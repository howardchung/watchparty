"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.PGPlugin = void 0;
const EventEmitter = require("events");
const core_1 = require("@opencensus/core");
const shimmer = require("shimmer");
class PGPlugin extends core_1.BasePlugin {
    constructor(moduleName) {
        super(moduleName);
        this.internalFileList = {
            '6 - 7': {
                'client': 'lib/client'
            }
        };
    }
    applyPatch() {
        this.logger.debug('Patched PG');
        if (this.internalFilesExports.client) {
            this.logger.debug('patching pq.client.prototype.query');
            shimmer.wrap(this.internalFilesExports.client.prototype, 'query', this.getPatchCreateQuery());
        }
        return this.moduleExports;
    }
    applyUnpatch() {
        shimmer.unwrap(this.internalFilesExports.client.prototype, 'query');
    }
    getPatchCreateQuery() {
        const plugin = this;
        return (original) => {
            return function (...args) {
                const span = plugin.tracer.startChildSpan('pg-query', core_1.SpanKind.CLIENT);
                if (span === null)
                    return original.apply(this, arguments);
                let pgQuery;
                if (arguments.length >= 1) {
                    const args = Array.prototype.slice.call(arguments, 0);
                    plugin.populateLabelsFromInputs(span, args);
                    const callback = args[args.length - 1];
                    if (typeof callback === 'function') {
                        args[args.length - 1] = plugin.patchCallback(callback, span);
                    }
                    else if (typeof args[0] === 'object') {
                        plugin.patchSubmittable(args[0], span);
                    }
                    pgQuery = original.apply(this, args);
                }
                else {
                    pgQuery = original.apply(this, arguments);
                }
                if (pgQuery) {
                    if (pgQuery instanceof EventEmitter) {
                        plugin.tracer.wrapEmitter(pgQuery);
                    }
                    else if (typeof pgQuery.then === 'function') {
                        plugin.patchPromise(pgQuery, span);
                    }
                }
                return pgQuery;
            };
        };
    }
    patchCallback(callback, span) {
        const plugin = this;
        return plugin.tracer.wrap((err, res) => {
            plugin.populateLabelsFromOutputs(span, err, res);
            span.end();
            callback(err, res);
        });
    }
    patchSubmittable(pgQuery, span) {
        const plugin = this;
        let spanEnded = false;
        if (pgQuery.handleError) {
            shimmer.wrap(pgQuery, 'handleError', (origCallback) => {
                return this.tracer.wrap(function (...args) {
                    if (!spanEnded) {
                        const err = args[0];
                        plugin.populateLabelsFromOutputs(span, err);
                        span.end();
                        spanEnded = true;
                    }
                    if (origCallback) {
                        origCallback.apply(this, args);
                    }
                });
            });
        }
        if (pgQuery.handleReadyForQuery) {
            shimmer.wrap(pgQuery, 'handleReadyForQuery', (origCallback) => {
                return this.tracer.wrap(function (...args) {
                    if (!spanEnded) {
                        plugin.populateLabelsFromOutputs(span, null, this._result);
                        span.end();
                        spanEnded = true;
                    }
                    if (origCallback) {
                        origCallback.apply(this, args);
                    }
                });
            });
        }
        return pgQuery;
    }
    patchPromise(promise, span) {
        return promise = promise.then((res) => {
            plugin.populateLabelsFromOutputs(span, null, res);
            span.end();
            return res;
        }, (err) => {
            plugin.populateLabelsFromOutputs(span, err);
            span.end();
            throw err;
        });
    }
    populateLabelsFromInputs(span, args) {
        const queryObj = args[0];
        if (typeof queryObj === 'object') {
            if (queryObj.text) {
                span.addAttribute('query', queryObj.text);
            }
            if (plugin.options.detailedCommands === true && queryObj.values) {
                span.addAttribute('values', queryObj.values);
            }
        }
        else if (typeof queryObj === 'string') {
            span.addAttribute('query', queryObj);
            if (plugin.options.detailedCommands === true && args.length >= 2 && typeof args[1] !== 'function') {
                span.addAttribute('values', args[1]);
            }
        }
    }
    populateLabelsFromOutputs(span, err, res) {
        if (plugin.options.detailedCommands !== true)
            return;
        if (err) {
            span.addAttribute('error', err.toString());
        }
        if (res) {
            span.addAttribute('row_count', res.rowCount);
            span.addAttribute('oid', res.oid);
            span.addAttribute('rows', res.rows);
            span.addAttribute('fields', res.fields);
        }
    }
}
exports.PGPlugin = PGPlugin;
const plugin = new PGPlugin('pg');
exports.plugin = plugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY2Vuc3VzL3BsdWdpbnMvcGcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBZUEsdUNBQXNDO0FBRXRDLDJDQUE2RDtBQUM3RCxtQ0FBa0M7QUFVbEMsTUFBYSxRQUFTLFNBQVEsaUJBQVU7SUFVdEMsWUFBYSxVQUFrQjtRQUM3QixLQUFLLENBQUMsVUFBVSxDQUFDLENBQUE7UUFSQSxxQkFBZ0IsR0FBRztZQUNwQyxPQUFPLEVBQUU7Z0JBQ1AsUUFBUSxFQUFFLFlBQVk7YUFDdkI7U0FDRixDQUFBO0lBS0QsQ0FBQztJQUtTLFVBQVU7UUFDbEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUE7UUFFL0IsSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxFQUFFO1lBQ3BDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLG9DQUFvQyxDQUFDLENBQUE7WUFDdkQsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQTtTQUM5RjtRQUVELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQTtJQUMzQixDQUFDO0lBR0QsWUFBWTtRQUNWLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFDckUsQ0FBQztJQUVPLG1CQUFtQjtRQUN6QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUE7UUFDbkIsT0FBTyxDQUFDLFFBQWtCLEVBQUUsRUFBRTtZQUM1QixPQUFPLFVBQVUsR0FBRyxJQUFXO2dCQUM3QixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxVQUFVLEVBQUUsZUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFBO2dCQUN0RSxJQUFJLElBQUksS0FBSyxJQUFJO29CQUFFLE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUE7Z0JBRXpELElBQUksT0FBTyxDQUFBO2dCQUVYLElBQUksU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7b0JBQ3pCLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUE7b0JBR3JELE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7b0JBSTNDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFBO29CQUN0QyxJQUFJLE9BQU8sUUFBUSxLQUFLLFVBQVUsRUFBRTt3QkFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUE7cUJBQzdEO3lCQUFNLElBQUksT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxFQUFFO3dCQUN0QyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFBO3FCQUN2QztvQkFDRCxPQUFPLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7aUJBQ3JDO3FCQUFNO29CQUNMLE9BQU8sR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQTtpQkFDMUM7Z0JBRUQsSUFBSSxPQUFPLEVBQUU7b0JBQ1gsSUFBSSxPQUFPLFlBQVksWUFBWSxFQUFFO3dCQUNuQyxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQTtxQkFDbkM7eUJBQU0sSUFBSSxPQUFPLE9BQU8sQ0FBQyxJQUFJLEtBQUssVUFBVSxFQUFFO3dCQUM3QyxNQUFNLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQTtxQkFDbkM7aUJBQ0Y7Z0JBQ0QsT0FBTyxPQUFPLENBQUE7WUFDaEIsQ0FBQyxDQUFBO1FBQ0gsQ0FBQyxDQUFBO0lBQ0gsQ0FBQztJQUVPLGFBQWEsQ0FBRSxRQUFRLEVBQUUsSUFBSTtRQUNuQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUE7UUFDbkIsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtZQUNyQyxNQUFNLENBQUMseUJBQXlCLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQTtZQUNoRCxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUE7WUFDVixRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO1FBQ3BCLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVPLGdCQUFnQixDQUFFLE9BQU8sRUFBRSxJQUFJO1FBQ3JDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQTtRQUNuQixJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUE7UUFDckIsSUFBSSxPQUFPLENBQUMsV0FBVyxFQUFFO1lBQ3ZCLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxDQUFDLFlBQVksRUFBRSxFQUFFO2dCQUdwRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQWdCLEdBQUcsSUFBVztvQkFFcEQsSUFBSSxDQUFDLFNBQVMsRUFBRTt3QkFDZCxNQUFNLEdBQUcsR0FBVSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7d0JBQzFCLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUE7d0JBQzNDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTt3QkFDVixTQUFTLEdBQUcsSUFBSSxDQUFBO3FCQUNqQjtvQkFDRCxJQUFJLFlBQVksRUFBRTt3QkFDaEIsWUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7cUJBQy9CO2dCQUNILENBQUMsQ0FBQyxDQUFBO1lBQ0osQ0FBQyxDQUFDLENBQUE7U0FDSDtRQUNELElBQUksT0FBTyxDQUFDLG1CQUFtQixFQUFFO1lBQy9CLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLHFCQUFxQixFQUFFLENBQUMsWUFBWSxFQUFFLEVBQUU7Z0JBRzVELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBZ0IsR0FBRyxJQUFXO29CQUVwRCxJQUFJLENBQUMsU0FBUyxFQUFFO3dCQUNkLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTt3QkFDMUQsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBO3dCQUNWLFNBQVMsR0FBRyxJQUFJLENBQUE7cUJBQ2pCO29CQUNELElBQUksWUFBWSxFQUFFO3dCQUNoQixZQUFZLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQTtxQkFDL0I7Z0JBQ0gsQ0FBQyxDQUFDLENBQUE7WUFDSixDQUFDLENBQUMsQ0FBQTtTQUNIO1FBQ0QsT0FBTyxPQUFPLENBQUE7SUFDaEIsQ0FBQztJQUVPLFlBQVksQ0FBRSxPQUFPLEVBQUUsSUFBSTtRQUNqQyxPQUFPLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7WUFDcEMsTUFBTSxDQUFDLHlCQUF5QixDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUE7WUFDakQsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBO1lBQ1YsT0FBTyxHQUFHLENBQUE7UUFDWixDQUFDLEVBQ0QsQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUNOLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUE7WUFDM0MsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBO1lBQ1YsTUFBTSxHQUFHLENBQUE7UUFDWCxDQUFDLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFFTyx3QkFBd0IsQ0FBRSxJQUFVLEVBQUUsSUFBUztRQUNyRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDeEIsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLEVBQUU7WUFDaEMsSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFO2dCQUNqQixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7YUFDMUM7WUFDRCxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEtBQUssSUFBSSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUU7Z0JBQy9ELElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQTthQUM3QztTQUNGO2FBQU0sSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLEVBQUU7WUFDdkMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUE7WUFDcEMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLGdCQUFnQixLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxVQUFVLEVBQUU7Z0JBQ2pHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO2FBQ3JDO1NBQ0Y7SUFDSCxDQUFDO0lBRU8seUJBQXlCLENBQUUsSUFBVSxFQUFFLEdBQWlCLEVBQUUsR0FBUztRQUN6RSxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEtBQUssSUFBSTtZQUFFLE9BQU07UUFFcEQsSUFBSSxHQUFHLEVBQUU7WUFDUCxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtTQUMzQztRQUNELElBQUksR0FBRyxFQUFFO1lBQ1AsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1lBQzVDLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNqQyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7WUFDbkMsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1NBQ3hDO0lBQ0gsQ0FBQztDQUNGO0FBdEtELDRCQXNLQztBQUVELE1BQU0sTUFBTSxHQUFHLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ3hCLHdCQUFNIn0=