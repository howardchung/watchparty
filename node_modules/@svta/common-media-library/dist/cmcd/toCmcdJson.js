import { symbolToStr } from '../cta/utils/symbolToStr.js';
import { SfToken } from '../structuredfield/SfToken.js';
import { processCmcd } from './utils/processCmcd.js';
/**
 * Convert a CMCD data object to JSON.
 *
 * @param cmcd - The CMCD object to convert.
 * @param options - Options for encoding the CMCD object.
 *
 * @returns The CMCD JSON.
 *
 * @group CMCD
 *
 * @beta
 */
export function toCmcdJson(cmcd, options) {
    const data = processCmcd(cmcd, options);
    return JSON.stringify(data, (_, value) => typeof value === 'symbol' || value instanceof SfToken ? symbolToStr(value) : value);
}
//# sourceMappingURL=toCmcdJson.js.map