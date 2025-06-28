"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
const statsAgg_1 = require("./utils/statsAgg");
const axios_1 = __importDefault(require("axios"));
const redis_1 = require("./utils/redis");
statsTimeSeries();
setInterval(statsTimeSeries, 5 * 60 * 1000);
async function statsTimeSeries() {
    if (redis_1.redis) {
        console.time('timeSeries');
        try {
            const stats = await (0, statsAgg_1.statsAgg)();
            const isFreePoolFull = (await axios_1.default.get('http://localhost:' + config_1.default.VMWORKER_PORT + '/isFreePoolFull')).data.isFull;
            const datapoint = {
                time: new Date(),
                currentUsers: stats.currentUsers,
                currentVBrowser: stats.currentVBrowser,
                currentVBrowserLarge: stats.currentVBrowserLarge,
                currentHttp: stats.currentHttp,
                currentScreenShare: stats.currentScreenShare,
                currentFileShare: stats.currentFileShare,
                currentVideoChat: stats.currentVideoChat,
                chatMessages: stats.chatMessages,
                redisUsage: stats.redisUsage,
                hetznerApiRemaining: stats.hetznerApiRemaining,
                avgStartMS: stats.vBrowserStartMS &&
                    stats.vBrowserStartMS.reduce((a, b) => Number(a) + Number(b), 0) / stats.vBrowserStartMS.length,
                vBrowserStarts: stats.vBrowserStarts,
                vBrowserLaunches: stats.vBrowserLaunches,
                vBrowserFails: stats.vBrowserFails,
                vBrowserStagingFails: stats.vBrowserStagingFails,
                isFreePoolFull: Number(isFreePoolFull),
            };
            Object.keys(stats.vmManagerStats).forEach((key) => {
                if (stats.vmManagerStats[key]) {
                    datapoint[key] =
                        stats.vmManagerStats[key]?.availableVBrowsers?.length;
                }
            });
            await redis_1.redis.lpush('timeSeries', JSON.stringify(datapoint));
            await redis_1.redis.ltrim('timeSeries', 0, 288);
        }
        catch (e) {
            console.warn(`[TIMESERIES] %s when collecting stats`, e.code);
        }
        console.timeEnd('timeSeries');
    }
}
