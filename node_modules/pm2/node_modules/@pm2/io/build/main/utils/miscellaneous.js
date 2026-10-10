"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serviceManager_1 = require("../serviceManager");
class MiscUtils {
    static generateUUID() {
        return Math.random().toString(36).substr(2, 16);
    }
    static getValueFromDump(property, parentProperty) {
        if (!parentProperty) {
            parentProperty = 'handles';
        }
        const dump = serviceManager_1.ServiceManager.get('eventLoopService').inspector.dump();
        return dump[parentProperty].hasOwnProperty(property) ? dump[parentProperty][property].length : 0;
    }
}
exports.default = MiscUtils;
