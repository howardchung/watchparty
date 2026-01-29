import { iso8601DurationToNumber } from '../../../utils/dash/iso8601DurationToNumber.js';
import { getGroup } from './utils/getGroup.js';
import { getInitializationUrl } from './utils/getInitializationUrl.js';
import { getPresentationId } from './utils/getPresentationId.js';
import { mapSegments } from './mapSegments.js';
import { mapTracks } from './mapTracks.js';
/**
 * @internal
 *
 * Main function to map dash to ham.
 *
 * @param dash - Dash manifest to map
 * @returns List of presentations in ham
 */
export function mapDashToHam(dash) {
    return dash.MPD.Period.map((period) => {
        const duration = iso8601DurationToNumber(period.$.duration);
        const presentationId = getPresentationId(period, duration);
        const selectionSetGroups = {};
        period.AdaptationSet.map((adaptationSet) => {
            var _a, _b, _c, _d;
            const tracks = adaptationSet.Representation.map((representation) => {
                const segments = mapSegments(adaptationSet, representation, duration);
                return mapTracks(adaptationSet, representation, segments, getInitializationUrl(adaptationSet, representation));
            });
            const group = getGroup(adaptationSet);
            if (!selectionSetGroups[group]) {
                selectionSetGroups[group] = {
                    id: group,
                    switchingSets: [],
                };
            }
            selectionSetGroups[group].switchingSets.push({
                id: (_d = (_a = adaptationSet.$.id) !== null && _a !== void 0 ? _a : (_c = (_b = adaptationSet.ContentComponent) === null || _b === void 0 ? void 0 : _b.at(0)) === null || _c === void 0 ? void 0 : _c.$.id) !== null && _d !== void 0 ? _d : group,
                tracks,
            });
        });
        const selectionSets = Object.values(selectionSetGroups);
        return { id: presentationId, selectionSets };
    });
}
//# sourceMappingURL=mapDashToHam.js.map