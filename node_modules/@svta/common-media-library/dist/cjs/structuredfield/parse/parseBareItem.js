"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBareItem = parseBareItem;
const BARE_ITEM_js_1 = require("../utils/BARE_ITEM.js");
const parseBoolean_js_1 = require("./parseBoolean.js");
const parseByteSequence_js_1 = require("./parseByteSequence.js");
const parseDate_js_1 = require("./parseDate.js");
const parseError_js_1 = require("./parseError.js");
const parseIntegerOrDecimal_js_1 = require("./parseIntegerOrDecimal.js");
const parseString_js_1 = require("./parseString.js");
const parseToken_js_1 = require("./parseToken.js");
// 4.2.3.1.  Parsing a Bare Item
//
// Given an ASCII string as input_string, return a bare Item.
// input_string is modified to remove the parsed value.
//
// 1.  If the first character of input_string is a "-" or a DIGIT,
//     return the result of running Parsing an Integer or Decimal
//     (Section 4.2.4) with input_string.
//
// 2.  If the first character of input_string is a DQUOTE, return the
//     result of running Parsing a String (Section 4.2.5) with
//     input_string.
//
// 3.  If the first character of input_string is ":", return the result
//     of running Parsing a Byte Sequence (Section 4.2.7) with
//     input_string.
//
// 4.  If the first character of input_string is "?", return the result
//     of running Parsing a Boolean (Section 4.2.8) with input_string.
//
// 5.  If the first character of input_string is an ALPHA or "*", return
//     the result of running Parsing a Token (Section 4.2.6) with
//     input_string.
//
// 6.  If the first character of input_string is "@", return the result
//     of running Parsing a Date (Section 4.2.9) with input_string.
//
// 7.  Otherwise, the item type is unrecognized; fail parsing.
function parseBareItem(src, options) {
    const first = src[0];
    if (first === `"`) {
        return (0, parseString_js_1.parseString)(src);
    }
    if (/^[-0-9]/.test(first)) {
        return (0, parseIntegerOrDecimal_js_1.parseIntegerOrDecimal)(src);
    }
    if (first === `?`) {
        return (0, parseBoolean_js_1.parseBoolean)(src);
    }
    if (first === `:`) {
        return (0, parseByteSequence_js_1.parseByteSequence)(src);
    }
    if (/^[a-zA-Z*]/.test(first)) {
        return (0, parseToken_js_1.parseToken)(src, options);
    }
    if (first === `@`) {
        return (0, parseDate_js_1.parseDate)(src);
    }
    throw (0, parseError_js_1.parseError)(src, BARE_ITEM_js_1.BARE_ITEM);
}
//# sourceMappingURL=parseBareItem.js.map