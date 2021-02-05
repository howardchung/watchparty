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
  hetznerCloudInit = false
) => `#!/bin/bash
iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 5000
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
}" ${imageName}
`;

export const cloudInitWithTls = (
  host: string,
  imageName: string,
  resolution = '1280x720@30',
  vp9 = false
) => `#!/bin/bash
until nslookup ${host}
do
sleep 5
echo "Trying DNS lookup again..."
done
    
# Generate cert with letsencrypt
certbot certonly --standalone -n --agree-tos --email howardzchung@gmail.com --domains ${host}
chmod -R 755 /etc/letsencrypt/archive

# start browser
iptables -t nat -A PREROUTING -p tcp --dport 443 -j REDIRECT --to-port 5000
sed -i 's/scripts-user$/\[scripts-user, always\]/' /etc/cloud/cloud.cfg
# docker pull ${imageName}
docker run -d --rm --name=vbrowser -v /etc/letsencrypt:/etc/letsencrypt -v /usr/share/fonts:/usr/share/fonts --log-opt max-size=1g --net=host --shm-size=1g --cap-add="SYS_ADMIN" -e DISPLAY=":99.0" -e NEKO_SCREEN="${resolution}" -e NEKO_PASSWORD=$(hostname) -e NEKO_PASSWORD_ADMIN=$(hostname) -e NEKO_BIND=":5000" -e NEKO_EPR=":59000-59100" -e NEKO_KEY="/etc/letsencrypt/live/${host}/privkey.pem" -e NEKO_CERT="/etc/letsencrypt/live/${host}/fullchain.pem" -e NEKO_VP9="${
  vp9 ? 1 : 0
}" ${imageName}
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
      // This code spawns a VM if none is available in the pool
      // const availableCount = await redis.llen(this.getRedisQueueKey());
      // const stagingCount = await redis.llen(this.getRedisStagingKey());
      // const fixedSize = this.getFixedSize();
      // if (availableCount + stagingCount === 0 && !fixedSize) {
      //   await this.startVMWrapper();
      // }
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
        vmManager.getLockTimeSeconds()
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

export function createVMManagers() {
  // Start the VM manager
  let vmManager: VMManager | null = null;
  let vmManagerLarge: VMManager | null = null;
  if (
    config.REDIS_URL &&
    config.SCW_SECRET_KEY &&
    config.SCW_ORGANIZATION_ID &&
    config.VM_MANAGER_ID === 'Scaleway'
  ) {
    vmManager = new Scaleway();
    vmManagerLarge = new Scaleway(true);
  } else if (
    config.REDIS_URL &&
    config.HETZNER_TOKEN &&
    config.VM_MANAGER_ID === 'Hetzner'
  ) {
    vmManager = new Hetzner();
    vmManagerLarge = new Hetzner(true);
  } else if (
    config.REDIS_URL &&
    config.DO_TOKEN &&
    config.VM_MANAGER_ID === 'DO'
  ) {
    vmManager = new DigitalOcean();
    vmManagerLarge = new DigitalOcean(true);
  } else if (
    config.REDIS_URL &&
    config.DOCKER_VM_HOST &&
    config.VM_MANAGER_ID === 'Docker'
  ) {
    vmManager = new Docker();
    vmManagerLarge = new Docker(true);
  }
  return { standard: vmManager, large: vmManagerLarge };
}
