"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeInnerList = serializeInnerList;
const serializeItem_js_1 = require("./serializeItem.js");
const serializeParams_js_1 = require("./serializeParams.js");
// 4.1.1.1.  Serializing an Inner List
//
// Given an array of (member_value, parameters) tuples as inner_list,
// and parameters as list_parameters, return an ASCII string suitable
// for use in a HTTP field value.
//
// 1.  Let output be the string "(".
//
// 2.  For each (member_value, parameters) of inner_list:
//
//     1.  Append the result of running Serializing an Item
//         (Section 4.1.3) with (member_value, parameters) to output.
//
//     2.  If more values remain in inner_list, append a single SP to
//         output.
//
// 3.  Append ")" to output.
//
// 4.  Append the result of running Serializing Parameters
//     (Section 4.1.1.2) with list_parameters to output.
//
// 5.  Return output.
function serializeInnerList(value) {
    return `(${value.value.map(serializeItem_js_1.serializeItem).join(' ')})${(0, serializeParams_js_1.serializeParams)(value.params)}`;
}
//# sourceMappingURL=serializeInnerList.js.map