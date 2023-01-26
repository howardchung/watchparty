import config from './config';
import { assignVM, getBgVMManagers } from './vm/utils';
import express from 'express';
import Redis from 'ioredis';
import bodyParser from 'body-parser';

let redis: Redis.Redis | undefined = undefined;
if (config.REDIS_URL) {
  redis = new Redis(config.REDIS_URL);
}
const app = express();
const vmManagers = getBgVMManagers();
const redisRefs: { [key: string]: Redis.Redis } = {};

app.use(bodyParser.json());

Object.values(vmManagers).forEach((manager) => {
  manager?.runBackgroundJobs();
});

setInterval(() => {
  redis?.setex('currentVBrowserWaiting', 90, Object.keys(redisRefs).length);
}, 60000);

app.post('/assignVM', async (req, res) => {
  try {
    let redis: Redis.Redis | undefined = undefined;
    if (config.REDIS_URL) {
      redis = new Redis(config.REDIS_URL);
      redisRefs[req.body.uid] = redis;
      setTimeout(() => {
        redis?.disconnect();
        delete redisRefs[req.body.uid];
      }, config.VM_ASSIGNMENT_TIMEOUT * 1000);
    }
    const pool =
      vmManagers[
        req.body.provider + (req.body.isLarge ? 'Large' : '') + req.body.region
      ];
    if (redis && pool) {
      const vm = await assignVM(redis, pool);
      redis?.disconnect();
      delete redisRefs[req.body.uid];
      return res.json(vm ?? null);
    }
  } catch (e) {
    console.warn(e);
  }
  return res.status(400).end();
});

app.post('/releaseVM', async (req, res) => {
  try {
    const pool =
      vmManagers[
        req.body.provider + (req.body.isLarge ? 'Large' : '') + req.body.region
      ];
    redisRefs[req.body.uid]?.disconnect();
    delete redisRefs[req.body.uid];
    if (req.body.id) {
      await pool?.resetVM(req.body.id);
    }
  } catch (e) {
    console.warn(e);
  }
  return res.end();
});

app.get('/stats', async (req, res) => {
  const vmManagerStats: AnyDict = {};
  for (let i = 0; i <= Object.keys(vmManagers).length; i++) {
    const key = Object.keys(vmManagers)[i];
    const vmManager = vmManagers[key];
    const availableVBrowsers = await redis?.lrange(
      vmManager?.getRedisQueueKey() || 'availableList',
      0,
      -1
    );
    const stagingVBrowsers = await redis?.lrange(
      vmManager?.getRedisStagingKey() || 'stagingList',
      0,
      -1
    );
    // const terminationVBrowsers = await redis?.smembers(
    //   vmManager?.getRedisTerminationKey() || 'terminationList',
    // );
    const size = await redis?.get(
      vmManager?.getRedisPoolSizeKey() || 'vmPoolFull'
    );
    if (key && vmManager) {
      vmManagerStats[key] = {
        availableVBrowsers,
        stagingVBrowsers,
        adjustedBuffer: vmManager?.getAdjustedBuffer(),
        // terminationVBrowsers,
        size,
      };
    }
  }
  return res.json(vmManagerStats);
});

app.get('/isVMPoolFull', async (req, res) => {
  const isVMPoolFull: BooleanDict = {};
  for (let i = 0; i <= Object.keys(vmManagers).length; i++) {
    const key = Object.keys(vmManagers)[i];
    const value = vmManagers[key];
    if (value) {
      const availableCount = await redis?.llen(value.getRedisQueueKey());
      const limitSize = value?.getLimitSize() ?? 0;
      const currentSize = await redis?.get(value.getRedisPoolSizeKey());
      isVMPoolFull[key] = Boolean(
        limitSize > 0 &&
          Number(currentSize) - Number(availableCount) > limitSize * 0.95
      );
    }
  }
  return res.json(isVMPoolFull);
});

// curl -X POST http://localhost:3100/updateSnapshot -H 'Content-Type: application/json' -d '{"provider":"Hetzner","isLarge":false,"region":"US"}'
app.post('/updateSnapshot', async (req, res) => {
  const pool =
    vmManagers[
      req.body.provider + (req.body.isLarge ? 'Large' : '') + req.body.region
    ];
  const result = await pool?.updateSnapshot();
  return res.send(result?.toString() + '\n');
});

app.listen(config.VMWORKER_PORT, () => {
  console.log('vmWorker listening on %s', config.VMWORKER_PORT);
});
