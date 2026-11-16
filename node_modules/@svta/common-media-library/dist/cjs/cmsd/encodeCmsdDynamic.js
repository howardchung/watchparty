"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeCmsdDynamic = encodeCmsdDynamic;
const SfItem_js_1 = require("../structuredfield/SfItem.js");
const encodeSfList_js_1 = require("../structuredfield/encodeSfList.js");
function encodeCmsdDynamic(value, cmsd) {
    if (!value) {
        return '';
    }
    if (typeof value === 'string') {
        if (!cmsd) {
            return '';
        }
        value = [new SfItem_js_1.SfItem(value, cmsd)];
    }
    return (0, encodeSfList_js_1.encodeSfList)(value, { whitespace: false });
}
//# sourceMappingURL=encodeCmsdDynamic.js.map