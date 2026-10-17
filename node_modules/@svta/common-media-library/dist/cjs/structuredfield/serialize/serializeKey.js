"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeKey = serializeKey;
const KEY_js_1 = require("../utils/KEY.js");
const serializeError_js_1 = require("./serializeError.js");
// 4.1.1.3.  Serializing a Key
//
// Given a key as input_key, return an ASCII string suitable for use in
// a HTTP field value.
//
// 1.  Convert input_key into a sequence of ASCII characters; if
//     conversion fails, fail serialization.
//
// 2.  If input_key contains characters not in lcalpha, DIGIT, "_", "-",
//     ".", or "*" fail serialization.
//
// 3.  If the first character of input_key is not lcalpha or "*", fail
//     serialization.
//
// 4.  Let output be an empty string.
//
// 5.  Append input_key to output.
//
// 6.  Return output.
function serializeKey(value) {
    if (/^[a-z*][a-z0-9\-_.*]*$/.test(value) === false) {
        throw (0, serializeError_js_1.serializeError)(value, KEY_js_1.KEY);
    }
    return value;
}
//# sourceMappingURL=serializeKey.js.map