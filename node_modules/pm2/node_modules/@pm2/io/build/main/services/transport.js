"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransportConfig = void 0;
exports.createTransport = createTransport;
const IPCTransport_1 = require("../transports/IPCTransport");
class TransportConfig {
}
exports.TransportConfig = TransportConfig;
function createTransport(name, config) {
    const transport = new IPCTransport_1.IPCTransport();
    transport.init(config);
    return transport;
}
