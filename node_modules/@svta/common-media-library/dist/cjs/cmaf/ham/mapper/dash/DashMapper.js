"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashMapper = void 0;
const mapDashToHam_js_1 = require("./mapDashToHam/mapDashToHam.js");
const mapHamToDash_js_1 = require("./mapHamToDash/mapHamToDash.js");
const parseDashManifest_js_1 = require("../../utils/dash/parseDashManifest.js");
const addMetadataToDash_js_1 = require("../../utils/manifest/addMetadataToDash.js");
const getMetadata_js_1 = require("../../utils/manifest/getMetadata.js");
class DashMapper {
    getManifestMetadata() {
        return (0, getMetadata_js_1.getMetadata)(this.manifest);
    }
    toHam(manifest) {
        const dashManifest = (0, parseDashManifest_js_1.parseDashManifest)(manifest.manifest);
        if (!dashManifest) {
            return [];
        }
        (0, addMetadataToDash_js_1.addMetadataToDash)(dashManifest, manifest);
        return (0, mapDashToHam_js_1.mapDashToHam)(dashManifest);
    }
    toManifest(presentation) {
        const manifest = (0, mapHamToDash_js_1.mapHamToDash)(presentation);
        return { manifest, ancillaryManifests: [], type: 'dash' };
    }
}
exports.DashMapper = DashMapper;
//# sourceMappingURL=DashMapper.js.map