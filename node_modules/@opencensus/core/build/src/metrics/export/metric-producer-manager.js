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
const validations_1 = require("../../common/validations");
/**
 * Keeps a set of MetricProducer that is used by exporters to determine the
 * metrics that need to be exported.
 */
class BaseMetricProducerManager {
    constructor() {
        this.metricProducers = new Set();
    }
    /** Gets the instance. */
    static get instance() {
        return this.singletonInstance || (this.singletonInstance = new this());
    }
    /**
     * Adds the MetricProducer to the manager if it is not already present.
     *
     * @param {MetricProducer} The MetricProducer to be added to the manager.
     */
    add(metricProducer) {
        validations_1.validateNotNull(metricProducer, 'metricProducer');
        if (!this.metricProducers.has(metricProducer)) {
            this.metricProducers.add(metricProducer);
        }
    }
    /**
     * Removes the MetricProducer to the manager if it is present.
     *
     * @param {MetricProducer} The MetricProducer to be removed from the manager.
     */
    remove(metricProducer) {
        validations_1.validateNotNull(metricProducer, 'metricProducer');
        this.metricProducers.delete(metricProducer);
    }
    /**
     * Clears all MetricProducers.
     */
    removeAll() {
        this.metricProducers.clear();
    }
    /**
     * Returns all registered MetricProducers that should be exported.
     *
     * This method should be used by any metrics exporter that automatically
     * exports data for MetricProducer registered with the MetricProducerManager.
     *
     * @return {Set<MetricProducer>} The Set of MetricProducers.
     */
    getAllMetricProducer() {
        return this.metricProducers;
    }
}
exports.metricProducerManagerInstance = BaseMetricProducerManager.instance;
//# sourceMappingURL=metric-producer-manager.js.map