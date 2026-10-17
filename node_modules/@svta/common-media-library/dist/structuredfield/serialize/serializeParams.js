import { serializeBareItem } from './serializeBareItem.js';
import { serializeKey } from './serializeKey.js';
// 4.1.1.2.  Serializing Parameters
//
// Given an ordered Dictionary as input_parameters (each member having a
// param_name and a param_value), return an ASCII string suitable for
// use in a HTTP field value.
//
// 1.  Let output be an empty string.
//
// 2.  For each param_name with a value of param_value in
//     input_parameters:
//
//     1.  Append ";" to output.
//
//     2.  Append the result of running Serializing a Key
//         (Section 4.1.1.3) with param_name to output.
//
//     3.  If param_value is not Boolean true:
//
//         1.  Append "=" to output.
//
//         2.  Append the result of running Serializing a bare Item
//             (Section 4.1.3.1) with param_value to output.
//
// 3.  Return output.
export function serializeParams(params) {
    if (params == null) {
        return '';
    }
    return Object.entries(params)
        .map(([key, value]) => {
        if (value === true) {
            return `;${serializeKey(key)}`; // omit true
        }
        return `;${serializeKey(key)}=${serializeBareItem(value)}`;
    })
        .join('');
}
//# sourceMappingURL=serializeParams.js.map