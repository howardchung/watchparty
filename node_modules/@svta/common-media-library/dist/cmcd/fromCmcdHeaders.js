import { CmcdHeaderMap } from './CmcdHeaderMap.js';
import { decodeCmcd } from './decodeCmcd.js';
const keys = Object.keys(CmcdHeaderMap);
/**
 * Decode CMCD data from request headers.
 *
 * @param headers - The request headers to decode.
 *
 * @returns The decoded CMCD data.
 *
 * @group CMCD
 *
 * @beta
 */
export function fromCmcdHeaders(headers) {
    if (!(headers instanceof Headers)) {
        headers = new Headers(headers);
    }
    return keys.reduce((acc, key) => {
        const value = headers.get(key);
        return Object.assign(acc, decodeCmcd(value));
    }, {});
}
//# sourceMappingURL=fromCmcdHeaders.js.map