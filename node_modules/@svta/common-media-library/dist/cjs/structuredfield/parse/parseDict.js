"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDict = parseDict;
const SfItem_js_1 = require("../SfItem.js");
const DICT_js_1 = require("../utils/DICT.js");
const ParsedValue_js_1 = require("./ParsedValue.js");
const parseError_js_1 = require("./parseError.js");
const parseItemOrInnerList_js_1 = require("./parseItemOrInnerList.js");
const parseKey_js_1 = require("./parseKey.js");
const parseParameters_js_1 = require("./parseParameters.js");
// 4.2.2.  Parsing a Dictionary
//
// Given an ASCII string as input_string, return an ordered map whose
// values are (item_or_inner_list, parameters) tuples. input_string is
// modified to remove the parsed value.
//
// 1.  Let dictionary be an empty, ordered map.
//
// 2.  While input_string is not empty:
//
//     1.  Let this_key be the result of running Parsing a Key
//         (Section 4.2.3.3) with input_string.
//
//     2.  If the first character of input_string is "=":
//
//         1.  Consume the first character of input_string.
//
//         2.  Let member be the result of running Parsing an Item or
//             Inner List (Section 4.2.1.1) with input_string.
//
//     3.  Otherwise:
//
//         1.  Let value be Boolean true.
//
//         2.  Let parameters be the result of running Parsing
//             Parameters Section 4.2.3.2 with input_string.
//
//         3.  Let member be the tuple (value, parameters).
//
//     4.  Add name this_key with value member to dictionary.  If
//         dictionary already contains a name this_key (comparing
//         character-for-character), overwrite its value.
//
//     5.  Discard any leading OWS characters from input_string.
//
//     6.  If input_string is empty, return dictionary.
//
//     7.  Consume the first character of input_string; if it is not
//         ",", fail parsing.
//
//     8.  Discard any leading OWS characters from input_string.
//
//     9.  If input_string is empty, there is a trailing comma; fail
//         parsing.
//
// 3.  No structured data has been found; return dictionary (which is
//     empty).
//
// Note that when duplicate Dictionary keys are encountered, this has
// the effect of ignoring all but the last instance.
function parseDict(src, options) {
    const value = {};
    while (src.length > 0) {
        let member;
        const parsedKey = (0, parseKey_js_1.parseKey)(src);
        const key = parsedKey.value;
        src = parsedKey.src;
        if (src[0] === '=') {
            const parsedItemOrInnerList = (0, parseItemOrInnerList_js_1.parseItemOrInnerList)(src.substring(1), options);
            member = parsedItemOrInnerList.value;
            src = parsedItemOrInnerList.src;
        }
        else {
            const parsedParameters = (0, parseParameters_js_1.parseParameters)(src, options);
            member = new SfItem_js_1.SfItem(true, parsedParameters.value);
            src = parsedParameters.src;
        }
        value[key] = member;
        src = src.trim();
        if (src.length === 0) {
            return (0, ParsedValue_js_1.parsedValue)(value, src);
        }
        if (src[0] !== ',') {
            throw (0, parseError_js_1.parseError)(src, DICT_js_1.DICT);
        }
        src = src.substring(1).trim();
        if (src.length === 0 || src[0] === ',') {
            throw (0, parseError_js_1.parseError)(src, DICT_js_1.DICT);
        }
    }
    return (0, ParsedValue_js_1.parsedValue)(value, src);
}
//# sourceMappingURL=parseDict.js.map