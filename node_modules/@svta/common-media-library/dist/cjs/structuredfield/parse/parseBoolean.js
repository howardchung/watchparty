"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBoolean = parseBoolean;
const BOOLEAN_js_1 = require("../utils/BOOLEAN.js");
const ParsedValue_js_1 = require("./ParsedValue.js");
const parseError_js_1 = require("./parseError.js");
// 4.2.8.  Parsing a Boolean
//
// Given an ASCII string as input_string, return a Boolean. input_string
// is modified to remove the parsed value.
//
// 1.  If the first character of input_string is not "?", fail parsing.
//
// 2.  Discard the first character of input_string.
//
// 3.  If the first character of input_string matches "1", discard the
//     first character, and return true.
//
// 4.  If the first character of input_string matches "0", discard the
//     first character, and return false.
//
// 5.  No value has matched; fail parsing.
function parseBoolean(src) {
    let i = 0;
    if (src[i] !== '?') {
        throw (0, parseError_js_1.parseError)(src, BOOLEAN_js_1.BOOLEAN);
    }
    i++;
    if (src[i] === '1') {
        return (0, ParsedValue_js_1.parsedValue)(true, src.substring(++i));
    }
    if (src[i] === '0') {
        return (0, ParsedValue_js_1.parsedValue)(false, src.substring(++i));
    }
    throw (0, parseError_js_1.parseError)(src, BOOLEAN_js_1.BOOLEAN);
}
//# sourceMappingURL=parseBoolean.js.map