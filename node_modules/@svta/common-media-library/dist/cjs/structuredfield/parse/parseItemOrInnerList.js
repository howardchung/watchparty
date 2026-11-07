"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseItemOrInnerList = parseItemOrInnerList;
const parseInnerList_js_1 = require("./parseInnerList.js");
const parseItem_js_1 = require("./parseItem.js");
// 4.2.1.1.  Parsing an Item or Inner List
//
// Given an ASCII string as input_string, return the tuple
// (item_or_inner_list, parameters), where item_or_inner_list can be
// either a single bare item, or an array of (bare_item, parameters)
// tuples. input_string is modified to remove the parsed value.
//
// 1.  If the first character of input_string is "(", return the result
//     of running Parsing an Inner List (Section 4.2.1.2) with
//     input_string.
//
// 2.  Return the result of running Parsing an Item (Section 4.2.3) with
//     input_string.
function parseItemOrInnerList(src, options) {
    if (src[0] === '(') {
        return (0, parseInnerList_js_1.parseInnerList)(src, options);
    }
    return (0, parseItem_js_1.parseItem)(src, options);
}
//# sourceMappingURL=parseItemOrInnerList.js.map