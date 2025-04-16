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
/**
 * The Clock class is used to record the duration and endTime for spans.
 */
class Clock {
    /** Constructs a new SamplerImpl instance. */
    constructor() {
        /** Indicates if the clock is endend. */
        this.endedLocal = false;
        /** The duration between start and end of the clock. */
        this.diff = null;
        this.startTimeLocal = new Date();
        this.hrtimeLocal = process.hrtime();
    }
    /** Ends the clock. */
    end() {
        if (this.endedLocal) {
            return;
        }
        this.diff = process.hrtime(this.hrtimeLocal);
        this.endedLocal = true;
    }
    /** Gets the duration of the clock. */
    get duration() {
        if (!this.endedLocal) {
            return null;
        }
        const ns = this.diff[0] * 1e9 + this.diff[1];
        return ns / 1e6;
    }
    /** Starts the clock. */
    get startTime() {
        return this.startTimeLocal;
    }
    /**
     * Gets the time so far.
     * @returns A Date object with the current duration.
     */
    get endTime() {
        let result = null;
        if (this.ended) {
            result = new Date(this.startTime.getTime() + this.duration);
        }
        return result;
    }
    /** Indicates if the clock was ended. */
    get ended() {
        return this.endedLocal;
    }
}
exports.Clock = Clock;
//# sourceMappingURL=clock.js.map