import config from '../config';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { redis, redisCount } from '../utils/redis';
import { postgres as pg } from '../utils/postgres';
import { PoolConfig, PoolRegion } from './utils';
import type { Client } from 'pg';
const incrInterval = 5 * 1000;
const decrInterval = 15 * 1000;
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

  public getTargetBuffer = () => {
    return this.limitSize * 0.03;
  };

  public getCurrentSize = async () => {
    const { rows } = await postgres.query(
      `SELECT count(1) FROM vbrowser WHERE pool = $1`,
      [this.getPoolName()],
    );
    return Number(rows[0]?.count);
  };

  public getPoolName = () => {
    return this.id + (this.isLarge ? 'Large' : '') + this.region;
  };

  public getAdjustedBuffer = (): number => {
    let buffer = this.getTargetBuffer();
    // If ramping config, adjust buffer based on the hour
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
      buffer *= 0.5;
    } else if (isRampUp) {
      buffer *= 1.5;
    }
    return Math.ceil(buffer);
  };

  public getAvailableCount = async (): Promise<number> => {
    const { rows } = await postgres.query(
      `SELECT count(1) FROM vbrowser WHERE pool = $1 and state = 'available'`,
      [this.getPoolName()],
    );
    return Number(rows[0]?.count);
  };

  public getStagingCount = async (): Promise<number> => {
    const { rows } = await postgres.query(
      `SELECT count(1) FROM vbrowser WHERE pool = $1 and state = 'staging'`,
      [this.getPoolName()],
    );
    return Number(rows[0]?.count);
  };

  public getAvailableVBrowsers = async (): Promise<string[]> => {
    const { rows } = await postgres.query(
      `SELECT vmid from vbrowser WHERE pool = $1 and state = 'available'`,
      [this.getPoolName()],
    );
    return rows.map((row: any) => row.vmid);
  };

  public getStagingVBrowsers = async (): Promise<string[]> => {
    const { rows } = await postgres.query(
      `SELECT vmid from vbrowser WHERE pool = $1 and state = 'staging'`,
      [this.getPoolName()],
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
    uid: string,
  ): Promise<AssignedVM | undefined> => {
    if (!roomId || !uid) {
      return undefined;
    }
    // Update and use SKIP LOCKED to ensure each consumer gets a different one
    const { rows } = await postgres.query(
      `
    UPDATE vbrowser 
    SET "roomId" = $1, uid = $2, "heartbeatTime" = NOW(), "assignTime" = NOW(), state = 'used'
    WHERE id = (
      SELECT id
      FROM vbrowser
      WHERE state = 'available'
      AND pool = $3
      ORDER BY id ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    RETURNING data, pass`,
      [roomId, uid, this.getPoolName()],
    );
    let vm: VM | undefined = rows[0]?.data;
    let pass: string = rows[0]?.pass;
    if (!vm) {
      return;
    }
    return { ...vm, pass, assignTime: Number(new Date()) };
  };

  public resetVM = async (vmid: string, roomId?: string): Promise<void> => {
    if (roomId !== undefined) {
      // verify the roomId matches if user initiated
      const { rows } = await postgres.query(
        `SELECT "roomId" FROM vbrowser WHERE pool = $1 AND vmid = $2`,
        [this.getPoolName(), vmid],
      );
      if (rows[0]?.roomId && rows[0]?.roomId !== roomId) {
        console.log(
          '[RESET] %s: roomId mismatch on %s, expected %s, got %s',
          this.getPoolName(),
          vmid,
          rows[0]?.roomId,
          roomId,
        );
        return;
      }
    }
    console.log('[RESET]', this.getPoolName(), vmid, roomId);
    // We generally want to reuse if the provider has per-hour billing
    // Since most user sessions are less than an hour
    // Otherwise if it's per-second or Docker, it's easier to just terminate it on reboot
    if (this.reuseVMs) {
      // To reset without API calls/reimaging (logic can be reused on any cloud provider so we can avoid individual reboot implementations):
      // Update vbrowser script to generate uuid password
      // add admin endpoints to vbrowser to get password and reboot
      // to reset, hit reboot endpoint with admin key OR call cloud reboot method
      // in checkstaging, check password endpoint with admin key, update DB once available
      const { rows } = await postgres.query(
        `SELECT image FROM vbrowser WHERE pool = $1 AND vmid = $2`,
        [this.getPoolName(), vmid],
      );
      const vmImageId = rows[0]?.image;
      // Check if VM needs to be reimaged
      if (this.imageId !== vmImageId) {
        await this.reimageVM(vmid);
        // Update the vmImageId
        await postgres.query(
          `UPDATE vbrowser SET image = $3 WHERE pool = $1 AND vmid = $2`,
          [this.getPoolName(), vmid, this.imageId],
        );
      } else {
        await this.rebootVM(vmid);
      }
      // we could crash here and then row will remain in used state
      // Once the heartbeat becomes stale cleanup will reset it again
      const result = await postgres.query(
        `
        INSERT INTO vbrowser(pool, vmid, "creationTime", state)
        VALUES($1, $2, NOW(), 'staging')
        ON CONFLICT(pool, vmid) DO
        UPDATE SET state = 'staging',
        "roomId" = NULL, uid = NULL, retries = 0, "heartbeatTime" = NULL, "assignTime" = NULL, data = NULL
        `,
        [this.getPoolName(), vmid],
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
    const password = uuidv4();
    const id = await this.startVM(password);
    // We might fail to record it if crashing here but cleanup will reset it
    await postgres.query(
      `
    INSERT INTO vbrowser(pool, vmid, "creationTime", state) 
    VALUES($1, $2, NOW(), 'staging')`,
      [this.getPoolName(), id],
    );
    redisCount('vBrowserLaunches');
    return id;
  };

  protected terminateVMWrapper = async (vmid: string) => {
    console.log('[TERMINATE]', this.getPoolName(), vmid);
    // Update the DB before calling terminate
    // If we don't actually complete the termination, cleanup will reset it
    const { command, rowCount } = await postgres.query(
      `DELETE FROM vbrowser WHERE pool = $1 AND vmid = $2 RETURNING id`,
      [this.getPoolName(), vmid],
    );
    console.log(command, rowCount);
    // We can log the VM lifetime by returning the creationTime and diffing
    await this.terminateVM(vmid);
  };

  checkVMReady = async (host: string) => {
    // NOTE: This URL doesn't work for docker since it doesn't have /
    // But since we don't reuse docker VMs it's ok
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
      return this.reuseVMs ? timeSinceBoot < 60 * 1000 : true;
    } catch (e) {
      // console.log(url, e.message, e.response?.status);
      return false;
    }
  };

  public runBackgroundJobs = async () => {
    const resizeVMGroupIncr = async () => {
      const availableCount = await this.getAvailableCount();
      const stagingCount = await this.getStagingCount();
      const currentSize = await this.getCurrentSize();
      let launch = false;
      launch =
        availableCount + stagingCount < this.getAdjustedBuffer() &&
        currentSize < (this.getLimitSize() || Infinity);
      if (launch) {
        console.log(
          '[RESIZE-INCR]',
          this.getPoolName(),
          'target:',
          this.getAdjustedBuffer(),
          'available:',
          availableCount,
          'staging:',
          stagingCount,
          'currentSize:',
          currentSize,
          'limit:',
          this.getLimitSize(),
        );
        try {
          await this.startVMWrapper();
        } catch (e: any) {
          console.log(
            e.response?.status,
            JSON.stringify(e.response?.data),
            e.config?.url,
            e.config?.data,
          );
        }
      }
    };

    const resizeVMGroupDecr = async () => {
      const availableCount = await this.getAvailableCount();
      const stagingCount = await this.getStagingCount();
      let unlaunch = false;
      unlaunch = availableCount + stagingCount > this.getAdjustedBuffer();
      if (unlaunch) {
        // use SKIP LOCKED to delete to avoid deleting VM that might be assigning
        // filter to only VMs eligible for deletion
        // they must be up for long enough
        // keep the oldest min pool size number of VMs
        // Hetzner/DO/Scaleway rounds up to nearest hour
        let modulo = 3600;
        const { rows } = await postgres.query(
          `
          DELETE FROM vbrowser
          WHERE id = (
            SELECT id
            FROM vbrowser
            WHERE pool = $1
            AND state = 'available'
            AND id >= (SELECT id from vbrowser WHERE pool = $1 ORDER BY id ASC LIMIT 1 OFFSET $2)
            AND CAST(extract(epoch from now() - "creationTime") as INT) % $3 > $4
            FOR UPDATE SKIP LOCKED
            LIMIT 1
          ) RETURNING vmid`,
          [
            this.getPoolName(),
            this.getMinSize(),
            modulo,
            config.VM_MIN_UPTIME_MINUTES * 60, // to seconds
          ],
        );
        const first = rows[0];
        if (first) {
          console.log('[RESIZE-DECR] %s: %s', this.getPoolName(), first.vmid);
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
        console.log(
          '[CLEANUP] %s: failed to fetch VM list',
          this.getPoolName(),
        );
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
        [this.getPoolName()],
      );
      const inUse = new Set(rows.map((row: any) => row.vmid));
      console.log(
        '[CLEANUP] %s: found %s VMs, %s to keep',
        this.getPoolName(),
        allVMs.length,
        inUse.size,
      );
      for (let i = 0; i < allVMs.length; i++) {
        const server = allVMs[i];
        if (!inUse.has(server.id)) {
          // TODO log how many cleanups we do
          console.log('[CLEANUP]', this.getPoolName(), server.id);
          try {
            await this.resetVM(server.id);
            //this.terminateVMWrapper(server.id);
          } catch (e: any) {
            console.warn('[CLEANUP]', this.getPoolName(), e.response?.data);
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
        [this.getPoolName()],
      );
      const stagingPromises = rows.map(async (row: any): Promise<string> => {
        const rowid = row.id;
        const vmid = row.vmid as string;
        const retryCount = row.retries as number;
        let vm = row.data as VM | null;
        if (retryCount < this.minRetries) {
          if (config.NODE_ENV === 'development') {
            console.log(
              '[CHECKSTAGING] %s: [vmid: %s] [attempt: %s] waiting for minRetries',
              this.getPoolName(),
              vmid,
              retryCount,
            );
          }
          // Do a minimum # of retries to give reboot time
          return [vmid, retryCount, false].join(',');
        }
        // Fetch data on first attempt
        // Try again only every once in a while to reduce load on API
        const shouldFetchVM =
          retryCount === this.minRetries + 1 || retryCount % 30 === 0;
        // Refetch the VM every once in a while even if cached to check if it should be deleted
        if (shouldFetchVM) {
          try {
            vm = await this.getVM(vmid);
          } catch (e: any) {
            console.warn(e.response?.data);
            if (e.response?.status === 404) {
              // Remove the VM because the provider says it doesn't exist
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
              [vm, rowid],
            );
          }
        }
        if (!vm?.host) {
          console.log(
            '[CHECKSTAGING] %s: no host for vm %s',
            this.getPoolName(),
            vmid,
          );
          throw new Error('no host for vm ' + vmid);
        }
        if (retryCount % 150 === 0) {
          console.log(
            '[CHECKSTAGING] %s: %s poweron, attach to network',
            this.getPoolName(),
            vmid,
          );
          this.powerOn(vmid);
          //this.attachToNetwork(vmid);
        }
        if (retryCount % 180 === 0) {
          console.log('[CHECKSTAGING]', this.getPoolName(), 'giving up:', vmid);
          redisCount('vBrowserStagingFails');
          await redis?.lpush('vBrowserStageFails', vmid);
          await redis?.ltrim('vBrowserStageFails', 0, 24);
          await this.resetVM(vmid);
          // await this.terminateVMWrapper(vmid);
        }
        if (retryCount >= 180) {
          throw new Error('too many attempts on vm ' + vmid);
        }
        const ready = await this.checkVMReady(vm.host);
        if (
          ready ||
          retryCount % (config.NODE_ENV === 'development' ? 1 : 30) === 0
        ) {
          console.log(
            '[CHECKSTAGING] %s: [ready: %s] [vmid: %s] [retries: %s] [host: %s]',
            this.getPoolName(),
            ready,
            vmid,
            retryCount,
            vm?.host,
          );
        }
        if (ready) {
          const passUrl =
            'https://' +
            (vm.host.includes('/')
              ? vm.host.replace('/', '/password')
              : vm.host + '/password') +
            (vm.host.includes('?') ? '&' : '?') +
            'key=' +
            config.VBROWSER_ADMIN_KEY;
          // console.log(passUrl);
          const resp2 = await axios({
            method: 'GET',
            url: passUrl,
            timeout: 1000,
          });
          const pass = resp2.data;
          // password is a uuid so it should never match the previous value, if it does we probably didn't reset properly
          const { rows } = await postgres.query(
            `UPDATE vbrowser SET state = 'available', pass = $2 WHERE id = $1 AND pass IS DISTINCT FROM $2`,
            [rowid, pass],
          );
          // console.log(rows);
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

    console.log('[VMWORKER] %s: starting background jobs', this.getPoolName());

    setInterval(resizeVMGroupIncr, incrInterval);
    setInterval(resizeVMGroupDecr, decrInterval);
    setInterval(async () => {
      console.log(
        '[STATS] %s: currentSize %s, available %s, staging %s, target %s',
        this.getPoolName(),
        await this.getCurrentSize(),
        await this.getAvailableCount(),
        await this.getStagingCount(),
        this.getAdjustedBuffer(),
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
          console.warn(
            '[CLEANUPVMGROUP-ERROR]',
            this.getPoolName(),
            e.response?.data,
          );
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
          console.warn('[CHECKSTAGING-ERROR]', this.getPoolName(), e);
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
  protected abstract imageId: string;
  protected abstract startVM: (name: string) => Promise<string>;
  protected abstract rebootVM: (id: string) => Promise<void>;
  protected abstract reimageVM: (id: string) => Promise<void>;
  protected abstract terminateVM: (id: string) => Promise<void>;
  public abstract getVM: (id: string) => Promise<VM>;
  protected abstract listVMs: (filter: string) => Promise<VM[]>;
  protected abstract powerOn: (id: string) => Promise<void>;
  protected abstract attachToNetwork: (id: string) => Promise<void>;
  protected abstract mapServerObject: (server: any) => VM;
  public abstract updateSnapshot: () => Promise<string>;
}

function pointInInterval24(x: number, a: number, b: number) {
  return nonNegativeMod(x - a, 24) <= nonNegativeMod(b - a, 24);
}

function nonNegativeMod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export interface VM {
  id: string;
  host: string;
  provider: string;
  large: boolean;
  region: string;
}

export interface AssignedVM extends VM {
  pass: string;
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
