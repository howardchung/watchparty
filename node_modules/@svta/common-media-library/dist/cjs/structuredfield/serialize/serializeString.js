"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeString = serializeString;
const STRING_js_1 = require("../utils/STRING.js");
const STRING_REGEX_js_1 = require("../utils/STRING_REGEX.js");
const serializeError_js_1 = require("./serializeError.js");
// 4.1.6.  Serializing a String
//
// Given a String as input_string, return an ASCII string suitable for
// use in a HTTP field value.
//
// 1.  Convert input_string into a sequence of ASCII characters; if
//     conversion fails, fail serialization.
//
// 2.  If input_string contains characters in the range %x00-1f or %x7f
//     (i.e., not in VCHAR or SP), fail serialization.
//
// 3.  Let output be the string DQUOTE.
//
// 4.  For each character char in input_string:
//
//     1.  If char is "\" or DQUOTE:
//
//         1.  Append "\" to output.
//
//     2.  Append char to output.
//
// 5.  Append DQUOTE to output.
//
// 6.  Return output.
function serializeString(value) {
    if (STRING_REGEX_js_1.STRING_REGEX.test(value)) {
        throw (0, serializeError_js_1.serializeError)(value, STRING_js_1.STRING);
    }
    return `"${value.replace(/\\/g, `\\\\`).replace(/"/g, `\\"`)}"`;
}
//# sourceMappingURL=serializeString.js.map