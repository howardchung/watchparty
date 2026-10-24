import type { SwitchingSet } from '../../types/model/SwitchingSet.js';
import type { Track } from '../../types/model/Track.js';
/**
 * Get a list of Tracks contained on a SwitchingSet
 *
 * @param switchingSet - SwitchingSet object from HAM
 * @param predicate - Filtering function
 * @returns Track[]
 *
 * @group CMAF
 * @alpha
 */
export declare function getTracksFromSwitchingSet(switchingSet: SwitchingSet, predicate?: (track: Track) => boolean): Track[];
//# sourceMappingURL=getTracksFromSwitchingSet.d.ts.map