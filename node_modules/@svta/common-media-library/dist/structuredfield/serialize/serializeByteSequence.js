import { base64encode } from '../../utils/base64encode.js';
import { BYTES } from '../utils/BYTES.js';
import { serializeError } from './serializeError.js';
// 4.1.8.  Serializing a Byte Sequence
//
// Given a Byte Sequence as input_bytes, return an ASCII string suitable
// for use in a HTTP field value.
//
// 1.  If input_bytes is not a sequence of bytes, fail serialization.
//
// 2.  Let output be an empty string.
//
// 3.  Append ":" to output.
//
// 4.  Append the result of base64-encoding input_bytes as per
//     [RFC4648], Section 4, taking account of the requirements below.
//
// 5.  Append ":" to output.
//
// 6.  Return output.
//
// The encoded data is required to be padded with "=", as per [RFC4648],
// Section 3.2.
//
// Likewise, encoded data SHOULD have pad bits set to zero, as per
// [RFC4648], Section 3.5, unless it is not possible to do so due to
// implementation constraints.
export function serializeByteSequence(value) {
    if (ArrayBuffer.isView(value) === false) {
        throw serializeError(value, BYTES);
    }
    return `:${base64encode(value)}:`;
}
//# sourceMappingURL=serializeByteSequence.js.map