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
    const pools = Object.values(vmManagers).filter((mgr) => {
      return (
        mgr.getIsLarge() === Boolean(req.body.isLarge) &&
        mgr.getRegion() === req.body.region
      );
    });
    let vm = null;
    // Sequentially try each to give earlier pools preference
    // We might want to add the ability to load balance as well by randomly selecting between pools with same priority
    for (let i = 0; i < pools.length; i++) {
      const pool = pools[i];
      console.log(
        'try assignVM from pool:',
        pool.getPoolName(),
        req.body.roomId,
        req.body.uid,
      );
      vm = await pool.assignVM(req.body.roomId, req.body.uid);
      if (vm) {
        return res.json(vm);
      }
    }
    return res.json(null);
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
  const freePools = Object.values(vmManagers).filter((mgr) => {
    return (
      mgr?.getIsLarge() === false &&
      mgr?.getRegion() === config.DEFAULT_VM_REGION &&
      mgr?.getLimitSize() > 0
    );
  });
  const fullResult = await Promise.all<Boolean>(
    freePools.map(async (freePool) => {
      let isFull = false;
      if (freePool) {
        const availableCount = await freePool.getAvailableCount();
        const limitSize = freePool?.getLimitSize() ?? 0;
        const currentSize = await freePool.getCurrentSize();
        isFull = Boolean(
          limitSize > 0 &&
            (Number(availableCount) === 0 ||
              Number(currentSize) - Number(availableCount) > limitSize * 0.95),
        );
      }
      return isFull;
    }),
  );
  const isFull = fullResult.every(Boolean);
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
