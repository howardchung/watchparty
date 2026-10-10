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
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeResponse = exports.encodeRequest = void 0;
// proto-over-HTTP request encoding and decoding
const fallback_1 = require("./fallback");
const googleError_1 = require("./googleError");
function encodeRequest(rpc, protocol, servicePath, servicePort, request) {
    const protoNamespaces = [];
    let currNamespace = rpc.parent;
    while (currNamespace.name !== '') {
        protoNamespaces.unshift(currNamespace.name);
        currNamespace = currNamespace.parent;
    }
    const protoServiceName = protoNamespaces.join('.');
    const rpcName = rpc.name;
    const headers = {
        'Content-Type': 'application/x-protobuf',
    };
    const method = 'POST';
    const requestMessage = rpc.resolvedRequestType.fromObject(request);
    const body = rpc.resolvedRequestType.encode(requestMessage).finish();
    const url = `${protocol}://${servicePath}:${servicePort}/$rpc/${protoServiceName}/${rpcName}`;
    return {
        method,
        url,
        headers,
        body,
    };
}
exports.encodeRequest = encodeRequest;
function decodeResponse(rpc, ok, response) {
    if (!ok) {
        const statusDecoder = new googleError_1.GoogleErrorDecoder();
        const error = statusDecoder.decodeErrorFromBuffer(response);
        throw error;
    }
    const buffer = response instanceof ArrayBuffer ? new Uint8Array(response) : response;
    const message = rpc.resolvedResponseType.decode(buffer);
    return rpc.resolvedResponseType.toObject(message, fallback_1.defaultToObjectOptions);
}
exports.decodeResponse = decodeResponse;
//# sourceMappingURL=fallbackProto.js.map