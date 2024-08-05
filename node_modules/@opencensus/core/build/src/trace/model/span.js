"use strict";
/**
 * Copyright 2018, OpenCensus Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const logger = require("../../common/console-logger");
const span_base_1 = require("./span-base");
/** Defines a Span. */
class Span extends span_base_1.SpanBase {
    /**
     * Constructs a new SpanImpl instance.
     * @param root
     */
    constructor(root) {
        super();
        /** set isRootSpan = true */
        this.isRootSpan = false;
        this.root = root;
        this.logger = this.root.logger || logger.logger();
        this.parentSpanId = root.id;
        this.activeTraceParams = this.root.activeTraceParams;
    }
    /** Gets trace id of span. */
    get traceId() {
        return this.root.traceId;
    }
    get traceState() {
        return this.root.traceState;
    }
    /** Starts the span instance. */
    start() {
        super.start();
        this.logger.debug('starting span  %o', {
            traceId: this.traceId,
            spanId: this.id,
            name: this.name,
            traceState: this.traceState
        });
    }
    /** Ends the span. */
    end() {
        super.end();
        this.logger.debug('ending span  %o', {
            spanId: this.id,
            traceId: this.traceId,
            name: this.name,
            startTime: this.startTime,
            endTime: this.endTime,
            duration: this.duration
        });
    }
}
exports.Span = Span;
//# sourceMappingURL=span.js.map