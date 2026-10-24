import { decodeSfList } from '../structuredfield/decodeSfList.js';
/**
 * Decode a CMSD dynamic string to an object.
 *
 * @param cmsd - The CMSD string to decode.
 *
 * @returns The decoded CMSD object.
 *
 * @group CMSD
 *
 * @beta
 */
export function decodeCmsdDynamic(cmsd) {
    if (!cmsd) {
        return [];
    }
    const sfDict = decodeSfList(cmsd);
    return sfDict;
}
//# sourceMappingURL=decodeCmsdDynamic.js.map