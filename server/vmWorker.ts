import config from './config';
import { getBgVMManagers } from './vm/utils';
import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const vmManagers = getBgVMManagers();

app.use(bodyParser.json());

Object.values(vmManagers).forEach((manager) => {
  manager?.runBackgroundJobs();
});

app.post('/assignVM', async (req, res) => {
  try {
    // Find a pool that matches the size and region requirements
    const pool = Object.values(vmManagers).find((mgr) => {
      return (
        mgr?.getIsLarge() === Boolean(req.body.isLarge) &&
        mgr?.getRegion() === req.body.region
      );
    });
    // TODO maybe there's more than one, load balance between them?
    // However if the pool is 0 sized we need to consistently request the same pool for a given uid/roomid
    // Otherwise we may spawn multiple VMs on retries
    if (pool) {
      console.log(
        'assignVM from pool:',
        pool.getPoolName(),
        req.body.roomId,
        req.body.uid
      );
      const vm = await pool.assignVM(req.body.roomId, req.body.uid);
      return res.json(vm ?? null);
    }
    return res.status(400).end();
  } catch (e) {
    console.warn(e);
    return res.status(500).end();
  }
});

app.post('/releaseVM', async (req, res) => {
  try {
    const pool =
      vmManagers[
        req.body.provider + (req.body.isLarge ? 'Large' : '') + req.body.region
      ];
    if (req.body.id) {
      await pool?.resetVM(req.body.id, req.body.roomId);
    }
    return res.end();
  } catch (e) {
    console.warn(e);
    return res.status(500).end();
  }
});

app.get('/stats', async (req, res) => {
  const vmManagerStats: AnyDict = {};
  for (let i = 0; i <= Object.keys(vmManagers).length; i++) {
    const key = Object.keys(vmManagers)[i];
    const vmManager = vmManagers[key];
    const availableVBrowsers = await vmManager?.getAvailableVBrowsers();
    const stagingVBrowsers = await vmManager?.getStagingVBrowsers();
    const size = await vmManager?.getCurrentSize();
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

app.get('/isFreePoolFull', async (req, res) => {
  const freePool = Object.values(vmManagers).find((mgr) => {
    return (
      mgr?.getIsLarge() === false &&
      mgr?.getRegion() === config.DEFAULT_VM_REGION
    );
  });
  let isFull = false;
  if (freePool) {
    const availableCount = await freePool.getAvailableCount();
    const limitSize = freePool?.getLimitSize() ?? 0;
    const currentSize = await freePool.getCurrentSize();
    isFull = Boolean(
      limitSize > 0 &&
        (Number(availableCount) === 0 ||
          Number(currentSize) - Number(availableCount) > limitSize * 0.95)
    );
  }
  return res.json({ isFull });
});

app.post('/updateSnapshot', async (req, res) => {
  const pool = vmManagers[req.body.provider + req.body.region];
  const result = await pool?.updateSnapshot();
  return res.send(result?.toString() + '\n');
});

app.listen(config.VMWORKER_PORT, () => {
  console.log('vmWorker listening on %s', config.VMWORKER_PORT);
});
