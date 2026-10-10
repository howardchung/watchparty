"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTracksFromSelectionSet = getTracksFromSelectionSet;
const getTracksFromSwitchingSet_js_1 = require("./getTracksFromSwitchingSet.js");
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
function getTracksFromSelectionSet(selectionSet, predicate) {
    const tracks = selectionSet.switchingSets.flatMap((switchingSet) => (0, getTracksFromSwitchingSet_js_1.getTracksFromSwitchingSet)(switchingSet));
    return predicate ? tracks.filter(predicate) : tracks;
}
//# sourceMappingURL=getTracksFromSelectionSet.js.map