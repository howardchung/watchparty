import { tracksToRepresentation } from './tracksToRepresentation.js';
import { getFrameRate } from './utils/getFrameRate.js';
export function selectionSetsToAdaptationSet(selectionsSets) {
    return selectionsSets.flatMap((selectionSet) => {
        return selectionSet.switchingSets.map((switchingSet) => {
            const track = switchingSet.tracks[0];
            return {
                $: {
                    id: switchingSet.id,
                    group: selectionSet.id,
                    contentType: track === null || track === void 0 ? void 0 : track.type,
                    mimeType: `${track === null || track === void 0 ? void 0 : track.type}/mp4`,
                    frameRate: getFrameRate(track),
                    lang: track === null || track === void 0 ? void 0 : track.language,
                    codecs: track === null || track === void 0 ? void 0 : track.codec,
                },
                Representation: tracksToRepresentation(switchingSet.tracks),
            };
        });
    });
}
//# sourceMappingURL=selectionSetsToAdaptationSet.js.map