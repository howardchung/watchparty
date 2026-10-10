"use strict";
// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Storage = exports.IdempotencyStrategy = exports.Notification = exports.Iam = exports.HmacKey = exports.File = exports.Channel = exports.Bucket = void 0;
var bucket_1 = require("./bucket");
Object.defineProperty(exports, "Bucket", { enumerable: true, get: function () { return bucket_1.Bucket; } });
__exportStar(require("./crc32c"), exports);
var channel_1 = require("./channel");
Object.defineProperty(exports, "Channel", { enumerable: true, get: function () { return channel_1.Channel; } });
var file_1 = require("./file");
Object.defineProperty(exports, "File", { enumerable: true, get: function () { return file_1.File; } });
__exportStar(require("./hash-stream-validator"), exports);
var hmacKey_1 = require("./hmacKey");
Object.defineProperty(exports, "HmacKey", { enumerable: true, get: function () { return hmacKey_1.HmacKey; } });
var iam_1 = require("./iam");
Object.defineProperty(exports, "Iam", { enumerable: true, get: function () { return iam_1.Iam; } });
var notification_1 = require("./notification");
Object.defineProperty(exports, "Notification", { enumerable: true, get: function () { return notification_1.Notification; } });
var storage_1 = require("./storage");
Object.defineProperty(exports, "IdempotencyStrategy", { enumerable: true, get: function () { return storage_1.IdempotencyStrategy; } });
Object.defineProperty(exports, "Storage", { enumerable: true, get: function () { return storage_1.Storage; } });
__exportStar(require("./transfer-manager"), exports);
//# sourceMappingURL=index.js.map