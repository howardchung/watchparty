"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
const utils_1 = require("./vm/utils");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = (0, express_1.default)();
const vmManagers = (0, utils_1.getBgVMManagers)();
app.use(body_parser_1.default.json());
Object.values(vmManagers).forEach((manager) => {
    manager?.runBackgroundJobs();
});
app.post('/assignVM', async (req, res) => {
    try {
        // Find a pool that matches the size and region requirements
        const pools = Object.values(vmManagers).filter((mgr) => {
            return (mgr.getIsLarge() === Boolean(req.body.isLarge) &&
                mgr.getRegion() === req.body.region);
        });
        let vm = null;
        // Sequentially try each to give earlier pools preference
        // We might want to add the ability to load balance as well by randomly selecting between pools with same priority
        for (let i = 0; i < pools.length; i++) {
            const pool = pools[i];
            console.log('try assignVM from pool:', pool.getPoolName(), req.body.roomId, req.body.uid);
            vm = await pool.assignVM(req.body.roomId, req.body.uid);
            if (vm) {
                res.json(vm);
                return;
            }
        }
        res.json(null);
    }
    catch (e) {
        console.warn(e);
        res.status(500).end();
    }
});
app.post('/releaseVM', async (req, res) => {
    try {
        const pool = vmManagers[req.body.provider + (req.body.isLarge ? 'Large' : '') + req.body.region];
        if (req.body.id) {
            await pool?.resetVM(req.body.id, req.body.roomId);
        }
        res.end();
    }
    catch (e) {
        console.warn(e);
        res.status(500).end();
    }
});
app.get('/stats', async (req, res) => {
    const vmManagerStats = {};
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
    res.json(vmManagerStats);
});
app.get('/isFreePoolFull', async (req, res) => {
    const freePools = Object.values(vmManagers).filter((mgr) => {
        return (mgr?.getIsLarge() === false &&
            mgr?.getRegion() === config_1.default.DEFAULT_VM_REGION &&
            mgr?.getLimitSize() > 0);
    });
    const fullResult = await Promise.all(freePools.map(async (freePool) => {
        let isFull = false;
        if (freePool) {
            const availableCount = await freePool.getAvailableCount();
            const limitSize = freePool?.getLimitSize() ?? 0;
            const currentSize = await freePool.getCurrentSize();
            isFull = Boolean(limitSize > 0 &&
                (Number(availableCount) === 0 ||
                    Number(currentSize) - Number(availableCount) > limitSize * 0.95));
        }
        return isFull;
    }));
    const isFull = freePools.length && fullResult.every(Boolean);
    res.json({ isFull });
});
app.post('/updateSnapshot', async (req, res) => {
    const pool = vmManagers[req.body.provider + req.body.region];
    const result = await pool?.updateSnapshot();
    res.send(result?.toString() + '\n');
});
app.listen(config_1.default.VMWORKER_PORT, () => {
    console.log('vmWorker listening on %s', config_1.default.VMWORKER_PORT);
});
