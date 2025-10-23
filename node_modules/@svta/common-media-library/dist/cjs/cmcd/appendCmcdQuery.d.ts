import type { Cmcd } from './Cmcd.js';
import type { CmcdEncodeOptions } from './CmcdEncodeOptions.js';
/**
 * Append CMCD query args to a URL.
 *
 * @param url - The URL to append to.
 * @param cmcd - The CMCD object to append.
 * @param options - Options for encoding the CMCD object.
 *
 * @returns The URL with the CMCD query args appended.
 *
 * @group CMCD
 *
 * @beta
 */
export declare function appendCmcdQuery(url: string, cmcd: Cmcd, options?: CmcdEncodeOptions): string;
//# sourceMappingURL=appendCmcdQuery.d.ts.map