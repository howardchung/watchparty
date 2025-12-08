import config from './config.ts';
import axios from 'axios';
import { redis } from './utils/redis.ts';
import { getStats } from './utils/getStats.ts';

statsTimeSeries();
setInterval(statsTimeSeries, 5 * 60 * 1000);

async function statsTimeSeries() {
  if (redis) {
    console.time('timeSeries');
    try {
      const stats = await getStats();
      const isFreePoolFull = (
        await axios.get(
          'http://localhost:' + config.VMWORKER_PORT + '/isFreePoolFull',
        )
      ).data.isFull;
      const datapoint: AnyDict = {
        time: new Date(),
        currentUsers: stats.counts.currentUsers,
        currentVBrowser: stats.counts.currentVBrowser,
        currentVBrowserLarge: stats.counts.currentVBrowserLarge,
        currentHttp: stats.counts.currentHttp,
        currentScreenShare: stats.counts.currentScreenShare,
        currentFileShare: stats.counts.currentFileShare,
        currentVideoChat: stats.counts.currentVideoChat,
        chatMessages: stats.counts.chatMessages,
        redisUsage: stats.counts.redisUsage,
        hetznerApiRemaining: stats.counts.hetznerApiRemaining,
        avgStartMS:
          (stats.vBrowserStartMS || []).map(Number).reduce((a, b) => a + b, 0) /
          (stats.vBrowserStartMS?.length ?? 0),
        vBrowserStarts: stats.counts.vBrowserStarts,
        vBrowserLaunches: stats.counts.vBrowserLaunches,
        vBrowserFails: stats.counts.vBrowserFails,
        vBrowserStagingFails: stats.counts.vBrowserStagingFails,
        isFreePoolFull: Number(isFreePoolFull),
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
