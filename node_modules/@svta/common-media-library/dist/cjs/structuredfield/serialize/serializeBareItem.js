"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeBareItem = serializeBareItem;
const SfToken_js_1 = require("../SfToken.js");
const BARE_ITEM_js_1 = require("../utils/BARE_ITEM.js");
const serializeBoolean_js_1 = require("./serializeBoolean.js");
const serializeByteSequence_js_1 = require("./serializeByteSequence.js");
const serializeDate_js_1 = require("./serializeDate.js");
const serializeDecimal_js_1 = require("./serializeDecimal.js");
const serializeError_js_1 = require("./serializeError.js");
const serializeInteger_js_1 = require("./serializeInteger.js");
const serializeString_js_1 = require("./serializeString.js");
const serializeToken_js_1 = require("./serializeToken.js");
// 4.1.3.1.  Serializing a Bare Item
//
// Given an Item as input_item, return an ASCII string suitable for use
// in a HTTP field value.
//
// 1.  If input_item is an Integer, return the result of running
//     Serializing an Integer (Section 4.1.4) with input_item.
//
// 2.  If input_item is a Decimal, return the result of running
//     Serializing a Decimal (Section 4.1.5) with input_item.
//
// 3.  If input_item is a String, return the result of running
//     Serializing a String (Section 4.1.6) with input_item.
//
// 4.  If input_item is a Token, return the result of running
//     Serializing a Token (Section 4.1.7) with input_item.
//
// 5.  If input_item is a Boolean, return the result of running
//     Serializing a Boolean (Section 4.1.9) with input_item.
//
// 6.  If input_item is a Byte Sequence, return the result of running
//     Serializing a Byte Sequence (Section 4.1.8) with input_item.
//
// 7.  If input_item is a Date, return the result of running Serializing
//     a Date (Section 4.1.10) with input_item.
//
// 8.  Otherwise, fail serialization.
function serializeBareItem(value) {
    switch (typeof value) {
        case 'number':
            if (!Number.isFinite(value)) {
                throw (0, serializeError_js_1.serializeError)(value, BARE_ITEM_js_1.BARE_ITEM);
            }
            if (Number.isInteger(value)) {
                return (0, serializeInteger_js_1.serializeInteger)(value);
            }
            return (0, serializeDecimal_js_1.serializeDecimal)(value);
        case 'string':
            return (0, serializeString_js_1.serializeString)(value);
        case 'symbol':
            return (0, serializeToken_js_1.serializeToken)(value);
        case 'boolean':
            return (0, serializeBoolean_js_1.serializeBoolean)(value);
        case 'object':
            if (value instanceof Date) {
                return (0, serializeDate_js_1.serializeDate)(value);
            }
            if (value instanceof Uint8Array) {
                return (0, serializeByteSequence_js_1.serializeByteSequence)(value);
            }
            if (value instanceof SfToken_js_1.SfToken) {
                return (0, serializeToken_js_1.serializeToken)(value);
            }
        default:
            // fail
            throw (0, serializeError_js_1.serializeError)(value, BARE_ITEM_js_1.BARE_ITEM);
    }
}
//# sourceMappingURL=serializeBareItem.js.map