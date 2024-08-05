"use strict";
/**
 * Copyright 2019, OpenCensus Authors
 *
 * Licensed under the Apache License, Version 2.0 the "License";
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
const MILLIS_PER_SECOND = 1e3;
const NANOS_PER_MILLI = 1e3 * 1e3;
const NANOS_PER_SECOND = 1e3 * 1e3 * 1e3;
let hrtime = process.hrtime;
let hrtimeOrigin = [0, 0];
let hrtimeRefSeconds = 0;
let hrtimeRefNanos = 0;
function setHrtimeReference() {
    resetHrtimeFunctionCache();
    hrtimeOrigin = hrtime();
    const refTime = Date.now();
    hrtimeRefSeconds = Math.floor(refTime / MILLIS_PER_SECOND);
    hrtimeRefNanos = (refTime % MILLIS_PER_SECOND) * NANOS_PER_MILLI;
}
/**
 * This is used to enable tests to mock process.hrtime while still allow us to
 * cache it.
 */
function resetHrtimeFunctionCache() {
    hrtime = process.hrtime;
}
/**
 * Gets the current timestamp with seconds and nanoseconds.
 *
 * @returns {Timestamp} The Timestamp.
 */
function getTimestampWithProcessHRTime() {
    const [offsetSecs, offsetNanos] = hrtime(hrtimeOrigin);
    // determine drift in seconds and nanoseconds
    const seconds = hrtimeRefSeconds + offsetSecs;
    const nanos = hrtimeRefNanos + offsetNanos;
    if (nanos >= NANOS_PER_SECOND) {
        return { seconds: seconds + 1, nanos: nanos % NANOS_PER_SECOND };
    }
    return { seconds, nanos };
}
exports.getTimestampWithProcessHRTime = getTimestampWithProcessHRTime;
/**
 * Creates a new timestamp from the given milliseconds.
 *
 * @param {number} epochMilli the timestamp represented in milliseconds since
 *  epoch.
 * @returns {Timestamp} new timestamp with specified fields.
 */
function timestampFromMillis(epochMilli) {
    return {
        seconds: Math.floor(epochMilli / MILLIS_PER_SECOND),
        nanos: (epochMilli % MILLIS_PER_SECOND) * NANOS_PER_MILLI
    };
}
exports.timestampFromMillis = timestampFromMillis;
setHrtimeReference();
exports.TEST_ONLY = {
    setHrtimeReference,
    resetHrtimeFunctionCache
};
//# sourceMappingURL=time-util.js.map