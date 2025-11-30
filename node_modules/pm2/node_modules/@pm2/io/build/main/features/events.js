"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsFeature = void 0;
const serviceManager_1 = require("../serviceManager");
const Debug = require("debug");
class EventsFeature {
    constructor() {
        this.logger = Debug('axm:features:events');
    }
    init() {
        this.transport = serviceManager_1.ServiceManager.get('transport');
        this.logger('init');
    }
    emit(name, data) {
        if (typeof name !== 'string') {
            console.error('event name must be a string');
            return console.trace();
        }
        if (typeof data !== 'object') {
            console.error('event data must be an object');
            return console.trace();
        }
        if (data instanceof Array) {
            console.error(`event data cannot be an array`);
            return console.trace();
        }
        let inflightObj = {};
        try {
            inflightObj = JSON.parse(JSON.stringify(data));
        }
        catch (err) {
            return console.log('Failed to serialize the event data', err.message);
        }
        inflightObj.__name = name;
        if (this.transport === undefined) {
            return this.logger('Failed to send event as transporter isnt available');
        }
        this.transport.send('human:event', inflightObj);
    }
    destroy() {
        this.logger('destroy');
    }
}
exports.EventsFeature = EventsFeature;
