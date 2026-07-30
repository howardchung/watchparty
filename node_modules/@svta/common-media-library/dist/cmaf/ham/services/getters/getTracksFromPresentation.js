import { getTracksFromSelectionSet } from './getTracksFromSelectionSet.js';
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
export function getTracksFromPresentation(presentation, predicate) {
    const tracks = presentation.selectionSets.flatMap((selectionSet) => getTracksFromSelectionSet(selectionSet));
    return predicate ? tracks.filter(predicate) : tracks;
}
//# sourceMappingURL=getTracksFromPresentation.js.map