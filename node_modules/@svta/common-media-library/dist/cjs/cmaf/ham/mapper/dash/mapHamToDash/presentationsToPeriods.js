"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.presentationsToPeriods = presentationsToPeriods;
const selectionSetsToAdaptationSet_js_1 = require("./selectionSetsToAdaptationSet.js");
const numberToIso8601Duration_js_1 = require("../../../utils/dash/numberToIso8601Duration.js");
function presentationsToPeriods(presentations) {
    return presentations.map((presentation) => {
        return {
            $: {
                duration: (0, numberToIso8601Duration_js_1.numberToIso8601Duration)(presentation.selectionSets[0].switchingSets[0].tracks[0]
                    .duration),
                id: presentation.id,
                start: 'PT0S',
            },
            AdaptationSet: (0, selectionSetsToAdaptationSet_js_1.selectionSetsToAdaptationSet)(presentation.selectionSets),
        };
    });
}
//# sourceMappingURL=presentationsToPeriods.js.map