"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPCTransport = void 0;
const Debug = require("debug");
const eventemitter2_1 = require("eventemitter2");
const cluster = require("cluster");
class IPCTransport extends eventemitter2_1.EventEmitter2 {
    constructor() {
        super(...arguments);
        this.initiated = false;
        this.logger = Debug('axm:transport:ipc');
    }
    init(config) {
        this.logger('Init new transport service');
        if (this.initiated === true) {
            console.error(`Trying to re-init the transport, please avoid`);
            return this;
        }
        this.initiated = true;
        this.logger('Agent launched');
        this.onMessage = (data) => {
            this.logger(`Received reverse message from IPC`);
            this.emit('data', data);
        };
        process.on('message', this.onMessage);
        if (cluster.isWorker === false) {
            this.autoExitHook();
        }
        return this;
    }
    autoExitHook() {
        this.autoExitHandle = setInterval(() => {
            let currentProcess = (cluster.isWorker) ? cluster.worker.process : process;
            if (currentProcess._getActiveHandles().length === 3) {
                let handlers = currentProcess._getActiveHandles().map(h => h.constructor.name);
                if (handlers.includes('Pipe') === true &&
                    handlers.includes('Socket') === true) {
                    process.removeListener('message', this.onMessage);
                    let tmp = setTimeout(_ => {
                        this.logger(`Still alive, listen back to IPC`);
                        process.on('message', this.onMessage);
                    }, 200);
                    tmp.unref();
                }
            }
        }, 3000);
        this.autoExitHandle.unref();
    }
    setMetrics(metrics) {
        const serializedMetric = metrics.reduce((object, metric) => {
            if (typeof metric.name !== 'string')
                return object;
            object[metric.name] = {
                historic: metric.historic,
                unit: metric.unit,
                type: metric.id,
                value: metric.value
            };
            return object;
        }, {});
        this.send('axm:monitor', serializedMetric);
    }
    addAction(action) {
        this.logger(`Add action: ${action.name}:${action.type}`);
        this.send('axm:action', {
            action_name: action.name,
            action_type: action.type,
            arity: action.arity,
            opts: action.opts
        });
    }
    setOptions(options) {
        this.logger(`Set options: [${Object.keys(options).join(',')}]`);
        return this.send('axm:option:configuration', options);
    }
    send(channel, payload) {
        if (typeof process.send !== 'function')
            return -1;
        if (process.connected === false) {
            console.error('Process disconnected from parent! (not connected)');
            return process.exit(1);
        }
        try {
            process.send({ type: channel, data: payload });
        }
        catch (err) {
            this.logger('Process disconnected from parent !');
            this.logger(err);
            return process.exit(1);
        }
    }
    destroy() {
        if (this.onMessage !== undefined) {
            process.removeListener('message', this.onMessage);
        }
        if (this.autoExitHandle !== undefined) {
            clearInterval(this.autoExitHandle);
        }
        this.logger('destroy');
    }
}
exports.IPCTransport = IPCTransport;
