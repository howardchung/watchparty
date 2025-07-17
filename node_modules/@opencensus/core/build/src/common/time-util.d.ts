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
import { Timestamp } from '../metrics/export/types';
declare function setHrtimeReference(): void;
/**
 * This is used to enable tests to mock process.hrtime while still allow us to
 * cache it.
 */
declare function resetHrtimeFunctionCache(): void;
/**
 * Gets the current timestamp with seconds and nanoseconds.
 *
 * @returns {Timestamp} The Timestamp.
 */
export declare function getTimestampWithProcessHRTime(): Timestamp;
/**
 * Creates a new timestamp from the given milliseconds.
 *
 * @param {number} epochMilli the timestamp represented in milliseconds since
 *  epoch.
 * @returns {Timestamp} new timestamp with specified fields.
 */
export declare function timestampFromMillis(epochMilli: number): Timestamp;
export declare const TEST_ONLY: {
    setHrtimeReference: typeof setHrtimeReference;
    resetHrtimeFunctionCache: typeof resetHrtimeFunctionCache;
};
export {};
