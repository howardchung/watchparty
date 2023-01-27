import config from '../config';
import Redis from 'ioredis';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { redisCount } from '../utils/redis';
import { PoolConfig, PoolRegion } from './utils';

let redis: Redis.Redis | undefined = undefined;
if (config.REDIS_URL) {
  redis = new Redis(config.REDIS_URL);
}

const incrInterval = 5 * 1000;
const decrInterval = 30 * 1000;
const cleanupInterval = 5 * 60 * 1000;
const updateSizeInterval = 60 * 1000;

export abstract class VMManager {
  protected isLarge = false;
  protected region: PoolRegion = 'US';
  protected redis: Redis.Redis;
  private currentSize = 0;
  private limitSize = 0;
  private minSize = 0;

  constructor({ isLarge, region, limitSize, minSize }: PoolConfig) {
    this.isLarge = isLarge;
    this.region = region;
    this.limitSize = Number(limitSize);
    this.minSize = Number(minSize);
    if (!redis) {
      throw new Error('Cannot construct VMManager without Redis');
    }
    this.redis = redis;
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

  public getCurrentSize = () => {
    return this.currentSize;
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
      minBuffer /= 2;
    } else if (isRampUp) {
      minBuffer *= 1.5;
    }
    return [Math.ceil(minBuffer), Math.ceil(minBuffer * 1.5)];
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
    } catch (e: any) {
      console.warn(e.response?.data);
    }
    return 0;
  };

  public runBackgroundJobs = async () => {
    try {
      console.log(
        '[VMWORKER] starting background jobs for %s',
        this.getPoolName()
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
          allVMs.length
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
        if (allVMs.length) {
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
          console.log(
            '[STATS] %s: currentSize %s, available %s, staging %s, buffer %s',
            this.getPoolName(),
            allVMs.length,
            availableKeys.length,
            stagingKeys.length,
            this.getAdjustedBuffer()
          );
        }
      };

      const cleanupVMGroup = async () => {
        // Clean up hanging VMs
        // It's possible we created a VM but lost track of it in redis
        // Take the list of VMs from API, subtract VMs that have a lock in redis or are in the available or staging pool, delete the rest
        let allVMs = [];
        try {
          allVMs = await this.listVMs(this.getTag());
        } catch (e) {
          console.log('cleanupVMGroup: failed to fetch VM list');
          return;
        }
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
          '[CLEANUP] %s: cleanup %s VMs',
          this.getPoolName(),
          allVMs.length - dontDelete.size
        );
        for (let i = 0; i < allVMs.length; i++) {
          const server = allVMs[i];
          if (!dontDelete.has(server.id)) {
            console.log('[CLEANUP]', server.id);
            try {
              await this.resetVM(server.id);
            } catch (e: any) {
              console.warn(e.response?.data);
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
              let vm: VM | null = null;
              try {
                const cached = await this.redis.get(
                  this.getRedisHostCacheKey() + ':' + id
                );
                vm = cached ? JSON.parse(cached) : null;
                if (
                  !vm &&
                  (retryCount === this.minRetries + 1 || retryCount % 20 === 0)
                ) {
                  vm = await this.getVM(id);
                  if (vm?.host) {
                    console.log(
                      '[CHECKSTAGING] caching host %s for id %s',
                      vm?.host,
                      id
                    );
                    await this.redis.setex(
                      this.getRedisHostCacheKey() + ':' + id,
                      2 * 3600,
                      JSON.stringify(vm)
                    );
                  }
                }
              } catch (e: any) {
                console.warn(e.response?.data);
                if (e.response?.status === 404) {
                  await this.redis.lrem(this.getRedisQueueKey(), 0, id);
                  await this.redis.lrem(this.getRedisStagingKey(), 0, id);
                  await this.redis.del(this.getRedisStagingKey() + ':' + id);
                  return reject();
                }
              }
              ready = await checkVMReady(vm?.host ?? '', vm?.pass);
              //ready = retryCount > 100;
              if (ready) {
                console.log('[CHECKSTAGING] ready:', id, vm?.host, retryCount);
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
                if (retryCount >= 240) {
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
                  if (retryCount % 150 === 0) {
                    console.log(
                      '[CHECKSTAGING] %s attempt to poweron, attach to network',
                      id
                    );
                    this.powerOn(id);
                    //this.attachToNetwork(id);
                  }
                  if (retryCount % 30 === 0) {
                    console.log(
                      '[CHECKSTAGING]',
                      'not ready:',
                      id,
                      vm?.host,
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
          } catch (e: any) {
            console.log('error in cleanupVMGroup');
            console.warn(e.response?.data);
          }
          await new Promise((resolve) => setTimeout(resolve, cleanupInterval));
        }
      });

      const checkStagingInterval = 1000;
      while (true) {
        await new Promise((resolve) =>
          setTimeout(resolve, checkStagingInterval)
        );
        await checkStaging();
      }
    } catch (e) {
      console.log('error in runBackgroundJobs');
      console.log(e);
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

async function checkVMReady(host: string, pass: string | undefined) {
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
    const timeSinceBoot = Date.now() / 1000 - Number(resp.data);
    console.log(timeSinceBoot);
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
