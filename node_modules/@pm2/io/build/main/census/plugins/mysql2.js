"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.Mysql2Plugin = void 0;
const core_1 = require("@opencensus/core");
const shimmer = require("shimmer");
class Mysql2Plugin extends core_1.BasePlugin {
    constructor(moduleName) {
        super(moduleName);
        this.internalFileList = {
            '1 - 3': {
                'Connection': 'lib/connection',
                'Pool': 'lib/pool'
            }
        };
    }
    applyPatch() {
        this.logger.debug('Patched Mysql2');
        if (this.internalFilesExports.Connection) {
            this.logger.debug('patching mysql2.Connection.createQuery');
            shimmer.wrap(this.internalFilesExports.Connection, 'createQuery', this.getPatchCreateQuery());
        }
        if (this.internalFilesExports.Pool) {
            this.logger.debug('patching mysql2.Pool.prototype.getConnection');
            shimmer.wrap(this.internalFilesExports.Pool.prototype, 'getConnection', this.getPatchGetConnection());
        }
        return this.moduleExports;
    }
    applyUnpatch() {
        shimmer.unwrap(this.internalFilesExports.Connection, 'createQuery');
        shimmer.unwrap(this.internalFilesExports.Pool.prototype, 'getConnection');
    }
    getPatchCreateQuery() {
        const plugin = this;
        return (original) => {
            return function (...args) {
                const span = plugin.tracer.startChildSpan('mysql-query', core_1.SpanKind.CLIENT);
                if (span === null)
                    return original.apply(this, arguments);
                const query = original.apply(this, arguments);
                span.addAttribute('sql', query.sql);
                if (plugin.options.detailedCommands === true && query.values) {
                    span.addAttribute('values', query.values);
                }
                if (typeof query._callback === 'function') {
                    query._callback = plugin.patchEnd(span, query._callback);
                }
                else {
                    query.on('end', function () {
                        span.end();
                    });
                }
                return query;
            };
        };
    }
    getPatchGetConnection() {
        const plugin = this;
        return (original) => {
            return function (cb) {
                return original.call(this, plugin.tracer.wrap(cb));
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
            if (resultHandler) {
                return resultHandler.apply(this, arguments);
            }
        };
        return this.tracer.wrap(patchedEnd);
    }
}
exports.Mysql2Plugin = Mysql2Plugin;
const plugin = new Mysql2Plugin('mysql2');
exports.plugin = plugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXlzcWwyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NlbnN1cy9wbHVnaW5zL215c3FsMi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFnQkEsMkNBQTZEO0FBQzdELG1DQUFrQztBQVVsQyxNQUFhLFlBQWEsU0FBUSxpQkFBVTtJQVcxQyxZQUFhLFVBQWtCO1FBQzdCLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQVRBLHFCQUFnQixHQUFHO1lBQ3BDLE9BQU8sRUFBRTtnQkFDUCxZQUFZLEVBQUUsZ0JBQWdCO2dCQUM5QixNQUFNLEVBQUUsVUFBVTthQUNuQjtTQUNGLENBQUE7SUFLRCxDQUFDO0lBS1MsVUFBVTtRQUNsQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO1FBRW5DLElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLFVBQVUsRUFBRTtZQUN4QyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFBO1lBQzNELE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFVBQVUsRUFBRSxhQUFhLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQTtTQUM5RjtRQUVELElBQUksSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRTtZQUNsQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFBO1lBQ2pFLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsZUFBZSxFQUFFLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLENBQUE7U0FDdEc7UUFFRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUE7SUFDM0IsQ0FBQztJQUdELFlBQVk7UUFDVixPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxvQkFB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