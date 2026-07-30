import { getTracksFromSwitchingSet } from './getTracksFromSwitchingSet.js';
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
export function getTracksFromSelectionSet(selectionSet, predicate) {
    const tracks = selectionSet.switchingSets.flatMap((switchingSet) => getTracksFromSwitchingSet(switchingSet));
    return predicate ? tracks.filter(predicate) : tracks;
}
//# sourceMappingURL=getTracksFromSelectionSet.js.map