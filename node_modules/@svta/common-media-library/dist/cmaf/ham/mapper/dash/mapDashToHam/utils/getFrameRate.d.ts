import type { AdaptationSet } from '../../../../types/mapper/dash/AdaptationSet.js';
import type { Representation } from '../../../../types/mapper/dash/Representation.js';
import type { FrameRate } from '../../../../types/model/FrameRate.js';
/**
 * @internal
 *
 * Get the frame rate from a dash manifest.
 *
 * This functions assumes the adaptationSet and representation set are type video
 *
 * @param adaptationSet - To try to get the frameRate from
 * @param representation - To try to get the frameRate from
 * @returns object containing numerator and denominator
 */
export declare function getFrameRate(adaptationSet: AdaptationSet, representation: Representation): FrameRate;
//# sourceMappingURL=getFrameRate.d.ts.map