"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseInnerList = parseInnerList;
const SfItem_js_1 = require("../SfItem.js");
const INNER_js_1 = require("../utils/INNER.js");
const ParsedValue_js_1 = require("./ParsedValue.js");
const parseError_js_1 = require("./parseError.js");
const parseItem_js_1 = require("./parseItem.js");
const parseParameters_js_1 = require("./parseParameters.js");
// 4.2.1.2.  Parsing an Inner List
//
// Given an ASCII string as input_string, return the tuple (inner_list,
// parameters), where inner_list is an array of (bare_item, parameters)
// tuples. input_string is modified to remove the parsed value.
//
// 1.  Consume the first character of input_string; if it is not "(",
//     fail parsing.
//
// 2.  Let inner_list be an empty array.
//
// 3.  While input_string is not empty:
//
//     1.  Discard any leading SP characters from input_string.
//
//     2.  If the first character of input_string is ")":
//
//         1.  Consume the first character of input_string.
//
//         2.  Let parameters be the result of running Parsing
//             Parameters (Section 4.2.3.2) with input_string.
//
//         3.  Return the tuple (inner_list, parameters).
//
//     3.  Let item be the result of running Parsing an Item
//         (Section 4.2.3) with input_string.
//
//     4.  Append item to inner_list.
//
//     5.  If the first character of input_string is not SP or ")", fail
//         parsing.
//
// 4.  The end of the inner list was not found; fail parsing.
function parseInnerList(src, options) {
    if (src[0] !== '(') {
        throw (0, parseError_js_1.parseError)(src, INNER_js_1.INNER);
    }
    src = src.substring(1);
    const innerList = [];
    while (src.length > 0) {
        src = src.trim();
        if (src[0] === ')') {
            src = src.substring(1);
            const parsedParameters = (0, parseParameters_js_1.parseParameters)(src, options);
            return (0, ParsedValue_js_1.parsedValue)(new SfItem_js_1.SfItem(innerList, parsedParameters.value), parsedParameters.src);
        }
        const parsedItem = (0, parseItem_js_1.parseItem)(src, options);
        innerList.push(parsedItem.value);
        src = parsedItem.src;
        if (src[0] !== ' ' && src[0] !== ')') {
            throw (0, parseError_js_1.parseError)(src, INNER_js_1.INNER);
        }
    }
    throw (0, parseError_js_1.parseError)(src, INNER_js_1.INNER);
}
//# sourceMappingURL=parseInnerList.js.map