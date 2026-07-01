"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeToken = serializeToken;
const symbolToStr_js_1 = require("../../cta/utils/symbolToStr.js");
const TOKEN_js_1 = require("../utils/TOKEN.js");
const serializeError_js_1 = require("./serializeError.js");
function serializeToken(token) {
    const value = (0, symbolToStr_js_1.symbolToStr)(token);
    if (/^([a-zA-Z*])([!#$%&'*+\-.^_`|~\w:/]*)$/.test(value) === false) {
        throw (0, serializeError_js_1.serializeError)(value, TOKEN_js_1.TOKEN);
    }
    return value;
}
//# sourceMappingURL=serializeToken.js.map