"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StackTraceParser = exports.Cache = void 0;
class Cache {
    constructor(opts) {
        this.cache = {};
        this.ttlCache = {};
        this.onMiss = opts.miss;
        this.tllTime = opts.ttl || -1;
        if (opts.ttl) {
            this.worker = setInterval(this.workerFn.bind(this), 1000);
            this.worker.unref();
        }
    }
    workerFn() {
        let keys = Object.keys(this.ttlCache);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let value = this.ttlCache[key];
            if (Date.now() > value) {
                delete this.cache[key];
                delete this.ttlCache[key];
            }
        }
    }
    get(key) {
        if (!key)
            return null;
        let value = this.cache[key];
        if (value)
            return value;
        value = this.onMiss(key);
        if (value) {
            this.set(key, value);
        }
        return value;
    }
    set(key, value) {
        if (!key || !value)
            return false;
        this.cache[key] = value;
        if (this.tllTime > 0) {
            this.ttlCache[key] = Date.now() + this.tllTime;
        }
        return true;
    }
    reset() {
        this.cache = {};
        this.ttlCache = {};
    }
}
exports.Cache = Cache;
class StackTraceParser {
    constructor(options) {
        this.contextSize = 3;
        this.cache = options.cache;
        this.contextSize = options.contextSize;
    }
    isAbsolute(path) {
        if (process.platform === 'win32') {
            let splitDeviceRe = /^([a-zA-Z]:|[\\/]{2}[^\\/]+[\\/]+[^\\/]+)?([\\/])?([\s\S]*?)$/;
            let result = splitDeviceRe.exec(path);
            if (result === null)
                return path.charAt(0) === '/';
            let device = result[1] || '';
            let isUnc = Boolean(device && device.charAt(1) !== ':');
            return Boolean(result[2] || isUnc);
        }
        else {
            return path.charAt(0) === '/';
        }
    }
    parse(stack) {
        if (stack.length === 0)
            return null;
        const userFrame = stack.find(frame => {
            const type = this.isAbsolute(frame.file_name) || frame.file_name[0] === '.' ? 'user' : 'core';
            return type !== 'core' && frame.file_name.indexOf('node_modules') < 0 && frame.file_name.indexOf('@pm2/io') < 0;
        });
        if (userFrame === undefined)
            return null;
        const context = this.cache.get(userFrame.file_name);
        const source = [];
        if (context === null || context.length === 0)
            return null;
        const preLine = userFrame.line_number - this.contextSize - 1;
        const start = preLine > 0 ? preLine : 0;
        context.slice(start, userFrame.line_number - 1).forEach(function (line) {
            source.push(line.replace(/\t/g, '  '));
        });
        if (context[userFrame.line_number - 1]) {
            source.push(context[userFrame.line_number - 1].replace(/\t/g, '  ').replace('  ', '>>'));
        }
        const postLine = userFrame.line_number + this.contextSize;
        context.slice(userFrame.line_number, postLine).forEach(function (line) {
            source.push(line.replace(/\t/g, '  '));
        });
        return {
            context: source.join('\n'),
            callsite: [userFrame.file_name, userFrame.line_number].join(':')
        };
    }
    retrieveContext(error) {
        if (error.stack === undefined)
            return null;
        const frameRegex = /(\/[^\\\n]*)/g;
        let tmp;
        let frames = [];
        while ((tmp = frameRegex.exec(error.stack))) {
            frames.push(tmp[1]);
        }
        const stackFrames = frames.map((callsite) => {
            if (callsite[callsite.length - 1] === ')') {
                callsite = callsite.substr(0, callsite.length - 1);
            }
            let location = callsite.split(':');
            return {
                file_name: location[0],
                line_number: parseInt(location[1], 10)
            };
        });
        return this.parse(stackFrames);
    }
}
exports.StackTraceParser = StackTraceParser;
