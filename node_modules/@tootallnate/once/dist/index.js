"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function once(emitter, name, { signal } = {}) {
    return new Promise((resolve, reject) => {
        function cleanup() {
            signal === null || signal === void 0 ? void 0 : signal.removeEventListener('abort', onAbort);
            emitter.removeListener(name, onEvent);
            emitter.removeListener('error', onError);
        }
        function onEvent(...args) {
            cleanup();
            resolve(args);
        }
        function onError(err) {
            cleanup();
            reject(err);
        }
        function onAbort() {
            cleanup();
            const err = new Error('The operation was aborted');
            err.name = 'AbortError';
            reject(err);
        }
        if (signal === null || signal === void 0 ? void 0 : signal.aborted) {
            onAbort();
            return;
        }
        signal === null || signal === void 0 ? void 0 : signal.addEventListener('abort', onAbort);
        emitter.on(name, onEvent);
        emitter.on('error', onError);
    });
}
exports.default = once;
//# sourceMappingURL=index.js.map