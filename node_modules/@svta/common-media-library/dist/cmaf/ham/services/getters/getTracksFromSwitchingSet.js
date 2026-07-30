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
export function getTracksFromSwitchingSet(switchingSet, predicate) {
    const tracks = switchingSet.tracks;
    return predicate ? tracks.filter(predicate) : tracks;
}
//# sourceMappingURL=getTracksFromSwitchingSet.js.map