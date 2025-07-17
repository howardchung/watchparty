"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveShard = resolveShard;
const config_1 = __importDefault(require("../config"));
const ecosystem_config_1 = __importDefault(require("../ecosystem.config"));
function resolveShard(roomId) {
    if (!config_1.default.SHARD) {
        return 0;
    }
    const numShards = ecosystem_config_1.default.apps.filter((app) => app.env?.SHARD).length;
    const letter = roomId[0];
    const charCode = letter.charCodeAt(0);
    return Number((charCode % numShards) + 1);
}
