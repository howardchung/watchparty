setInterval(statsTimeSeries, 5 * 60 * 1000);

async function statsTimeSeries() {
  if (redis) {
    const stats = await getStats();
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
          stats.vBrowserStartMS.reduce((a, b) => Number(a) + Number(b), 0) /
            stats.vBrowserStartMS.length,
      })
    );
    await redis.ltrim('timeSeries', 0, 300);
  }
}
