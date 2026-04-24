import { INTEGER } from '../utils/INTEGER.js';
import { isInvalidInt } from '../utils/isInvalidInt.js';
import { serializeError } from './serializeError.js';
// 4.1.4.  Serializing an Integer
//
// Given an Integer as input_integer, return an ASCII string suitable
// for use in a HTTP field value.
//
// 1.  If input_integer is not an integer in the range of
//     -999,999,999,999,999 to 999,999,999,999,999 inclusive, fail
//     serialization.
//
// 2.  Let output be an empty string.
//
// 3.  If input_integer is less than (but not equal to) 0, append "-" to
//     output.
//
// 4.  Append input_integer's numeric value represented in base 10 using
//     only decimal digits to output.
//
// 5.  Return output.
export function serializeInteger(value) {
    if (isInvalidInt(value)) {
        throw serializeError(value, INTEGER);
    }
    return value.toString();
}
//# sourceMappingURL=serializeInteger.js.map