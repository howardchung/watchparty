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
import * as defaultLogger from '../common/console-logger';
import { Bucket } from './types';
export declare class BucketBoundaries {
    readonly buckets: Bucket[];
    readonly bucketCounts: number[];
    /** An object to log information to */
    private logger;
    constructor(boundaries: number[], logger?: typeof defaultLogger);
    /**
     * Gets bucket boundaries
     */
    getBoundaries(): Bucket[];
    /**
     * Gets initial bucket counts
     */
    getCounts(): number[];
    /**
     * Drops negative (BucketBounds) are currently not supported by
     * any of the backends that OC supports
     * @param bucketBoundaries a list with the bucket boundaries
     */
    private dropNegativeBucketBounds;
    /**
     * Gets initial list of bucket counters
     * @param buckets Bucket boundaries
     */
    private getBucketCounts;
    /**
     * Checks boundaries order and duplicates
     * @param current Boundary
     * @param next Next boundary
     */
    private validateBoundary;
}
