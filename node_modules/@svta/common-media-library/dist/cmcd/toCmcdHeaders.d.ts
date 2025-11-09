import type { Cmcd } from './Cmcd.js';
import type { CmcdEncodeOptions } from './CmcdEncodeOptions.js';
import { CmcdHeaderField } from './CmcdHeaderField.js';
/**
 * Convert a CMCD data object to request headers
 *
 * @param cmcd - The CMCD data object to convert.
 * @param options - Options for encoding the CMCD object.
 *
 * @returns The CMCD header shards.
 *
 * @group CMCD
 *
 * @beta
 */
export declare function toCmcdHeaders(cmcd: Cmcd, options?: CmcdEncodeOptions): Record<CmcdHeaderField, string>;
//# sourceMappingURL=toCmcdHeaders.d.ts.map