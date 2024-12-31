"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.MongoDBPlugin = void 0;
const core_1 = require("@opencensus/core");
const shimmer = require("shimmer");
class MongoDBPlugin extends core_1.BasePlugin {
    constructor(moduleName) {
        super(moduleName);
        this.internalFileList = {
            '1 - 3': {
                'ConnectionPool': 'lib/connection/pool'
            }
        };
    }
    applyPatch() {
        this.logger.debug('Patched MongoDB');
        if (this.moduleExports.Server) {
            this.logger.debug('patching mongodb-core.Server.prototype functions: insert, remove, command, update');
            shimmer.wrap(this.moduleExports.Server.prototype, 'insert', this.getPatchCommand('mongodb-insert'));
            shimmer.wrap(this.moduleExports.Server.prototype, 'remove', this.getPatchCommand('mongodb-remove'));
            shimmer.wrap(this.moduleExports.Server.prototype, 'command', this.getPatchCommand('mongodb-command'));
            shimmer.wrap(this.moduleExports.Server.prototype, 'update', this.getPatchCommand('mongodb-update'));
        }
        if (this.moduleExports.Cursor) {
            this.logger.debug('patching mongodb-core.Cursor.prototype.next');
            shimmer.wrap(this.moduleExports.Cursor.prototype, 'next', this.getPatchCursor());
        }
        if (this.internalFilesExports.ConnectionPool) {
            this.logger.debug('patching mongodb-core/lib/connection/pool');
            shimmer.wrap(this.internalFilesExports.ConnectionPool.prototype, 'once', this.getPatchEventEmitter());
        }
        return this.moduleExports;
    }
    applyUnpatch() {
        shimmer.unwrap(this.moduleExports.Server.prototype, 'insert');
        shimmer.unwrap(this.moduleExports.Server.prototype, 'remove');
        shimmer.unwrap(this.moduleExports.Server.prototype, 'command');
        shimmer.unwrap(this.moduleExports.Server.prototype, 'update');
        shimmer.unwrap(this.moduleExports.Cursor.prototype, 'next');
        if (this.internalFilesExports.ConnectionPool) {
            shimmer.unwrap(this.internalFilesExports.ConnectionPool.prototype, 'once');
        }
    }
    getPatchCommand(label) {
        const plugin = this;
        return (original) => {
            return function (ns, command, options, callback) {
                const resultHandler = typeof options === 'function' ? options : callback;
                if (plugin.tracer.currentRootSpan && typeof resultHandler === 'function') {
                    let type;
                    if (command.createIndexes) {
                        type = 'createIndexes';
                    }
                    else if (command.findandmodify) {
                        type = 'findAndModify';
                    }
                    else if (command.ismaster) {
                        type = 'isMaster';
                    }
                    else if (command.count) {
                        type = 'count';
                    }
                    else {
                        type = 'command';
                    }
                    const span = plugin.tracer.startChildSpan(label, core_1.SpanKind.CLIENT);
                    if (span === null)
                        return original.apply(this, arguments);
                    span.addAttribute('database', ns);
                    span.addAttribute('type', type);
                    if (plugin.options.detailedCommands === true) {
                        span.addAttribute('command', JSON.stringify(command));
                    }
                    if (typeof options === 'function') {
                        return original.call(this, ns, command, plugin.patchEnd(span, options));
                    }
                    else {
                        return original.call(this, ns, command, options, plugin.patchEnd(span, callback));
                    }
                }
                return original.apply(this, arguments);
            };
        };
    }
    getPatchCursor() {
        const plugin = this;
        return (original) => {
            return function (...args) {
                let resultHandler = args[0];
                if (plugin.tracer.currentRootSpan && typeof resultHandler === 'function') {
                    const span = plugin.tracer.startChildSpan('mongodb-find', core_1.SpanKind.CLIENT);
                    if (span === null)
                        return original.apply(this, arguments);
                    resultHandler = plugin.patchEnd(span, resultHandler);
                    span.addAttribute('database', this.ns);
                    if (plugin.options.detailedCommands === true && typeof this.cmd.query === 'object') {
                        span.addAttribute('command', JSON.stringify(this.cmd.query));
                    }
                }
                return original.call(this, resultHandler);
            };
        };
    }
    getPatchEventEmitter() {
        const plugin = this;
        return (original) => {
            return function (event, cb) {
                return original.call(this, event, plugin.tracer.wrap(cb));
            };
        };
    }
    patchEnd(span, resultHandler) {
        const plugin = this;
        const patchedEnd = function (err, res) {
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
exports.MongoDBPlugin = MongoDBPlugin;
const plugin = new MongoDBPlugin('mongodb-core');
exports.plugin = plugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9uZ29kYi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jZW5zdXMvcGx1Z2lucy9tb25nb2RiLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQWdCQSwyQ0FBbUU7QUFDbkUsbUNBQWtDO0FBVWxDLE1BQWEsYUFBYyxTQUFRLGlCQUFVO0lBVTNDLFlBQWEsVUFBa0I7UUFDN0IsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFBO1FBUkEscUJBQWdCLEdBQUc7WUFDcEMsT0FBTyxFQUFFO2dCQUNQLGdCQUFnQixFQUFFLHFCQUFxQjthQUN4QztTQUNGLENBQUE7SUFLRCxDQUFDO0lBS1MsVUFBVTtRQUNsQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO1FBRXBDLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUU7WUFDN0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsbUZBQW1GLENBQUMsQ0FBQTtZQUN0RyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUE7WUFDbkcsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFBO1lBQ25HLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQTtZQUNyRyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxRQUFRLEVB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