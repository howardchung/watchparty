"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapHamToDash = mapHamToDash;
const presentationsToPeriods_js_1 = require("./presentationsToPeriods.js");
const serializeDashManifest_js_1 = require("../../../utils/dash/serializeDashManifest.js");
function mapHamToDash(hamManifests) {
    const periods = (0, presentationsToPeriods_js_1.presentationsToPeriods)(hamManifests);
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
    return (0, serializeDashManifest_js_1.serializeDashManifest)(manifest);
}
//# sourceMappingURL=mapHamToDash.js.map