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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNhY3Rpb25BZ2dyZWdhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxzL3RyYW5zYWN0aW9uQWdncmVnYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUE7OztBQUVaLCtCQUE4QjtBQUM5QixpREFBNkM7QUFDN0MsaUNBQXlCO0FBQ3pCLG1EQUEyQztBQUUzQyxNQUFNLE1BQU0sR0FBRyxDQUFDLElBQVksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7QUFDakUsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUE7QUE0RHBELE1BQWEscUJBQXNCLFNBQVEsNkJBQWE7SUFBeEQ7O1FBRVUsY0FBUyxHQUFhLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLGVBQWUsQ0FBQyxDQUFBO1FBQ3hFLFVBQUssR0FBZTtZQUMxQixNQUFNLEVBQUUsRUFBRTtZQUNWLElBQUksRUFBRTtnQkFDSixXQUFXLEVBQUUsQ0FBQztnQkFDZCxVQUFVLEVBQUUsSUFBSSxjQUFJLEVBQUU7Z0JBQ3RCLFFBQVEsRUFBRSxJQUFJLGNBQUksRUFBRTtnQkFDcEIsU0FBUyxFQUFFLElBQUksbUJBQVMsQ0FBQyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsQ0FBQztnQkFDbkQsYUFBYSxFQUFFLEVBQUU7YUFDbEI7U0FDRixDQUFBO1FBQ08saUJBQVksR0FBVyxtRkFBbUYsQ0FBQTtJQStZcEgsQ0FBQztJQTVZQyxJQUFJLENBQUUsZUFBdUIsS0FBSztRQUNoQyxJQUFJLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUM1QixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQTtZQUMvQyxJQUFJLENBQUMsSUFB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LE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQTtTQUN2QztRQUdELElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBR3RCLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQUUsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFBO1FBR3RFLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDOUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDcEMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ25CLElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7WUFFL0IsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLElBQUksQ0FBQyxNQUFNO2dCQUFFLFNBQVE7WUFFN0MsS0FBSyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUV6QyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBRTNCLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTt3QkFDeEYsT0FBTyxRQUFR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