/*! firebase-admin v11.11.1 */
"use strict";
/*!
 * @license
 * Copyright 2017 Google Inc.
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
exports.FirebaseMessagingRequestHandler = void 0;
const api_request_1 = require("../utils/api-request");
const messaging_errors_internal_1 = require("./messaging-errors-internal");
const batch_request_internal_1 = require("./batch-request-internal");
const index_1 = require("../utils/index");
// FCM backend constants
const FIREBASE_MESSAGING_TIMEOUT = 15000;
const FIREBASE_MESSAGING_BATCH_URL = 'https://fcm.googleapis.com/batch';
const FIREBASE_MESSAGING_HTTP_METHOD = 'POST';
const FIREBASE_MESSAGING_HEADERS = {
    'X-Firebase-Client': `fire-admin-node/${(0, index_1.getSdkVersion)()}`,
};
const LEGACY_FIREBASE_MESSAGING_HEADERS = {
    'X-Firebase-Client': `fire-admin-node/${(0, index_1.getSdkVersion)()}`,
    'access_token_auth': 'true',
};
/**
 * Class that provides a mechanism to send requests to the Firebase Cloud Messaging backend.
 */
class FirebaseMessagingRequestHandler {
    /**
     * @param app - The app used to fetch access tokens to sign API requests.
     * @constructor
     */
    constructor(app) {
        this.httpClient = new api_request_1.AuthorizedHttpClient(app);
        this.batchClient = new batch_request_internal_1.BatchRequestClient(this.httpClient, FIREBASE_MESSAGING_BATCH_URL, FIREBASE_MESSAGING_HEADERS);
    }
    /**
     * Invokes the request handler with the provided request data.
     *
     * @param host - The host to which to send the request.
     * @param path - The path to which to send the request.
     * @param requestData - The request data.
     * @returns A promise that resolves with the response.
     */
    invokeRequestHandler(host, path, requestData) {
        const request = {
            method: FIREBASE_MESSAGING_HTTP_METHOD,
            url: `https://${host}${path}`,
            data: requestData,
            headers: LEGACY_FIREBASE_MESSAGING_HEADERS,
            timeout: FIREBASE_MESSAGING_TIMEOUT,
        };
        return this.httpClient.send(request).then((response) => {
            // Send non-JSON responses to the catch() below where they will be treated as errors.
            if (!response.isJson()) {
                throw new api_request_1.HttpError(response);
            }
            // Check for backend errors in the response.
            const errorCode = (0, messaging_errors_internal_1.getErrorCode)(response.data);
            if (errorCode) {
                throw new api_request_1.HttpError(response);
            }
            // Return entire response.
            return response.data;
        })
            .catch((err) => {
            if (err instanceof api_request_1.HttpError) {
                throw (0, messaging_errors_internal_1.createFirebaseError)(err);
            }
            // Re-throw the error if it already has the proper format.
            throw err;
        });
    }
    /**
     * Invokes the request handler with the provided request data.
     *
     * @param host - The host to which to send the request.
     * @param path - The path to which to send the request.
     * @param requestData - The request data.
     * @returns A promise that resolves with the {@link SendResponse}.
     */
    invokeRequestHandlerForSendResponse(host, path, requestData) {
        const request = {
            method: FIREBASE_MESSAGING_HTTP_METHOD,
            url: `https://${host}${path}`,
            data: requestData,
            headers: LEGACY_FIREBASE_MESSAGING_HEADERS,
            timeout: FIREBASE_MESSAGING_TIMEOUT,
        };
        return this.httpClient.send(request).then((response) => {
            return this.buildSendResponse(response);
        })
            .catch((err) => {
            if (err instanceof api_request_1.HttpError) {
                return this.buildSendResponseFromError(err);
            }
            // Re-throw the error if it already has the proper format.
            throw err;
        });
    }
    /**
     * Sends the given array of sub requests as a single batch to FCM, and parses the result into
     * a BatchResponse object.
     *
     * @param requests - An array of sub requests to send.
     * @returns A promise that resolves when the send operation is complete.
     */
    sendBatchRequest(requests) {
        return this.batchClient.send(requests)
            .then((responses) => {
            return responses.map((part) => {
                return this.buildSendResponse(part);
            });
        }).then((responses) => {
            const successCount = responses.filter((resp) => resp.success).length;
            return {
                responses,
                successCount,
                failureCount: responses.length - successCount,
            };
        }).catch((err) => {
            if (err instanceof api_request_1.HttpError) {
                throw (0, messaging_errors_internal_1.createFirebaseError)(err);
            }
            // Re-throw the error if it already has the proper format.
            throw err;
        });
    }
    buildSendResponse(response) {
        const result = {
            success: response.status === 200,
        };
        if (result.success) {
            result.messageId = response.data.name;
        }
        else {
            result.error = (0, messaging_errors_internal_1.createFirebaseError)(new api_request_1.HttpError(response));
        }
        return result;
    }
    buildSendResponseFromError(err) {
        return {
            success: false,
            error: (0, messaging_errors_internal_1.createFirebaseError)(err)
        };
    }
}
exports.FirebaseMessagingRequestHandler = FirebaseMessagingRequestHandler;
