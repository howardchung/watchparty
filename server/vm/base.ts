import axios from 'axios';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

import { Room } from '../room';
import { redisCount } from '../utils/redis';

export abstract class VMManager {
  public vmBufferSize = Number(process.env.VBROWSER_VM_BUFFER) || 0;
  private redis = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL)
    : undefined;
  private redis2 = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL)
    : undefined;
  private redis3 = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL)
    : undefined;

  constructor(rooms: Map<string, Room>, vmBufferSize?: number) {
    if (!process.env.REDIS_URL) {
      return;
    }
    if (vmBufferSize !== undefined) {
      this.vmBufferSize = vmBufferSize;
    }

    const release = async () => {
      // Reset VMs in rooms that are:
      // assigned more than 6 hours ago
      // assigned to a room with no users
      const roomArr = Array.from(rooms.values());
      for (let i = 0; i < roomArr.length; i++) {
        const room = roomArr[i];
        if (
          room.vBrowser &&
          room.vBrowser.assignTime &&
          (!room.vBrowser.provider ||
            room.vBrowser.provider === this.redisQueueKey)
        ) {
          if (
            Number(new Date()) - room.vBrowser.assignTime >
              6 * 60 * 60 * 1000 ||
            room.roster.length === 0
          ) {
            console.log('[RESET] VM in room:', room.roomId);
            room.resetRoomVM();
          }
        }
      }
    };
    const renew = async () => {
      const roomArr = Array.from(rooms.values());
      for (let i = 0; i < roomArr.length; i++) {
        const room = roomArr[i];
        if (
          room.vBrowser &&
          room.vBrowser.id &&
          (!room.vBrowser.provider ||
            room.vBrowser.provider === this.redisQueueKey)
        ) {
          console.log('[RENEW] VM in room:', room.roomId, room.vBrowser.id);
          // Renew the lock on the VM
          await this.redis.expire('vbrowser:' + room.vBrowser.id, 300);
        }
      }
    };
    setInterval(this.resizeVMGroupIncr, 15 * 1000);
    setInterval(this.resizeVMGroupDecr, 20 * 60 * 1000);
    setInterval(this.cleanupVMGroup, 3 * 60 * 1000);
    setInterval(renew, 30 * 1000);
    setInterval(release, 5 * 60 * 1000);
    setTimeout(this.checkStaging, 100); // Add some delay to make sure the object is constructed first
  }

  public assignVM = async (): Promise<AssignedVM> => {
    const assignStart = Number(new Date());
    let selected = null;
    while (!selected) {
      const currSize = await this.redis.llen(this.redisQueueKey);
      if (currSize === 0) {
        await this.startVMWrapper();
      }
      let resp = await this.redis2.brpop(this.redisQueueKey, 0);
      const id = resp[1];
      console.log('[ASSIGN]', id);
      const lock = await this.redis.set('vbrowser:' + id, '1', 'NX', 'EX', 300);
      if (!lock) {
        console.log('failed to acquire lock on VM:', id);
        continue;
      }
      let candidate = await this.getVM(id);
      selected = candidate;
    }
    const assignEnd = Number(new Date());
    const assignElapsed = assignEnd - assignStart;
    await this.redis.lpush('vBrowserStartMS', assignElapsed);
    await this.redis.ltrim('vBrowserStartMS', 0, 24);
    console.log('[ASSIGN]', selected.id, assignElapsed + 'ms');
    const retVal = { ...selected, assignTime: Number(new Date()) };
    return retVal;
  };

  public resetVM = async (id: string): Promise<void> => {
    console.log('[RESET]', id);
    // We can attempt to reuse the instance which is more efficient if users tend to use them for a short time
    // Otherwise terminating them is simpler but more expensive since they're billed for an hour
    await this.rebootVM(id);
    // Delete any locks
    await this.redis.del('vbrowser:' + id);
    // Add the VM back to the pool
    await this.redis.lpush(this.redisStagingKey, id);
  };

  protected resizeVMGroupIncr = async () => {
    const maxAvailable = this.vmBufferSize;
    const availableCount = await this.redis.llen(this.redisQueueKey);
    const stagingCount = await this.redis.llen(this.redisStagingKey);
    if (availableCount + stagingCount < maxAvailable) {
      console.log(
        '[RESIZE-LAUNCH]',
        'desired:',
        maxAvailable,
        'available:',
        availableCount,
        'staging:',
        stagingCount
      );
      this.startVMWrapper();
    }
  };

  protected resizeVMGroupDecr = async () => {
    while (true) {
      const maxAvailable = this.vmBufferSize;
      const availableCount = await this.redis.llen(this.redisQueueKey);
      if (availableCount > maxAvailable) {
        const id = await this.redis.lpop(this.redisQueueKey);
        console.log(
          '[RESIZE-TERMINATE]',
          id,
          'desired:',
          maxAvailable,
          'available:',
          availableCount
        );
        await this.terminateVMWrapper(id);
      } else {
        break;
      }
    }
  };

  protected cleanupVMGroup = async () => {
    // Clean up hanging VMs
    // It's possible we created a VM but lost track of it in redis
    // Take the list of VMs from API, subtract VMs that have a lock in redis or are in the available pool, delete the rest
    const allVMs = await this.listVMs();
    // TODO locks could collide if multiple cloud providers use the same IDs
    const usedKeys = (await this.redis.keys('vbrowser:*')).map((key) =>
      key.slice('vbrowser:'.length)
    );
    const availableKeys = await this.redis.lrange(this.redisQueueKey, 0, -1);
    const stagingKeys = await this.redis.lrange(this.redisStagingKey, 0, -1);
    const dontDelete = new Set([...usedKeys, ...availableKeys, ...stagingKeys]);
    // console.log(allVMs, dontDelete);
    for (let i = 0; i < allVMs.length; i++) {
      const server = allVMs[i];
      if (!dontDelete.has(server.id)) {
        console.log('[CLEANUP] terminating:', server.id);
        this.terminateVMWrapper(server.id);
      }
    }
  };

  protected checkStaging = async () => {
    while (true) {
      // Loop through staging list and check if VM is ready
      const id = await this.redis3.brpoplpush(
        this.redisStagingKey,
        this.redisStagingKey,
        0
      );
      // We wait first before checking to give the VM time to shut down (if it's restarting)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      let ready = false;
      try {
        const candidate = await this.getVM(id);
        ready = await this.checkVMReady(candidate.host);
      } catch (e) {
        // console.log(e);
      }
      const retryCount = await this.redis.incr(this.redisStagingKey + ':' + id);
      if (ready) {
        console.log('[CHECKSTAGING] ready:', id);
        // If it is, move it to available list
        await this.redis
          .multi()
          .lrem(this.redisStagingKey, 1, id)
          .lpush(this.redisQueueKey, id)
          .del(this.redisStagingKey + ':' + id)
          .exec();
      } else {
        console.log('[CHECKSTAGING] not ready:', id);
        if (retryCount > 120) {
          await this.redis.del(this.redisStagingKey + ':' + id);
          this.terminateVMWrapper(id);
        }
      }
    }
  };

  protected checkVMReady = async (host: string) => {
    let state = '';
    const url = 'https://' + host;
    try {
      const response4 = await axios({
        method: 'GET',
        url,
      });
      state = response4.data.slice(10);
    } catch (e) {
      // console.log(e);
      // console.log(e.response);
      // The server currently 404s on requests with a query string, so just treat the 404 message as success
      // The error code is not 404 maybe due to the gateway
      state =
        e.response && e.response.data === '404 page not found\n' ? 'ready' : '';
    }
    return state === 'ready';
  };

  protected startVMWrapper = async () => {
    // generate credentials and boot a VM
    const password = uuidv4();
    const id = await this.startVM(password);
    await this.redis.lpush(this.redisStagingKey, id);
    redisCount('vBrowserLaunches');
    return id;
  };

  protected terminateVMWrapper = async (id: string) => {
    // Get the VM data to calculate lifetime, if we fail do the terminate anyway
    const lifetime = await this.terminateVMMetrics(id);
    await this.terminateVM(id);
    // Remove from lists, if it exists
    await this.redis.lrem(this.redisQueueKey, 1, id);
    await this.redis.lrem(this.redisStagingKey, 1, id);
    if (lifetime) {
      await this.redis.lpush('vBrowserVMLifetime', lifetime);
      await this.redis.ltrim('vBrowserVMLifetime', 0, 24);
    }
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

  public abstract redisQueueKey: string;
  public abstract redisStagingKey: string;
  protected abstract startVM: (name: string) => Promise<string>;
  protected abstract rebootVM: (id: string) => Promise<void>;
  protected abstract terminateVM: (id: string) => Promise<void>;
  protected abstract getVM: (id: string) => Promise<VM>;
  protected abstract listVMs: (filter?: string) => Promise<VM[]>;
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
}

export interface AssignedVM extends VM {
  assignTime: number;
}
