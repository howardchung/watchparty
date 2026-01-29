'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotifyFeature = exports.ErrorContext = exports.NotifyOptions = void 0;
const configuration_1 = require("../configuration");
const serviceManager_1 = require("../serviceManager");
const debug_1 = require("debug");
const semver = require("semver");
const stackParser_1 = require("../utils/stackParser");
const fs = require("fs");
const path = require("path");
class NotifyOptions {
}
exports.NotifyOptions = NotifyOptions;
class ErrorContext {
}
exports.ErrorContext = ErrorContext;
const optionsDefault = {
    catchExceptions: true
};
class NotifyFeature {
    constructor() {
        this.logger = (0, debug_1.default)('axm:features:notify');
    }
    init(options) {
        if (options === undefined) {
            options = optionsDefault;
        }
        this.logger('init');
        this.transport = serviceManager_1.ServiceManager.get('transport');
        if (this.transport === undefined) {
            return this.logger(`Failed to load transporter service`);
        }
        configuration_1.default.configureModule({
            error: true
        });
        if (options.catchExceptions === false)
            return;
        this.logger('Registering hook to catch unhandled exception/rejection');
        this.cache = new stackParser_1.Cache({
            miss: (key) => {
                try {
                    const content = fs.readFileSync(path.resolve(key));
                    return content.toString().split(/\r?\n/);
                }
                catch (err) {
                    this.logger('Error while trying to get file from FS : %s', err.message || err);
                    return null;
                }
            },
            ttl: 30 * 60
        });
        this.stackParser = new stackParser_1.StackTraceParser({
            cache: this.cache,
            contextSize: 5
        });
        this.catchAll();
    }
    destroy() {
        process.removeListener('uncaughtException', this.onUncaughtException);
        process.removeListener('unhandledRejection', this.onUnhandledRejection);
        this.logger('destroy');
    }
    getSafeError(err) {
        if (err instanceof Error)
            return err;
        let message;
        try {
            message = `Non-error value: ${JSON.stringify(err)}`;
        }
        catch (e) {
            try {
                message = `Unserializable non-error value: ${String(e)}`;
            }
            catch (e2) {
                message = `Unserializable non-error value that cannot be converted to a string`;
            }
        }
        if (message.length > 1000)
            message = message.substr(0, 1000) + '...';
        return new Error(message);
    }
    notifyError(err, context) {
        if (typeof context !== 'object') {
            context = {};
        }
        if (this.transport === undefined) {
            return this.logger(`Tried to send error without having transporter available`);
        }
        const safeError = this.getSafeError(err);
        let stackContext = null;
        if (err instanceof Error) {
            stackContext = this.stackParser.retrieveContext(err);
        }
        const payload = Object.assign({
            message: safeError.message,
            stack: safeError.stack,
            name: safeError.name,
            metadata: context
        }, stackContext === null ? {} : stackContext);
        return this.transport.send('process:exception', payload);
    }
    onUncaughtException(error) {
        if (semver.satisfies(process.version, '< 6')) {
            console.error(error.stack);
        }
        else {
            console.error(error);
        }
        const safeError = this.getSafeError(error);
        let stackContext = null;
        if (error instanceof Error) {
            stackContext = this.stackParser.retrieveContext(error);
        }
        const payload = Object.assign({
            message: safeError.message,
            stack: safeError.stack,
            name: safeError.name
        }, stackContext === null ? {} : stackContext);
        if (serviceManager_1.ServiceManager.get('transport')) {
            serviceManager_1.ServiceManager.get('transport').send('process:exception', payload);
        }
        if (process.listeners('uncaughtException').length === 1) {
            process.exit(1);
        }
    }
    onUnhandledRejection(error) {
        if (error === undefined)
            return;
        console.error(error);
        const safeError = this.getSafeError(error);
        let stackContext = null;
        if (error instanceof Error) {
            stackContext = this.stackParser.retrieveContext(error);
        }
        const payload = Object.assign({
            message: safeError.message,
            stack: safeError.stack,
            name: safeError.name
        }, stackContext === null ? {} : stackContext);
        if (serviceManager_1.ServiceManager.get('transport')) {
            serviceManager_1.ServiceManager.get('transport').send('process:exception', payload);
        }
    }
    catchAll() {
        if (process.env.exec_mode === 'cluster_mode') {
            return false;
        }
        process.on('uncaughtException', this.onUncaughtException.bind(this));
        process.on('unhandledRejection', this.onUnhandledRejection.bind(this));
    }
    expressErrorHandler() {
        const self = this;
        configuration_1.default.configureModule({
            error: true
        });
        return function errorHandler(err, req, res, next) {
            const safeError = self.getSafeError(err);
            const payload = {
                message: safeError.message,
                stack: safeError.stack,
                name: safeError.name,
                metadata: {
                    http: {
                        url: req.url,
                        params: req.params,
                        method: req.method,
                        query: req.query,
                        body: req.body,
                        path: req.path,
                        route: req.route && req.route.path ? req.route.path : undefined
                    },
                    custom: {
                        user: typeof req.user === 'object' ? req.user.id : undefined
                    }
                }
            };
            if (serviceManager_1.ServiceManager.get('transport')) {
                serviceManager_1.ServiceManager.get('transport').send('process:exception', payload);
            }
            return next(err);
        };
    }
    koaErrorHandler() {
        const self = this;
        configuration_1.default.configureModule({
            error: true
        });
        return function (ctx, next) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    yield next();
                }
                catch (err) {
                    const safeError = self.getSafeError(err);
                    const payload = {
                        message: safeError.message,
                        stack: safeError.stack,
                        name: safeError.name,
                        metadata: {
                            http: {
                                url: ctx.request.url,
                                params: ctx.params,
                                method: ctx.request.method,
                                query: ctx.request.query,
                                body: ctx.request.body,
                                path: ctx.request.path,
                                route: ctx._matchedRoute
                            },
                            custom: {
                                user: typeof ctx.user === 'object' ? ctx.user.id : undefined
                            }
                        }
                    };
                    if (serviceManager_1.ServiceManager.get('transport')) {
                        serviceManager_1.ServiceManager.get('transport').send('process:exception', payload);
                    }
                    throw err;
                }
            });
        };
    }
}
exports.NotifyFeature = NotifyFeature;
