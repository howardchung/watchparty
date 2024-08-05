'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.RedisPlugin = void 0;
const core_1 = require("@opencensus/core");
const shimmer = require("shimmer");
const semver = require("semver");
class RedisPlugin extends core_1.BasePlugin {
    constructor(moduleName) {
        super(moduleName);
    }
    applyPatch() {
        this.logger.debug('Patched redis');
        if (semver.lt(this.version, '2.4.0')) {
            this.logger.info('disabling redis plugin because version isnt supported');
            return this.moduleExports;
        }
        if (this.moduleExports.RedisClient) {
            this.logger.debug('patching redis.RedisClient.prototype.create_stream');
            shimmer.wrap(this.moduleExports.RedisClient.prototype, 'create_stream', this.getPatchCreateStream());
            this.logger.debug('patching redis.RedisClient.prototype.internal_send');
            shimmer.wrap(this.moduleExports.RedisClient.prototype, 'internal_send_command', this.getPatchSendCommand());
            this.logger.debug('patching redis.RedisClient.prototype.createClient');
            shimmer.wrap(this.moduleExports, 'createClient', this.getPatchCreateClient());
        }
        return this.moduleExports;
    }
    applyUnpatch() {
        if (semver.lt(this.version, '2.4.0'))
            return;
        shimmer.unwrap(this.moduleExports.RedisClient.prototype, 'internal_send_command');
        shimmer.unwrap(this.moduleExports, 'createClient');
        shimmer.unwrap(this.moduleExports.RedisClient.prototype, 'create_stream');
    }
    getPatchCreateStream() {
        const plugin = this;
        return function createStreamWrap(original) {
            return function create_stream_trace() {
                if (!this.stream) {
                    Object.defineProperty(this, 'stream', {
                        get: function () { return this._patched_redis_stream; },
                        set: function (val) {
                            plugin.tracer.wrapEmitter(val);
                            this._patched_redis_stream = val;
                        }
                    });
                }
                return original.apply(this, arguments);
            };
        };
    }
    getPatchCreateClient() {
        const plugin = this;
        return function createClientWrap(original) {
            return function createClientTrace() {
                const client = original.apply(this, arguments);
                plugin.tracer.wrapEmitter(client);
                return client;
            };
        };
    }
    getPatchSendCommand() {
        const plugin = this;
        const addArguments = typeof this.options === 'object'
            && this.options.detailedCommands === true;
        return function internalSendCommandWrap(original) {
            return function internal_send_command_trace(cmd, args, cb) {
                if (!plugin.tracer.currentRootSpan) {
                    return original.apply(this, arguments);
                }
                if (arguments.length === 1 && typeof cmd === 'object') {
                    const span = plugin.tracer.startChildSpan(`redis-${cmd.command}`, core_1.SpanKind.CLIENT);
                    if (span === null)
                        return original.apply(this, arguments);
                    span.addAttribute('command', cmd.command);
                    if (addArguments) {
                        span.addAttribute('arguments', JSON.stringify(cmd.args || []));
                    }
                    cmd.callback = plugin.patchEnd(span, cmd.callback);
                    return original.apply(this, arguments);
                }
                if (typeof cmd === 'string' && Array.isArray(args) && typeof cb === 'function') {
                    const span = plugin.tracer.startChildSpan(`redis-${cmd}`, core_1.SpanKind.CLIENT);
                    if (span === null)
                        return original.apply(this, arguments);
                    span.addAttribute('command', cmd);
                    if (addArguments) {
                        span.addAttribute('arguments', JSON.stringify(args));
                    }
                    cb = plugin.patchEnd(span, cb);
                    return original.apply(this, arguments);
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
            if (typeof resultHandler === 'function') {
                return resultHandler.apply(this, arguments);
            }
        };
        return this.tracer.wrap(patchedEnd);
    }
}
exports.RedisPlugin = RedisPlugin;
const plugin = new RedisPlugin('redis');
exports.plugin = plugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkaXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY2Vuc3VzL3BsdWdpbnMvcmVkaXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsWUFBWSxDQUFBOzs7QUFFWiwyQ0FBNkQ7QUFDN0QsbUNBQWtDO0FBQ2xDLGlDQUFnQztBQWVoQyxNQUFhLFdBQVksU0FBUSxpQkFBVTtJQUl6QyxZQUFhLFVBQWtCO1FBQzdCLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUNuQixDQUFDO0lBS1MsVUFBVTtRQUNsQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQTtRQUVsQyxJQUFJLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsRUFBRTtZQUNwQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyx1REFBdUQsQ0FBQyxDQUFBO1lBQ3pFLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQTtTQUMxQjtRQUVELElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUU7WUFDbEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsb0RBQW9ELENBQUMsQ0FBQTtZQUN2RSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxlQUFlLEVBQ3BFLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUE7WUFDOUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsb0RBQW9ELENBQUMsQ0FBQTtZQUN2RSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSx1QkFBdUIsRUFDNUUsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQTtZQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxtREFBbUQsQ0FBQyxDQUFB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