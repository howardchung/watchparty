'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotifyFeature = exports.ErrorContext = exports.NotifyOptions = void 0;
const tslib_1 = require("tslib");
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
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2ZlYXR1cmVzL25vdGlmeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUE7Ozs7QUFHWixvREFBNEM7QUFDNUMsc0RBQWtEO0FBQ2xELGlDQUF5QjtBQUV6QixpQ0FBZ0M7QUFDaEMsc0RBQTRFO0FBQzVFLHlCQUF3QjtBQUN4Qiw2QkFBNEI7QUFFNUIsTUFBYSxhQUFhO0NBRXpCO0FBRkQsc0NBRUM7QUFFRCxNQUFhLFlBQVk7Q0FVeEI7QUFWRCxvQ0FVQztBQUVELE1BQU0sY0FBYyxHQUFrQjtJQUNwQyxlQUFlLEVBQUUsSUFBSTtDQUN0QixDQUFBO0FBRUQsTUFBYSxhQUFhO0lBQTFCO1FBRVUsV0FBTSxHQUFhLElBQUEsZUFBSyxFQUFDLHFCQUFxQixDQUFDLENBQUE7SUFxT3pELENBQUM7SUFoT0MsSUFBSSxDQUFFLE9BQXVCO1FBQzNCLElBQUksT0FBTyxLQUFLLFNBQVMsRUFBRTtZQUN6QixPQUFPLEdBQUcsY0FBYyxDQUFBO1NBQ3pCO1FBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUNuQixJQUFJLENBQUMsU0FBUyxHQUFHLCtCQUFjLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBQ2hELElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxTQUFTLEVBQUU7WUFDaEMsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLG9DQUFvQyxDQUFDLENBQUE7U0FDekQ7UUFFRCx1QkFBYSxDQUFDLGVBQWUsQ0FBQztZQUM1QixLQUFLLEVBQUcsSUFBSTtTQUNiLENBQUMsQ0FBQTtRQUNGLElBQUksT0FBTyxDQUFDLGVBQWUsS0FBSyxLQUFLO1lBQUUsT0FBTTtRQUM3QyxJQUFJLENBQUMsTUFBTSxDQUFDLHlEQUF5RCxDQUFDLENBQUE7UUFDdEUsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLG1CQUFLLENBQUM7WUFD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