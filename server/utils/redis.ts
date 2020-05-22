import Redis from 'ioredis';

let redis = (undefined as unknown) as Redis.Redis;
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
}

export async function redisCount(prefix: string) {
  if (!redis) {
    return;
  }
  const key = `${prefix}:${getStartOfHour()}`;
  await redis.incr(key);
  await redis.expireat(key, getStartOfHour() + 86400 * 1000);
}

export async function getRedisCountDay(prefix: string) {
  if (!redis) {
    return;
  }
  // Get counts for last 24 hour keys (including current partial hour)
  const keyArr = [];
  for (let i = 0; i < 24; i += 1) {
    keyArr.push(`${prefix}:${getStartOfHour() - i * 3600 * 1000}`);
  }
  const values = await redis.mget(...keyArr);
  return values.reduce((a, b) => (Number(a) || 0) + (Number(b) || 0), 0);
}

export async function getRedisCountHour(prefix: string) {
  if (!redis) {
    return;
  }
  // Get counts for previous full hour
  const value = await redis.get(`${prefix}:${getStartOfHour() - 3600 * 1000}`);
  return Number(value);
}

function getStartOfDay() {
  const now = Number(new Date());
  return now - (now % 86400000);
}

function getStartOfHour() {
  const now = Number(new Date());
  return now - (now % 3600000);
}

function getStartOfMinute() {
  const now = Number(new Date());
  return now - (now % 60000);
}
