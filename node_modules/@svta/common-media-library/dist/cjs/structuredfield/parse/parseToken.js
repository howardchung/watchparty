"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseToken = parseToken;
const SfToken_js_1 = require("../SfToken.js");
const TOKEN_js_1 = require("../utils/TOKEN.js");
const ParsedValue_js_1 = require("./ParsedValue.js");
const parseError_js_1 = require("./parseError.js");
// 4.2.6.  Parsing a Token
//
// Given an ASCII string as input_string, return a Token. input_string
// is modified to remove the parsed value.
//
// 1.  If the first character of input_string is not ALPHA or "*", fail
//     parsing.
//
// 2.  Let output_string be an empty string.
//
// 3.  While input_string is not empty:
//
//     1.  If the first character of input_string is not in tchar, ":"
//         or "/", return output_string.
//
//     2.  Let char be the result of consuming the first character of
//         input_string.
//
//     3.  Append char to output_string.
//
// 4.  Return output_string.
function parseToken(src, options) {
    if (/^[a-zA-Z*]$/.test(src[0]) === false) {
        throw (0, parseError_js_1.parseError)(src, TOKEN_js_1.TOKEN);
    }
    const re = /^([!#$%&'*+\-.^_`|~\w:/]+)/g;
    const value = re.exec(src)[1];
    src = src.substring(re.lastIndex);
    return (0, ParsedValue_js_1.parsedValue)((options === null || options === void 0 ? void 0 : options.useSymbol) === false ? new SfToken_js_1.SfToken(value) : Symbol.for(value), src);
}
//# sourceMappingURL=parseToken.js.map