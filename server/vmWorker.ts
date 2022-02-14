import config from './config';
import { assignVM, getBgVMManagers, getVMManager } from './vm/utils';
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
      }, 90000);
    }
    const pool = getVMManager(
      req.body.provider,
      req.body.isLarge,
      req.body.region
    );
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
    const pool = getVMManager(
      req.body.provider,
      req.body.isLarge,
      req.body.region
    );
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

// curl -X POST http://localhost:3100/updateSnapshot -H 'Content-Type: application/json' -d '{"provider":"Hetzner","isLarge":false,"region":""}'
app.post('/updateSnapshot', async (req, res) => {
  const pool = getVMManager(
    req.body.provider,
    req.body.isLarge,
    req.body.region
  );
  const result = await pool?.updateSnapshot();
  return res.send(result?.toString());
});

app.listen(config.VMWORKER_PORT, () => {
  console.log('vmWorker listening on %s', config.VMWORKER_PORT);
});
