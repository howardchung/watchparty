import { toCmcdHeaders } from './toCmcdHeaders.js';
/**
 * Append CMCD query args to a header object.
 *
 * @param headers - The headers to append to.
 * @param cmcd - The CMCD object to append.
 * @param options - Encode options.
 *
 * @returns The headers with the CMCD header shards appended.
 *
 * @group CMCD
 *
 * @beta
 */
export function appendCmcdHeaders(headers, cmcd, options) {
    return Object.assign(headers, toCmcdHeaders(cmcd, options));
}
//# sourceMappingURL=appendCmcdHeaders.js.map