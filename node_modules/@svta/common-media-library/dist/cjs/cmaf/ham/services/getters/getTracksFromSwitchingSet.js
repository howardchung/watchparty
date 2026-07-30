"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTracksFromSwitchingSet = getTracksFromSwitchingSet;
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
function getTracksFromSwitchingSet(switchingSet, predicate) {
    const tracks = switchingSet.tracks;
    return predicate ? tracks.filter(predicate) : tracks;
}
//# sourceMappingURL=getTracksFromSwitchingSet.js.map