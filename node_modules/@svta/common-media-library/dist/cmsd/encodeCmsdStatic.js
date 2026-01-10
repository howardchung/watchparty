import { encodeSfDict } from '../structuredfield/encodeSfDict.js';
import { processCmsd } from './utils/processCmsd.js';
/**
 * Encode a CMSD Static object.
 *
 * @param cmsd - The CMSD object to encode.
 * @param options - Encoding options
 *
 * @returns The encoded CMSD string.
 *
 * @group CMSD
 *
 * @beta
 */
export function encodeCmsdStatic(cmsd, options) {
    if (!cmsd) {
        return '';
    }
    return encodeSfDict(processCmsd(cmsd, options), { whitespace: false });
}
//# sourceMappingURL=encodeCmsdStatic.js.map