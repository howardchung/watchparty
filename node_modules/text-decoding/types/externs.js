/* typal types/index.xml externs */
/** @const */
var _textDecoding = {}
/**
 * Options for the program.
 * @typedef {{ shouldRun: (boolean|undefined), text: string }}
 */
_textDecoding.Config

/** @interface */
function Decoder() {}
Decoder.prototype = {
  /**
   * @param {Stream} stream The stream of bytes being decoded.
   * @param {number} bite The next byte read from the stream.
   * @return {?(number|!Array.<number>)} The next code point(s)
   *     decoded, or null if not enough data exists in the input
   *     stream to decode a complete code point, or |finished|.
   */
  handler: function(stream, bite) {},
}

/** @interface */
function Encoder() {}
Encoder.prototype = {
  /**
   * @param {Stream} stream The stream of code points being encoded.
   * @param {number} code_point Next code point read from the stream.
   * @return {(number|!Array.<number>)} Byte(s) to emit, or |finished|.
   */
  handler: function(stream, code_point) {},
}