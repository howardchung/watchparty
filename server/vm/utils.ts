import { AssignedVM, VMManager } from './base';
import Redis from 'ioredis';
import config from '../config';
import { Scaleway } from './scaleway';
import { Hetzner } from './hetzner';
import { DigitalOcean } from './digitalocean';
import { Docker } from './docker';

export const imageName = 'howardc93/vbrowser';

export const assignVM = async (
  redis: Redis.Redis,
  vmManager: VMManager
): Promise<AssignedVM | undefined> => {
  try {
    const assignStart = Number(new Date());
    let selected = null;
    while (!selected) {
      if (vmManager.getMinSize() === 0) {
        // This code spawns a VM if none is available in the pool
        const availableCount = await redis.llen(vmManager.getRedisQueueKey());
        if (!availableCount) {
          await vmManager.startVMWrapper();
        }
      }
      let resp = await redis.blpop(
        vmManager.getRedisQueueKey(),
        config.VM_ASSIGNMENT_TIMEOUT
      );
      if (!resp) {
        return undefined;
      }
      const id = resp[1];
      console.log('[ASSIGN]', id);
      const lock = await redis.set(
        'lock:' + vmManager.id + ':' + id,
        '1',
        'NX',
        'EX',
        300
      );
      if (!lock) {
        console.log('failed to acquire lock on VM:', id);
        continue;
      }
      const cachedData = await redis.get(
        vmManager.getRedisHostCacheKey() + ':' + id
      );
      let candidate =
        cachedData && cachedData.startsWith('{') && JSON.parse(cachedData);
      if (!candidate) {
        candidate = await vmManager.getVM(id);
      }
      selected = candidate;
    }
    const assignEnd = Number(new Date());
    const assignElapsed = assignEnd - assignStart;
    await redis.lpush('vBrowserStartMS', assignElapsed);
    await redis.ltrim('vBrowserStartMS', 0, 24);
    console.log('[ASSIGN]', selected.id, assignElapsed + 'ms');
    const retVal = { ...selected, assignTime: Number(new Date()) };
    return retVal;
  } catch (e) {
    console.warn(e);
    return undefined;
  }
};

export type PoolRegion = 'US' | 'USW' | 'EU';
export type PoolConfig = {
  provider: string;
  isLarge: boolean;
  region: PoolRegion;
  limitSize: number;
  minSize: number;
};

function createVMManager(poolConfig: PoolConfig): VMManager | null {
  let vmManager: VMManager | null = null;
  if (
    config.REDIS_URL &&
    config.SCW_SECRET_KEY &&
    config.SCW_ORGANIZATION_ID &&
    poolConfig.provider === 'Scaleway'
  ) {
    vmManager = new Scaleway(poolConfig);
  } else if (
    config.REDIS_URL &&
    config.HETZNER_TOKEN &&
    poolConfig.provider === 'Hetzner'
  ) {
    vmManager = new Hetzner(poolConfig);
  } else if (
    config.REDIS_URL &&
    config.DO_TOKEN &&
    poolConfig.provider === 'DO'
  ) {
    vmManager = new DigitalOcean(poolConfig);
  } else if (
    config.REDIS_URL &&
    config.DOCKER_VM_HOST &&
    poolConfig.provider === 'Docker'
  ) {
    vmManager = new Docker(poolConfig);
  }
  return vmManager;
}

export function getVMManagerConfig(): Array<PoolConfig> {
  return config.VM_MANAGER_CONFIG.split(',').map((c) => {
    const split = c.split(':');
    return {
      provider: split[0],
      isLarge: split[1] === 'large',
      region: split[2] as PoolRegion,
      minSize: Number(split[3]),
      limitSize: Number(split[4]),
    };
  });
}

export function getBgVMManagers(): { [key: string]: VMManager | null } {
  const result: { [key: string]: VMManager | null } = {};
  const conf = getVMManagerConfig();
  conf.forEach((c) => {
    const mgr = createVMManager(c);
    if (mgr) {
      result[mgr.getPoolName()] = mgr;
    }
  });
  return result;
}

export function getSessionLimitSeconds(isLarge: boolean) {
  return isLarge
    ? config.VBROWSER_SESSION_SECONDS_LARGE
    : config.VBROWSER_SESSION_SECONDS;
}
