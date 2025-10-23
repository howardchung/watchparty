import { base64decode } from '../../utils/base64decode.js';
import { BYTES } from '../utils/BYTES.js';
import { parsedValue } from './ParsedValue.js';
import { parseError } from './parseError.js';
// 4.2.7.  Parsing a Byte Sequence
//
// Given an ASCII string as input_string, return a Byte Sequence.
// input_string is modified to remove the parsed value.
//
// 1.  If the first character of input_string is not ":", fail parsing.
//
// 2.  Discard the first character of input_string.
//
// 3.  If there is not a ":" character before the end of input_string,
//     fail parsing.
//
// 4.  Let b64_content be the result of consuming content of
//     input_string up to but not including the first instance of the
//     character ":".
//
// 5.  Consume the ":" character at the beginning of input_string.
//
// 6.  If b64_content contains a character not included in ALPHA, DIGIT,
//     "+", "/" and "=", fail parsing.
//
// 7.  Let binary_content be the result of Base 64 Decoding [RFC4648]
//     b64_content, synthesizing padding if necessary (note the
//     requirements about recipient behavior below).
//
// 8.  Return binary_content.
//
// Because some implementations of base64 do not allow rejection of
// encoded data that is not properly "=" padded (see [RFC4648],
// Section 3.2), parsers SHOULD NOT fail when "=" padding is not
// present, unless they cannot be configured to do so.
//
// Because some implementations of base64 do not allow rejection of
// encoded data that has non-zero pad bits (see [RFC4648], Section 3.5),
// parsers SHOULD NOT fail when non-zero pad bits are present, unless
// they cannot be configured to do so.
//
// This specification does not relax the requirements in [RFC4648],
// Section 3.1 and 3.3; therefore, parsers MUST fail on characters
// outside the base64 alphabet, and on line feeds in encoded data.
export function parseByteSequence(src) {
    if (src[0] !== ':') {
        throw parseError(src, BYTES);
    }
    src = src.substring(1);
    if (src.includes(':') === false) {
        throw parseError(src, BYTES);
    }
    const re = /(^.*?)(:)/g;
    const b64_content = re.exec(src)[1];
    src = src.substring(re.lastIndex);
    // pass b64_content char check step 6
    return parsedValue(base64decode(b64_content), src);
}
//# sourceMappingURL=parseByteSequence.js.map