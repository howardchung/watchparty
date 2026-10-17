import type { SelectionSet } from '../../types/model/SelectionSet.js';
import type { Track } from '../../types/model/Track.js';
/**
 * Get a list of Tracks contained on a SelectionSet
 *
 * @param selectionSet - SelectionSet object from HAM
 * @param predicate - Filtering function
 * @returns Track[]
 *
 * @group CMAF
 * @alpha
 */
export declare function getTracksFromSelectionSet(selectionSet: SelectionSet, predicate?: (track: Track) => boolean): Track[];
//# sourceMappingURL=getTracksFromSelectionSet.d.ts.map