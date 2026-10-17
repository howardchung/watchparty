'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionAggregator = void 0;
const Debug = require("debug");
const eventemitter2_1 = require("eventemitter2");
const EWMA_1 = require("./EWMA");
const histogram_1 = require("./metrics/histogram");
const fclone = (data) => JSON.parse(JSON.stringify(data));
const log = Debug('axm:features:tracing:aggregator');
class TransactionAggregator extends eventemitter2_1.EventEmitter2 {
    constructor() {
        super(...arguments);
        this.spanTypes = ['redis', 'mysql', 'pg', 'mongo', 'outbound_http'];
        this.cache = {
            routes: {},
            meta: {
                trace_count: 0,
                http_meter: new EWMA_1.default(),
                db_meter: new EWMA_1.default(),
                histogram: new histogram_1.default({ measurement: 'median' }),
                db_histograms: {}
            }
        };
        this.privacyRegex = /":(?!\[|{)\\"[^"]*\\"|":(["'])(?:(?=(\\?))\2.)*?\1|":(?!\[|{)[^,}\]]*|":\[[^{]*]/g;
    }
    init(sendInterval = 30000) {
        this.worker = setInterval(_ => {
            let data = this.prepareAggregationforShipping();
            this.emit('packet', { data });
        }, sendInterval);
    }
    destroy() {
        if (this.worker !== undefined) {
            clearInterval(this.worker);
        }
        this.cache.routes = {};
    }
    getAggregation() {
        return this.cache;
    }
    validateData(packet) {
        if (!packet) {
            log('Packet malformated', packet);
            return false;
        }
        if (!packet.spans || !packet.spans[0]) {
            log('Trace without spans: %s', Object.keys(packet.data));
            return false;
        }
        if (!packet.spans[0].labels) {
            log('Trace spans without labels: %s', Object.keys(packet.spans));
            return false;
        }
        return true;
    }
    aggregate(packet) {
        if (this.validateData(packet) === false)
            return false;
        let path = packet.spans[0].labels['http/path'];
        if (process.env.PM2_APM_CENSOR_SPAMS !== '0') {
            this.censorSpans(packet.spans);
        }
        packet.spans = packet.spans.filter((span) => {
            return span.endTime !== span.startTime;
        });
        packet.spans.forEach((span) => {
            span.mean = Math.round(new Date(span.endTime).getTime() - new Date(span.startTime).getTime());
            delete span.endTime;
        });
        packet.spans.forEach((span) => {
            if (!span.name || !span.kind)
                return false;
            if (span.kind === 'RPC_SERVER') {
                this.cache.meta.histogram.update(span.mean);
                return this.cache.meta.http_meter.update(1);
            }
            if (span.labels && span.labels['http/method'] && span.labels['http/status_code']) {
                span.labels['service'] = span.name;
                span.name = 'outbound_http';
            }
            for (let i = 0; i < this.spanTypes.length; i++) {
                if (span.name.indexOf(this.spanTypes[i]) > -1) {
                    this.cache.meta.db_meter.update(1);
                    if (!this.cache.meta.db_histograms[this.spanTypes[i]]) {
                        this.cache.meta.db_histograms[this.spanTypes[i]] = new histogram_1.default({ measurement: 'mean' });
                    }
                    this.cache.meta.db_histograms[this.spanTypes[i]].update(span.mean);
                    break;
                }
            }
        });
        this.cache.meta.trace_count++;
        if (path[0] === '/' && path !== '/') {
            path = path.substr(1, path.length - 1);
        }
        let matched = this.matchPath(path, this.cache.routes);
        if (!matched) {
            this.cache.routes[path] = [];
            this.mergeTrace(this.cache.routes[path], packet);
        }
        else {
            this.mergeTrace(this.cache.routes[matched], packet);
        }
        return this.cache;
    }
    mergeTrace(aggregated, trace) {
        if (!aggregated || !trace)
            return;
        if (trace.spans.length === 0)
            return;
        if (!aggregated.variances)
            aggregated.variances = [];
        if (!aggregated.meta) {
            aggregated.meta = {
                histogram: new histogram_1.default({ measurement: 'median' }),
                meter: new EWMA_1.default()
            };
        }
        aggregated.meta.histogram.update(trace.spans[0].mean);
        aggregated.meta.meter.update();
        const merge = (variance) => {
            if (variance == null) {
                delete trace.projectId;
                delete trace.traceId;
                trace.histogram = new histogram_1.default({ measurement: 'median' });
                trace.histogram.update(trace.spans[0].mean);
                trace.spans.forEach((span) => {
                    span.histogram = new histogram_1.default({ measurement: 'median' });
                    span.histogram.update(span.mean);
                    delete span.mean;
                });
                aggregated.variances.push(trace);
            }
            else {
                variance.histogram.update(trace.spans[0].mean);
                this.updateSpanDuration(variance.spans, trace.spans);
                trace.spans.forEach((span) => {
                    delete span.labels.stacktrace;
                });
            }
        };
        for (let i = 0; i < aggregated.variances.length; i++) {
            if (this.compareList(aggregated.variances[i].spans, trace.spans)) {
                return merge(aggregated.variances[i]);
            }
        }
        return merge(null);
    }
    updateSpanDuration(spans, newSpans) {
        for (let i = 0; i < spans.length; i++) {
            if (!newSpans[i])
                continue;
            spans[i].histogram.update(newSpans[i].mean);
        }
    }
    compareList(one, two) {
        if (one.length !== two.length)
            return false;
        for (let i = 0; i < one.length; i++) {
            if (one[i].name !== two[i].name)
                return false;
            if (one[i].kind !== two[i].kind)
                return false;
            if (!one[i].labels && two[i].labels)
                return false;
            if (one[i].labels && !two[i].labels)
                return false;
            if (one[i].labels.length !== two[i].labels.length)
                return false;
        }
        return true;
    }
    matchPath(path, routes) {
        if (!path || !routes)
            return false;
        if (path === '/')
            return routes[path] ? path : null;
        if (path[path.length - 1] === '/') {
            path = path.substr(0, path.length - 1);
        }
        path = path.split('/');
        if (path.length === 1)
            return routes[path[0]] ? routes[path[0]] : null;
        let keys = Object.keys(routes);
        for (let i = 0; i < keys.length; i++) {
            let route = keys[i];
            let segments = route.split('/');
            if (segments.length !== path.length)
                continue;
            for (let j = path.length - 1; j >= 0; j--) {
                if (path[j] !== segments[j]) {
                    if (this.isIdentifier(path[j]) && segments[j] === '*' && path[j - 1] === segments[j - 1]) {
                        return segments.join('/');
                    }
                    else if (path[j - 1] !== undefined && path[j - 1] === segments[j - 1] && this.isIdentifier(path[j]) && this.isIdentifier(segments[j])) {
                        segments[j] = '*';
                        routes[segments.join('/')] = routes[route];
                        delete routes[keys[i]];
                        return segments.join('/');
                    }
                    else {
                        break;
                    }
                }
                if (j === 0)
                    return segments.join('/');
            }
        }
    }
    prepareAggregationforShipping() {
        let routes = this.cache.routes;
        const normalized = {
            routes: [],
            meta: {
                trace_count: this.cache.meta.trace_count,
                http_meter: Math.round(this.cache.meta.http_meter.rate(1000) * 100) / 100,
                db_meter: Math.round(this.cache.meta.db_meter.rate(1000) * 100) / 100,
                http_percentiles: {
                    median: this.cache.meta.histogram.percentiles([0.5])[0.5],
                    p95: this.cache.meta.histogram.percentiles([0.95])[0.95],
                    p99: this.cache.meta.histogram.percentiles([0.99])[0.99]
                },
                db_percentiles: {}
            }
        };
        this.spanTypes.forEach((name) => {
            let histogram = this.cache.meta.db_histograms[name];
            if (!histogram)
                return;
            normalized.meta.db_percentiles[name] = histogram.percentiles([0.5])[0.5];
        });
        Object.keys(routes).forEach((path) => {
            let data = routes[path];
            if (!data.variances || data.variances.length === 0)
                return;
            const variances = data.variances.sort((a, b) => {
                return b.count - a.count;
            }).slice(0, 5);
            let routeCopy = {
                path: path === '/' ? '/' : '/' + path,
                meta: {
                    min: data.meta.histogram.getMin(),
                    max: data.meta.histogram.getMax(),
                    count: data.meta.histogram.getCount(),
                    meter: Math.round(data.meta.meter.rate(1000) * 100) / 100,
                    median: data.meta.histogram.percentiles([0.5])[0.5],
                    p95: data.meta.histogram.percentiles([0.95])[0.95]
                },
                variances: []
            };
            variances.forEach((variance) => {
                if (!variance.spans || variance.spans.length === 0)
                    return;
                let tmp = {
                    spans: [],
                    count: variance.histogram.getCount(),
                    min: variance.histogram.getMin(),
                    max: variance.histogram.getMax(),
                    median: variance.histogram.percentiles([0.5])[0.5],
                    p95: variance.histogram.percentiles([0.95])[0.95]
                };
                variance.spans.forEach((oldSpan) => {
                    const span = fclone({
                        name: oldSpan.name,
                        labels: oldSpan.labels,
                        kind: oldSpan.kind,
                        startTime: oldSpan.startTime,
                        min: oldSpan.histogram ? oldSpan.histogram.getMin() : undefined,
                        max: oldSpan.histogram ? oldSpan.histogram.getMax() : undefined,
                        median: oldSpan.histogram ? oldSpan.histogram.percentiles([0.5])[0.5] : undefined
                    });
                    tmp.spans.push(span);
                });
                routeCopy.variances.push(tmp);
            });
            normalized.routes.push(routeCopy);
        });
        log(`sending formatted trace to remote endpoint`);
        return normalized;
    }
    isIdentifier(id) {
        id = typeof (id) !== 'string' ? id + '' : id;
        if (id.match(/[0-9a-f]{8}-[0-9a-f]{4}-[14][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-f]{12}[14][0-9a-f]{19}/i)) {
            return true;
        }
        else if (id.match(/\d+/)) {
            return true;
        }
        else if (id.match(/[0-9]+[a-z]+|[a-z]+[0-9]+/)) {
            return true;
        }
        else if (id.match(/((?:[0-9a-zA-Z]+[@\-_.][0-9a-zA-Z]+|[0-9a-zA-Z]+[@\-_.]|[@\-_.][0-9a-zA-Z]+)+)/)) {
            return true;
        }
        return false;
    }
    censorSpans(spans) {
        if (!spans)
            return log('spans is null');
        spans.forEach((span) => {
            if (!span.labels)
                return;
            delete span.labels.results;
            delete span.labels.result;
            delete span.spanId;
            delete span.parentSpanId;
            delete span.labels.values;
            delete span.labels.stacktrace;
            Object.keys(span.labels).forEach((key) => {
                if (typeof (span.labels[key]) === 'string' && key !== 'stacktrace') {
                    span.labels[key] = span.labels[key].replace(this.privacyRegex, '\": \"?\"');
                }
            });
        });
    }
}
exports.TransactionAggregator = TransactionAggregator;
