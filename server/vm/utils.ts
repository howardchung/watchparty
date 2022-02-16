import { AssignedVM, VMManager } from './base';
import Redis from 'ioredis';
import config from '../config';
import { Scaleway } from './scaleway';
import { Hetzner } from './hetzner';
import { DigitalOcean } from './digitalocean';
import { Docker } from './docker';

export const cloudInit = (
  imageName: string,
  resolution = '1280x720@30',
) => `#!/bin/bash
PASSWORD=$(hostname)
docker run -d --rm --name=vbrowser --log-opt max-size=1g --net=host --shm-size=1g --cap-add="SYS_ADMIN" -e DISPLAY=":99.0" -e NEKO_SCREEN="${resolution}" -e NEKO_PASSWORD=$PASSWORD -e NEKO_PASSWORD_ADMIN=$PASSWORD -e NEKO_BIND=":5000" -e NEKO_EPR=":59000-59100" -e NEKO_H264="1" ${imageName}
`;

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
      let resp = await redis.blpop(vmManager.getRedisQueueKey(), 90);
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

function getVMManager({
  provider,
  isLarge,
  region,
  limitSize,
  minSize,
}: {
  provider: string;
  isLarge: boolean;
  region: string;
  limitSize: number;
  minSize: number;
}): VMManager | null {
  let vmManager: VMManager | null = null;
  if (
    config.REDIS_URL &&
    config.SCW_SECRET_KEY &&
    config.SCW_ORGANIZATION_ID &&
    provider === 'Scaleway'
  ) {
    vmManager = new Scaleway(isLarge, region, limitSize, minSize);
  } else if (
    config.REDIS_URL &&
    config.HETZNER_TOKEN &&
    provider === 'Hetzner'
  ) {
    vmManager = new Hetzner(isLarge, region, limitSize, minSize);
  } else if (config.REDIS_URL && config.DO_TOKEN && provider === 'DO') {
    vmManager = new DigitalOcean(
      isLarge,
      region,
      limitSize,
      minSize,
    );
  } else if (
    config.REDIS_URL &&
    config.DOCKER_VM_HOST &&
    provider === 'Docker'
  ) {
    vmManager = new Docker(isLarge, region, limitSize, minSize);
  }
  return vmManager;
}

export function getBgVMManagers(): { [key: string]: VMManager | null } {
  const conf = [
    {
      provider: 'Hetzner',
      isLarge: true,
      region: 'US',
      limitSize: config.VM_POOL_LIMIT_LARGE,
      minSize: config.VM_POOL_MIN_SIZE_LARGE,
    },
    {
      provider: 'Hetzner',
      isLarge: false,
      region: 'US',
      limitSize: config.VM_POOL_LIMIT,
      minSize: config.VM_POOL_MIN_SIZE,
    },
    {
      provider: 'Hetzner',
      isLarge: true,
      region: 'EU',
      limitSize: 0,
      minSize: 0,
    },
    {
      provider: 'Hetzner',
      isLarge: false,
      region: 'EU',
      limitSize: 0,
      minSize: 0,
    },
    {
      provider: 'Scaleway',
      isLarge: true,
      region: 'US',
      limitSize: 0,
      minSize: 0,
    },
    {
      provider: 'Scaleway',
      isLarge: false,
      region: 'US',
      limitSize: 0,
      minSize: 0,
    },
    {
      provider: 'DO',
      isLarge: true,
      region: 'US',
      limitSize: 0,
      minSize: 0,
    },
    {
      provider: 'DO',
      isLarge: false,
      region: 'US',
      limitSize: 0,
      minSize: 0,
    },
    {
      provider: 'Docker',
      isLarge: true,
      region: 'US',
      limitSize: 0,
      minSize: 0,
    },
    {
      provider: 'Docker',
      isLarge: false,
      region: 'US',
      limitSize: 0,
      minSize: 0,
    },
  ];
  const result: { [key: string]: VMManager | null } = {};
  conf.forEach((c) => {
    result[c.provider + (c.isLarge ? 'Large' : '') + c.region] =
      getVMManager(c);
  });
  return result;
}

export function getSessionLimitSeconds(isLarge: boolean) {
  return isLarge
    ? config.VBROWSER_SESSION_SECONDS_LARGE
    : config.VBROWSER_SESSION_SECONDS;
}
