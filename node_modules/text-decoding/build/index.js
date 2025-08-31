const TextEncoder = require('./lib/TextEncoder');
const TextDecoder = require('./lib/TextDecoder');
const EncodingIndexes = require('./encoding-indexes');
const { getEncoding } = require('./lib');

//
// Implementation of Encoding specification
// https://encoding.spec.whatwg.org/
//



module.exports.TextEncoder = TextEncoder
module.exports.TextDecoder = TextDecoder
module.exports.EncodingIndexes = EncodingIndexes
module.exports.getEncoding = getEncoding