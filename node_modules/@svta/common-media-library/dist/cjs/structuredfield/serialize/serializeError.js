"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeError = serializeError;
const throwError_js_1 = require("../utils/throwError.js");
function serializeError(src, type, cause) {
    return (0, throwError_js_1.throwError)('serialize', src, type, cause);
}
//# sourceMappingURL=serializeError.js.map