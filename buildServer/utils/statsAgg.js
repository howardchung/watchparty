"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsAgg = statsAgg;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config"));
const ecosystem_config_1 = __importDefault(require("../ecosystem.config"));
async function statsAgg() {
    const ports = process.env.NODE_ENV === 'development'
        ? [8080]
        : ecosystem_config_1.default.apps.map((app) => app.env?.PORT).filter(Boolean);
    const shardReqs = ports.map((port) => (0, axios_1.default)({
        url: `http://localhost:${port}/stats?key=${config_1.default.STATS_KEY}`,
        validateStatus: () => true,
    }));
    let stats = {};
    const shardData = await Promise.all(shardReqs);
    shardData.forEach((shard) => {
        const data = shard.data;
        stats = combine(stats, data);
    });
    return stats;
}
function combine(a, b, forceCombine = false) {
    const result = { ...a };
    Object.keys(b).forEach((key) => {
        if (key.startsWith('current') || forceCombine) {
            if (typeof b[key] === 'number') {
                result[key] = (result[key] || 0) + b[key];
            }
            else if (typeof b[key] === 'string') {
                result[key] = (result[key] || '') + b[key];
            }
            else if (Array.isArray(b[key])) {
                result[key] = [...(result[key] || []), ...b[key]];
            }
            else if (typeof b[key] === 'object') {
                result[key] = combine(result[key] || {}, b[key], true);
            }
        }
        else {
            result[key] = a[key] || b[key];
        }
    });
    return result;
}
