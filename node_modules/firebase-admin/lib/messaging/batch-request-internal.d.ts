/*! firebase-admin v11.11.1 */
/*!
 * Copyright 2019 Google Inc.
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
import { HttpClient, HttpResponse } from '../utils/api-request';
/**
 * Represents a request that can be sent as part of an HTTP batch request.
 */
export interface SubRequest {
    url: string;
    body: object;
    headers?: {
        [key: string]: any;
    };
}
/**
 * An HTTP client that can be used to make batch requests. This client is not tied to any service
 * (FCM or otherwise). Therefore it can be used to make batch requests to any service that allows
 * it. If this requirement ever arises we can move this implementation to the utils module
 * where it can be easily shared among other modules.
 */
export declare class BatchRequestClient {
    private readonly httpClient;
    private readonly batchUrl;
    private readonly commonHeaders?;
    /**
     * @param {HttpClient} httpClient The client that will be used to make HTTP calls.
     * @param {string} batchUrl The URL that accepts batch requests.
     * @param {object=} commonHeaders Optional headers that will be included in all requests.
     *
     * @constructor
     */
    constructor(httpClient: HttpClient, batchUrl: string, commonHeaders?: object | undefined);
    /**
     * Sends the given array of sub requests as a single batch, and parses the results into an array
     * of HttpResponse objects.
     *
     * @param requests - An array of sub requests to send.
     * @returns A promise that resolves when the send operation is complete.
     */
    send(requests: SubRequest[]): Promise<HttpResponse[]>;
    private getMultipartPayload;
}
