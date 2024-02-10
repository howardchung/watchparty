import { AssignedVM, VMManager } from './base';
import config from '../config';
import { Scaleway } from './scaleway';
import { Hetzner } from './hetzner';
import { DigitalOcean } from './digitalocean';
import { Docker } from './docker';

// Chromium on ARM: ghcr.io/howardchung/vbrowser/arm-chromium
export const imageName = 'howardc93/vbrowser';

export type PoolRegion = 'US' | 'USW' | 'EU';
export type PoolConfig = {
  provider: string;
  isLarge: boolean;
  region: PoolRegion;
  limitSize: number | undefined;
  minSize: number | undefined;
  hostname: string | undefined;
};

function createVMManager(poolConfig: PoolConfig): VMManager {
  let vmManager: VMManager | null = null;
  if (
    config.SCW_SECRET_KEY &&
    config.SCW_ORGANIZATION_ID &&
    config.SCW_IMAGE &&
    config.SCW_GATEWAY &&
    poolConfig.provider === 'Scaleway'
  ) {
    vmManager = new Scaleway(poolConfig);
  } else if (
    config.HETZNER_TOKEN &&
    config.HETZNER_IMAGE &&
    config.HETZNER_GATEWAY &&
    poolConfig.provider === 'Hetzner'
  ) {
    vmManager = new Hetzner(poolConfig);
  } else if (
    config.DO_TOKEN &&
    config.DO_IMAGE &&
    config.DO_GATEWAY &&
    poolConfig.provider === 'DO'
  ) {
    vmManager = new DigitalOcean(poolConfig);
  } else if (poolConfig.provider === 'Docker') {
    vmManager = new Docker(poolConfig);
  }
  if (!vmManager) {
    throw new Error('failed to create vmManager');
  }
  return vmManager;
}

export function getVMManagerConfig(): PoolConfig[] {
  return config.VM_MANAGER_CONFIG.split(',').map((c) => {
    const split = c.split(':');
    return {
      provider: split[0],
      isLarge: split[1] === 'large',
      region: split[2] as PoolRegion,
      minSize: Number(split[3]),
      limitSize: Number(split[4]),
      hostname: split[5],
    };
  });
}

export function getBgVMManagers(): { [key: string]: VMManager } {
  const result: { [key: string]: VMManager } = {};
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
