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
const types_1 = require("./types");
const UNKNOWN_TAG_VALUE = null;
class Recorder {
    static addMeasurement(aggregationData, measurement) {
        aggregationData.timestamp = Date.now();
        const value = measurement.measure.type === types_1.MeasureType.DOUBLE ?
            measurement.value :
            Math.trunc(measurement.value);
        switch (aggregationData.type) {
            case types_1.AggregationType.DISTRIBUTION:
                return this.addToDistribution(aggregationData, value);
            case types_1.AggregationType.SUM:
                return this.addToSum(aggregationData, value);
            case types_1.AggregationType.COUNT:
                return this.addToCount(aggregationData, value);
            default:
                return this.addToLastValue(aggregationData, value);
        }
    }
    /** Gets the tag values from tags and columns */
    static getTagValues(tags, columns) {
        return columns.map((tagKey) => (tags.get(tagKey) ||
            /** replace not found key values by null. */ UNKNOWN_TAG_VALUE));
    }
    static addToDistribution(distributionData, value) {
        distributionData.count += 1;
        let bucketIndex = distributionData.buckets.findIndex(bucket => bucket > value);
        if (bucketIndex < 0) {
            bucketIndex = distributionData.buckets.length;
        }
        distributionData.bucketCounts[bucketIndex] += 1;
        if (distributionData.count === 1) {
            distributionData.mean = value;
        }
        distributionData.sum += value;
        const oldMean = distributionData.mean;
        distributionData.mean = distributionData.mean +
            (value - distributionData.mean) / distributionData.count;
        distributionData.sumOfSquaredDeviation =
            distributionData.sumOfSquaredDeviation +
                (value - oldMean) * (value - distributionData.mean);
        distributionData.stdDeviation = Math.sqrt(distributionData.sumOfSquaredDeviation / distributionData.count);
        return distributionData;
    }
    static addToSum(sumData, value) {
        sumData.value += value;
        return sumData;
    }
    static addToCount(countData, value) {
        countData.value += 1;
        return countData;
    }
    static addToLastValue(lastValueData, value) {
        lastValueData.value = value;
        return lastValueData;
    }
}
exports.Recorder = Recorder;
//# sourceMappingURL=recorder.js.map