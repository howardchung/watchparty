'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.ExpressPlugin = exports.kMiddlewareStack = void 0;
const core_1 = require("@opencensus/core");
const shimmer = require("shimmer");
const semver = require("semver");
exports.kMiddlewareStack = Symbol('express-middleware-stack');
class ExpressPlugin extends core_1.BasePlugin {
    constructor(moduleName) {
        super(moduleName);
        this.kPatched = Symbol('express-layer-patched');
    }
    applyPatch() {
        this.logger.debug('Patched express');
        if (!semver.satisfies(this.version, '^4.0.0')) {
            this.logger.debug('express version %s not supported - aborting...', this.version);
            return this.moduleExports;
        }
        if (this.moduleExports) {
            const routerProto = semver.satisfies(this.version, '^5')
                ? (this.moduleExports.Router && this.moduleExports.Router.prototype)
                : this.moduleExports.Router;
            const plugin = this;
            this.logger.debug('patching express.Router.prototype.route');
            shimmer.wrap(routerProto, 'route', (original) => {
                return function route_trace(path) {
                    const route = original.apply(this, arguments);
                    const layer = this.stack[this.stack.length - 1];
                    plugin.applyLayerPatch(layer, path);
                    return route;
                };
            });
            this.logger.debug('patching express.Router.prototype.use');
            shimmer.wrap(routerProto, 'use', (original) => {
                return function use(path) {
                    const route = original.apply(this, arguments);
                    const layer = this.stack[this.stack.length - 1];
                    plugin.applyLayerPatch(layer, path);
                    return route;
                };
            });
            this.logger.debug('patching express.Application.use');
            shimmer.wrap(this.moduleExports.application, 'use', (original) => {
                return function use(path) {
                    const route = original.apply(this, arguments);
                    const layer = this._router.stack[this._router.stack.length - 1];
                    plugin.applyLayerPatch(layer, path);
                    return route;
                };
            });
        }
        return this.moduleExports;
    }
    applyUnpatch() {
        if (!semver.satisfies(this.version, '^4.0.0')) {
            return this.moduleExports;
        }
        const routerProto = semver.satisfies(this.version, '^5')
            ? (this.moduleExports.Router && this.moduleExports.Router.prototype)
            : this.moduleExports.Router;
        shimmer.unwrap(routerProto, 'use');
        shimmer.unwrap(routerProto, 'route');
        shimmer.unwrap(this.moduleExports.application, 'use');
    }
    applyLayerPatch(layer, layerPath) {
        const plugin = this;
        if (layer[this.kPatched] === true)
            return;
        layer[this.kPatched] = true;
        plugin.logger.debug('patching express.Router.Layer.handle');
        shimmer.wrap(layer, 'handle', function (original) {
            if (original.length !== 4) {
                return function (req, res, next) {
                    plugin.safePush(req, exports.kMiddlewareStack, layerPath);
                    let spanName = `Middleware - ${layer.name}`;
                    if (layer.route) {
                        spanName = `Route - ${layer.route.path}`;
                    }
                    else if (layer.name === 'router') {
                        spanName = `Router - ${layerPath}`;
                    }
                    const span = plugin.tracer.startChildSpan(spanName, core_1.SpanKind.CLIENT);
                    if (span === null)
                        return original.apply(this, arguments);
                    arguments[2] = function () {
                        if (!(req.route && arguments[0] instanceof Error)) {
                            req[exports.kMiddlewareStack].pop();
                        }
                        return plugin.patchEnd(span, next)();
                    };
                    return original.apply(this, arguments);
                };
            }
            return function (_err, req, res, next) {
                return original.apply(this, arguments);
            };
        });
    }
    safePush(obj, prop, value) {
        if (!obj[prop])
            obj[prop] = [];
        obj[prop].push(value);
    }
    patchEnd(span, callback) {
        const plugin = this;
        const patchedEnd = function (err) {
            if (plugin.options.detailedCommands === true && err instanceof Error) {
                span.addAttribute('error', err.message);
            }
            if (span.ended === false) {
                span.end();
            }
            return callback.apply(this, arguments);
        };
        return this.tracer.wrap(patchedEnd);
    }
}
exports.ExpressPlugin = ExpressPlugin;
const plugin = new ExpressPlugin('express');
exports.plugin = plugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwcmVzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jZW5zdXMvcGx1Z2lucy9leHByZXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLFlBQVksQ0FBQTs7O0FBRVosMkNBQTZEO0FBQzdELG1DQUFrQztBQUNsQyxpQ0FBZ0M7QUFHbkIsUUFBQSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsMEJBQTBCLENBQUMsQ0FBQTtBQUdsRSxNQUFhLGFBQWMsU0FBUSxpQkFBVTtJQUszQyxZQUFhLFVBQWtCO1FBQzdCLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUpYLGFBQVEsR0FBRyxNQUFNLENBQUMsdUJBQXVCLENBQUMsQ0FBQTtJQUtsRCxDQUFDO0lBS1MsVUFBVTtRQUNsQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO1FBRXBDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEVBQUU7WUFDN0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsZ0RBQWdELEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQ2pGLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQTtTQUMxQjtRQUVELElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUN0QixNQUFNLFdBQVcsR0FBbUIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQztnQkFDdEUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO2dCQUNwRSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUE7WUFDN0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFBO1lBRW5CLElBQUksQ0FBQyxNQUFNLENB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