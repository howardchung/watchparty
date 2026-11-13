import { DATE } from '../utils/DATE.js';
import { parsedValue } from './ParsedValue.js';
import { parseError } from './parseError.js';
import { parseIntegerOrDecimal } from './parseIntegerOrDecimal.js';
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
export function parseDate(src) {
    let i = 0;
    if (src[i] !== '@') {
        throw parseError(src, DATE);
    }
    i++;
    const date = parseIntegerOrDecimal(src.substring(i));
    if (Number.isInteger(date.value) === false) {
        throw parseError(src, DATE);
    }
    return parsedValue(new Date(date.value * 1000), date.src);
}
//# sourceMappingURL=parseDate.js.map