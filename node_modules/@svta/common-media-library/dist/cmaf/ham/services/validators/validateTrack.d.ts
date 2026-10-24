import type { Track } from '../../types/model/Track.js';
import type { Validation } from '../../types/Validation.js';
/**
 * Validate a track.
 * It validates in cascade, calling each child validation method.
 *
 * Validations:
 * - track has id
 * - Invokes specific audio, video and text validations
 *
 * @example
 * ```ts
 * import cmaf, { Track } from '@svta/common-media-library/cmaf-ham';
 * ...
 *
 * // const track: Track = ...;
 *
 * const validation = cmaf.validateTrack(track);
 * ```
 *
 * Example output: `{ status: true|false, errorMessages: [...] }`
 *
 * @param track - Track from cmaf ham model
 * @param switchingSetId - Optional: parent switching set id
 * @param prevValidation - Optional: validation object from parent previous validate method call
 * @returns Validation
 *
 * @group CMAF
 * @alpha
 *
 */
export declare function validateTrack(track: Track, switchingSetId?: string, prevValidation?: Validation): Validation;
//# sourceMappingURL=validateTrack.d.ts.map