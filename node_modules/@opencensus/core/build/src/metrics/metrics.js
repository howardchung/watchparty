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
const metric_producer_manager_1 = require("./export/metric-producer-manager");
const metric_component_1 = require("./metric-component");
/**
 * Class for accessing the default MetricsComponent.
 */
class Metrics {
    /** @return {MetricProducerManager} The global MetricProducerManager. */
    static getMetricProducerManager() {
        return metric_producer_manager_1.metricProducerManagerInstance;
    }
    /** @return {MetricRegistry} The global MetricRegistry. */
    static getMetricRegistry() {
        return Metrics.METRIC_COMPONENT.getMetricRegistry();
    }
}
Metrics.METRIC_COMPONENT = new metric_component_1.MetricsComponent();
exports.Metrics = Metrics;
//# sourceMappingURL=metrics.js.map