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
const updateSizeInterval = 30 * 1000;

export abstract class VMManager {
  protected isLarge = false;
  protected region = '';
  protected redis: Redis.Redis;
  private currentSize = 0;

  constructor(large?: boolean, region = '') {
    this.isLarge = Boolean(large);
    this.region = region;
    if (!redis) {
      throw new Error('Cannot construct VMManager without Redis');
    }
    this.redis = redis;
  }

  protected getMinSize = () =>
    this.isLarge
      ? Number(config.VM_POOL_MIN_SIZE_LARGE)
      : Number(config.VM_POOL_MIN_SIZE);
  protected getLimitSize = () =>
    this.isLarge
      ? Number(config.VM_POOL_LIMIT_LARGE)
      : Number(config.VM_POOL_LIMIT);
  protected getCurrentSize = () => {
    return this.currentSize;
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

  public getRedisHostCacheKey = () => {
    return 'hostCache' + this.id + this.region + (this.isLarge ? 'Large' : '');
  };

  public getRedisVMPoolFullKey = () => {
    return 'vmPoolFull' + this.id + this.region + (this.isLarge ? 'Large' : '');
  };

  public getTag = () => {
    return (
      (config.VBROWSER_TAG || 'vbrowser') +
      this.region +
      (this.isLarge ? 'Large' : '')
    );
  };

  public resetVM = async (id: string): Promise<void> => {
    console.log('[RESET]', id);
    // We can attempt to reuse the instance which is more efficient if users tend to use them for a short time
    // Otherwise terminating them is simpler but more expensive since they're billed for an hour
    await this.rebootVM(id);
    // Delete any locks
    await this.redis.del('lock:' + this.id + ':' + id);
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
    } catch (e) {
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
    const lifetime = await this.terminateVMMetrics(id);
    await this.terminateVM(id);
    if (lifetime) {
      await this.redis.lpush('vBrowserVMLifetime', lifetime);
      await this.redis.ltrim('vBrowserVMLifetime', 0, 49);
    }
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
    let vmBufferSize = 0;
    let vmBufferFlex = 0;
    if (this.isLarge) {
      vmBufferSize = Number(config.VBROWSER_VM_BUFFER_LARGE) || 0;
      vmBufferFlex = Number(config.VBROWSER_VM_BUFFER_LARGE_FLEX) || 0;
    } else {
      vmBufferSize = Number(config.VBROWSER_VM_BUFFER) || 0;
      vmBufferFlex = Number(config.VBROWSER_VM_BUFFER_FLEX) || 0;
    }
    const vmBufferMax = vmBufferSize + vmBufferFlex;
    const resizeVMGroupIncr = async () => {
      const availableCount = await this.redis.llen(this.getRedisQueueKey());
      const stagingCount = await this.redis.llen(this.getRedisStagingKey());
      let launch = false;
      launch =
        availableCount + stagingCount < vmBufferSize &&
        this.getCurrentSize() < (this.getLimitSize() || Infinity);
      if (launch) {
        console.log(
          '[RESIZE-LAUNCH]',
          'desired:',
          vmBufferSize,
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
      unlaunch = availableCount > vmBufferMax;
      if (unlaunch) {
        const allVMs = await this.listVMs(this.getTag());
        const now = Date.now();
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
        let first = null;
        let rem = 0;
        // Remove the first available VM
        while (sortedVMs.length && !rem) {
          first = sortedVMs.shift();
          const id = first?.id;
          rem = id ? await this.redis.lrem(this.getRedisQueueKey(), 1, id) : 0;
        }
        if (first && rem) {
          const id = first?.id;
          console.log('[RESIZE-UNLAUNCH]', id);
          await this.terminateVMWrapper(id);
        }
      }
    };

    const updateSize = async () => {
      const allVMs = await this.listVMs(this.getTag());
      this.currentSize = allVMs.length;
      const availableCount = await this.redis.llen(this.getRedisQueueKey());
      if (availableCount === 0) {
        await this.redis.setex(
          this.getRedisVMPoolFullKey(),
          2 * 60,
          this.currentSize
        );
      } else {
        await this.redis.del(this.getRedisVMPoolFullKey() + this.id);
      }
    };

    const cleanupVMGroup = async () => {
      // Clean up hanging VMs
      // It's possible we created a VM but lost track of it in redis
      // Take the list of VMs from API, subtract VMs that have a lock in redis or are in the available or staging pool, delete the rest
      const allVMs = await this.listVMs(this.getTag());
      const usedKeys: string[] = [];
      for (let i = 0; i < allVMs.length; i++) {
        if (await redis?.get(`lock:${this.id}:${allVMs[i].id}`)) {
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
        '[CLEANUP] found %s VMs, usedKeys %s, availableKeys %s, stagingKeys %s',
        allVMs.length,
        usedKeys.length,
        availableKeys.length,
        stagingKeys.length
      );
      for (let i = 0; i < allVMs.length; i++) {
        const server = allVMs[i];
        if (!dontDelete.has(server.id)) {
          console.log('[CLEANUP]', server.id);
          this.resetVM(server.id);
          //this.terminateVM(server.id);
        }
      }
    };

    const checkStaging = async () => {
      const checkStagingStart = this.isLarge
        ? 0
        : Math.floor(Date.now() / 1000);
      if (checkStagingStart) {
        console.log('[CHECKSTAGING]', checkStagingStart);
      }
      try {
        // Loop through staging list and check if VM is ready
        const stagingKeys = await this.redis.lrange(
          this.getRedisStagingKey(),
          0,
          -1
        );
        const stagingPromises = stagingKeys.map((id) => {
          new Promise<void>(async (resolve, reject) => {
            const retryCount = await this.redis.incr(
              this.getRedisStagingKey() + ':' + id
            );
            if (retryCount < 10) {
              // Do a minimum of 10 retries to give reboot time
              return reject();
            }
            let ready = false;
            let host = await this.redis.get(
              this.getRedisHostCacheKey() + ':' + id
            );
            if (!host) {
              try {
                const vm = await this.getVM(id);
                host = vm?.host ?? null;
              } catch (e) {
                if (e.response?.status === 404) {
                  await this.redis.lrem(this.getRedisQueueKey(), 0, id);
                  await this.redis.lrem(this.getRedisStagingKey(), 0, id);
                  await this.redis.del(this.getRedisStagingKey() + ':' + id);
                  return reject();
                }
              }
              if (host) {
                console.log(
                  '[CHECKSTAGING] caching host %s for id %s',
                  host,
                  id
                );
                await this.redis.setex(
                  this.getRedisHostCacheKey() + ':' + id,
                  3600,
                  host
                );
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
                await this.redis.ltrim('vBrowserStageRetries', 0, 49);
              }
            } else {
              if (retryCount >= 180) {
                console.log(
                  '[CHECKSTAGING]',
                  checkStagingStart,
                  'giving up:',
                  id
                );
                await this.redis
                  .multi()
                  .lrem(this.getRedisStagingKey(), 0, id)
                  .del(this.getRedisStagingKey() + ':' + id)
                  .exec();
                redisCount('vBrowserStagingFails');
                await this.resetVM(id);
              } else {
                if (retryCount % 100 === 0) {
                  const vm = await this.getVM(id);
                  console.log(
                    '[CHECKSTAGING] %s attempt to poweron and attach to network',
                    id
                  );
                  this.powerOn(id);
                  if (!vm?.private_ip) {
                    this.attachToNetwork(id);
                  }
                }
                if (retryCount % 10 === 0) {
                  console.log(
                    '[CHECKSTAGING]',
                    checkStagingStart,
                    'not ready:',
                    id,
                    host,
                    retryCount
                  );
                }
              }
            }
            resolve();
          });
        });
        const result = await Promise.allSettled(stagingPromises);
        if (checkStagingStart) {
          console.log('[CHECKSTAGING-DONE]', checkStagingStart);
        }
        return result;
      } catch (e) {
        console.warn('[CHECKSTAGING-ERROR]', e);
        return [];
      }
    };

    const checkVMReady = async (host: string) => {
      const url = 'https://' + host.replace('/', '/healthz');
      try {
        // const out = execSync(`curl -i -L -v --ipv4 '${host}'`);
        // if (!out.toString().startsWith('OK') && !out.toString().startsWith('404 page not found')) {
        //   throw new Error('mismatched response from healthz');
        // }
        await axios({
          method: 'GET',
          url,
          timeout: 2000,
        });
      } catch (e) {
        // console.log(url, e.message, e.response?.status);
        return false;
      }
      return true;
    };
    setInterval(resizeVMGroupIncr, incrInterval);
    setInterval(resizeVMGroupDecr, decrInterval);
    updateSize();
    setInterval(updateSize, updateSizeInterval);
    cleanupVMGroup();
    setInterval(cleanupVMGroup, cleanupInterval);
    const checkStagingInterval = 2000;
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, checkStagingInterval));
      await checkStaging();
    }
  };

  public abstract id: string;
  protected abstract size: string;
  protected abstract largeSize: string;
  protected abstract startVM: (name: string) => Promise<string>;
  protected abstract rebootVM: (id: string) => Promise<void>;
  protected abstract terminateVM: (id: string) => Promise<void>;
  public abstract getVM: (id: string) => Promise<VM | null>;
  protected abstract listVMs: (filter?: string) => Promise<VM[]>;
  protected abstract powerOn: (id: string) => Promise<void>;
  protected abstract attachToNetwork: (id: string) => Promise<void>;
  protected abstract mapServerObject: (server: any) => VM;
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
