"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDate = parseDate;
const DATE_js_1 = require("../utils/DATE.js");
const ParsedValue_js_1 = require("./ParsedValue.js");
const parseError_js_1 = require("./parseError.js");
const parseIntegerOrDecimal_js_1 = require("./parseIntegerOrDecimal.js");
// 4.2.9.  Parsing a Date
//
// Given an ASCII string as input_string, return a Date. input_string is
// modified to remove the parsed value.
//
// 1.  If the first character of input_string is not "@", fail parsing.
//
// 2.  Discard the first character of input_string.
//
// 3.  Let output_date be the result of running Parsing an Integer or
//     Decimal (Section 4.2.4) with input_string.
//
// 4.  If output_date is a Decimal, fail parsing.
//
// 5.  Return output_date.
function parseDate(src) {
    let i = 0;
    if (src[i] !== '@') {
        throw (0, parseError_js_1.parseError)(src, DATE_js_1.DATE);
    }
    i++;
    const date = (0, parseIntegerOrDecimal_js_1.parseIntegerOrDecimal)(src.substring(i));
    if (Number.isInteger(date.value) === false) {
        throw (0, parseError_js_1.parseError)(src, DATE_js_1.DATE);
    }
    return (0, ParsedValue_js_1.parsedValue)(new Date(date.value * 1000), date.src);
}
//# sourceMappingURL=parseDate.js.map