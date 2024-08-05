"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.TraceStatusCodes = exports.HttpPlugin = void 0;
const core_1 = require("@opencensus/core");
const httpModule = require("http");
const semver = require("semver");
const shimmer = require("shimmer");
const url = require("url");
const uuid = require("uuid");
const express_1 = require("./express");
class HttpPlugin extends core_1.BasePlugin {
    constructor(moduleName) {
        super(moduleName);
    }
    applyPatch() {
        this.logger.debug('applying patch to %s@%s', this.moduleName, this.version);
        shimmer.wrap(this.moduleExports, 'request', this.getPatchOutgoingRequestFunction());
        if (semver.satisfies(this.version, '>=8.0.0')) {
            shimmer.wrap(this.moduleExports, 'get', () => {
                return function getTrace(options, callback) {
                    const req = httpModule.request(options, callback);
                    req.end();
                    return req;
                };
            });
        }
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
        shimmer.unwrap(this.moduleExports, 'request');
        if (semver.satisfies(this.version, '>=8.0.0')) {
            shimmer.unwrap(this.moduleExports, 'get');
        }
        if (this.moduleExports && this.moduleExports.Server &&
            this.moduleExports.Server.prototype) {
            shimmer.unwrap(this.moduleExports.Server.prototype, 'emit');
        }
    }
    isIgnored(url, request, list) {
        if (!list) {
            return false;
        }
        for (const pattern of list) {
            if (this.isSatisfyPattern(url, request, pattern)) {
                return true;
            }
        }
        return false;
    }
    isSatisfyPattern(url, request, pattern) {
        if (typeof pattern === 'string') {
            return pattern === url;
        }
        else if (pattern instanceof RegExp) {
            return pattern.test(url);
        }
        else if (typeof pattern === 'function') {
            return pattern(url, request);
        }
        else {
            throw new TypeError('Pattern is in unsupported datatype');
        }
    }
    getPatchIncomingRequestFunction() {
        return (original) => {
            const plugin = this;
            return function incomingRequest(event, ...args) {
                if (event !== 'request') {
                    return original.apply(this, arguments);
                }
                const request = args[0];
                const response = args[1];
                const path = url.parse(request.url).pathname;
                plugin.logger.debug('%s plugin incomingRequest', plugin.moduleName);
                if (plugin.isIgnored(path, request, plugin.options.ignoreIncomingPaths)) {
                    return original.apply(this, arguments);
                }
                const propagation = plugin.tracer.propagation;
                const headers = request.headers;
                const getter = {
                    getHeader(name) {
                        return headers[name];
                    }
                };
                const context = propagation ? propagation.extract(getter) : null;
                const traceOptions = {
                    name: path,
                    kind: core_1.SpanKind.SERVER,
                    spanContext: context !== null ? context : undefined
                };
                return plugin.createSpan(traceOptions, rootSpan => {
                    if (!rootSpan)
                        return original.apply(this, arguments);
                    plugin.tracer.wrapEmitter(request);
                    plugin.tracer.wrapEmitter(response);
                    const originalEnd = response.end;
                    response.end = function () {
                        response.end = originalEnd;
                        const returned = response.end.apply(this, arguments);
                        const requestUrl = url.parse(request.url || 'localhost');
                        const host = headers.host || 'localhost';
                        const userAgent = (headers['user-agent'] || headers['User-Agent']);
                        rootSpan.addAttribute(HttpPlugin.ATTRIBUTE_HTTP_HOST, host.replace(/^(.*)(\:[0-9]{1,5})/, '$1'));
                        rootSpan.addAttribute(HttpPlugin.ATTRIBUTE_HTTP_METHOD, request.method || 'GET');
                        rootSpan.addAttribute(HttpPlugin.ATTRIBUTE_HTTP_PATH, `${requestUrl.pathname}`);
                        let route = `${requestUrl.path}`;
                        const middlewareStack = request[express_1.kMiddlewareStack];
                        if (middlewareStack) {
                            route = middlewareStack
                                .filter(path => path !== '/')
                                .map(path => {
                                return path[0] === '/' ? path : '/' + path;
                            }).join('');
                        }
                        rootSpan.addAttribute(HttpPlugin.ATTRIBUTE_HTTP_ROUTE, route);
                        rootSpan.addAttribute(HttpPlugin.ATTRIBUTE_HTTP_USER_AGENT, userAgent);
                        rootSpan.addAttribute(HttpPlugin.ATTRIBUTE_HTTP_STATUS_CODE, response.statusCode.toString());
                        rootSpan.setStatus(HttpPlugin.convertTraceStatus(response.statusCode));
                        rootSpan.addMessageEvent(core_1.MessageEventType.RECEIVED, uuid.v4().split('-').join(''));
                        rootSpan.end();
                        return returned;
                    };
                    return original.apply(this, arguments);
                });
            };
        };
    }
    getPatchOutgoingRequestFunction() {
        return (original) => {
            const plugin = this;
            const kind = plugin.moduleName === 'https' ? 'HTTPS' : 'HTTP';
            return function outgoingRequest(options, callback) {
                if (!options) {
                    return original.apply(this, arguments);
                }
                let pathname = '';
                let method = 'GET';
                let origin = '';
                if (typeof (options) === 'string') {
                    const parsedUrl = url.parse(options);
                    options = parsedUrl;
                    pathname = parsedUrl.pathname || '/';
                    origin = `${parsedUrl.protocol || 'http:'}//${parsedUrl.host}`;
                }
                else {
                    if (options.headers &&
                        options.headers['x-opencensus-outgoing-request']) {
                        plugin.logger.debug('header with "x-opencensus-outgoing-request" - do not trace');
                        return original.apply(this, arguments);
                    }
                    try {
                        pathname = options.pathname || '';
                        if (pathname.length === 0 && typeof options.path === 'string') {
                            pathname = url.parse(options.path).pathname || '';
                        }
                        method = options.method || 'GET';
                        origin = `${options.protocol || 'http:'}//${options.host}`;
                    }
                    catch (e) {
                        return original.apply(this, arguments);
                    }
                }
                const request = original.apply(this, arguments);
                if (plugin.isIgnored(origin + pathname, request, plugin.options.ignoreOutgoingUrls)) {
                    return request;
                }
                plugin.tracer.wrapEmitter(request);
                plugin.logger.debug('%s plugin outgoingRequest', plugin.moduleName);
                const traceOptions = {
                    name: `${kind.toLowerCase()}-${(method || 'GET').toLowerCase()}`,
                    kind: core_1.SpanKind.CLIENT
                };
                if (!plugin.tracer.currentRootSpan) {
                    plugin.logger.debug('outgoingRequest starting a root span');
                    return plugin.tracer.startRootSpan(traceOptions, plugin.getMakeRequestTraceFunction(request, options, plugin));
                }
                else {
                    plugin.logger.debug('outgoingRequest starting a child span');
                    const span = plugin.tracer.startChildSpan(traceOptions.name, traceOptions.kind);
                    return (plugin.getMakeRequestTraceFunction(request, options, plugin))(span);
                }
            };
        };
    }
    getMakeRequestTraceFunction(request, options, plugin) {
        return (span) => {
            plugin.logger.debug('makeRequestTrace');
            if (!span) {
                plugin.logger.debug('makeRequestTrace span is null');
                return request;
            }
            const setter = {
                setHeader(name, value) {
                    if (plugin.hasExpectHeader(options) && options.headers) {
                        if (options.__cloned !== true) {
                            options = Object.assign({}, options);
                            options.headers = Object.assign({}, options.headers);
                            options.__cloned = true;
                        }
                        options.headers[name] = value;
                    }
                    else {
                        request.setHeader(name, value);
                    }
                }
            };
            const propagation = plugin.tracer.propagation;
            if (propagation) {
                propagation.inject(setter, span.spanContext);
            }
            request.on('response', (response) => {
                plugin.tracer.wrapEmitter(response);
                plugin.logger.debug('outgoingRequest on response()');
                response.on('end', () => {
                    plugin.logger.debug('outgoingRequest on end()');
                    const method = response.method ? response.method : 'GET';
                    const headers = options.headers;
                    const userAgent = headers ? (headers['user-agent'] || headers['User-Agent']) : null;
                    if (options.host || options.hostname) {
                        const value = options.host || options.hostname;
                        span.addAttribute(HttpPlugin.ATTRIBUTE_HTTP_HOST, `${value}`);
                    }
                    span.addAttribute(HttpPlugin.ATTRIBUTE_HTTP_METHOD, method);
                    span.addAttribute(HttpPlugin.ATTRIBUTE_HTTP_PATH, `${options.path}`);
                    span.addAttribute(HttpPlugin.ATTRIBUTE_HTTP_ROUTE, `${options.path}`);
                    if (userAgent) {
                        span.addAttribute(HttpPlugin.ATTRIBUTE_HTTP_USER_AGENT, userAgent.toString());
                    }
                    span.addAttribute(HttpPlugin.ATTRIBUTE_HTTP_STATUS_CODE, `${response.statusCode}`);
                    span.setStatus(HttpPlugin.convertTraceStatus(response.statusCode || 0));
                    span.addMessageEvent(core_1.MessageEventType.SENT, uuid.v4().split('-').join(''));
                    span.end();
                });
                response.on('error', error => {
                    span.addAttribute(HttpPlugin.ATTRIBUTE_HTTP_ERROR_NAME, error.name);
                    span.addAttribute(HttpPlugin.ATTRIBUTE_HTTP_ERROR_MESSAGE, error.message);
                    span.setStatus(core_1.CanonicalCode.UNKNOWN);
                    span.end();
                });
            });
            request.on('error', error => {
                span.addAttribute(HttpPlugin.ATTRIBUTE_HTTP_ERROR_NAME, error.name);
                span.addAttribute(HttpPlugin.ATTRIBUTE_HTTP_ERROR_MESSAGE, error.message);
                span.setStatus(core_1.CanonicalCode.UNKNOWN);
                span.end();
            });
            plugin.logger.debug('makeRequestTrace return request');
            return request;
        };
    }
    createSpan(options, fn) {
        const forceChildspan = this.options.createSpanWithNet === true;
        if (forceChildspan) {
            const span = this.tracer.startChildSpan(options.name, options.kind);
            return fn(span);
        }
        else {
            return this.tracer.startRootSpan(options, fn);
        }
    }
    static convertTraceStatus(statusCode) {
        if (statusCode < 200 || statusCode > 504) {
            return TraceStatusCodes.UNKNOWN;
        }
        else if (statusCode >= 200 && statusCode < 400) {
            return TraceStatusCodes.OK;
        }
        else {
            switch (statusCode) {
                case (400):
                    return TraceStatusCodes.INVALID_ARGUMENT;
                case (504):
                    return TraceStatusCodes.DEADLINE_EXCEEDED;
                case (404):
                    return TraceStatusCodes.NOT_FOUND;
                case (403):
                    return TraceStatusCodes.PERMISSION_DENIED;
                case (401):
                    return TraceStatusCodes.UNAUTHENTICATED;
                case (429):
                    return TraceStatusCodes.RESOURCE_EXHAUSTED;
                case (501):
                    return TraceStatusCodes.UNIMPLEMENTED;
                case (503):
                    return TraceStatusCodes.UNAVAILABLE;
                default:
                    return TraceStatusCodes.UNKNOWN;
            }
        }
    }
    hasExpectHeader(options) {
        return !!(options.headers &&
            options.headers.Expect);
    }
}
exports.HttpPlugin = HttpPlugin;
HttpPlugin.ATTRIBUTE_HTTP_HOST = 'http.host';
HttpPlugin.ATTRIBUTE_HTTP_METHOD = 'http.method';
HttpPlugin.ATTRIBUTE_HTTP_PATH = 'http.path';
HttpPlugin.ATTRIBUTE_HTTP_ROUTE = 'http.route';
HttpPlugin.ATTRIBUTE_HTTP_USER_AGENT = 'http.user_agent';
HttpPlugin.ATTRIBUTE_HTTP_STATUS_CODE = 'http.status_code';
HttpPlugin.ATTRIBUTE_HTTP_ERROR_NAME = 'http.error_name';
HttpPlugin.ATTRIBUTE_HTTP_ERROR_MESSAGE = 'http.error_message';
var TraceStatusCodes;
(function (TraceStatusCodes) {
    TraceStatusCodes[TraceStatusCodes["UNKNOWN"] = 2] = "UNKNOWN";
    TraceStatusCodes[TraceStatusCodes["OK"] = 0] = "OK";
    TraceStatusCodes[TraceStatusCodes["INVALID_ARGUMENT"] = 3] = "INVALID_ARGUMENT";
    TraceStatusCodes[TraceStatusCodes["DEADLINE_EXCEEDED"] = 4] = "DEADLINE_EXCEEDED";
    TraceStatusCodes[TraceStatusCodes["NOT_FOUND"] = 5] = "NOT_FOUND";
    TraceStatusCodes[TraceStatusCodes["PERMISSION_DENIED"] = 7] = "PERMISSION_DENIED";
    TraceStatusCodes[TraceStatusCodes["UNAUTHENTICATED"] = 16] = "UNAUTHENTICATED";
    TraceStatusCodes[TraceStatusCodes["RESOURCE_EXHAUSTED"] = 8] = "RESOURCE_EXHAUSTED";
    TraceStatusCodes[TraceStatusCodes["UNIMPLEMENTED"] = 12] = "UNIMPLEMENTED";
    TraceStatusCodes[TraceStatusCodes["UNAVAILABLE"] = 14] = "UNAVAILABLE";
})(TraceStatusCodes = exports.TraceStatusCodes || (exports.TraceStatusCodes = {}));
exports.plugin = new HttpPlugin('http');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jZW5zdXMvcGx1Z2lucy9odHRwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQWdCQSwyQ0FBOEk7QUFDOUksbUNBQWtDO0FBQ2xDLGlDQUFnQztBQUNoQyxtQ0FBa0M7QUFDbEMsMkJBQTBCO0FBQzFCLDZCQUE0QjtBQUM1Qix1Q0FBNEM7QUF3QjVDLE1BQWEsVUFBVyxTQUFRLGlCQUFVO0lBa0J4QyxZQUFhLFVBQWtCO1FBQzdCLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUNuQixDQUFDO0lBS1MsVUFBVTtRQUNsQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUUzRSxPQUFPLENBQUMsSUFBSSxDQUNSLElBQUksQ0FBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQywrQkFBK0IsRUFBRSxDQUFDLENBQUE7UUFJMUUsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLEVBQUU7WUFDN0MsT0FBTyxDQUFDLElBQUksQ0FDUixJQUFJLENBQUMsYUFBYSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUU7Z0JBWTlCLE9BQU8sU0FBUyxRQUFRLENBQUUsT0FBTyxFQUFFLFFBQVE7b0JBQ3pDLE1BQU0sR0FBRyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFBO29CQUNqRCxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUE7b0JBQ1QsT0FBTyxHQUFHLENBQUE7Z0JBQ1osQ0FBQyxDQUFBO1lBQ0gsQ0FBQyxDQUFDLENBQUE7U0FDUDtRQUVELElBQUksSUFBSSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU07WUFDL0MsSUFBSSxDQUFD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