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
const metric_producer_manager_1 = require("./export/metric-producer-manager");
const metric_registry_1 = require("./metric-registry");
/**
 * Class that holds the implementation instance for MetricRegistry.
 */
class MetricsComponent {
    constructor() {
        this.metricRegistry = new metric_registry_1.MetricRegistry();
        // Register the MetricRegistry's MetricProducer to the global
        // MetricProducerManager.
        metric_producer_manager_1.metricProducerManagerInstance.add(this.metricRegistry.getMetricProducer());
    }
    /**
     * Returns the MetricRegistry.
     *
     * @return {MetricRegistry}.
     */
    getMetricRegistry() {
        return this.metricRegistry;
    }
}
exports.MetricsComponent = MetricsComponent;
//# sourceMappingURL=metric-component.js.map