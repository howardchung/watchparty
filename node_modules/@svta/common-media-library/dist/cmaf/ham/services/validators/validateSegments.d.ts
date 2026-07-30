import type { Segment } from '../../types/model/Segment.js';
import type { Validation } from '../../types/Validation.js';
/**
 * Validate a list of segments.
 *
 * @example
 * ```ts
 * import cmaf, { Segment } from '@svta/common-media-library/cmaf-ham';
 * ...
 *
 * // const segments: Segment[] = ...;
 *
 * const validation = cmaf.validateSegments(segments);
 * ```
 *
 * Example output: `{ status: true|false, errorMessages: [...] }`
 *
 * @param segments - List of Segment from cmaf ham model
 * @param trackId - Optional: parent track id
 * @param prevValidation - Optional: validation object from parent previous validate method call
 * @returns Validation
 *
 * @group CMAF
 * @alpha
 *
 */
export declare function validateSegments(segments: Segment[], trackId?: string, prevValidation?: Validation): Validation;
//# sourceMappingURL=validateSegments.d.ts.map