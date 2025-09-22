"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeDict = serializeDict;
const SfItem_js_1 = require("../SfItem.js");
const DICT_js_1 = require("../utils/DICT.js");
const serializeError_js_1 = require("./serializeError.js");
const serializeInnerList_js_1 = require("./serializeInnerList.js");
const serializeItem_js_1 = require("./serializeItem.js");
const serializeKey_js_1 = require("./serializeKey.js");
const serializeParams_js_1 = require("./serializeParams.js");
// 4.1.2.  Serializing a Dictionary
//
// Given an ordered Dictionary as input_dictionary (each member having a
// member_name and a tuple value of (member_value, parameters)), return
// an ASCII string suitable for use in a HTTP field value.
//
// 1.  Let output be an empty string.
//
// 2.  For each member_name with a value of (member_value, parameters)
//     in input_dictionary:
//
//     1.  Append the result of running Serializing a Key
//         (Section 4.1.1.3) with member's member_name to output.
//
//     2.  If member_value is Boolean true:
//
//         1.  Append the result of running Serializing Parameters
//             (Section 4.1.1.2) with parameters to output.
//
//     3.  Otherwise:
//
//         1.  Append "=" to output.
//
//         2.  If member_value is an array, append the result of running
//             Serializing an Inner List (Section 4.1.1.1) with
//             (member_value, parameters) to output.
//
//         3.  Otherwise, append the result of running Serializing an
//             Item (Section 4.1.3) with (member_value, parameters) to
//             output.
//
//     4.  If more members remain in input_dictionary:
//
//         1.  Append "," to output.
//
//         2.  Append a single SP to output.
//
// 3.  Return output.
function serializeDict(dict, options = { whitespace: true }) {
    if (typeof dict !== 'object') {
        throw (0, serializeError_js_1.serializeError)(dict, DICT_js_1.DICT);
    }
    const entries = dict instanceof Map ? dict.entries() : Object.entries(dict);
    const optionalWhiteSpace = (options === null || options === void 0 ? void 0 : options.whitespace) ? ' ' : '';
    return Array.from(entries)
        .map(([key, item]) => {
        if (item instanceof SfItem_js_1.SfItem === false) {
            item = new SfItem_js_1.SfItem(item);
        }
        let output = (0, serializeKey_js_1.serializeKey)(key);
        if (item.value === true) {
            output += (0, serializeParams_js_1.serializeParams)(item.params);
        }
        else {
            output += '=';
            if (Array.isArray(item.value)) {
                output += (0, serializeInnerList_js_1.serializeInnerList)(item);
            }
            else {
                output += (0, serializeItem_js_1.serializeItem)(item);
            }
        }
        return output;
    })
        .join(`,${optionalWhiteSpace}`);
}
//# sourceMappingURL=serializeDict.js.map