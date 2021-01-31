import config from './config';
import Redis from 'ioredis';
import axios from 'axios';

let redis: Redis.Redis | undefined = undefined;
if (config.REDIS_URL) {
  redis = new Redis(config.REDIS_URL);
}

setInterval(statsTimeSeries, 5 * 60 * 1000);

async function statsTimeSeries() {
  if (redis) {
    const response = await axios({
      url: `http://localhost:${config.PORT}/stats`,
    });
    const stats = response.data;
    await redis.lpush(
      'timeSeries',
      JSON.stringify({
        time: new Date(),
        availableVBrowsers: stats.availableVBrowsers?.length,
        availableVBrowsersLarge: stats.availableVBrowsersLarge?.length,
        currentUsers: stats.currentUsers,
        currentVBrowser: stats.currentVBrowser,
        currentVBrowserLarge: stats.currentVBrowserLarge,
        currentHttp: stats.currentHttp,
        currentScreenShare: stats.currentScreenShare,
        currentFileShare: stats.currentFileShare,
        currentVideoChat: stats.currentVideoChat,
        chatMessages: stats.chatMessages,
        roomCount: stats.roomCount,
        redisUsage: stats.redisUsage,
        avgStartMS:
          stats.vBrowserStartMS &&
          stats.vBrowserStartMS.reduce(
            (a: string, b: string) => Number(a) + Number(b),
            0
          ) / stats.vBrowserStartMS.length,
      })
    );
    await redis.ltrim('timeSeries', 0, 300);
  }
}
