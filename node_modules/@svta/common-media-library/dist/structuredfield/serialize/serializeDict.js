import { SfItem } from '../SfItem.js';
import { DICT } from '../utils/DICT.js';
import { serializeError } from './serializeError.js';
import { serializeInnerList } from './serializeInnerList.js';
import { serializeItem } from './serializeItem.js';
import { serializeKey } from './serializeKey.js';
import { serializeParams } from './serializeParams.js';
// 4.1.2.  Serializing a Dictionary
//
// Given an ordered Dictionary as input_dictionary (each member having a
// member_name and a tuple value of (member_value, parameters)), return
// an ASCII string suitable for use in a HTTP field value.
//
// 1.  Let output be an empty string.
//
// 2.  For each member_name with a value of (member_value, parameters)
//     in input_dictionary:
//
//     1.  Append the result of running Serializing a Key
//         (Section 4.1.1.3) with member's member_name to output.
//
//     2.  If member_value is Boolean true:
//
//         1.  Append the result of running Serializing Parameters
//             (Section 4.1.1.2) with parameters to output.
//
//     3.  Otherwise:
//
//         1.  Append "=" to output.
//
//         2.  If member_value is an array, append the result of running
//             Serializing an Inner List (Section 4.1.1.1) with
//             (member_value, parameters) to output.
//
//         3.  Otherwise, append the result of running Serializing an
//             Item (Section 4.1.3) with (member_value, parameters) to
//             output.
//
//     4.  If more members remain in input_dictionary:
//
//         1.  Append "," to output.
//
//         2.  Append a single SP to output.
//
// 3.  Return output.
export function serializeDict(dict, options = { whitespace: true }) {
    if (typeof dict !== 'object') {
        throw serializeError(dict, DICT);
    }
    const entries = dict instanceof Map ? dict.entries() : Object.entries(dict);
    const optionalWhiteSpace = (options === null || options === void 0 ? void 0 : options.whitespace) ? ' ' : '';
    return Array.from(entries)
        .map(([key, item]) => {
        if (item instanceof SfItem === false) {
            item = new SfItem(item);
        }
        let output = serializeKey(key);
        if (item.value === true) {
            output += serializeParams(item.params);
        }
        else {
            output += '=';
            if (Array.isArray(item.value)) {
                output += serializeInnerList(item);
            }
            else {
                output += serializeItem(item);
            }
        }
        return output;
    })
        .join(`,${optionalWhiteSpace}`);
}
//# sourceMappingURL=serializeDict.js.map