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
  vp9 = false,
  hetznerCloudInit = false,
  h264 = false
) => `#!/bin/bash
iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 5000
sysctl -w net.ipv6.conf.all.disable_ipv6=1
sysctl -w net.ipv6.conf.default.disable_ipv6=1
sed -i 's/scripts-user$/\[scripts-user, always\]/' /etc/cloud/cloud.cfg
${
  hetznerCloudInit
    ? `sed -i 's/scripts-user$/\[scripts-user, always\]/' /etc/cloud/cloud.cfg.d/90-hetznercloud.cfg`
    : ''
}
PASSWORD=$(hostname)
# docker pull ${imageName}
docker run -d --rm --name=vbrowser -v /usr/share/fonts:/usr/share/fonts --log-opt max-size=1g --net=host --shm-size=1g --cap-add="SYS_ADMIN" -e DISPLAY=":99.0" -e NEKO_SCREEN="${resolution}" -e NEKO_PASSWORD=$PASSWORD -e NEKO_PASSWORD_ADMIN=$PASSWORD -e NEKO_BIND=":5000" -e NEKO_EPR=":59000-59100" -e NEKO_VP9="${
  vp9 ? 1 : 0
}" -e NEKO_H264="${h264 ? 1 : 0}" ${imageName}
`;

export const imageName = 'howardc93/vbrowser:latest';

export const assignVM = async (
  redis: Redis.Redis,
  vmManager: VMManager
): Promise<AssignedVM | undefined> => {
  try {
    const assignStart = Number(new Date());
    let selected = null;
    while (!selected) {
      if (process.env.NODE_ENV === 'development') {
        // This code spawns a VM if none is available in the pool
        const availableCount = await redis.llen(vmManager.getRedisQueueKey());
        if (!availableCount) {
          await vmManager.startVMWrapper();
        }
      }
      let resp = await redis.blpop(vmManager.getRedisQueueKey(), 60);
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
      let candidate = await vmManager.getVM(id);
      selected = candidate;
    }
    const assignEnd = Number(new Date());
    const assignElapsed = assignEnd - assignStart;
    await redis.lpush('vBrowserStartMS', assignElapsed);
    await redis.ltrim('vBrowserStartMS', 0, 99);
    console.log('[ASSIGN]', selected.id, assignElapsed + 'ms');
    const retVal = { ...selected, assignTime: Number(new Date()) };
    return retVal;
  } catch (e) {
    console.warn(e);
    return undefined;
  }
};

export function getVMManager(
  provider: string,
  isLarge: boolean,
  region: string
): VMManager | null {
  let vmManager: VMManager | null = null;
  if (
    config.REDIS_URL &&
    config.SCW_SECRET_KEY &&
    config.SCW_ORGANIZATION_ID &&
    provider === 'Scaleway'
  ) {
    vmManager = new Scaleway(isLarge, region);
  } else if (
    config.REDIS_URL &&
    config.HETZNER_TOKEN &&
    provider === 'Hetzner'
  ) {
    vmManager = new Hetzner(isLarge, region);
  } else if (config.REDIS_URL && config.DO_TOKEN && provider === 'DO') {
    vmManager = new DigitalOcean(isLarge, region);
  } else if (
    config.REDIS_URL &&
    config.DOCKER_VM_HOST &&
    provider === 'Docker'
  ) {
    vmManager = new Docker(isLarge, region);
  }
  return vmManager;
}

export function getBgVMManagers() {
  return {
    // large: getVMManager(config.VM_MANAGER_ID, true, ''),
    // standard: getVMManager(config.VM_MANAGER_ID, false, ''),
    largeUS: getVMManager(config.VM_MANAGER_ID, true, 'US'),
    US: getVMManager(config.VM_MANAGER_ID, false, 'US'),
  };
}

export function getSessionLimitSeconds(isLarge: boolean) {
  return isLarge
    ? config.VBROWSER_SESSION_SECONDS_LARGE
    : config.VBROWSER_SESSION_SECONDS;
}
