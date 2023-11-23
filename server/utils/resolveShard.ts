import config from '../config';
import ecosystem from '../ecosystem.config';

export function resolveShard(roomId: string): number {
  if (!config.SHARD) {
    return 0;
  }
  const numShards = ecosystem.apps.filter((app) => app.env?.SHARD).length;
  const letter = roomId[0];
  const charCode = letter.charCodeAt(0);
  return Number((charCode % numShards) + 1);
}
