"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canUseInspector = canUseInspector;
const semver = require("semver");
exports.default = {
    METRIC_INTERVAL: 990
};
function canUseInspector() {
    const isBun = typeof Bun !== 'undefined';
    const isAboveNode10 = semver.satisfies(process.version, '>= 10.1.0');
    const isAboveNode8 = semver.satisfies(process.version, '>= 8.0.0');
    const canUseInNode8 = process.env.FORCE_INSPECTOR === '1'
        || process.env.FORCE_INSPECTOR === 'true' || process.env.NODE_ENV === 'production';
    return !isBun && (isAboveNode10 || (isAboveNode8 && canUseInNode8));
}
