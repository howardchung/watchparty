"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisCountHourDistinct = exports.getRedisCountDayDistinct = exports.redisCountDistinct = exports.getRedisCountHour = exports.getRedisCountDay = exports.redisCount = exports.redis = void 0;
const config_1 = __importDefault(require("../config"));
const ioredis_1 = __importDefault(require("ioredis"));
const time_1 = require("./time");
exports.redis = undefined;
if (config_1.default.REDIS_URL) {
    exports.redis = new ioredis_1.default(config_1.default.REDIS_URL);
}
async function redisCount(prefix) {
    if (!exports.redis) {
        return;
    }
    const key = `${prefix}:${(0, time_1.getStartOfHour)()}`;
    await exports.redis.incr(key);
    await exports.redis.expireat(key, (0, time_1.getStartOfHour)() + 86400 * 1000);
}
exports.redisCount = redisCount;
async function getRedisCountDay(prefix) {
    if (!exports.redis) {
        return;
    }
    // Get counts for last 24 hour keys (including current partial hour)
    const keyArr = [];
    for (let i = 0; i < 24; i += 1) {
        keyArr.push(`${prefix}:${(0, time_1.getStartOfHour)() - i * 3600 * 1000}`);
    }
    const values = await exports.redis.mget(...keyArr);
    return values.reduce((a, b) => (Number(a) || 0) + (Number(b) || 0), 0);
}
exports.getRedisCountDay = getRedisCountDay;
async function getRedisCountHour(prefix) {
    if (!exports.redis) {
        return;
    }
    // Get counts for previous full hour
    const value = await exports.redis.get(`${prefix}:${(0, time_1.getStartOfHour)() - 3600 * 1000}`);
    return Number(value);
}
exports.getRedisCountHour = getRedisCountHour;
async function redisCountDistinct(prefix, item) {
    if (!exports.redis) {
        return;
    }
    const key = `${prefix}:${(0, time_1.getStartOfHour)()}`;
    await exports.redis.pfadd(key, item);
    await exports.redis.expireat(key, (0, time_1.getStartOfHour)() + 86400 * 1000);
}
exports.redisCountDistinct = redisCountDistinct;
async function getRedisCountDayDistinct(prefix) {
    if (!exports.redis) {
        return;
    }
    // Get counts for last 24 hour keys (including current partial hour)
    const keyArr = [];
    for (let i = 0; i < 24; i += 1) {
        keyArr.push(`${prefix}:${(0, time_1.getStartOfHour)() - i * 3600 * 1000}`);
    }
    return await exports.redis.pfcount(...keyArr);
}
exports.getRedisCountDayDistinct = getRedisCountDayDistinct;
async function getRedisCountHourDistinct(prefix) {
    if (!exports.redis) {
        return;
    }
    // Get counts for previous full hour
    return await exports.redis.pfcount(`${prefix}:${(0, time_1.getStartOfHour)() - 3600 * 1000}`);
}
exports.getRedisCountHourDistinct = getRedisCountHourDistinct;
