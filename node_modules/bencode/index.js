import encode from './lib/encode.js'
import decode from './lib/decode.js'
import byteLength from './lib/encoding-length.js'
/**
 * Determines the amount of bytes
 * needed to encode the given value
 * @param  {Object|Array|Uint8Array|String|Number|Boolean} value
 * @return {Number} byteCount
 */
const encodingLength = byteLength
export default { encode, decode, byteLength, encodingLength }
