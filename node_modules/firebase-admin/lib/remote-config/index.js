/*! firebase-admin v11.11.1 */
"use strict";
/*!
 * Copyright 2020 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRemoteConfig = exports.RemoteConfig = void 0;
/**
 * Firebase Remote Config.
 *
 * @packageDocumentation
 */
const app_1 = require("../app");
const remote_config_1 = require("./remote-config");
var remote_config_2 = require("./remote-config");
Object.defineProperty(exports, "RemoteConfig", { enumerable: true, get: function () { return remote_config_2.RemoteConfig; } });
/**
 * Gets the {@link RemoteConfig} service for the default app or a given app.
 *
 * `getRemoteConfig()` can be called with no arguments to access the default
 * app's `RemoteConfig` service or as `getRemoteConfig(app)` to access the
 * `RemoteConfig` service associated with a specific app.
 *
 * @example
 * ```javascript
 * // Get the `RemoteConfig` service for the default app
 * const defaultRemoteConfig = getRemoteConfig();
 * ```
 *
 * @example
 * ```javascript
 * // Get the `RemoteConfig` service for a given app
 * const otherRemoteConfig = getRemoteConfig(otherApp);
 * ```
 *
 * @param app - Optional app for which to return the `RemoteConfig` service.
 *   If not provided, the default `RemoteConfig` service is returned.
 *
 * @returns The default `RemoteConfig` service if no
 *   app is provided, or the `RemoteConfig` service associated with the provided
 *   app.
 */
function getRemoteConfig(app) {
    if (typeof app === 'undefined') {
        app = (0, app_1.getApp)();
    }
    const firebaseApp = app;
    return firebaseApp.getOrInitService('remoteConfig', (app) => new remote_config_1.RemoteConfig(app));
}
exports.getRemoteConfig = getRemoteConfig;
