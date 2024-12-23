"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.HttpsPlugin = void 0;
const http_1 = require("./http");
const https = require("https");
const semver = require("semver");
const shimmer = require("shimmer");
class HttpsPlugin extends http_1.HttpPlugin {
    constructor() {
        super('https');
    }
    applyPatch() {
        this.logger.debug('applying patch to %s@%s', this.moduleName, this.version);
        if (this.moduleExports && this.moduleExports.Server &&
            this.moduleExports.Server.prototype) {
            shimmer.wrap(this.moduleExports && this.moduleExports.Server &&
                this.moduleExports.Server.prototype, 'emit', this.getPatchIncomingRequestFunction());
        }
        else {
            this.logger.error('Could not apply patch to %s.emit. Interface is not as expected.', this.moduleName);
        }
        shimmer.wrap(this.moduleExports, 'request', this.getPatchHttpsOutgoingRequest());
        if (semver.satisfies(this.version, '>=8.0.0')) {
            shimmer.wrap(this.moduleExports, 'get', () => {
                return function getTrace(options, callback) {
                    const req = https.request(options, callback);
                    req.end();
                    return req;
                };
            });
        }
        return this.moduleExports;
    }
    getPatchHttpsOutgoingRequest() {
        return (original) => {
            const plugin = this;
            return function httpsOutgoingRequest(options, callback) {
                if (typeof (options) !== 'string') {
                    options.protocol = options.protocol || 'https:';
                    options.port = options.port || 443;
                    options.agent = options.agent || https.globalAgent;
                }
                return (plugin.getPatchOutgoingRequestFunction())(original)(options, callback);
            };
        };
    }
    applyUnpatch() {
        if (this.moduleExports && this.moduleExports.Server &&
            this.moduleExports.Server.prototype) {
            shimmer.unwrap(this.moduleExports && this.moduleExports.Server &&
                this.moduleExports.Server.prototype, 'emit');
        }
        shimmer.unwrap(this.moduleExports, 'request');
        if (semver.satisfies(this.version, '>=8.0.0')) {
            shimmer.unwrap(this.moduleExports, 'get');
        }
    }
}
exports.HttpsPlugin = HttpsPlugin;
const plugin = new HttpsPlugin();
exports.plugin = plugin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY2Vuc3VzL3BsdWdpbnMvaHR0cHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBaUJBLGlDQUFtQztBQUVuQywrQkFBOEI7QUFDOUIsaUNBQWdDO0FBQ2hDLG1DQUFrQztBQUdsQyxNQUFhLFdBQVksU0FBUSxpQkFBVTtJQUV6QztRQUNFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUNoQixDQUFDO0lBS1MsVUFBVTtRQUNsQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUUzRSxJQUFJLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNO1lBQy9DLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRTtZQUN2QyxPQUFPLENBQUMsSUFBSSxDQUNSLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNO2dCQUMzQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQ3ZDLE1BQU0sRUFBRSxJQUFJLENBQUMsK0JBQStCLEVBQUUsQ0FBQyxDQUFBO1NBQ3BEO2FBQU07WUFDTCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FDYixpRUFBaUUsRUFDakUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO1NBQ3JCO1FBRUQsT0FBTyxDQUFDLElBQUksQ0FDUixJQUFJLENBQUMsYUFBYSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsNEJBQTRCLEVBQUUsQ0FBQyxDQUFBO1FBQ3ZFLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxFQUFFO1lBQzdDLE9BQU8sQ0FBQyxJQUFJLENBQ1YsSUFBSSxDQUFDLGFBQWEsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFO2dCQVk5QixPQUFPLFNBQVMsUUFBUSxDQUFFLE9BQU8sRUFBRSxRQUFRO29CQUN6QyxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQTtvQkFDNUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFBO29CQUNULE9BQU8sR0FBRyxDQUFBO2dCQUNaLENBQUMsQ0FBQTtZQUNILENBQUMsQ0FBQyxDQUFBO1NBQ0w7UUFFRCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUE7SUFDM0IsQ0FBQztJQUdPLDRCQUE0QjtRQUNsQyxPQUFPLENBQUMsUUFBa0MsRUFBNEIsRUFBRTtZQUN0RSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUE7WUFDbkIsT0FBTyxTQUFTLG9CQUFvQixDQUN6QixPQUFPLEVBQUUsUUFBUTtnQkFFMUIsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssUUFBUSxFQUFFO29CQUNqQyxPQUFPLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFBO29CQUMvQyxPQUFPLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFBO29CQUNsQyxPQUFPLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLFdBQVcsQ0FBQTtpQkFDbkQ7Z0JBQ0QsT0FBTyxDQUFDLE1BQU0sQ0FBQywrQkFBK0IsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQ3ZELE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQTtZQUN4QixDQUFDLENBQUE7UUFDSCxDQUFDLENBQUE7SUFDSCxDQUFDO0lBR1MsWUFBWTtRQUNwQixJQUFJLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNO1lBQy9DLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRTtZQUN2QyxPQUFPLENBQUMsTUFBTSxDQUNWLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNO2dCQUMzQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQ3ZDLE1BQU0sQ0FBQyxDQUFBO1NBQ1o7UUFDRCxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsU0FBUyxDQUFDLENBQUE7UUFDN0MsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLEVBQUU7WUFDN0MsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFBO1NBQzFDO0lBQ0gsQ0FBQztDQUNGO0FBbkZELGtDQW1GQztBQUVELE1BQU0sTUFBTSxHQUFHLElBQUksV0FBVyxFQUFFLENBQUE7QUFDdkIsd0JBQU0ifQ==