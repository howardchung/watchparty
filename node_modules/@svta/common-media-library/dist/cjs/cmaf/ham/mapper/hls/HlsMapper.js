"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HlsMapper = void 0;
const mapHamToHls_js_1 = require("./mapHamToHls/mapHamToHls.js");
const mapHlsToHam_js_1 = require("./mapHlsToHam/mapHlsToHam.js");
const getMetadata_js_1 = require("../../utils/manifest/getMetadata.js");
class HlsMapper {
    getManifestMetadata() {
        return (0, getMetadata_js_1.getMetadata)(this.manifest);
    }
    toHam(manifest) {
        const presentations = (0, mapHlsToHam_js_1.mapHlsToHam)(manifest);
        this.manifest = manifest;
        return presentations;
    }
    toManifest(presentation) {
        return (0, mapHamToHls_js_1.mapHamToHls)(presentation);
    }
}
exports.HlsMapper = HlsMapper;
//# sourceMappingURL=HlsMapper.js.map