"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseError = parseError;
const throwError_js_1 = require("../utils/throwError.js");
function parseError(src, type, cause) {
    return (0, throwError_js_1.throwError)('parse', src, type, cause);
}
//# sourceMappingURL=parseError.js.map