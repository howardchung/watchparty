import config from '../config';
import Redis from 'ioredis';
import { getStartOfHour } from './time';

let redis: Redis.Redis | undefined = undefined;
if (config.REDIS_URL) {
  redis = new Redis(config.REDIS_URL);
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

export async function redisCountDistinct(prefix: string, item: string) {
  if (!redis) {
    return;
  }
  const key = `${prefix}:${getStartOfHour()}`;
  await redis.pfadd(key, item);
  await redis.expireat(key, getStartOfHour() + 86400 * 1000);
}

export async function getRedisCountDayDistinct(prefix: string) {
  if (!redis) {
    return;
  }
  // Get counts for last 24 hour keys (including current partial hour)
  const keyArr = [];
  for (let i = 0; i < 24; i += 1) {
    keyArr.push(`${prefix}:${getStartOfHour() - i * 3600 * 1000}`);
  }
  return await redis.pfcount(...keyArr);
}

export async function getRedisCountHourDistinct(prefix: string) {
  if (!redis) {
    return;
  }
  // Get counts for previous full hour
  return await redis.pfcount(`${prefix}:${getStartOfHour() - 3600 * 1000}`);
}
