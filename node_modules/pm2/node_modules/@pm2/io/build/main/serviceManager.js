"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceManager = exports.Service = void 0;
const services = new Map();
class Service {
}
exports.Service = Service;
class ServiceManager {
    static get(serviceName) {
        return services.get(serviceName);
    }
    static set(serviceName, service) {
        return services.set(serviceName, service);
    }
    static reset(serviceName) {
        return services.delete(serviceName);
    }
}
exports.ServiceManager = ServiceManager;
