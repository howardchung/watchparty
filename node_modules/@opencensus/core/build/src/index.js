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
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./trace/model/types"));
const types_1 = require("./metrics/export/types");
exports.MetricDescriptorType = types_1.MetricDescriptorType;
// classes
// domain models impls
__export(require("./trace/model/tracer"));
// sampler impl
__export(require("./trace/sampler/sampler"));
// base instrumetation class
__export(require("./trace/instrumentation/base-plugin"));
// console exporter and buffer impls
__export(require("./exporters/exporter-buffer"));
__export(require("./exporters/console-exporter"));
// STATS CLASSES
// classes
__export(require("./stats/view"));
__export(require("./stats/recorder"));
__export(require("./stats/bucket-boundaries"));
__export(require("./stats/metric-utils"));
__export(require("./tags/tag-map"));
__export(require("./resource/resource"));
// interfaces
__export(require("./stats/types"));
// logger
const logger = require("./common/console-logger");
exports.logger = logger;
// version
__export(require("./common/version"));
// METRICS CLASSES
__export(require("./metrics/metrics"));
__export(require("./metrics/metric-registry"));
// GAUGES CLASSES
__export(require("./metrics/gauges/derived-gauge"));
__export(require("./metrics/gauges/gauge"));
// Stats singleton instance
const stats_1 = require("./stats/stats");
const globalStats = stats_1.BaseStats.instance;
exports.globalStats = globalStats;
//# sourceMappingURL=index.js.map