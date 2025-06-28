"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomCensusExporter = void 0;
const serviceManager_1 = require("../serviceManager");
const core_1 = require("@opencensus/core");
const default_config_1 = require("./config/default-config");
const constants_1 = require("./constants");
var CanonicalCodeString;
(function (CanonicalCodeString) {
    CanonicalCodeString["OK"] = "OK";
    CanonicalCodeString["CANCELLED"] = "CANCELLED";
    CanonicalCodeString["UNKNOWN"] = "UNKNOWN";
    CanonicalCodeString["INVALID_ARGUMENT"] = "INVALID_ARGUMENT";
    CanonicalCodeString["DEADLINE_EXCEEDED"] = "DEADLINE_EXCEEDED";
    CanonicalCodeString["NOT_FOUND"] = "NOT_FOUND";
    CanonicalCodeString["ALREADY_EXISTS"] = "ALREADY_EXISTS";
    CanonicalCodeString["PERMISSION_DENIED"] = "PERMISSION_DENIED";
    CanonicalCodeString["RESOURCE_EXHAUSTED"] = "RESOURCE_EXHAUSTED";
    CanonicalCodeString["FAILED_PRECONDITION"] = "FAILED_PRECONDITION";
    CanonicalCodeString["ABORTED"] = "ABORTED";
    CanonicalCodeString["OUT_OF_RANGE"] = "OUT_OF_RANGE";
    CanonicalCodeString["UNIMPLEMENTED"] = "UNIMPLEMENTED";
    CanonicalCodeString["INTERNAL"] = "INTERNAL";
    CanonicalCodeString["UNAVAILABLE"] = "UNAVAILABLE";
    CanonicalCodeString["DATA_LOSS"] = "DATA_LOSS";
    CanonicalCodeString["UNAUTHENTICATED"] = "UNAUTHENTICATED";
})(CanonicalCodeString || (CanonicalCodeString = {}));
class CustomCensusExporter {
    constructor(config) {
        this.transport = serviceManager_1.ServiceManager.get('transport');
        this.config = config;
        this.buffer = new core_1.ExporterBuffer(this, default_config_1.defaultConfig);
    }
    onEndSpan(root) {
        this.buffer.addToBuffer(root);
    }
    onStartSpan(root) { }
    sendTraces(zipkinTraces) {
        return new Promise((resolve, reject) => {
            zipkinTraces.forEach(span => {
                const isRootClient = span.kind === 'CLIENT' && !span.parentId;
                if (isRootClient && this.config.outbound === false)
                    return;
                if (process.env.NODE_ENV === 'test' || (span.duration > constants_1.Constants.MINIMUM_TRACE_DURATION)) {
                    this.transport.send('trace-span', span);
                }
            });
            resolve();
        });
    }
    mountSpanList(rootSpans) {
        const spanList = [];
        for (const root of rootSpans) {
            spanList.push(this.translateSpan(root));
            for (const span of root.spans) {
                spanList.push(this.translateSpan(span));
            }
        }
        return spanList;
    }
    translateSpan(span) {
        const spanTranslated = {
            traceId: span.traceId,
            name: span.name,
            id: span.id,
            parentId: span.parentSpanId,
            kind: this.getSpanKind(span.kind),
            timestamp: span.startTime.getTime() * 1000,
            duration: Math.round(span.duration * 1000),
            debug: false,
            shared: false,
            localEndpoint: { serviceName: this.config.serviceName },
            tags: span.attributes
        };
        if (typeof spanTranslated.tags['result.code'] !== 'string') {
            spanTranslated.tags['result.code'] = CanonicalCodeString[span.status.code];
        }
        if (typeof span.status.message === 'string') {
            spanTranslated.tags['result.message'] = span.status.message;
        }
        return spanTranslated;
    }
    publish(rootSpans) {
        const spanList = this.mountSpanList(rootSpans);
        return this.sendTraces(spanList).catch((err) => {
            return err;
        });
    }
    getSpanKind(kind) {
        switch (kind) {
            case core_1.SpanKind.CLIENT: {
                return 'CLIENT';
            }
            case core_1.SpanKind.SERVER: {
                return 'SERVER';
            }
            default: {
                return 'UNKNOWN';
            }
        }
    }
}
exports.CustomCensusExporter = CustomCensusExporter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwb3J0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY2Vuc3VzL2V4cG9ydGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHNEQUFrRDtBQUVsRCwyQ0FBZ0k7QUFDaEksNERBQXVEO0FBQ3ZELDJDQUF1QztBQU12QyxJQUFLLG1CQWtCSjtBQWxCRCxXQUFLLG1CQUFtQjtJQUN0QixnQ0FBUyxDQUFBO0lBQ1QsOENBQXVCLENBQUE7SUFDdkIsMENBQW1CLENBQUE7SUFDbkIsNERBQXFDLENBQUE7SUFDckMsOERBQXVDLENBQUE7SUFDdkMsOENBQXVCLENBQUE7SUFDdkIsd0RBQWlDLENBQUE7SUFDakMsOERBQXVDLENBQUE7SUFDdkMsZ0VBQXlDLENBQUE7SUFDekMsa0VBQTJDLENBQUE7SUFDM0MsMENBQW1CLENBQUE7SUFDbkIsb0RBQTZCLENBQUE7SUFDN0Isc0RBQStCLENBQUE7SUFDL0IsNENBQXFCLENBQUE7SUFDckIsa0RBQTJCLENBQUE7SUFDM0IsOENBQXVCLENBQUE7SUFDdkIsMERBQW1DLENBQUE7QUFDckMsQ0FBQyxFQWxCSSxtQkFBbUIsS0FBbkIsbUJBQW1CLFFBa0J2QjtBQWlCRCxNQUFhLG9CQUFvQjtJQUsvQixZQUFhLE1BQXFCO1FBSDFCLGNBQVMsR0FBYywrQkFBYyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUk1RCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtRQUNwQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUkscUJBQWMsQ0FBQyxJQUFJLEVBQUUsOEJBQWEsQ0FBQyxDQUFBO0lBQ3ZELENBQUM7SUFNRCxTQUFTLENBQUUsSUFBYztRQUN2QixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUMvQixDQUFDO0lBR0QsV0FBVyxDQUFFLElBQWMsSUFBRyxDQUFDO0lBTXZCLFVBQVUsQ0FBRSxZQUE4QjtRQUNoRCxP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