import { SfItem } from '../structuredfield/SfItem.js';
import type { CmsdDynamic } from './CmsdDynamic.js';
/**
 * Encode a list of CMSD Dynamic objects.
 *
 * @param value - The list of `SfItems` to encode.
 *
 * @returns The encoded CMSD string.
 *
 * @group CMSD
 *
 * @beta
 */
export declare function encodeCmsdDynamic(value: SfItem[]): string;
/**
 * Encode a single CMSD Dynamic object.
 *
 * @param value - The server name
 * @param cmsd - The CMSD object to encode.
 *
 * @returns The encoded CMSD string.
 *
 * @group CMSD
 *
 * @beta
 */
export declare function encodeCmsdDynamic(value: string, cmsd: CmsdDynamic): string;
//# sourceMappingURL=encodeCmsdDynamic.d.ts.map