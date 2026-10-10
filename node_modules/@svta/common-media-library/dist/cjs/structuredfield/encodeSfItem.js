"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeSfItem = encodeSfItem;
const SfItem_js_1 = require("./SfItem.js");
const serializeItem_js_1 = require("./serialize/serializeItem.js");
function encodeSfItem(value, params) {
    if (!(value instanceof SfItem_js_1.SfItem)) {
        value = new SfItem_js_1.SfItem(value, params);
    }
    return (0, serializeItem_js_1.serializeItem)(value);
}
//# sourceMappingURL=encodeSfItem.js.map