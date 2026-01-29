import type { Presentation } from '../../types/model/Presentation.js';
import type { Track } from '../../types/model/Track.js';
/**
 * Get a list of Tracks contained on a Presentation
 *
 * @param presentation - Presentation object from HAM
 * @param predicate - Filtering function
 * @returns Track[]
 *
 * @group CMAF
 * @alpha
 */
export declare function getTracksFromPresentation(presentation: Presentation, predicate?: (track: Track) => boolean): Track[];
//# sourceMappingURL=getTracksFromPresentation.d.ts.map