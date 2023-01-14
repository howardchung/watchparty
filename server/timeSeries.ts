import config from './config';
import Redis from 'ioredis';
import { statsAgg } from './utils/statsAgg';

let redis: Redis.Redis | undefined = undefined;
if (config.REDIS_URL) {
  redis = new Redis(config.REDIS_URL);
}

statsTimeSeries();
setInterval(statsTimeSeries, 5 * 60 * 1000);

async function statsTimeSeries() {
  if (redis) {
    console.time('timeSeries');
    try {
      const stats = await statsAgg();
      const datapoint: any = {
        time: new Date(),
        currentUsers: stats.currentUsers,
        currentVBrowser: stats.currentVBrowser,
        currentVBrowserLarge: stats.currentVBrowserLarge,
        currentHttp: stats.currentHttp,
        currentScreenShare: stats.currentScreenShare,
        currentFileShare: stats.currentFileShare,
        currentVideoChat: stats.currentVideoChat,
        currentRoomCount: stats.currentRoomCount,
        chatMessages: stats.chatMessages,
        redisUsage: stats.redisUsage,
        hetznerApiRemaining: stats.hetznerApiRemaining,
        avgStartMS:
          stats.vBrowserStartMS &&
          stats.vBrowserStartMS.reduce(
            (a: string, b: string) => Number(a) + Number(b),
            0
          ) / stats.vBrowserStartMS.length,
        vBrowserStarts: stats.vBrowserStarts,
        vBrowserLaunches: stats.vBrowserLaunches,
        vBrowserFails: stats.vBrowserFails,
        vBrowserStagingFails: stats.vBrowserStagingFails,
      };
      Object.keys(stats.vmManagerStats).forEach((key) => {
        if (stats.vmManagerStats[key]) {
          datapoint[key] =
            stats.vmManagerStats[key]?.availableVBrowsers?.length;
        }
      });
      await redis.lpush('timeSeries', JSON.stringify(datapoint));
      await redis.ltrim('timeSeries', 0, 288);
    } catch (e: any) {
      console.warn(`[TIMESERIES] %s when collecting stats`, e.code);
    }
    console.timeEnd('timeSeries');
  }
}
