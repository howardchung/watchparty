"use strict";
/*!
 * Copyright 2018 Google Inc. All Rights Reserved.
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
exports.tryGetPreferRestEnvironmentVariable = exports.wrapError = exports.silencePromise = exports.getRetryParams = exports.getRetryCodes = exports.isPermanentRpcError = exports.isFunction = exports.isEmpty = exports.isPlainObject = exports.isObject = exports.requestTag = exports.autoId = exports.Deferred = void 0;
const crypto_1 = require("crypto");
const gapicConfig = require("./v1/firestore_client_config.json");
/**
 * A Promise implementation that supports deferred resolution.
 * @private
 * @internal
 */
class Deferred {
    constructor() {
        this.resolve = () => { };
        this.reject = () => { };
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}
exports.Deferred = Deferred;
/**
 * Generate a unique client-side identifier.
 *
 * Used for the creation of new documents.
 *
 * @private
 * @internal
 * @returns {string} A unique 20-character wide identifier.
 */
function autoId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let autoId = '';
    while (autoId.length < 20) {
        const bytes = (0, crypto_1.randomBytes)(40);
        bytes.forEach(b => {
            // Length of `chars` is 62. We only take bytes between 0 and 62*4-1
            // (both inclusive). The value is then evenly mapped to indices of `char`
            // via a modulo operation.
            const maxValue = 62 * 4 - 1;
            if (autoId.length < 20 && b <= maxValue) {
                autoId += chars.charAt(b % 62);
            }
        });
    }
    return autoId;
}
exports.autoId = autoId;
/**
 * Generate a short and semi-random client-side identifier.
 *
 * Used for the creation of request tags.
 *
 * @private
 * @internal
 * @returns {string} A random 5-character wide identifier.
 */
function requestTag() {
    return autoId().substr(0, 5);
}
exports.requestTag = requestTag;
/**
 * Determines whether `value` is a JavaScript object.
 *
 * @private
 * @internal
 */
function isObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
}
exports.isObject = isObject;
/**
 * Verifies that 'obj' is a plain JavaScript object that can be encoded as a
 * 'Map' in Firestore.
 *
 * @private
 * @internal
 * @param input The argument to verify.
 * @returns 'true' if the input can be a treated as a plain object.
 */
function isPlainObject(input) {
    return (isObject(input) &&
        (Object.getPrototypeOf(input) === Object.prototype ||
            Object.getPrototypeOf(input) === null ||
            input.constructor.name === 'Object'));
}
exports.isPlainObject = isPlainObject;
/**
 * Returns whether `value` has no custom properties.
 *
 * @private
 * @internal
 */
function isEmpty(value) {
    return Object.keys(value).length === 0;
}
exports.isEmpty = isEmpty;
/**
 * Determines whether `value` is a JavaScript function.
 *
 * @private
 * @internal
 */
function isFunction(value) {
    return typeof value === 'function';
}
exports.isFunction = isFunction;
/**
 * Determines whether the provided error is considered permanent for the given
 * RPC.
 *
 * @private
 * @internal
 */
function isPermanentRpcError(err, methodName) {
    if (err.code !== undefined) {
        const retryCodes = getRetryCodes(methodName);
        return retryCodes.indexOf(err.code) === -1;
    }
    else {
        return false;
    }
}
exports.isPermanentRpcError = isPermanentRpcError;
let serviceConfig;
/** Lazy-loads the service config when first accessed. */
function getServiceConfig(methodName) {
    if (!serviceConfig) {
        serviceConfig = require('google-gax/build/src/fallback').constructSettings('google.firestore.v1.Firestore', gapicConfig, {}, require('google-gax/build/src/status').Status);
    }
    return serviceConfig[methodName];
}
/**
 * Returns the list of retryable error codes specified in the service
 * configuration.
 * @private
 * @internal
 */
function getRetryCodes(methodName) {
    var _a, _b, _c;
    return (_c = (_b = (_a = getServiceConfig(methodName)) === null || _a === void 0 ? void 0 : _a.retry) === null || _b === void 0 ? void 0 : _b.retryCodes) !== null && _c !== void 0 ? _c : [];
}
exports.getRetryCodes = getRetryCodes;
/**
 * Returns the backoff setting from the service configuration.
 * @private
 * @internal
 */
function getRetryParams(methodName) {
    var _a, _b, _c;
    return ((_c = (_b = (_a = getServiceConfig(methodName)) === null || _a === void 0 ? void 0 : _a.retry) === null || _b === void 0 ? void 0 : _b.backoffSettings) !== null && _c !== void 0 ? _c : require('google-gax/build/src/fallback').createDefaultBackoffSettings());
}
exports.getRetryParams = getRetryParams;
/**
 * Returns a promise with a void return type. The returned promise swallows all
 * errors and never throws.
 *
 * This is primarily used to wait for a promise to complete when the result of
 * the promise will be discarded.
 *
 * @private
 * @internal
 */
function silencePromise(promise) {
    return promise.then(() => { }, () => { });
}
exports.silencePromise = silencePromise;
/**
 * Wraps the provided error in a new error that includes the provided stack.
 *
 * Used to preserve stack traces across async calls.
 * @private
 * @internal
 */
function wrapError(err, stack) {
    err.stack += '\nCaused by: ' + stack;
    return err;
}
exports.wrapError = wrapError;
/**
 * Parses the value of the environment variable FIRESTORE_PREFER_REST, and
 * returns a value indicating if the environment variable enables or disables
 * preferRest.
 *
 * This function will warn to the console if the environment variable is set
 * to an unsupported value.
 *
 * @return `true` if the environment variable enables `preferRest`,
 * `false` if the environment variable disables `preferRest`, or `undefined`
 * if the environment variable is not set or is set to an unsupported value.
 */
function tryGetPreferRestEnvironmentVariable() {
    var _a;
    const rawValue = (_a = process.env.FIRESTORE_PREFER_REST) === null || _a === void 0 ? void 0 : _a.trim().toLowerCase();
    if (rawValue === undefined) {
        return undefined;
    }
    else if (rawValue === '1' || rawValue === 'true') {
        return true;
    }
    else if (rawValue === '0' || rawValue === 'false') {
        return false;
    }
    else {
        // eslint-disable-next-line no-console
        console.warn(`An unsupported value was specified for the environment variable FIRESTORE_PREFER_REST. Value ${rawValue} is unsupported.`);
        return undefined;
    }
}
exports.tryGetPreferRestEnvironmentVariable = tryGetPreferRestEnvironmentVariable;
//# sourceMappingURL=util.js.map