import { CMCD_PARAM } from './CMCD_PARAM.js';
import { decodeCmcd } from './decodeCmcd.js';
/**
 * Decode CMCD data from a query string.
 *
 * @param query - The query string to decode.
 *
 * @returns The decoded CMCD data.
 *
 * @group CMCD
 *
 * @beta
 */
export function fromCmcdQuery(query) {
    if (typeof query === 'string') {
        query = new URLSearchParams(query);
    }
    const value = query.get(CMCD_PARAM);
    return decodeCmcd(value);
}
//# sourceMappingURL=fromCmcdQuery.js.map