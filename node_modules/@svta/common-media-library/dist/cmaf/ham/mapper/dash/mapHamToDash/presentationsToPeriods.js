import { selectionSetsToAdaptationSet } from './selectionSetsToAdaptationSet.js';
import { numberToIso8601Duration } from '../../../utils/dash/numberToIso8601Duration.js';
export function presentationsToPeriods(presentations) {
    return presentations.map((presentation) => {
        return {
            $: {
                duration: numberToIso8601Duration(presentation.selectionSets[0].switchingSets[0].tracks[0]
                    .duration),
                id: presentation.id,
                start: 'PT0S',
            },
            AdaptationSet: selectionSetsToAdaptationSet(presentation.selectionSets),
        };
    });
}
//# sourceMappingURL=presentationsToPeriods.js.map