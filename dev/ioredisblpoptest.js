const Redis = require('ioredis');

init();

async function init() {
  const redis = new Redis('localhost:6379');
  const redis2 = new Redis('localhost:6379');
  redis.blpop('ioRedisTest', 0);
  redis.disconnect();
  await redis2.lpush('ioRedisTest', 'val');
  console.log(await redis2.lrange('ioRedisTest', 0, -1));
}
