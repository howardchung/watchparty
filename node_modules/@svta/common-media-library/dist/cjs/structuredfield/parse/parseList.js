"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseList = parseList;
const LIST_js_1 = require("../utils/LIST.js");
const ParsedValue_js_1 = require("./ParsedValue.js");
const parseError_js_1 = require("./parseError.js");
const parseItemOrInnerList_js_1 = require("./parseItemOrInnerList.js");
// 4.2.1.  Parsing a List
//
// Given an ASCII string as input_string, return an array of
// (item_or_inner_list, parameters) tuples. input_string is modified to
// remove the parsed value.
//
// 1.  Let members be an empty array.
//
// 2.  While input_string is not empty:
//
//     1.  Append the result of running Parsing an Item or Inner List
//         (Section 4.2.1.1) with input_string to members.
//
//     2.  Discard any leading OWS characters from input_string.
//
//     3.  If input_string is empty, return members.
//
//     4.  Consume the first character of input_string; if it is not
//         ",", fail parsing.
//
//     5.  Discard any leading OWS characters from input_string.
//
//     6.  If input_string is empty, there is a trailing comma; fail
//         parsing.
//
// 3.  No structured data has been found; return members (which is
//     empty).
function parseList(src, options) {
    const value = [];
    while (src.length > 0) {
        const parsedItemOrInnerList = (0, parseItemOrInnerList_js_1.parseItemOrInnerList)(src, options);
        value.push(parsedItemOrInnerList.value);
        src = parsedItemOrInnerList.src.trim();
        if (src.length === 0) {
            return (0, ParsedValue_js_1.parsedValue)(value, src);
        }
        if (src[0] !== ',') {
            throw (0, parseError_js_1.parseError)(src, LIST_js_1.LIST);
        }
        src = src.substring(1).trim();
        if (src.length === 0 || src[0] === ',') {
            throw (0, parseError_js_1.parseError)(src, LIST_js_1.LIST);
        }
    }
    return (0, ParsedValue_js_1.parsedValue)(value, src);
}
//# sourceMappingURL=parseList.js.map