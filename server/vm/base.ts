import config from '../config';
import Redis from 'ioredis';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { redisCount } from '../utils/redis';

const incrInterval = 5 * 1000;
const decrInterval = 3 * 60 * 1000;
const cleanupInterval = 4 * 60 * 1000;
const updateSizeInterval = 60 * 1000;

export abstract class VMManager {
  protected tag = config.VBROWSER_TAG || 'vbrowser';
  protected isLarge = false;
  private redis = new Redis(config.REDIS_URL);
  private currentSize = 0;

  constructor(large?: boolean) {
    if (large) {
      this.tag += 'Large';
      this.isLarge = true;
    }
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
    return 'availableList' + this.id + (this.isLarge ? 'Large' : '');
  };

  public getRedisStagingKey = () => {
    return 'stagingList' + this.id + (this.isLarge ? 'Large' : '');
  };

  public resetVM = async (id: string): Promise<void> => {
    console.log('[RESET]', id);
    // We can attempt to reuse the instance which is more efficient if users tend to use them for a short time
    // Otherwise terminating them is simpler but more expensive since they're billed for an hour
    await this.rebootVM(id);
    // Delete any locks
    await this.redis.del('lock:' + this.id + ':' + id);
    // We wait to give the VM time to shut down (if it's restarting)
    await new Promise((resolve) => setTimeout(resolve, 3000));
    // Add the VM back to the pool
    await this.redis.rpush(this.getRedisStagingKey(), id);
  };

  protected startVMWrapper = async () => {
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
    await this.redis.lrem(this.getRedisQueueKey(), 1, id);
    await this.redis.lrem(this.getRedisStagingKey(), 1, id);
    // Get the VM data to calculate lifetime, if we fail do the terminate anyway
    const lifetime = await this.terminateVMMetrics(id);
    await this.terminateVM(id);
    if (lifetime) {
      await this.redis.lpush('vBrowserVMLifetime', lifetime);
      await this.redis.ltrim('vBrowserVMLifetime', 0, 49);
    }
    // Delete any locks
    await this.redis.del('lock:' + this.id + ':' + id);
  };

  protected terminateVMMetrics = async (id: string) => {
    try {
      const vm = await this.getVM(id);
      const lifetime = Number(new Date()) - Number(new Date(vm.creation_date));
      return lifetime;
    } catch (e) {
      console.warn(e);
    }
    return 0;
  };

  public runBackgroundJobs = () => {
    const backgroundRedis = new Redis(config.REDIS_URL);
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
          stagingCount
        );
        this.startVMWrapper();
      }
    };

    const resizeVMGroupDecr = async () => {
      let unlaunch = false;
      const availableCount = await this.redis.llen(this.getRedisQueueKey());
      unlaunch = availableCount > vmBufferMax;
      if (unlaunch) {
        const allVMs = await this.listVMs();
        const now = Date.now();
        // Sort newest first
        let sortedVMs = allVMs
          .sort((a, b) => -a.creation_date?.localeCompare(b.creation_date))
          .slice(0, -this.getMinSize() || undefined)
          .filter(
            (vm) =>
              now - Number(new Date(vm.creation_date)) >
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
      const allVMs = await this.listVMs();
      this.currentSize = allVMs.length;
    };

    const cleanupVMGroup = async () => {
      // Clean up hanging VMs
      // It's possible we created a VM but lost track of it in redis
      // Take the list of VMs from API, subtract VMs that have a lock in redis or are in the available or staging pool, delete the rest
      const allVMs = await this.listVMs();
      const usedKeys = (await this.redis.keys(`lock:${this.id}:*`)).map((key) =>
        key.slice(`lock:${this.id}:`.length)
      );
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
        }
      }
    };

    const checkStaging = async () => {
      while (true) {
        try {
          // Loop through staging list and check if VM is ready
          const id = await backgroundRedis.brpoplpush(
            this.getRedisStagingKey(),
            this.getRedisStagingKey(),
            0
          );
          let ready = false;
          let candidate = undefined;
          try {
            candidate = await this.getVM(id);
            ready = await checkVMReady(candidate.host);
          } catch (e) {
            console.log('[CHECKSTAGING-ERROR]', id, e?.response?.status);
          }
          const retryCount = await this.redis.incr(
            this.getRedisStagingKey() + ':' + id
          );
          if (retryCount % 20 === 0) {
            this.powerOn(id);
            this.attachToNetwork(id);
          }
          if (ready) {
            console.log(
              '[CHECKSTAGING] ready:',
              id,
              candidate?.host,
              retryCount
            );
            // If it is, move it to available list
            await this.redis
              .multi()
              .lrem(this.getRedisStagingKey(), 1, id)
              .rpush(this.getRedisQueueKey(), id)
              .del(this.getRedisStagingKey() + ':' + id)
              .exec();
            await this.redis.lpush('vBrowserStageRetries', retryCount);
            await this.redis.ltrim('vBrowserStageRetries', 0, 49);
          } else {
            if (retryCount % 5 === 0) {
              console.log(
                '[CHECKSTAGING] not ready:',
                id,
                candidate?.host,
                retryCount
              );
            }
            if (retryCount > 100) {
              console.log('[CHECKSTAGING] giving up:', id);
              await this.redis
                .multi()
                .lrem(this.getRedisStagingKey(), 1, id)
                .del(this.getRedisStagingKey() + ':' + id)
                .exec();
              redisCount('vBrowserStagingFails');
              await this.resetVM(id);
            }
          }
        } catch (e) {
          console.warn('[CHECKSTAGING-CRASH]', e);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    };

    const checkVMReady = async (host: string) => {
      const url = 'https://' + host + '/healthz';
      try {
        const response4 = await axios({
          method: 'GET',
          url,
          timeout: 1000,
        });
      } catch (e) {
        return false;
      }
      return true;
    };
    setInterval(resizeVMGroupIncr, incrInterval);
    setInterval(resizeVMGroupDecr, decrInterval);
    updateSize();
    setInterval(updateSize, updateSizeInterval);
    setInterval(cleanupVMGroup, cleanupInterval);
    setTimeout(checkStaging, 100); // Add some delay to make sure the object is constructed first
  };

  public abstract id: string;
  protected abstract size: string;
  protected abstract largeSize: string;
  protected abstract startVM: (name: string) => Promise<string>;
  protected abstract rebootVM: (id: string) => Promise<void>;
  protected abstract terminateVM: (id: string) => Promise<void>;
  public abstract getVM: (id: string) => Promise<VM>;
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
}

export interface AssignedVM extends VM {
  assignTime: number;
  controllerClient?: string;
  creatorUID?: string;
  creatorClientID?: string;
}
