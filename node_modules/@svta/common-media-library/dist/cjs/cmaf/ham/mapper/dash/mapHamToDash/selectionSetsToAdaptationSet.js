"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectionSetsToAdaptationSet = selectionSetsToAdaptationSet;
const tracksToRepresentation_js_1 = require("./tracksToRepresentation.js");
const getFrameRate_js_1 = require("./utils/getFrameRate.js");
function selectionSetsToAdaptationSet(selectionsSets) {
    return selectionsSets.flatMap((selectionSet) => {
        return selectionSet.switchingSets.map((switchingSet) => {
            const track = switchingSet.tracks[0];
            return {
                $: {
                    id: switchingSet.id,
                    group: selectionSet.id,
                    contentType: track === null || track === void 0 ? void 0 : track.type,
                    mimeType: `${track === null || track === void 0 ? void 0 : track.type}/mp4`,
                    frameRate: (0, getFrameRate_js_1.getFrameRate)(track),
                    lang: track === null || track === void 0 ? void 0 : track.language,
                    codecs: track === null || track === void 0 ? void 0 : track.codec,
                },
                Representation: (0, tracksToRepresentation_js_1.tracksToRepresentation)(switchingSet.tracks),
            };
        });
    });
}
//# sourceMappingURL=selectionSetsToAdaptationSet.js.map