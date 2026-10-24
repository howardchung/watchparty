import type { Segment } from '../../types/model/Segment.js';
import type { Validation } from '../../types/Validation.js';
/**
 * Validate a segment.
 *
 * Validations:
 * - segment has duration
 * - segment has url
 *
 * @param segment - Segment from cmaf ham model
 * @param trackId - Optional: parent track id
 * @param prevValidation - Optional: validation object from parent previous validate method call
 * @returns Validation
 *
 * @group CMAF
 * @alpha
 */
export declare function validateSegment(segment: Segment, trackId?: string, prevValidation?: Validation): Validation;
//# sourceMappingURL=validateSegment.d.ts.map