"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clock_1 = require("../../internal/clock");
const util_1 = require("../../internal/util");
const types = require("./types");
const STATUS_OK = {
    code: types.CanonicalCode.OK
};
/** Defines a base model for spans. */
class SpanBase {
    /** Constructs a new SpanBaseModel instance. */
    constructor() {
        /** The clock used to mesure the beginning and ending of a span */
        this.clock = null;
        /** Indicates if this span was started */
        this.startedLocal = false;
        /** Indicates if this span was ended */
        this.endedLocal = false;
        /** Indicates if this span was forced to end */
        // @ts-ignore
        this.truncated = false;
        /** A set of attributes, each in the format [KEY]:[VALUE] */
        this.attributes = {};
        /** A text annotation with a set of attributes. */
        this.annotations = [];
        /** An event describing a message sent/received between Spans */
        this.messageEvents = [];
        /** Pointers from the current span to another span */
        this.links = [];
        /** The span ID of this span's parent. If it's a root span, must be empty */
        this.parentSpanId = null;
        /** The resource name of the span */
        this.name = null;
        /** Kind of span. */
        this.kind = types.SpanKind.UNSPECIFIED;
        /** A final status for this span */
        this.status = STATUS_OK;
        /** The number of dropped attributes. */
        this.droppedAttributesCount = 0;
        /** The number of dropped links. */
        this.droppedLinksCount = 0;
        /** The number of dropped annotations. */
        this.droppedAnnotationsCount = 0;
        /** The number of dropped message events. */
        this.droppedMessageEventsCount = 0;
        this.className = this.constructor.name;
        this.id = util_1.randomSpanId();
    }
    /** Indicates if span was started. */
    get started() {
        return this.startedLocal;
    }
    /** Indicates if span was ended. */
    get ended() {
        return this.endedLocal;
    }
    /**
     * Gives a timestamp that indicates the span's start time in RFC3339 UTC
     * "Zulu" format.
     */
    get startTime() {
        if (!this.clock) {
            this.logger.debug('calling startTime() on null clock');
            return null;
        }
        return this.clock.startTime;
    }
    /**
     * Gives a timestap that indicates the span's end time in RFC3339 UTC
     * "Zulu" format.
     */
    get endTime() {
        if (!this.clock) {
            this.logger.debug('calling endTime() on null clock');
            return null;
        }
        return this.clock.endTime;
    }
    /**
     * Gives a timestap that indicates the span's duration in RFC3339 UTC
     * "Zulu" format.
     */
    get duration() {
        if (!this.clock) {
            this.logger.debug('calling duration() on null clock');
            return null;
        }
        return this.clock.duration;
    }
    /** Gives the TraceContext of the span. */
    get spanContext() {
        return {
            traceId: this.traceId,
            spanId: this.id,
            options: 0x1,
            traceState: this.traceState
        };
    }
    /**
     * Adds an atribute to the span.
     * @param key Describes the value added.
     * @param value The result of an operation.
     */
    addAttribute(key, value) {
        if (this.attributes[key]) {
            delete this.attributes[key];
        }
        if (Object.keys(this.attributes).length >=
            this.activeTraceParams.numberOfAttributesPerSpan) {
            this.droppedAttributesCount++;
            const attributeKeyToDelete = Object.keys(this.attributes).shift();
            delete this.attributes[attributeKeyToDelete];
        }
        this.attributes[key] = value;
    }
    /**
     * Adds an annotation to the span.
     * @param description Describes the event.
     * @param attributes A set of attributes on the annotation.
     * @param timestamp A time, in milliseconds. Defaults to Date.now()
     */
    addAnnotation(description, attributes, timestamp = 0) {
        if (this.annotations.length >=
            this.activeTraceParams.numberOfAnnontationEventsPerSpan) {
            this.annotations.shift();
            this.droppedAnnotationsCount++;
        }
        this.annotations.push({
            'description': description,
            'attributes': attributes,
            'timestamp': timestamp ? timestamp : Date.now(),
        });
    }
    /**
     * Adds a link to the span.
     * @param traceId The trace ID for a trace within a project.
     * @param spanId The span ID for a span within a trace.
     * @param type The relationship of the current span relative to the linked.
     * @param attributes A set of attributes on the link.
     */
    addLink(traceId, spanId, type, attributes) {
        if (this.links.length >= this.activeTraceParams.numberOfLinksPerSpan) {
            this.links.shift();
            this.droppedLinksCount++;
        }
        this.links.push({
            'traceId': traceId,
            'spanId': spanId,
            'type': type,
            'attributes': attributes
        });
    }
    /**
     * Adds a message event to the span.
     * @param type The type of message event.
     * @param id An identifier for the message event.
     * @param timestamp A time in milliseconds. Defaults to Date.now()
     */
    addMessageEvent(type, id, timestamp = 0) {
        if (this.messageEvents.length >=
            this.activeTraceParams.numberOfMessageEventsPerSpan) {
            this.messageEvents.shift();
            this.droppedMessageEventsCount++;
        }
        this.messageEvents.push({
            'type': type,
            'id': id,
            'timestamp': timestamp ? timestamp : Date.now(),
        });
    }
    /**
     * Sets a status to the span.
     * @param code The canonical status code.
     * @param message optional A developer-facing error message.
     */
    setStatus(code, message) {
        this.status = { code, message };
    }
    /** Starts the span. */
    start() {
        if (this.started) {
            this.logger.debug('calling %s.start() on already started %s %o', this.className, this.className, { id: this.id, name: this.name, type: this.kind });
            return;
        }
        this.clock = new clock_1.Clock();
        this.startedLocal = true;
    }
    /** Ends the span. */
    end() {
        if (this.ended) {
            this.logger.debug('calling %s.end() on already ended %s %o', this.className, this.className, { id: this.id, name: this.name, type: this.kind });
            return;
        }
        if (!this.started) {
            this.logger.error('calling %s.end() on un-started %s %o', this.className, this.className, { id: this.id, name: this.name, type: this.kind });
            return;
        }
        this.startedLocal = false;
        this.endedLocal = true;
        this.clock.end();
    }
    /** Forces the span to end. */
    truncate() {
        this.truncated = true;
        this.end();
        this.logger.debug('truncating %s  %o', this.className, { id: this.id, name: this.name });
    }
}
exports.SpanBase = SpanBase;
//# sourceMappingURL=span-base.js.map