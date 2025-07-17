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
const defaultLogger = require("../common/console-logger");
class BucketBoundaries {
    constructor(boundaries, logger = defaultLogger) {
        this.logger = logger.logger();
        this.buckets = this.dropNegativeBucketBounds(boundaries);
        this.bucketCounts = this.getBucketCounts(this.buckets);
    }
    /**
     * Gets bucket boundaries
     */
    getBoundaries() {
        return this.buckets;
    }
    /**
     * Gets initial bucket counts
     */
    getCounts() {
        return this.bucketCounts;
    }
    /**
     * Drops negative (BucketBounds) are currently not supported by
     * any of the backends that OC supports
     * @param bucketBoundaries a list with the bucket boundaries
     */
    dropNegativeBucketBounds(bucketBoundaries) {
        let negative = 0;
        if (!bucketBoundaries)
            return [];
        const result = bucketBoundaries.reduce((accumulator, boundary, index) => {
            if (boundary > 0) {
                const nextBoundary = bucketBoundaries[index + 1];
                this.validateBoundary(boundary, nextBoundary);
                accumulator.push(boundary);
            }
            else {
                negative++;
            }
            return accumulator;
        }, []);
        if (negative) {
            this.logger.warn(`Dropping ${negative} negative bucket boundaries, the values must be strictly > 0.`);
        }
        return result;
    }
    /**
     * Gets initial list of bucket counters
     * @param buckets Bucket boundaries
     */
    getBucketCounts(buckets) {
        if (!buckets)
            return [];
        const bucketsCount = new Array(buckets.length + 1);
        bucketsCount.fill(0);
        return bucketsCount;
    }
    /**
     * Checks boundaries order and duplicates
     * @param current Boundary
     * @param next Next boundary
     */
    validateBoundary(current, next) {
        if (next) {
            if (current > next) {
                this.logger.error('Bucket boundaries not sorted.');
            }
            if (current === next) {
                this.logger.error('Bucket boundaries not unique.');
            }
        }
    }
}
exports.BucketBoundaries = BucketBoundaries;
//# sourceMappingURL=bucket-boundaries.js.map