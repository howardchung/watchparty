import type { SfBareItem } from './SfBareItem.js';
import { SfItem } from './SfItem.js';
import type { SfParameters } from './SfParameters.js';
/**
 * Encode a structured field item to a string
 *
 * @param value - The structured field item to encode
 *
 * @returns The structured field string
 *
 * @group Structured Field
 *
 * @beta
 */
export declare function encodeSfItem(value: SfItem): string;
/**
 * Encode a structured field value to a string with optional parameters.
 *
 * @param value - The structured field value to encode
 * @param params - The structured field parameters
 *
 * @returns The structured field string
 *
 * @beta
 */
export declare function encodeSfItem(value: SfBareItem, params?: SfParameters): string;
//# sourceMappingURL=encodeSfItem.d.ts.map