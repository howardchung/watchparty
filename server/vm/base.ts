import config from '../config';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { redis, redisCount } from '../utils/redis';
import { postgres as pg } from '../utils/postgres';
import { PoolConfig, PoolRegion } from './utils';
import type { Client } from 'pg';
const incrInterval = 5 * 1000;
const decrInterval = 30 * 1000;
const cleanupInterval = 5 * 60 * 1000;

// If postgres isn't configured we can still run in stateless mode
// Only start/get/terminate can be used, otherwise exception will be thrown
const postgres = !pg ? (null as unknown as Client) : pg;

export abstract class VMManager {
  protected isLarge = false;
  protected region: PoolRegion = 'US';
  private limitSize = 0;
  private minSize = 0;
  protected hostname: string | undefined;

  constructor({ isLarge, region, limitSize, minSize, hostname }: PoolConfig) {
    this.isLarge = isLarge;
    this.region = region;
    this.limitSize = Number(limitSize) || 0;
    this.minSize = Number(minSize) || 0;
    this.hostname = hostname;
  }

  public getIsLarge = () => {
    return this.isLarge;
  };

  public getRegion = () => {
    return this.region;
  };

  public getMinSize = () => {
    return this.minSize;
  };

  public getLimitSize = () => {
    return this.limitSize;
  };

  public getMinBuffer = () => {
    return this.limitSize * 0.05;
  };

  public getCurrentSize = async () => {
    const { rows } = await postgres.query(
      `SELECT count(1) FROM vbrowser WHERE pool = $1`,
      [this.getPoolName()]
    );
    return Number(rows[0]?.count);
  };

  public getPoolName = () => {
    return this.id + (this.isLarge ? 'Large' : '') + this.region;
  };

  public getAdjustedBuffer = () => {
    let minBuffer = this.getMinBuffer();
    // If ramping config, adjust minBuffer based on the hour
    // During ramp down hours, keep a smaller buffer
    // During ramp up hours, keep a larger buffer
    const rampDownHours = config.VM_POOL_RAMP_DOWN_HOURS.split(',').map(Number);
    const rampUpHours = config.VM_POOL_RAMP_UP_HOURS.split(',').map(Number);
    const nowHour = new Date().getUTCHours();
    const isRampDown =
      rampDownHours.length &&
      pointInInterval24(nowHour, rampDownHours[0], rampDownHours[1]);
    const isRampUp =
      rampUpHours.length &&
      pointInInterval24(nowHour, rampUpHours[0], rampUpHours[1]);
    if (isRampDown) {
      minBuffer *= 0.5;
    } else if (isRampUp) {
      minBuffer *= 1.5;
    }
    return [Math.ceil(minBuffer), Math.ceil(minBuffer * 1.5)];
  };

  public getAvailableCount = async (): Promise<number> => {
    const { rows } = await postgres.query(
      `SELECT count(1) FROM vbrowser WHERE pool = $1 and state = 'available'`,
      [this.getPoolName()]
    );
    return Number(rows[0]?.count);
  };

  public getStagingCount = async (): Promise<number> => {
    const { rows } = await postgres.query(
      `SELECT count(1) FROM vbrowser WHERE pool = $1 and state = 'staging'`,
      [this.getPoolName()]
    );
    return Number(rows[0]?.count);
  };

  public getAvailableVBrowsers = async (): Promise<string[]> => {
    const { rows } = await postgres.query(
      `SELECT vmid from vbrowser WHERE pool = $1 and state = 'available'`,
      [this.getPoolName()]
    );
    return rows.map((row: any) => row.vmid);
  };

  public getStagingVBrowsers = async (): Promise<string[]> => {
    const { rows } = await postgres.query(
      `SELECT vmid from vbrowser WHERE pool = $1 and state = 'staging'`,
      [this.getPoolName()]
    );
    return rows.map((row: any) => row.vmid);
  };

  public getTag = () => {
    return (
      (config.VBROWSER_TAG || 'vbrowser') +
      this.region +
      (this.isLarge ? 'Large' : '')
    );
  };

  public assignVM = async (
    roomId: string,
    uid: string
  ): Promise<AssignedVM | undefined> => {
    if (!roomId || !uid) {
      return undefined;
    }
    if (this.getMinSize() === 0) {
      // If the min size is 0 we may never create a VM
      // So start one if we don't already have one ready or staging
      const availableCount = await this.getAvailableCount();
      const stagingCount = await this.getStagingCount();
      if (!availableCount && !stagingCount) {
        await this.startVMWrapper();
      }
    }
    // Update and use SKIP LOCKED to ensure each consumer gets a different one
    const getAssignedVM = async (): Promise<VM | undefined> => {
      const { rows } = await postgres.query(
        `
      UPDATE vbrowser 
      SET "roomId" = $1, uid = $2, "heartbeatTime" = $3, state = 'used'
      WHERE id = (
        SELECT id
        FROM vbrowser
        WHERE state = 'available'
        AND pool = $4
        ORDER BY id ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      )
      RETURNING data`,
        [roomId, uid, new Date(), this.getPoolName()]
      );
      return rows[0]?.data;
    };
    let selected: VM | undefined = await getAssignedVM();
    if (!selected) {
      return;
    }
    return { ...selected, assignTime: Number(new Date()) };
  };

  public resetVM = async (vmid: string, uid?: string): Promise<void> => {
    if (uid !== undefined) {
      // verify the uid matches if user initiated
      const { rows } = await postgres.query(
        `SELECT uid FROM vbrowser WHERE pool = $1 AND vmid = $2`,
        [this.getPoolName(), vmid]
      );
      if (rows[0]?.uid && rows[0]?.uid !== uid) {
        console.log(
          '[RESET] uid mismatch on %s, expected %s, got %s',
          vmid,
          rows[0]?.uid,
          uid
        );
        return;
      }
    }
    console.log('[RESET]', vmid);
    await this.rebootVM(vmid);
    // we could crash here and then row will remain in used state
    // Once the heartbeat becomes stale cleanup will reset it

    // We generally want to reuse if the provider has per-hour billing
    // Since most user sessions are less than an hour
    // Otherwise if it's per-second or Docker, it's easier to just terminate it on reboot
    if (this.reuseVMs) {
      const result = await postgres.query(
        `
        INSERT INTO vbrowser(pool, vmid, "creationTime", state)
        VALUES($1, $2, $3, 'staging')
        ON CONFLICT(pool, vmid) DO
        UPDATE SET state = 'staging',
        "roomId" = NULL, uid = NULL, retries = 0, "heartbeatTime" = NULL, data = NULL
        `,
        [this.getPoolName(), vmid, new Date()]
      );
      console.log('UPSERT', result.rowCount);
      // Normally this should be an update, but we could insert if:
      // if cleaning up a VM we didn't record in db on create
      // if we resized down and deleted db row but didn't complete the termination
    } else {
      this.terminateVMWrapper(vmid);
    }
  };

  public startVMWrapper = async () => {
    // generate credentials and boot a VM
    try {
      const password = uuidv4();
      const id = await this.startVM(password);
      // We might fail to record it if crashing here but cleanup will eventually delete it
      await postgres.query(
        `
      INSERT INTO vbrowser(pool, vmid, "creationTime", state) 
      VALUES($1, $2, $3, 'staging')`,
        [this.getPoolName(), id, new Date()]
      );
      redisCount('vBrowserLaunches');
      return id;
    } catch (e: any) {
      console.log(
        e.response?.status,
        JSON.stringify(e.response?.data),
        e.config?.url,
        e.config?.data
      );
    }
  };

  protected terminateVMWrapper = async (vmid: string) => {
    console.log('[TERMINATE]', vmid);
    // Update the DB before calling terminate
    // If we don't actually complete the termination, cleanup will eventually remove it
    const { rows } = await postgres.query(
      `DELETE FROM vbrowser WHERE pool = $1 AND vmid = $2 RETURNING id`,
      [this.getPoolName(), vmid]
    );
    console.log('DELETE', rows.length);
    // We can log the VM lifetime by returning the creationTime and diffing
    await this.terminateVM(vmid);
  };

  public runBackgroundJobs = async () => {
    const resizeVMGroupIncr = async () => {
      const availableCount = await this.getAvailableCount();
      const stagingCount = await this.getStagingCount();
      const currentSize = await this.getCurrentSize();
      let launch = false;
      launch =
        availableCount + stagingCount < this.getAdjustedBuffer()[0] &&
        currentSize < (this.getLimitSize() || Infinity);
      if (launch) {
        console.log(
          '[RESIZE-LAUNCH]',
          'minimum:',
          this.getAdjustedBuffer()[0],
          'available:',
          availableCount,
          'staging:',
          stagingCount,
          'currentSize:',
          currentSize,
          'limit:',
          this.getLimitSize()
        );
        this.startVMWrapper();
      }
    };

    const resizeVMGroupDecr = async () => {
      let unlaunch = false;
      const availableCount = await this.getAvailableCount();
      unlaunch = availableCount > this.getAdjustedBuffer()[1];
      if (unlaunch) {
        // use SKIP LOCKED to delete to avoid deleting VM that might be assigning
        // filter to only VMs eligible for deletion
        // they must be up for long enough
        // keep the oldest min pool size number of VMs
        const { rows } = await postgres.query(
          `
          DELETE FROM vbrowser
          WHERE id = (
            SELECT id
            FROM vbrowser
            WHERE pool = $1
            AND state = 'available'
            AND CAST(extract(epoch from now() - "creationTime") as INT) % (60 * 60) > $2
            ORDER BY id ASC
            FOR UPDATE SKIP LOCKED
            LIMIT 1
            OFFSET $3
          ) RETURNING vmid, CAST(extract(epoch from now() - "creationTime") as INT) % (60 * 60) as uptime_frac`,
          [
            this.getPoolName(),
            config.VM_MIN_UPTIME_MINUTES * 60, // to seconds
            this.getMinSize(),
          ]
        );
        const first = rows[0];
        if (first) {
          console.log(
            '[RESIZE-UNLAUNCH] %s up for %s seconds of hour',
            first.vmid,
            first.uptime_frac
          );
          await this.terminateVMWrapper(first.vmid);
        }
      }
    };

    const cleanupVMGroup = async () => {
      // Reset hanging VMs
      // It's possible we created a VM but lost track of it
      // Take the list of VMs from API
      // subtract VMs that have a heartbeat or available or staging
      let allVMs = [];
      try {
        allVMs = await this.listVMs(this.getTag());
      } catch (e) {
        console.log('cleanupVMGroup: failed to fetch VM list');
        return;
      }
      const { rows } = await postgres.query(
        `
        SELECT vmid from vbrowser
        WHERE pool = $1
        AND
        ("heartbeatTime" > (NOW() - INTERVAL '5 minutes')
        OR state = 'staging'
        OR state = 'available')
        `,
        [this.getPoolName()]
      );
      const inUse = new Set(rows.map((row: any) => row.vmid));
      console.log(
        '[CLEANUP] %s: found %s VMs, %s to keep',
        this.getPoolName(),
        allVMs.length,
        inUse.size
      );
      for (let i = 0; i < allVMs.length; i++) {
        const server = allVMs[i];
        if (!inUse.has(server.id)) {
          // TODO log how many cleanups we do
          console.log('[CLEANUP]', server.id);
          try {
            await this.resetVM(server.id);
            //this.terminateVMWrapper(server.id);
          } catch (e: any) {
            console.warn(e.response?.data);
          }
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    };

    const checkStaging = async () => {
      // Increment retry count and return data
      const { rows } = await postgres.query(
        `
          UPDATE vbrowser
          SET retries = retries + 1
          WHERE pool = $1 and state = 'staging'
          RETURNING id, vmid, data, retries
        `,
        [this.getPoolName()]
      );
      const stagingPromises = rows.map(async (row: any): Promise<string> => {
        const rowid = row.id;
        const vmid = row.vmid as string;
        const retryCount = row.retries as number;
        let vm = row.data as VM | null;
        if (retryCount < this.minRetries) {
          if (config.NODE_ENV === 'development') {
            console.log(
              '[CHECKSTAGING] %s attempt %s, waiting for minRetries',
              vmid,
              retryCount
            );
          }
          // Do a minimum # of retries to give reboot time
          return [vmid, retryCount, false].join(',');
        }
        if (retryCount % 150 === 0) {
          console.log('[CHECKSTAGING] %s poweron, attach to network', vmid);
          this.powerOn(vmid);
          //this.attachToNetwork(vmid);
        }
        if (retryCount >= 240) {
          console.log('[CHECKSTAGING]', 'giving up:', vmid);
          redisCount('vBrowserStagingFails');
          await redis?.lpush('vBrowserStageFails', vmid);
          await redis?.ltrim('vBrowserStageFails', 0, 24);
          await this.resetVM(vmid);
          // await this.terminateVMWrapper(vmid);
          throw new Error('too many attempts on vm ' + vmid);
        }
        // Fetch data on first attempt
        // Try again only every once in a while to reduce load on API
        const shouldFetchVM =
          retryCount === this.minRetries + 1 || retryCount % 20 === 0;
        if (!vm && shouldFetchVM) {
          try {
            vm = await this.getVM(vmid);
          } catch (e: any) {
            console.warn(e.response?.data);
            if (e.response?.status === 404) {
              // Remove the VM beecause the provider says it doesn't exist
              await postgres.query('DELETE FROM vbrowser WHERE id = $1', [
                rowid,
              ]);
              throw new Error('failed to find vm ' + vmid);
            }
          }
          if (vm?.host) {
            // Save the VM data
            await postgres.query(
              `UPDATE vbrowser SET data = $1 WHERE id = $2`,
              [vm, rowid]
            );
          }
        }
        if (!vm?.host) {
          console.log('[CHECKSTAGING] no host for vm %s', vmid);
          throw new Error('no host for vm ' + vmid);
        }
        const ready = await checkVMReady(vm.host);
        if (
          ready ||
          retryCount % (config.NODE_ENV === 'development' ? 1 : 30) === 0
        ) {
          console.log(
            '[CHECKSTAGING] [ready: %s] [vmid: %s] [host: %s] [retries: %s]',
            ready,
            vmid,
            vm?.host,
            retryCount
          );
        }
        if (ready) {
          await postgres.query(
            `UPDATE vbrowser SET state = 'available' WHERE id = $1`,
            [rowid]
          );
          await redis?.lpush('vBrowserStageRetries', retryCount);
          await redis?.ltrim('vBrowserStageRetries', 0, 24);
        }
        return [vmid, retryCount, ready].join(',');
      });
      // TODO log something if we timeout
      const result = await Promise.race([
        Promise.allSettled(stagingPromises),
        new Promise((resolve) => setTimeout(resolve, 30000)),
      ]);
      return result;
    };

    console.log(
      '[VMWORKER] starting background jobs for %s',
      this.getPoolName()
    );

    setInterval(resizeVMGroupIncr, incrInterval);
    setInterval(resizeVMGroupDecr, decrInterval);
    setInterval(async () => {
      console.log(
        '[STATS] %s: currentSize %s, available %s, staging %s, buffer %s',
        this.getPoolName(),
        await this.getCurrentSize(),
        await this.getAvailableCount(),
        await this.getStagingCount(),
        this.getAdjustedBuffer()
      );
    }, 10000);

    // The following may take a while per iteration
    // Use while loop and delay between iterations rather than setInterval to avoid stacking requests
    setImmediate(async () => {
      while (true) {
        console.time(this.getPoolName() + ':cleanup');
        try {
          await cleanupVMGroup();
        } catch (e: any) {
          console.warn('[CLEANUPVMGROUP-ERROR]', e.response?.data);
        }
        console.timeEnd(this.getPoolName() + ':cleanup');
        await new Promise((resolve) => setTimeout(resolve, cleanupInterval));
      }
    });

    setImmediate(async () => {
      while (true) {
        // console.time(this.getPoolName() + ':checkstaging');
        try {
          await checkStaging();
        } catch (e) {
          console.warn('[CHECKSTAGING-ERROR]', e);
        }
        // console.timeEnd(this.getPoolName() + ':checkstaging');
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    });
  };

  public abstract id: string;
  protected abstract size: string;
  protected abstract largeSize: string;
  protected abstract minRetries: number;
  protected abstract reuseVMs: boolean;
  protected abstract startVM: (name: string) => Promise<string>;
  protected abstract rebootVM: (id: string) => Promise<void>;
  protected abstract terminateVM: (id: string) => Promise<void>;
  public abstract getVM: (id: string) => Promise<VM | null>;
  protected abstract listVMs: (filter?: string) => Promise<VM[]>;
  protected abstract powerOn: (id: string) => Promise<void>;
  protected abstract attachToNetwork: (id: string) => Promise<void>;
  protected abstract mapServerObject: (server: any) => VM;
  public abstract updateSnapshot: () => Promise<string>;
}

async function checkVMReady(host: string) {
  const url = 'https://' + host.replace('/', '/health');
  try {
    // const out = execSync(`curl -i -L -v --ipv4 '${host}'`);
    // if (!out.toString().startsWith('OK') && !out.toString().startsWith('404 page not found')) {
    //   throw new Error('mismatched response from health');
    // }
    const resp = await axios({
      method: 'GET',
      url,
      timeout: 1000,
    });
    // Check to make sure the VM was recently rebooted (we could also check on the password to ensure reset)
    const timeSinceBoot = Date.now() / 1000 - Number(resp.data);
    // console.log(timeSinceBoot);
    return process.env.NODE_ENV === 'production'
      ? timeSinceBoot < 60 * 1000
      : true;
  } catch (e) {
    // console.log(url, e.message, e.response?.status);
    return false;
  }
}

function pointInInterval24(x: number, a: number, b: number) {
  return nonNegativeMod(x - a, 24) <= nonNegativeMod(b - a, 24);
}

function nonNegativeMod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export interface VM {
  id: string;
  pass: string;
  host: string;
  private_ip: string;
  state: string;
  tags: string[];
  creation_date: string;
  provider: string;
  originalName?: string;
  large: boolean;
  region: string;
}

export interface AssignedVM extends VM {
  assignTime: number;
  controllerClient?: string;
  creatorUID?: string;
  creatorClientID?: string;
}

export interface VMManagers {
  standard: VMManager | null;
  large: VMManager | null;
  US: VMManager | null;
}
