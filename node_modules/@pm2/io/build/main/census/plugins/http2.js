"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.Http2Plugin = void 0;
const core_1 = require("@opencensus/core");
const http_1 = require("./http");
const shimmer = require("shimmer");
const url = require("url");
const uuid = require("uuid");
class Http2Plugin extends http_1.HttpPlugin {
    constructor() {
        super('http2');
    }
    applyPatch() {
        shimmer.wrap(this.moduleExports, 'createServer', this.getPatchCreateServerFunction());
        shimmer.wrap(this.moduleExports, 'createSecureServer', this.getPatchCreateServerFunction());
        shimmer.wrap(this.moduleExports, 'connect', this.getPatchConnectFunction());
        return this.moduleExports;
    }
    applyUnpatch() {
        shimmer.unwrap(this.moduleExports, 'createServer');
        shimmer.unwrap(this.moduleExports, 'createSecureServer');
        shimmer.unwrap(this.moduleExports, 'connect');
    }
    getPatchConnectFunction() {
        const plugin = this;
        return (original) => {
            return function patchedConnect(authority) {
                const client = original.apply(this, arguments);
                shimmer.wrap(client, 'request', (original) => (plugin.getPatchRequestFunction())(original, authority));
                shimmer.unwrap(plugin.moduleExports, 'connect');
                return client;
            };
        };
    }
    getPatchRequestFunction() {
        const plugin = this;
        return (original, authority) => {
            return function patchedRequest(headers) {
                if (headers['x-opencensus-outgoing-request']) {
                    return original.apply(this, arguments);
                }
                const request = original.apply(this, arguments);
                plugin.tracer.wrapEmitter(request);
                const traceOptions = {
                    name: `http2-${(headers[':method'] || 'GET').toLowerCase()}`,
                    kind: core_1.SpanKind.CLIENT
                };
                if (!plugin.tracer.currentRootSpan) {
                    return plugin.tracer.startRootSpan(traceOptions, plugin.getMakeHttp2RequestTraceFunction(request, headers, authority, plugin));
                }
                else {
                    const span = plugin.tracer.startChildSpan(traceOptions.name, traceOptions.kind);
                    return (plugin.getMakeHttp2RequestTraceFunction(request, headers, authority, plugin))(span);
                }
            };
        };
    }
    getMakeHttp2RequestTraceFunction(request, headers, authority, plugin) {
        return (span) => {
            if (!span)
                return request;
            const setter = {
                setHeader(name, value) {
                    headers[name] = value;
                }
            };
            const propagation = plugin.tracer.propagation;
            if (propagation) {
                propagation.inject(setter, span.spanContext);
            }
            request.on('response', (responseHeaders) => {
                const status = `${responseHeaders[':status']}`;
                span.addAttribute(Http2Plugin.ATTRIBUTE_HTTP_STATUS_CODE, status);
                span.setStatus(Http2Plugin.convertTraceStatus(parseInt(status, 10)));
            });
            request.on('end', () => {
                const userAgent = headers['user-agent'] || headers['User-Agent'] || null;
                span.addAttribute(Http2Plugin.ATTRIBUTE_HTTP_HOST, `${url.parse(authority).host}`);
                span.addAttribute(Http2Plugin.ATTRIBUTE_HTTP_METHOD, `${headers[':method']}`);
                span.addAttribute(Http2Plugin.ATTRIBUTE_HTTP_PATH, `${headers[':path']}`);
                span.addAttribute(Http2Plugin.ATTRIBUTE_HTTP_ROUTE, `${headers[':path']}`);
                if (userAgent) {
                    span.addAttribute(Http2Plugin.ATTRIBUTE_HTTP_USER_AGENT, `${userAgent}`);
                }
                span.addMessageEvent(core_1.MessageEventType.SENT, uuid.v4().split('-').join(''));
                span.end();
            });
            request.on('error', (err) => {
                span.addAttribute(http_1.HttpPlugin.ATTRIBUTE_HTTP_ERROR_NAME, err.name);
                span.addAttribute(http_1.HttpPlugin.ATTRIBUTE_HTTP_ERROR_MESSAGE, err.message);
                span.setStatus(core_1.CanonicalCode.UNKNOWN, err.message);
                span.end();
            });
            return request;
        };
    }
    getPatchCreateServerFunction() {
        const plugin = this;
        return (original) => {
            return function patchedCreateServer() {
                const server = original.apply(this, arguments);
                shimmer.wrap(server.constructor.prototype, 'emit', plugin.getPatchEmitFunction());
                shimmer.unwrap(plugin.moduleExports, 'createServer');
                shimmer.unwrap(plugin.moduleExports, 'createSecureServer');
                return server;
            };
        };
    }
    getPatchEmitFunction() {
        const plugin = this;
        return (original) => {
            return function patchedEmit(event, stream, headers) {
                if (event !== 'stream') {
                    return original.apply(this, arguments);
                }
                const propagation = plugin.tracer.propagation;
                const getter = {
                    getHeader(name) {
                        return headers[name];
                    }
                };
                const traceOptions = {
                    name: headers[':path'],
                    kind: core_1.SpanKind.SERVER,
                    spanContext: propagation ? propagation.extract(getter) : null
                };
                let statusCode = 0;
                const originalRespond = stream.respond;
                stream.respond = function () {
                    stream.respond = originalRespond;
                    statusCode = arguments[0][':status'];
                    return stream.respond.apply(this, arguments);
                };
                return plugin.tracer.startRootSpan(traceOptions, rootSpan => {
                    if (!rootSpan)
                        return original.apply(this, arguments);
                    plugin.tracer.wrapEmitter(stream);
                    const originalEnd = stream.end;
                    stream.end = function () {
                        stream.end = originalEnd;
                        const returned = stream.end.apply(this, arguments);
                        const userAgent = (headers['user-agent'] || headers['User-Agent'] ||
                            null);
                        rootSpan.addAttribute(Http2Plugin.ATTRIBUTE_HTTP_HOST, `${headers[':authority']}`);
                        rootSpan.addAttribute(Http2Plugin.ATTRIBUTE_HTTP_METHOD, `${headers[':method']}`);
                        rootSpan.addAttribute(Http2Plugin.ATTRIBUTE_HTTP_PATH, `${headers[':path']}`);
                        rootSpan.addAttribute(Http2Plugin.ATTRIBUTE_HTTP_ROUTE, `${headers[':path']}`);
                        rootSpan.addAttribute(Http2Plugin.ATTRIBUTE_HTTP_USER_AGENT, userAgent);
                        rootSpan.addAttribute(Http2Plugin.ATTRIBUTE_HTTP_STATUS_CODE, `${statusCode}`);
                        rootSpan.setStatus(Http2Plugin.convertTraceStatus(statusCode));
                        rootSpan.addMessageEvent(core_1.MessageEventType.RECEIVED, uuid.v4().split('-').join(''));
                        rootSpan.end();
                        return returned;
                    };
                    return original.apply(this, arguments);
                });
            };
        };
    }
}
exports.Http2Plugin = Http2Plugin;
const plugin = new Http2Plugin();
exports.plugin = plugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cDIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY2Vuc3VzL3BsdWdpbnMvaHR0cDIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBZ0JBLDJDQUEwSTtBQUMxSSxpQ0FBbUM7QUFFbkMsbUNBQWtDO0FBQ2xDLDJCQUEwQjtBQUMxQiw2QkFBNEI7QUFVNUIsTUFBYSxXQUFZLFNBQVEsaUJBQVU7SUFFekM7UUFDRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDaEIsQ0FBQztJQUtTLFVBQVU7UUFDbEIsT0FBTyxDQUFDLElBQUksQ0FDUixJQUFJLENBQUMsYUFBYSxFQUFFLGNBQWMsRUFDbEMsSUFBSSxDQUFDLDRCQUE0QixFQUFFLENBQUMsQ0FBQTtRQUN4QyxPQUFPLENBQUMsSUFBSSxDQUNSLElBQUksQ0FBQyxhQUFhLEVBQUUsb0JBQW9CLEVBQ3hDLElBQUksQ0FBQyw0QkFBNEIsRUFBRSxDQUFDLENBQUE7UUFFeEMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFBO1FBRTNFLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQTtJQUMzQixDQUFDO0lBR1MsWUFBWTtRQUdwQixPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUE7UUFDbEQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLG9CQUFvQixDQUFDLENBQUE7UUFDeEQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFBO0lBQy9DLENBQUM7SUFFTyx1QkFBdUI7UUFDN0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFBO1FBQ25CLE9BQU8sQ0FBQyxRQUF5QixFQUFrQyxFQUFFO1lBQ25FLE9BQU8sU0FBUyxjQUFjLENBQXFCLFNBQWlCO2dCQUVsRSxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQTtnQkFDOUMsT0FBTyxDQUFDLElBQUksQ0FDUixNQUFNLEVBQUUsU0FBUyxFQUNqQixDQUFDLFFBQVEsRUFBRSxFQUFFLENBQ1QsQ0FBQyxNQUFNLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFBO2dCQUVoRSxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsU0FBUyxDQUFDLENBQUE7Z0JBRS9DLE9BQU8sTUFBTSxDQUFBO1lBQ2YsQ0FBQyxDQUFBO1FBQ0gsQ0FBQyxDQUFBO0lBQ0gsQ0FBQztJQUVPLHVCQUF1QjtRQUM3QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUE7UUFDbkIsT0FBTyxDQUFDLFFBQXlCLEVBQ3pCLFNBQWlCLEVBQWlDLEVBQUU7WUFDMUQsT0FBTyxTQUFTLGNBQWMsQ0FFbkIsT0FBa0M7Z0JBRTNDLElBQUksT0FBTyxDQUFDLCtCQUErQixDQUFDLEVBQUU7b0JBQzVDLE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUE7aUJBQ3ZDO2dCQUVELE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFBO2dCQUMvQyxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQTtnQkFFbEMsTUFBTSxZQUFZLEdBQUc7b0JBQ25CLElBQUksRUFBRSxTQUFTLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBVyxJQUFJLEtBQUssQ0FBQyxDQUFDLFdBQVcsRUFBRSxFQUFFO29CQUN0RSxJQUFJLEVBQUUsZUFBUSxDQUFDLE1BQU07aUJBQ3RCLENBQUE7Z0JBTUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFO29CQUNsQyxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUM5QixZQUFZLEVBQ1osTUFBTSxDQUFDLGdDQUFnQyxDQUNuQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFBO2lCQUM5QztxQkFBTTtvQkFDTCxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FDckMsWUFBWSxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUE7b0JBQ3pDLE9BQU8sQ0FBQyxNQUFNLENBQUMsZ0NBQWdDLENBQzNDLE9BQU8sRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUE7aUJBQ2hEO1lBQ0gsQ0FBQyxDQUFBO1FBQ0gsQ0FBQyxDQUFBO0lBQ0gsQ0FBQztJQUVPLGdDQUFnQyxDQUNwQyxPQUFnQyxFQUFFLE9BQWtDLEVBQ3BFLFNBQWlCLEVBQUUsTUFBbUI7UUFDeEMsT0FBTyxDQUFDLElBQVUsRUFBMkIsRUFBRTtZQUM3QyxJQUFJLENBQUMsSUFBSTtnQkFBRSxPQUFPLE9BQU8sQ0FBQTtZQUV6QixNQUFNLE1BQU0sR0FBaUI7Z0JBQzNCLFNBQVMsQ0FBRSxJQUFZLEVBQUUsS0FBYTtvQkFDcEMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQTtnQkFDdkIsQ0FBQzthQUNGLENBQUE7WUFFRCxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQTtZQUM3QyxJQUFJLFdBQVcsRUFBRTtnQkFDZixXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7YUFDN0M7WUFFRCxPQUFPLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDLGVBQTBDLEVBQUUsRUFBRTtnQkFDcEUsTUFBTSxNQUFNLEdBQUcsR0FBRyxlQUFlLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQTtnQkFDOUMsSUFBSSxDQUFDLFlBQVksQ0FDYixXQUFXLENBQUMsMEJBQTBCLEVBQUUsTUFBTSxDQUFDLENBQUE7Z0JBQ25ELElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ3RFLENBQUMsQ0FBQyxDQUFBO1lBRUYsT0FBTyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFO2dCQUNyQixNQUFNLFNBQVMsR0FDWCxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLElBQUksQ0FBQTtnQkFFMUQsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7Z0JBQ2xGLElBQUksQ0FBQyxZQUFZLENBQ2IsV0FBVyxDQUFDLHFCQUFxQixFQUFFLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtnQkFDL0QsSUFBSSxDQUFDLFlBQVksQ0FDYixXQUFXLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFBO2dCQUMzRCxJQUFJLENBQUMsWUFBWSxDQUNiLFdBQVcsQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUE7Z0JBQzVELElBQUksU0FBUyxFQUFFO29CQUNiLElBQUksQ0FBQyxZQUFZLENBQ2IsV0FBVyxDQUFDLHlCQUF5QixFQUFFLEdBQUcsU0FBUyxFQUFFLENBQUMsQ0FBQTtpQkFDM0Q7Z0JBRUQsSUFBSSxDQUFDLGVBQWUsQ0FBQyx1QkFBZ0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtnQkFFMUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBO1lBQ1osQ0FBQyxDQUFDLENBQUE7WUFFRixPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQVUsRUFBRSxFQUFFO2dCQUNqQyxJQUFJLENBQUMsWUFBWSxDQUFDLGlCQUFVLENBQUMseUJBQXlCLEVBQUUsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUNqRSxJQUFJLENBQUMsWUFBWSxDQUFDLGlCQUFVLENBQUMsNEJBQTRCLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFBO2dCQUN2RSxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFhLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQTtnQkFFbEQsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBO1lBQ1osQ0FBQyxDQUFDLENBQUE7WUFFRixPQUFPLE9BQU8sQ0FBQTtRQUNoQixDQUFDLENBQUE7SUFDSCxDQUFDO0lBRU8sNEJBQTRCO1FBQ2xDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQTtRQUNuQixPQUFPLENBQUMsUUFBOEIsRUFBMkIsRUFBRTtZQUNqRSxPQUFPLFNBQVMsbUJBQW1CO2dCQUVqQyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQTtnQkFDOUMsT0FBTyxDQUFDLElBQUksQ0FDUixNQUFNLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQ3BDLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUE7Z0JBRWxDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxjQUFjLENBQUMsQ0FBQTtnQkFDcEQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLG9CQUFvQixDQUFDLENBQUE7Z0JBRTFELE9BQU8sTUFBTSxDQUFBO1lBQ2YsQ0FBQyxDQUFBO1FBQ0gsQ0FBQyxDQUFBO0lBQ0gsQ0FBQztJQUVPLG9CQUFvQjtRQUMxQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUE7UUFDbkIsT0FBTyxDQUFDLFFBQXlCLEVBQWlDLEVBQUU7WUFDbEUsT0FBTyxTQUFTLFdBQVcsQ0FDUyxLQUFhLEVBQ3RDLE1BQStCLEVBQy9CLE9BQWtDO2dCQUMzQyxJQUFJLEtBQUssS0FBSyxRQUFRLEVBQUU7b0JBQ3RCLE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUE7aUJBQ3ZDO2dCQUVELE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFBO2dCQUM3QyxNQUFNLE1BQU0sR0FBRztvQkFDYixTQUFTLENBQUUsSUFBWTt3QkFDckIsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7b0JBQ3RCLENBQUM7aUJBQ2MsQ0FBQTtnQkFFakIsTUFBTSxZQUFZLEdBQUc7b0JBQ25CLElBQUksRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDO29CQUN0QixJQUFJLEVBQUUsZUFBUSxDQUFDLE1BQU07b0JBQ3JCLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUk7aUJBQzlDLENBQUE7Z0JBSWpCLElBQUksVUFBVSxHQUFXLENBQUMsQ0FBQTtnQkFDMUIsTUFBTSxlQUFlLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQTtnQkFDdEMsTUFBTSxDQUFDLE9BQU8sR0FBRztvQkFHZixNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQTtvQkFDaEMsVUFBVSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQTtvQkFDcEMsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUE7Z0JBQzlDLENBQUMsQ0FBQTtnQkFFRCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsRUFBRTtvQkFDMUQsSUFBSSxDQUFDLFFBQVE7d0JBQUUsT0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQTtvQkFFckQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUE7b0JBRWpDLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUE7b0JBQzlCLE1BQU0sQ0FBQyxHQUFHLEdBQUc7d0JBQ1gsTUFBTSxDQUFDLEdBQUcsR0FBRyxXQUFXLENBQUE7d0JBQ3hCLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQTt3QkFFbEQsTUFBTSxTQUFTLEdBQUcsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksT0FBTyxDQUFDLFlBQVksQ0FBQzs0QkFDOUMsSUFBSSxDQUFXLENBQUE7d0JBRWxDLFFBQVEsQ0FBQyxZQUFZLENBQ2pCLFdBQVcsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUE7d0JBQ2hFLFFBQVEsQ0FBQyxZQUFZLENBQ2pCLFdBQVcsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUE7d0JBQy9ELFFBQVEsQ0FBQyxZQUFZLENBQ2pCLFdBQVcsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUE7d0JBQzNELFFBQVEsQ0FBQyxZQUFZLENBQ2pCLFdBQVcsQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUE7d0JBQzVELFFBQVEsQ0FBQyxZQUFZLENBQ2pCLFdBQVcsQ0FBQyx5QkFBeUIsRUFBRSxTQUFTLENBQUMsQ0FBQTt3QkFDckQsUUFBUSxDQUFDLFlBQVksQ0FDakIsV0FBVyxDQUFDLDBCQUEwQixFQUFFLEdBQUcsVUFBVSxFQUFFLENBQUMsQ0FBQTt3QkFDNUQsUUFBUSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQTt3QkFFOUQsUUFBUSxDQUFDLGVBQWUsQ0FDcEIsdUJBQWdCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7d0JBRTdELFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQTt3QkFDZCxPQUFPLFFBQVEsQ0FBQTtvQkFDakIsQ0FBQyxDQUFBO29CQUNELE9BQU8sUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUE7Z0JBQ3hDLENBQUMsQ0FBQyxDQUFBO1lBQ0osQ0FBQyxDQUFBO1FBQ0gsQ0FBQyxDQUFBO0lBQ0gsQ0FBQztDQUNGO0FBN09ELGtDQTZPQztBQUVELE1BQU0sTUFBTSxHQUFHLElBQUksV0FBVyxFQUFFLENBQUE7QUFDdkIsd0JBQU0ifQ==