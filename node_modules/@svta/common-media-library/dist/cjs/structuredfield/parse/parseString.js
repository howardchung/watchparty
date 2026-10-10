"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseString = parseString;
const STRING_js_1 = require("../utils/STRING.js");
const STRING_REGEX_js_1 = require("../utils/STRING_REGEX.js");
const ParsedValue_js_1 = require("./ParsedValue.js");
const parseError_js_1 = require("./parseError.js");
// 4.2.5.  Parsing a String
//
// Given an ASCII string as input_string, return an unquoted String.
// input_string is modified to remove the parsed value.
//
// 1.  Let output_string be an empty string.
//
// 2.  If the first character of input_string is not DQUOTE, fail
//     parsing.
//
// 3.  Discard the first character of input_string.
//
// 4.  While input_string is not empty:
//
//     1.  Let char be the result of consuming the first character of
//         input_string.
//
//     2.  If char is a backslash ("\"):
//
//         1.  If input_string is now empty, fail parsing.
//
//         2.  Let next_char be the result of consuming the first
//             character of input_string.
//
//         3.  If next_char is not DQUOTE or "\", fail parsing.
//
//         4.  Append next_char to output_string.
//
//     3.  Else, if char is DQUOTE, return output_string.
//
//     4.  Else, if char is in the range %x00-1f or %x7f (i.e., is not
//         in VCHAR or SP), fail parsing.
//
//     5.  Else, append char to output_string.
//
// 5.  Reached the end of input_string without finding a closing DQUOTE;
//     fail parsing.
function parseString(src) {
    let output = '';
    let i = 0;
    if (src[i] !== `"`) {
        throw (0, parseError_js_1.parseError)(src, STRING_js_1.STRING);
    }
    i++;
    while (src.length > i) {
        if (src[i] === `\\`) {
            if (src.length <= i + 1) {
                throw (0, parseError_js_1.parseError)(src, STRING_js_1.STRING);
            }
            i++;
            if (src[i] !== `"` && src[i] !== `\\`) {
                throw (0, parseError_js_1.parseError)(src, STRING_js_1.STRING);
            }
            output += src[i];
        }
        else if (src[i] === `"`) {
            return (0, ParsedValue_js_1.parsedValue)(output, src.substring(++i));
        }
        else if (STRING_REGEX_js_1.STRING_REGEX.test(src[i])) {
            throw (0, parseError_js_1.parseError)(src, STRING_js_1.STRING);
        }
        else {
            output += src[i];
        }
        i++;
    }
    throw (0, parseError_js_1.parseError)(src, STRING_js_1.STRING);
}
//# sourceMappingURL=parseString.js.map