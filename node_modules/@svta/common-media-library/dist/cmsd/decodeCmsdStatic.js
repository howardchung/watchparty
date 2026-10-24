import { symbolToStr } from '../cta/utils/symbolToStr.js';
import { decodeSfDict } from '../structuredfield/decodeSfDict.js';
/**
 * Decode a CMSD Static dict string to an object.
 *
 * @param cmsd - The CMSD string to decode.
 *
 * @returns The decoded CMSD object.
 *
 * @group CMSD
 *
 * @beta
 */
export function decodeCmsdStatic(cmsd) {
    if (!cmsd) {
        return {};
    }
    return Object
        .entries(decodeSfDict(cmsd))
        .reduce((acc, [key, item]) => {
        const { value } = item;
        acc[key] = (typeof value === 'symbol' ? symbolToStr(value) : value);
        return acc;
    }, {});
}
//# sourceMappingURL=decodeCmsdStatic.js.map