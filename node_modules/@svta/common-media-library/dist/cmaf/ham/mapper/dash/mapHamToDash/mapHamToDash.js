import { presentationsToPeriods } from './presentationsToPeriods.js';
import { serializeDashManifest } from '../../../utils/dash/serializeDashManifest.js';
export function mapHamToDash(hamManifests) {
    const periods = presentationsToPeriods(hamManifests);
    const duration = periods[0].$.duration;
    const manifest = {
        MPD: {
            $: {
                mediaPresentationDuration: duration,
                type: 'static',
            },
            Period: periods,
        },
    };
    return serializeDashManifest(manifest);
}
//# sourceMappingURL=mapHamToDash.js.map