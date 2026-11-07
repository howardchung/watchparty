"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeItem = serializeItem;
const SfItem_js_1 = require("../SfItem.js");
const serializeBareItem_js_1 = require("./serializeBareItem.js");
const serializeParams_js_1 = require("./serializeParams.js");
// 4.1.3.  Serializing an Item
//
// Given an Item as bare_item and Parameters as item_parameters, return
// an ASCII string suitable for use in a HTTP field value.
//
// 1.  Let output be an empty string.
//
// 2.  Append the result of running Serializing a Bare Item
//     Section 4.1.3.1 with bare_item to output.
//
// 3.  Append the result of running Serializing Parameters
//     Section 4.1.1.2 with item_parameters to output.
//
// 4.  Return output.
function serializeItem(value) {
    if (value instanceof SfItem_js_1.SfItem) {
        return `${(0, serializeBareItem_js_1.serializeBareItem)(value.value)}${(0, serializeParams_js_1.serializeParams)(value.params)}`;
    }
    else {
        return (0, serializeBareItem_js_1.serializeBareItem)(value);
    }
}
//# sourceMappingURL=serializeItem.js.map