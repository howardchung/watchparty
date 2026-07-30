"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapDashToHam = mapDashToHam;
const iso8601DurationToNumber_js_1 = require("../../../utils/dash/iso8601DurationToNumber.js");
const getGroup_js_1 = require("./utils/getGroup.js");
const getInitializationUrl_js_1 = require("./utils/getInitializationUrl.js");
const getPresentationId_js_1 = require("./utils/getPresentationId.js");
const mapSegments_js_1 = require("./mapSegments.js");
const mapTracks_js_1 = require("./mapTracks.js");
/**
 * @internal
 *
 * Main function to map dash to ham.
 *
 * @param dash - Dash manifest to map
 * @returns List of presentations in ham
 */
function mapDashToHam(dash) {
    return dash.MPD.Period.map((period) => {
        const duration = (0, iso8601DurationToNumber_js_1.iso8601DurationToNumber)(period.$.duration);
        const presentationId = (0, getPresentationId_js_1.getPresentationId)(period, duration);
        const selectionSetGroups = {};
        period.AdaptationSet.map((adaptationSet) => {
            var _a, _b, _c, _d;
            const tracks = adaptationSet.Representation.map((representation) => {
                const segments = (0, mapSegments_js_1.mapSegments)(adaptationSet, representation, duration);
                return (0, mapTracks_js_1.mapTracks)(adaptationSet, representation, segments, (0, getInitializationUrl_js_1.getInitializationUrl)(adaptationSet, representation));
            });
            const group = (0, getGroup_js_1.getGroup)(adaptationSet);
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