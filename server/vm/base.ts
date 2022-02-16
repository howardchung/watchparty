import config from '../config';
import Redis from 'ioredis';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { redisCount } from '../utils/redis';
import { execSync } from 'child_process';

let redis: Redis.Redis | undefined = undefined;
if (config.REDIS_URL) {
  redis = new Redis(config.REDIS_URL);
}

const incrInterval = 5 * 1000;
const decrInterval = 1 * 60 * 1000;
const cleanupInterval = 5 * 60 * 1000;
const updateSizeInterval = 60 * 1000;

export abstract class VMManager {
  protected isLarge = false;
  protected region = '';
  protected redis: Redis.Redis;
  private currentSize = 0;
  private limitSize = 0;
  private minSize = 0;
  private minBuffer = 0;

  constructor(
    large: boolean,
    region: string,
    limitSize: number,
    minSize: number,
    minBuffer: number
  ) {
    this.isLarge = Boolean(large);
    this.region = region;
    this.limitSize = Number(limitSize);
    this.minSize = Number(minSize);
    this.minBuffer = Number(minBuffer);
    if (!redis) {
      throw new Error('Cannot construct VMManager without Redis');
    }
    this.redis = redis;
  }

  public getMinSize = () => {
    return this.minSize;
  };

  public getLimitSize = () => {
    return this.limitSize;
  };

  public getMinBuffer = () => {
    return this.minBuffer;
  };

  public getCurrentSize = () => {
    return this.currentSize;
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
      nowHour >= rampDownHours[0] &&
      nowHour < rampDownHours[1];
    const isRampUp =
      rampUpHours.length &&
      nowHour >= rampUpHours[0] &&
      nowHour < rampUpHours[1];
    if (isRampDown) {
      minBuffer /= 2;
    } else if (isRampUp) {
      minBuffer *= 2;
    }
    return [minBuffer, Math.floor(minBuffer * 1.5)];
  };

  public getRedisQueueKey = () => {
    return (
      'availableList' + this.id + this.region + (this.isLarge ? 'Large' : '')
    );
  };

  public getRedisStagingKey = () => {
    return (
      'stagingList' + this.id + this.region + (this.isLarge ? 'Large' : '')
    );
  };

  public getRedisAllKey = () => {
    return 'allList' + this.id + this.region + (this.isLarge ? 'Large' : '');
  };

  public getRedisHostCacheKey = () => {
    return 'hostCache' + this.id + this.region + (this.isLarge ? 'Large' : '');
  };

  public getRedisPoolSizeKey = () => {
    return 'vmPoolFull' + this.id + this.region + (this.isLarge ? 'Large' : '');
  };

  public getRedisTerminationKey = () => {
    return (
      'terminationList' + this.id + this.region + (this.isLarge ? 'Large' : '')
    );
  };

  public getTag = () => {
    return (
      (config.VBROWSER_TAG || 'vbrowser') +
      this.region +
      (this.isLarge ? 'Large' : '')
    );
  };

  public resetVM = async (id: string): Promise<void> => {
    // We can attempt to reuse the instance which is more efficient if users tend to use them for a short time
    // Otherwise terminating them is simpler but more expensive since they're billed for an hour
    console.log('[RESET]', id);
    await this.rebootVM(id);
    // Delete any locks/caches
    await this.redis.del('lock:' + this.id + ':' + id);
    await this.redis.del(this.getRedisHostCacheKey() + ':' + id);
    // Add the VM back to the pool
    await this.redis.rpush(this.getRedisStagingKey(), id);
  };

  public startVMWrapper = async () => {
    // generate credentials and boot a VM
    try {
      const password = uuidv4();
      const id = await this.startVM(password);
      await this.redis.rpush(this.getRedisStagingKey(), id);
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

  protected terminateVMWrapper = async (id: string) => {
    console.log('[TERMINATE]', id);
    // Remove from lists, if it exists
    await this.redis.lrem(this.getRedisQueueKey(), 0, id);
    await this.redis.lrem(this.getRedisStagingKey(), 0, id);
    // Get the VM data to calculate lifetime, if we fail do the terminate anyway
    // const lifetime = await this.terminateVMMetrics(id);
    await this.terminateVM(id);
    // if (lifetime) {
    //   await this.redis.lpush('vBrowserVMLifetime', lifetime);
    //   await this.redis.ltrim('vBrowserVMLifetime', 0, 24);
    // }
    // Delete any locks
    await this.redis.del('lock:' + this.id + ':' + id);
    await this.redis.del(this.getRedisHostCacheKey() + ':' + id);
  };

  protected terminateVMMetrics = async (id: string) => {
    try {
      const vm = await this.getVM(id);
      if (vm) {
        const lifetime =
          Number(new Date()) - Number(new Date(vm.creation_date));
        return lifetime;
      }
    } catch (e) {
      console.warn(e);
    }
    return 0;
  };

  public runBackgroundJobs = async () => {
    console.log(
      '[VMWORKER] starting background jobs for %s',
      this.getRedisQueueKey()
    );
    const resizeVMGroupIncr = async () => {
      const availableCount = await this.redis.llen(this.getRedisQueueKey());
      const stagingCount = await this.redis.llen(this.getRedisStagingKey());
      let launch = false;
      launch =
        availableCount + stagingCount < this.getAdjustedBuffer()[0] &&
        this.getCurrentSize() != null &&
        this.getCurrentSize() < (this.getLimitSize() || Infinity);
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
          this.getCurrentSize(),
          'limit:',
          this.getLimitSize()
        );
        this.startVMWrapper();
      }
    };

    const resizeVMGroupDecr = async () => {
      let unlaunch = false;
      const availableCount = await this.redis.llen(this.getRedisQueueKey());
      unlaunch = availableCount > this.getAdjustedBuffer()[1];
      if (unlaunch) {
        const ids = await this.redis.smembers(this.getRedisTerminationKey());
        // Remove the first available VM
        let first = null;
        let rem = 0;
        while (ids.length && !rem) {
          first = ids.shift();
          rem = first
            ? await this.redis.lrem(this.getRedisQueueKey(), 1, first)
            : 0;
          if (first && rem) {
            console.log('[RESIZE-UNLAUNCH]', first);
            await this.terminateVMWrapper(first);
          }
        }
      }
    };

    const updateSize = async () => {
      const allVMs = await this.listVMs(this.getTag());
      const now = Date.now();
      this.currentSize = allVMs.length;
      await this.redis.setex(
        this.getRedisPoolSizeKey(),
        2 * 60,
        this.currentSize
      );
      let sortedVMs = allVMs
        // Sort newest first (decreasing alphabetically)
        .sort((a, b) => -a.creation_date?.localeCompare(b.creation_date))
        // Remove the minimum number of VMs to keep
        .slice(0, -this.getMinSize() || undefined)
        // Consider only VMs that have been up for most of an hour
        .filter(
          (vm) =>
            (now - Number(new Date(vm.creation_date))) % (60 * 60 * 1000) >
            config.VM_MIN_UPTIME_MINUTES * 60 * 1000
        );
      const cmd = this.redis.multi().del(this.getRedisTerminationKey());
      if (sortedVMs.length) {
        cmd.sadd(
          this.getRedisTerminationKey(),
          sortedVMs.map((vm) => vm.id)
        );
      }
      await cmd.exec();
    };

    const cleanupVMGroup = async () => {
      // Clean up hanging VMs
      // It's possible we created a VM but lost track of it in redis
      // Take the list of VMs from API, subtract VMs that have a lock in redis or are in the available or staging pool, delete the rest
      const allVMs = await this.listVMs(this.getTag());
      const usedKeys: string[] = [];
      for (let i = 0; i < allVMs.length; i++) {
        if (await this.redis.get(`lock:${this.id}:${allVMs[i].id}`)) {
          usedKeys.push(allVMs[i].id);
        }
      }
      const availableKeys = await this.redis.lrange(
        this.getRedisQueueKey(),
        0,
        -1
      );
      const stagingKeys = await this.redis.lrange(
        this.getRedisStagingKey(),
        0,
        -1
      );
      const dontDelete = new Set([
        ...usedKeys,
        ...availableKeys,
        ...stagingKeys,
      ]);
      console.log(
        '[CLEANUP] %s found %s VMs, usedKeys %s, availableKeys %s, stagingKeys %s',
        this.getRedisQueueKey(),
        allVMs.length,
        usedKeys.length,
        availableKeys.length,
        stagingKeys.length
      );
      for (let i = 0; i < allVMs.length; i++) {
        const server = allVMs[i];
        if (!dontDelete.has(server.id)) {
          console.log('[CLEANUP]', server.id);
          try {
            await this.resetVM(server.id);
          } catch (e) {
            console.warn(e);
          }
          //this.terminateVMWrapper(server.id);
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    };

    const checkStaging = async () => {
      try {
        // const checkStagingStart = this.isLarge
        //   ? 0
        //   : Math.floor(Date.now() / 1000);
        // if (checkStagingStart) {
        //   console.log('[CHECKSTAGING]', checkStagingStart);
        // }
        // Loop through staging list and check if VM is ready
        const stagingKeys = await this.redis.lrange(
          this.getRedisStagingKey(),
          0,
          -1
        );
        const stagingPromises = stagingKeys.map((id) => {
          return new Promise<string>(async (resolve, reject) => {
            const retryCount = await this.redis.incr(
              this.getRedisStagingKey() + ':' + id
            );
            if (retryCount < this.minRetries) {
              // Do a minimum # of retries to give reboot time
              return resolve(id + ', ' + retryCount + ', ' + false);
            }
            let ready = false;
            let vmCached = await this.redis.get(
              this.getRedisHostCacheKey() + ':' + id
            );
            let host = vmCached?.startsWith('{')
              ? JSON.parse(vmCached).host
              : vmCached;
            if (!host && (retryCount === 1 || retryCount % 5 === 0)) {
              try {
                const vm = await this.getVM(id);
                host = vm?.host ?? null;
                if (vm && vm.host) {
                  console.log(
                    '[CHECKSTAGING] caching host %s for id %s',
                    host,
                    id
                  );
                  await this.redis.setex(
                    this.getRedisHostCacheKey() + ':' + id,
                    3 * 3600,
                    JSON.stringify(vm)
                  );
                }
              } catch (e: any) {
                if (e.response?.status === 404) {
                  await this.redis.lrem(this.getRedisQueueKey(), 0, id);
                  await this.redis.lrem(this.getRedisStagingKey(), 0, id);
                  await this.redis.del(this.getRedisStagingKey() + ':' + id);
                  return reject();
                }
              }
            }
            ready = await checkVMReady(host ?? '');
            //ready = retryCount > 100;
            if (ready) {
              console.log('[CHECKSTAGING] ready:', id, host, retryCount);
              // If it is, move it to available list
              const rem = await this.redis.lrem(
                this.getRedisStagingKey(),
                1,
                id
              );
              if (rem) {
                await this.redis
                  .multi()
                  .rpush(this.getRedisQueueKey(), id)
                  .del(this.getRedisStagingKey() + ':' + id)
                  .exec();
                await this.redis.lpush('vBrowserStageRetries', retryCount);
                await this.redis.ltrim('vBrowserStageRetries', 0, 24);
              }
            } else {
              if (retryCount >= 80) {
                console.log('[CHECKSTAGING]', 'giving up:', id);
                await this.redis
                  .multi()
                  .lrem(this.getRedisStagingKey(), 0, id)
                  .del(this.getRedisStagingKey() + ':' + id)
                  .exec();
                redisCount('vBrowserStagingFails');
                await this.redis.lpush('vBrowserStageFails', id);
                await this.redis.ltrim('vBrowserStageFails', 0, 24);
                await this.resetVM(id);
                //await this.terminateVMWrapper(id);
              } else {
                if (retryCount % 45 === 0) {
                  console.log(
                    '[CHECKSTAGING] %s attempt to poweron and attach to network',
                    id
                  );
                  this.powerOn(id);
                  this.attachToNetwork(id);
                }
                if (retryCount % 10 === 0) {
                  console.log(
                    '[CHECKSTAGING]',
                    'not ready:',
                    id,
                    host,
                    retryCount
                  );
                }
              }
            }
            resolve(id + ', ' + retryCount + ', ' + ready);
          });
        });
        const result = await Promise.race([
          Promise.allSettled(stagingPromises),
          new Promise((resolve) => setTimeout(resolve, 30000)),
        ]);
        // if (checkStagingStart) {
        //   console.log('[CHECKSTAGING-DONE]', checkStagingStart, result);
        // }
        return result;
      } catch (e) {
        console.warn('[CHECKSTAGING-ERROR]', e);
        return [];
      }
    };

    setInterval(resizeVMGroupIncr, incrInterval);
    setInterval(resizeVMGroupDecr, decrInterval);

    updateSize();
    setInterval(updateSize, updateSizeInterval);

    setImmediate(async () => {
      while (true) {
        try {
          await cleanupVMGroup();
        } catch (e) {
          console.error(e);
        }
        await new Promise((resolve) => setTimeout(resolve, cleanupInterval));
      }
    });

    const checkStagingInterval = 3000;
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, checkStagingInterval));
      await checkStaging();
    }
  };

  public abstract id: string;
  protected abstract size: string;
  protected abstract largeSize: string;
  protected abstract minRetries: number;
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
  const url = 'https://' + host.replace('/', '/healthz');
  try {
    // const out = execSync(`curl -i -L -v --ipv4 '${host}'`);
    // if (!out.toString().startsWith('OK') && !out.toString().startsWith('404 page not found')) {
    //   throw new Error('mismatched response from healthz');
    // }
    await axios({
      method: 'GET',
      url,
      timeout: 1000,
    });
  } catch (e) {
    // console.log(url, e.message, e.response?.status);
    return false;
  }
  return true;
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
