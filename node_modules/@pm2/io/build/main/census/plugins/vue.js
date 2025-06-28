'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.VuePlugin = void 0;
const core_1 = require("@opencensus/core");
const shimmer = require("shimmer");
var RendererType;
(function (RendererType) {
    RendererType["NORMAL"] = "normal";
    RendererType["BUNDLE"] = "bundle";
})(RendererType || (RendererType = {}));
class VuePlugin extends core_1.BasePlugin {
    constructor(moduleName) {
        super(moduleName);
        this.rendererResults = [];
    }
    applyPatch() {
        this.logger.debug('Patched vue-server-renderer');
        if (this.moduleExports) {
            this.logger.debug('patching vue-server-renderer.prototype.createRenderer');
            shimmer.wrap(this.moduleExports, 'createRenderer', this.getPatchCreateRenderer(RendererType.NORMAL));
            this.logger.debug('patching vue-server-renderer.prototype.createBundleRenderer');
            shimmer.wrap(this.moduleExports, 'createBundleRenderer', this.getPatchCreateRenderer(RendererType.BUNDLE));
        }
        return this.moduleExports;
    }
    applyUnpatch() {
        shimmer.unwrap(this.moduleExports, 'createRenderer');
        shimmer.unwrap(this.moduleExports, 'createBundleRenderer');
        for (let result of this.rendererResults) {
            shimmer.unwrap(result, 'renderToString');
        }
    }
    getPatchCreateRenderer(type) {
        const plugin = this;
        return function createRendererWrap(original) {
            return function create_renderer_trace() {
                const result = original.apply(this, arguments);
                plugin.logger.debug(`patching ${type}.renderToString`);
                shimmer.wrap(result, 'renderToString', plugin.getPatchRenderToString(type));
                plugin.rendererResults.push(result);
                return result;
            };
        };
    }
    getPatchRenderToString(type) {
        const plugin = this;
        return function renderToStringWrap(original) {
            return function render_string_trace() {
                if (!plugin.tracer.currentRootSpan) {
                    return original.apply(this, arguments);
                }
                const span = plugin.tracer.startChildSpan(`vue-renderer`, core_1.SpanKind.CLIENT);
                if (span === null)
                    return original.apply(this, arguments);
                const promise = original.apply(this, arguments);
                if (promise instanceof Promise) {
                    promise.then(plugin.patchEnd(span)).catch(plugin.patchEnd(span));
                }
                return promise;
            };
        };
    }
    patchEnd(span) {
        const plugin = this;
        const patchedEnd = function (err) {
            if (plugin.options.detailedCommands === true && err instanceof Error) {
                span.addAttribute('error', err.message);
            }
            if (span.ended === false) {
                span.end();
            }
        };
        return this.tracer.wrap(patchedEnd);
    }
}
exports.VuePlugin = VuePlugin;
const plugin = new VuePlugin('vue-server-renderer');
exports.plugin = plugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnVlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NlbnN1cy9wbHVnaW5zL3Z1ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxZQUFZLENBQUE7OztBQUVaLDJDQUE2RDtBQUM3RCxtQ0FBa0M7QUFPbEMsSUFBSyxZQUdKO0FBSEQsV0FBSyxZQUFZO0lBQ2YsaUNBQWlCLENBQUE7SUFDakIsaUNBQWlCLENBQUE7QUFDbkIsQ0FBQyxFQUhJLFlBQVksS0FBWixZQUFZLFFBR2hCO0FBR0QsTUFBYSxTQUFVLFNBQVEsaUJBQVU7SUFTdkMsWUFBYSxVQUFrQjtRQUM3QixLQUFLLENBQUMsVUFBVSxDQUFDLENBQUE7UUFKWCxvQkFBZSxHQUEyQixFQUFFLENBQUE7SUFLcEQsQ0FBQztJQUtTLFVBQVU7UUFDbEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQTtRQUVoRCxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsdURBQXVELENBQUMsQ0FBQTtZQUMxRSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsZ0JBQWdCLEVBQy9DLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtZQUNuRCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyw2REFBNkQsQ0FBQyxDQUFBO1lBQ2hGLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxzQkFBc0IsRUFDckQsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBO1NBQ3BEO1FBQ0QsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFBO0lBQzNCLENBQUM7SUFHRCxZQUFZO1FBQ1YsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFF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