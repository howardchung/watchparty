import config from './config';
import Redis from 'ioredis';
import { Room } from './room';

let redis: Redis.Redis | undefined = undefined;
if (config.REDIS_URL) {
  redis = new Redis(config.REDIS_URL);
}

console.log('forked');

process.on(
  'message',
  async (msg: { rooms: Map<string, Room>; permanentSet: Set<string> }) => {
    console.log(msg);
    const { rooms, permanentSet } = msg;
    // console.time('roomSave');
    const roomArr = Array.from(rooms.values());
    for (let i = 0; i < roomArr.length; i++) {
      const isPermanent = permanentSet.has(roomArr[i].roomId);
      if (roomArr[i].roster.length) {
        if (redis) {
          await roomArr[i].saveToRedis(isPermanent);
        }
      }
    }
  }
);
