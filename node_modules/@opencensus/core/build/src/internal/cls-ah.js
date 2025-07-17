"use strict";
/**
 * Copyright 2018 Google LLC
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
Object.defineProperty(exports, "__esModule", { value: true });
// Original file from Stackdriver Trace Agent for Node.js
// https://github.com/GoogleCloudPlatform/cloud-trace-nodejs
const asyncHook = require("async_hooks");
const shimmer = require("shimmer");
const wrappedSymbol = Symbol('context_wrapped');
let contexts = {};
let current = {};
asyncHook.createHook({ init, before, destroy }).enable();
const EVENT_EMITTER_METHODS = ['addListener', 'on', 'once', 'prependListener', 'prependOnceListener'];
class AsyncHooksNamespace {
    get name() {
        throw new Error('Not implemented');
    }
    get active() {
        return current;
    }
    createContext() {
        throw new Error('Not implemented');
    }
    get(k) {
        return current[k];
    }
    set(k, v) {
        current[k] = v;
        return v;
    }
    run(fn) {
        this.runAndReturn(fn);
        return current;
    }
    runAndReturn(fn) {
        const oldContext = current;
        current = {};
        const res = fn();
        current = oldContext;
        return res;
    }
    bind(cb) {
        // TODO(kjin): Monitor https://github.com/Microsoft/TypeScript/pull/15473.
        // When it's landed and released, we can remove these `any` casts.
        // tslint:disable-next-line:no-any
        if (cb[wrappedSymbol] || !current) {
            return cb;
        }
        const boundContext = current;
        const contextWrapper = function () {
            const oldContext = current;
            current = boundContext;
            const res = cb.apply(this, arguments);
            current = oldContext;
            return res;
        };
        // tslint:disable-next-line:no-any
        contextWrapper[wrappedSymbol] = true;
        Object.defineProperty(contextWrapper, 'length', {
            enumerable: false,
            configurable: true,
            writable: false,
            value: cb.length
        });
        return contextWrapper;
    }
    // This function is not technically needed and all tests currently pass
    // without it (after removing call sites). While it is not a complete
    // solution, restoring correct context before running every request/response
    // event handler reduces the number of situations in which userspace queuing
    // will cause us to lose context.
    bindEmitter(ee) {
        const ns = this;
        EVENT_EMITTER_METHODS.forEach((method) => {
            if (ee[method]) {
                shimmer.wrap(ee, method, (oldMethod) => {
                    return function (event, cb) {
                        return oldMethod.call(this, event, ns.bind(cb));
                    };
                });
            }
        });
    }
}
const namespace = new AsyncHooksNamespace();
// AsyncWrap Hooks
function init(uid, provider, parentUid, parentHandle) {
    contexts[uid] = current;
}
function before(uid) {
    if (contexts[uid]) {
        current = contexts[uid];
    }
}
function destroy(uid) {
    delete contexts[uid];
}
function createNamespace() {
    return namespace;
}
exports.createNamespace = createNamespace;
function destroyNamespace() {
    current = {};
    contexts = {};
}
exports.destroyNamespace = destroyNamespace;
function getNamespace() {
    return namespace;
}
exports.getNamespace = getNamespace;
function reset() {
    throw new Error('Not implemented');
}
exports.reset = reset;
//# sourceMappingURL=cls-ah.js.map