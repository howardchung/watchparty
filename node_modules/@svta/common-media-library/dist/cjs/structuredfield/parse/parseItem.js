"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseItem = parseItem;
const SfItem_js_1 = require("../SfItem.js");
const ParsedValue_js_1 = require("./ParsedValue.js");
const parseBareItem_js_1 = require("./parseBareItem.js");
const parseParameters_js_1 = require("./parseParameters.js");
// 4.2.3.  Parsing an Item
//
// Given an ASCII string as input_string, return a (bare_item,
// parameters) tuple. input_string is modified to remove the parsed
// value.
//
// 1.  Let bare_item be the result of running Parsing a Bare Item
//     (Section 4.2.3.1) with input_string.
//
// 2.  Let parameters be the result of running Parsing Parameters
//     (Section 4.2.3.2) with input_string.
//
// 3.  Return the tuple (bare_item, parameters).
function parseItem(src, options) {
    const parsedBareItem = (0, parseBareItem_js_1.parseBareItem)(src, options);
    src = parsedBareItem.src;
    const parsedParameters = (0, parseParameters_js_1.parseParameters)(src, options);
    src = parsedParameters.src;
    return (0, ParsedValue_js_1.parsedValue)(new SfItem_js_1.SfItem(parsedBareItem.value, parsedParameters.value), src);
}
//# sourceMappingURL=parseItem.js.map