"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeDecimal = serializeDecimal;
const roundToEven_js_1 = require("../../utils/roundToEven.js");
const DECIMAL_js_1 = require("../utils/DECIMAL.js");
const serializeError_js_1 = require("./serializeError.js");
// 4.1.5.  Serializing a Decimal
//
// Given a decimal number as input_decimal, return an ASCII string
// suitable for use in a HTTP field value.
//
// 1.   If input_decimal is not a decimal number, fail serialization.
//
// 2.   If input_decimal has more than three significant digits to the
//      right of the decimal point, round it to three decimal places,
//      rounding the final digit to the nearest value, or to the even
//      value if it is equidistant.
//
// 3.   If input_decimal has more than 12 significant digits to the left
//      of the decimal point after rounding, fail serialization.
//
// 4.   Let output be an empty string.
//
// 5.   If input_decimal is less than (but not equal to) 0, append "-"
//      to output.
//
// 6.   Append input_decimal's integer component represented in base 10
//      (using only decimal digits) to output; if it is zero, append
//      "0".
//
// 7.   Append "." to output.
//
// 8.   If input_decimal's fractional component is zero, append "0" to
//      output.
//
// 9.   Otherwise, append the significant digits of input_decimal's
//      fractional component represented in base 10 (using only decimal
//      digits) to output.
//
// 10.  Return output.
function serializeDecimal(value) {
    const roundedValue = (0, roundToEven_js_1.roundToEven)(value, 3); // round to 3 decimal places
    if (Math.floor(Math.abs(roundedValue)).toString().length > 12) {
        throw (0, serializeError_js_1.serializeError)(value, DECIMAL_js_1.DECIMAL);
    }
    const stringValue = roundedValue.toString();
    return stringValue.includes('.') ? stringValue : `${stringValue}.0`;
}
//# sourceMappingURL=serializeDecimal.js.map