"use strict";
/**
 * Copyright 2021 Google LLC
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasAbortController = exports.isNodeJS = exports.hasTextDecoder = exports.hasTextEncoder = exports.hasWindowFetch = void 0;
/* global window */
const features = {
    windowFetch: typeof window !== 'undefined' &&
        (window === null || window === void 0 ? void 0 : window.fetch) &&
        typeof (window === null || window === void 0 ? void 0 : window.fetch) === 'function',
    // eslint-disable-next-line node/no-unsupported-features/node-builtins
    textEncoder: typeof TextEncoder !== 'undefined',
    // eslint-disable-next-line node/no-unsupported-features/node-builtins
    textDecoder: typeof TextDecoder !== 'undefined',
    nodeJS: typeof process !== 'undefined' && ((_a = process === null || process === void 0 ? void 0 : process.versions) === null || _a === void 0 ? void 0 : _a.node),
    abortController: typeof AbortController !== 'undefined',
};
function hasWindowFetch() {
    return features.windowFetch;
}
exports.hasWindowFetch = hasWindowFetch;
function hasTextEncoder() {
    return features.textEncoder;
}
exports.hasTextEncoder = hasTextEncoder;
function hasTextDecoder() {
    return features.textDecoder;
}
exports.hasTextDecoder = hasTextDecoder;
function isNodeJS() {
    return features.nodeJS;
}
exports.isNodeJS = isNodeJS;
function hasAbortController() {
    return features.abortController;
}
exports.hasAbortController = hasAbortController;
//# sourceMappingURL=featureDetection.js.map