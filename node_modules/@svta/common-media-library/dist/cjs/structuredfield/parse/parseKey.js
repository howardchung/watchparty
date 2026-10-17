"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseKey = parseKey;
const KEY_js_1 = require("../utils/KEY.js");
const ParsedValue_js_1 = require("./ParsedValue.js");
const parseError_js_1 = require("./parseError.js");
// 4.2.3.3.  Parsing a Key
//
// Given an ASCII string as input_string, return a key. input_string is
// modified to remove the parsed value.
//
// 1.  If the first character of input_string is not lcalpha or "*",
//     fail parsing.
//
// 2.  Let output_string be an empty string.
//
// 3.  While input_string is not empty:
//
//     1.  If the first character of input_string is not one of lcalpha,
//         DIGIT, "_", "-", ".", or "*", return output_string.
//
//     2.  Let char be the result of consuming the first character of
//         input_string.
//
//     3.  Append char to output_string.
//
// 4.  Return output_string.
function parseKey(src) {
    let i = 0;
    if (/^[a-z*]$/.test(src[i]) === false) {
        throw (0, parseError_js_1.parseError)(src, KEY_js_1.KEY);
    }
    let value = '';
    while (src.length > i) {
        if (/^[a-z0-9_\-.*]$/.test(src[i]) === false) {
            return (0, ParsedValue_js_1.parsedValue)(value, src.substring(i));
        }
        value += src[i];
        i++;
    }
    return (0, ParsedValue_js_1.parsedValue)(value, src.substring(i));
}
//# sourceMappingURL=parseKey.js.map