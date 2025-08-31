import config from '../config.ts';
import { apps } from '../ecosystem.config.js';

export function resolveShard(roomId: string): number {
  if (!config.SHARD) {
    return 0;
  }
  const numShards = apps.filter((app) => app.env?.SHARD).length;
  const letter = roomId[0];
  const charCode = letter.charCodeAt(0);
  return Number((charCode % numShards) + 1);
}
