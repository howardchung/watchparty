'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.IORedisPlugin = void 0;
const core_1 = require("@opencensus/core");
const shimmer = require("shimmer");
const semver = require("semver");
class IORedisPlugin extends core_1.BasePlugin {
    constructor(moduleName) {
        super(moduleName);
    }
    applyPatch() {
        this.logger.debug('Patched redis');
        if (!semver.satisfies(this.version, '>=2.0.0 <5.0.0')) {
            this.logger.info('disabling ioredis plugin because version isnt supported');
            return this.moduleExports;
        }
        if (this.moduleExports) {
            this.logger.debug('patching ioredis.prototype.sendCommand');
            shimmer.wrap(this.moduleExports.prototype, 'sendCommand', this.getPatchSendCommand());
        }
        return this.moduleExports;
    }
    applyUnpatch() {
        if (!semver.satisfies(this.version, '>=2.0.0 <5.0.0'))
            return;
        shimmer.unwrap(this.moduleExports.prototype, 'sendCommand');
    }
    getPatchSendCommand() {
        const plugin = this;
        const addArguments = typeof this.options === 'object'
            && this.options.detailedCommands === true;
        return function internalSendCommandWrap(original) {
            return function internal_send_command_trace(command) {
                if (!plugin.tracer.currentRootSpan) {
                    return original.apply(this, arguments);
                }
                const span = plugin.tracer.startChildSpan(`redis-${command.name}`, core_1.SpanKind.CLIENT);
                if (span === null)
                    return original.apply(this, arguments);
                span.addAttribute('command', command.name);
                if (addArguments) {
                    span.addAttribute('arguments', JSON.stringify(command.args));
                }
                if (typeof command.reject === 'function') {
                    command.reject = plugin.tracer.wrap(command.reject);
                }
                if (typeof command.resolve === 'function') {
                    command.resolve = plugin.tracer.wrap(command.resolve);
                }
                if (typeof command.callback === 'function') {
                    command.callback = plugin.patchEnd(span, command.callback);
                }
                if (typeof command.promise === 'object') {
                    const patchedEnd = function (err) {
                        if (plugin.options.detailedCommands === true && err instanceof Error) {
                            span.addAttribute('error', err.message);
                        }
                        if (span.ended === false) {
                            span.end();
                        }
                    };
                    if (typeof command.promise.finally === 'function') {
                        command.promise.finally(patchedEnd);
                    }
                    else if (typeof command.promise.then === 'function') {
                        command.promise.then(patchedEnd).catch(patchedEnd);
                    }
                }
                return original.apply(this, arguments);
            };
        };
    }
    patchEnd(span, resultHandler) {
        const plugin = this;
        const patchedEnd = function (err) {
            if (plugin.options.detailedCommands === true && err instanceof Error) {
                span.addAttribute('error', err.message);
            }
            if (span.ended === false) {
                span.end();
            }
            return resultHandler.apply(this, arguments);
        };
        return this.tracer.wrap(patchedEnd);
    }
}
exports.IORedisPlugin = IORedisPlugin;
const plugin = new IORedisPlugin('ioredis');
exports.plugin = plugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW9yZWRpcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jZW5zdXMvcGx1Z2lucy9pb3JlZGlzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLFlBQVksQ0FBQTs7O0FBRVosMkNBQTZEO0FBQzdELG1DQUFrQztBQUNsQyxpQ0FBZ0M7QUFxQmhDLE1BQWEsYUFBYyxTQUFRLGlCQUFVO0lBSzNDLFlBQWEsVUFBa0I7UUFDN0IsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFBO0lBQ25CLENBQUM7SUFLUyxVQUFVO1FBQ2xCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFBO1FBRWxDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsZ0JBQWdCLENBQUMsRUFBRTtZQUNyRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyx5REFBeUQsQ0FBQyxDQUFBO1lBQzNFLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQTtTQUMxQjtRQUVELElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFBO1lBQzNELE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsYUFBYSxFQUN0RCxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFBO1NBQzlCO1FBRUQsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFBO0lBQzNCLENBQUM7SUFHRCxZQUFZO1FBQ1YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQztZQUFFLE9BQU07UUFFN0QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQTtJQUM3RCxDQUFDO0lBR08sbUJB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