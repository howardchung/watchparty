import { symbolToStr } from '../cta/utils/symbolToStr.js';
import { decodeSfDict } from '../structuredfield/decodeSfDict.js';
/**
 * Decode a CMCD string to an object.
 *
 * @param cmcd - The CMCD string to decode.
 *
 * @returns The decoded CMCD object.
 *
 * @group CMCD
 *
 * @beta
 */
export function decodeCmcd(cmcd) {
    if (!cmcd) {
        return {};
    }
    const sfDict = decodeSfDict(decodeURIComponent(cmcd.replace(/^CMCD=/, '')));
    return Object
        .entries(sfDict)
        .reduce((acc, [key, item]) => {
        const { value } = item;
        // TODO: Find a better way to type this
        acc[key] = (typeof value === 'symbol' ? symbolToStr(value) : item.value);
        return acc;
    }, {});
}
//# sourceMappingURL=decodeCmcd.js.map