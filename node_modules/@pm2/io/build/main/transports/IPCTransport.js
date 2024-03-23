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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVBDVHJhbnNwb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3RyYW5zcG9ydHMvSVBDVHJhbnNwb3J0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLCtCQUE4QjtBQUc5QixpREFBNkM7QUFDN0MsbUNBQWtDO0FBRWxDLE1BQWEsWUFBYSxTQUFRLDZCQUFhO0lBQS9DOztRQUVVLGNBQVMsR0FBWSxLQUFLLENBQUE7UUFDMUIsV0FBTSxHQUFhLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0lBd0d2RCxDQUFDO0lBcEdDLElBQUksQ0FBRSxNQUF3QjtRQUM1QixJQUFJLENBQUMsTUFBTSxDQUFDLDRCQUE0QixDQUFDLENBQUE7UUFDekMsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLElBQUksRUFBRTtZQUMzQixPQUFPLENBQUMsS0FBSyxDQUFDLCtDQUErQyxDQUFDLENBQUE7WUFDOUQsT0FBTyxJQUFJLENBQUE7U0FDWjtRQUNELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO1FBQ3JCLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtRQUM3QixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsSUFBYSxFQUFFLEVBQUU7WUFDakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFBO1lBQ2hELElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFBO1FBQ3pCLENBQUMsQ0FBQTtRQUNELE9BQU8sQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUlyQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEtBQUssS0FBSyxFQUFFO1lBQzlCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQTtTQUNwQjtRQUNELE9BQU8sSUFBSSxDQUFBO0lBQ2IsQ0FBQztJQUVPLFlBQVk7UUFHbEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxX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