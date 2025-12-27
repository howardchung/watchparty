import { serializeDict } from './serialize/serializeDict.js';
/**
 * Encode an object into a structured field dictionary
 *
 * @param value - The structured field dictionary to encode
 * @param options - Encoding options
 *
 * @returns The structured field string
 *
 * @group Structured Field
 *
 * @beta
 */
export function encodeSfDict(value, options) {
    return serializeDict(value, options);
}
//# sourceMappingURL=encodeSfDict.js.map