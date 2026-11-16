import type { Track } from '../../types/model/Track.js';
import type { Validation } from '../../types/Validation.js';
/**
 * Validate a list of tracks.
 * It validates in cascade, calling each child validation method.
 *
 * @example
 * ```ts
 * import cmaf, { Track } from '@svta/common-media-library/cmaf-ham';
 * ...
 *
 * // const tracks: Track[] = ...;
 *
 * const validation = cmaf.validateTracks(tracks);
 * ```
 *
 * Example output: `{ status: true|false, errorMessages: [...] }`
 *
 * @param tracks - List of Track from cmaf ham model
 * @param switchingSetId - Optional: parent switching set id
 * @param prevValidation - Optional: validation object from parent previous validate method call
 * @returns Validation
 *
 * @group CMAF
 * @alpha
 *
 */
export declare function validateTracks(tracks: Track[], switchingSetId?: string, prevValidation?: Validation): Validation;
//# sourceMappingURL=validateTracks.d.ts.map