"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.NetPlugin = void 0;
const core_1 = require("@opencensus/core");
const shimmer = require("shimmer");
class NetPlugin extends core_1.BasePlugin {
    constructor(moduleName) {
        super(moduleName);
    }
    applyPatch() {
        this.logger.debug('applying patch to %s@%s', this.moduleName, this.version);
        if (this.moduleExports && this.moduleExports.Server &&
            this.moduleExports.Server.prototype) {
            shimmer.wrap(this.moduleExports.Server.prototype, 'emit', this.getPatchIncomingRequestFunction());
        }
        else {
            this.logger.error('Could not apply patch to %s.emit. Interface is not as expected.', this.moduleName);
        }
        return this.moduleExports;
    }
    applyUnpatch() {
        if (this.moduleExports && this.moduleExports.Server &&
            this.moduleExports.Server.prototype) {
            shimmer.unwrap(this.moduleExports.Server.prototype, 'emit');
        }
        else {
            this.logger.error('Could not unapply patch to %s.emit. Interface is not as expected.', this.moduleName);
        }
    }
    getPatchIncomingRequestFunction() {
        return (original) => {
            const plugin = this;
            return function incomingRequest(event, ...args) {
                if (event !== 'connection') {
                    return original.apply(this, arguments);
                }
                const socket = args[0];
                plugin.logger.debug('%s plugin incomingRequest', plugin.moduleName);
                const traceOptions = {
                    name: 'socket',
                    kind: core_1.SpanKind.SERVER,
                    spanContext: undefined
                };
                return plugin.tracer.startRootSpan(traceOptions, rootSpan => {
                    if (!rootSpan)
                        return original.apply(this, arguments);
                    plugin.tracer.wrapEmitter(socket);
                    const address = socket.address();
                    if (typeof address === 'string') {
                        rootSpan.addAttribute('net.address', address);
                    }
                    else {
                        rootSpan.addAttribute('net.host', address.address);
                        rootSpan.addAttribute('net.port', address.port);
                        rootSpan.addAttribute('net.family', address.family);
                    }
                    socket.on('error', (err) => {
                        rootSpan.addAttribute('net.error', err.message);
                    });
                    const originalEnd = socket.end;
                    socket.end = function () {
                        if (rootSpan.ended === false) {
                            rootSpan.end();
                        }
                        return originalEnd.apply(this, arguments);
                    };
                    socket.on('close', () => {
                        if (rootSpan.ended === false) {
                            rootSpan.end();
                        }
                    });
                    return original.apply(this, arguments);
                });
            };
        };
    }
}
exports.NetPlugin = NetPlugin;
exports.plugin = new NetPlugin('net');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NlbnN1cy9wbHVnaW5zL25ldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFnQkEsMkNBQXFFO0FBRXJFLG1DQUFrQztBQUdsQyxNQUFhLFNBQVUsU0FBUSxpQkFBVTtJQUd2QyxZQUFhLFVBQWtCO1FBQzdCLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUNuQixDQUFDO0lBS1MsVUFBVTtRQUNsQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUUzRSxJQUFJLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNO1lBQy9DLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRTtZQUN2QyxPQUFPLENBQUMsSUFBSSxDQUNSLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQzNDLElBQUksQ0FBQywrQkFBK0IsRUFBRSxDQUFDLENBQUE7U0FDNUM7YUFBTTtZQUNMLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUNiLGlFQUFpRSxFQUNqRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7U0FDckI7UUFFRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUE7SUFDM0IsQ0FBQztJQUdELFlBQVk7UUFDVixJQUFJLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNO1lBQy9DLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRTtZQUN2QyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQTtTQUM1RDthQUFNO1lBQ0wsSUFBSSxDQUFDLE1B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