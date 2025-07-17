"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageName = void 0;
exports.getVMManagerConfig = getVMManagerConfig;
exports.getBgVMManagers = getBgVMManagers;
exports.getSessionLimitSeconds = getSessionLimitSeconds;
const config_1 = __importDefault(require("../config"));
const scaleway_1 = require("./scaleway");
const hetzner_1 = require("./hetzner");
const digitalocean_1 = require("./digitalocean");
const docker_1 = require("./docker");
// Chromium on ARM: ghcr.io/howardchung/vbrowser/arm-chromium
exports.imageName = 'howardc93/vbrowser';
function createVMManager(poolConfig) {
    let vmManager = null;
    if (config_1.default.SCW_SECRET_KEY &&
        config_1.default.SCW_ORGANIZATION_ID &&
        config_1.default.SCW_IMAGE &&
        config_1.default.SCW_GATEWAY &&
        poolConfig.provider === 'Scaleway') {
        vmManager = new scaleway_1.Scaleway(poolConfig);
    }
    else if (config_1.default.HETZNER_TOKEN &&
        config_1.default.HETZNER_IMAGE &&
        config_1.default.HETZNER_GATEWAY &&
        poolConfig.provider === 'Hetzner') {
        vmManager = new hetzner_1.Hetzner(poolConfig);
    }
    else if (config_1.default.DO_TOKEN &&
        config_1.default.DO_IMAGE &&
        config_1.default.DO_GATEWAY &&
        poolConfig.provider === 'DO') {
        vmManager = new digitalocean_1.DigitalOcean(poolConfig);
    }
    else if (poolConfig.provider === 'Docker') {
        vmManager = new docker_1.Docker(poolConfig);
    }
    if (!vmManager) {
        throw new Error('failed to create vmManager');
    }
    return vmManager;
}
function getVMManagerConfig() {
    return config_1.default.VM_MANAGER_CONFIG.split(',')
        .filter(Boolean)
        .map((c) => {
        const split = c.split(':');
        return {
            provider: split[0],
            isLarge: split[1] === 'large',
            region: split[2],
            minSize: Number(split[3]),
            limitSize: Number(split[4]),
            hostname: split[5],
        };
    });
}
function getBgVMManagers() {
    const result = {};
    const conf = getVMManagerConfig();
    conf.forEach((c) => {
        const mgr = createVMManager(c);
        if (mgr) {
            result[mgr.getPoolName()] = mgr;
        }
    });
    return result;
}
function getSessionLimitSeconds(isLarge) {
    return isLarge
        ? config_1.default.VBROWSER_SESSION_SECONDS_LARGE
        : config_1.default.VBROWSER_SESSION_SECONDS;
}
