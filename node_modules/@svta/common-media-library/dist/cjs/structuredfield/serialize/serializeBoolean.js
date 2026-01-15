"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeBoolean = serializeBoolean;
const BOOLEAN_js_1 = require("../utils/BOOLEAN.js");
const serializeError_js_1 = require("./serializeError.js");
// 4.1.9.  Serializing a Boolean
//
// Given a Boolean as input_boolean, return an ASCII string suitable for
// use in a HTTP field value.
//
// 1.  If input_boolean is not a boolean, fail serialization.
//
// 2.  Let output be an empty string.
//
// 3.  Append "?" to output.
//
// 4.  If input_boolean is true, append "1" to output.
//
// 5.  If input_boolean is false, append "0" to output.
//
// 6.  Return output.
function serializeBoolean(value) {
    if (typeof value !== 'boolean') {
        throw (0, serializeError_js_1.serializeError)(value, BOOLEAN_js_1.BOOLEAN);
    }
    return value ? '?1' : '?0';
}
//# sourceMappingURL=serializeBoolean.js.map