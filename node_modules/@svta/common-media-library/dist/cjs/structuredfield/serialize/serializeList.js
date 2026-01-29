"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeList = serializeList;
const SfItem_js_1 = require("../SfItem.js");
const LIST_js_1 = require("../utils/LIST.js");
const serializeError_js_1 = require("./serializeError.js");
const serializeInnerList_js_1 = require("./serializeInnerList.js");
const serializeItem_js_1 = require("./serializeItem.js");
// 4.1.1.  Serializing a List
//
// Given an array of (member_value, parameters) tuples as input_list,
// return an ASCII string suitable for use in a HTTP field value.
//
// 1.  Let output be an empty string.
//
// 2.  For each (member_value, parameters) of input_list:
//
//     1.  If member_value is an array, append the result of running
//         Serializing an Inner List (Section 4.1.1.1) with
//         (member_value, parameters) to output.
//
//     2.  Otherwise, append the result of running Serializing an Item
//         (Section 4.1.3) with (member_value, parameters) to output.
//
//     3.  If more member_values remain in input_list:
//
//         1.  Append "," to output.
//
//         2.  Append a single SP to output.
//
// 3.  Return output.
function serializeList(list, options = { whitespace: true }) {
    if (Array.isArray(list) === false) {
        throw (0, serializeError_js_1.serializeError)(list, LIST_js_1.LIST);
    }
    const optionalWhiteSpace = (options === null || options === void 0 ? void 0 : options.whitespace) ? ' ' : '';
    return list
        .map(item => {
        if (item instanceof SfItem_js_1.SfItem === false) {
            item = new SfItem_js_1.SfItem(item);
        }
        // TODO: Fix this type assertion
        const i = item;
        if (Array.isArray(i.value)) {
            return (0, serializeInnerList_js_1.serializeInnerList)(i);
        }
        return (0, serializeItem_js_1.serializeItem)(i);
    })
        .join(`,${optionalWhiteSpace}`);
}
//# sourceMappingURL=serializeList.js.map