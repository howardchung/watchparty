import { resolveShard } from '../server/utils/resolveShard';
import { makeName } from '../server/utils/moniker';

for (let i = 0; i < 100; i++) {
  const shard = (i % 2) + 1;
  const name = makeName(shard);
  const nameShard = resolveShard(name);
  console.log(name, shard, nameShard);
  if (shard !== nameShard) {
    throw new Error('shard mismatch');
  }
}
