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
const CLS = require("continuation-local-storage");
const semver = require("semver");
const useAsyncHooks = semver.satisfies(process.version, '>=8'); //&&
// !!process.env.GCLOUD_TRACE_NEW_CONTEXT;
const cls = useAsyncHooks ? require('./cls-ah') : CLS;
const TRACE_NAMESPACE = 'opencensus.io';
/**
 * Stack traces are captured when a root span is started. Because the stack
 * trace height varies on the context propagation mechanism, to keep published
 * stack traces uniform we need to remove the top-most frames when using the
 * c-l-s module. Keep track of this number here.
 */
exports.ROOT_SPAN_STACK_OFFSET = useAsyncHooks ? 0 : 2;
function createNamespace() {
    return cls.createNamespace(TRACE_NAMESPACE);
}
exports.createNamespace = createNamespace;
function destroyNamespace() {
    cls.destroyNamespace(TRACE_NAMESPACE);
}
exports.destroyNamespace = destroyNamespace;
function getNamespace() {
    return cls.getNamespace(TRACE_NAMESPACE);
}
exports.getNamespace = getNamespace;
//# sourceMappingURL=cls.js.map