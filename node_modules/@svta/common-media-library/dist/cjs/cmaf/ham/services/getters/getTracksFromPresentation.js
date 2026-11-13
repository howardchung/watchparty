"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTracksFromPresentation = getTracksFromPresentation;
const getTracksFromSelectionSet_js_1 = require("./getTracksFromSelectionSet.js");
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
function getTracksFromPresentation(presentation, predicate) {
    const tracks = presentation.selectionSets.flatMap((selectionSet) => (0, getTracksFromSelectionSet_js_1.getTracksFromSelectionSet)(selectionSet));
    return predicate ? tracks.filter(predicate) : tracks;
}
//# sourceMappingURL=getTracksFromPresentation.js.map