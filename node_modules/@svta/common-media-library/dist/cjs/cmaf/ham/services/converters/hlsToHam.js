"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hlsToHam = hlsToHam;
const HlsMapper_js_1 = require("../../mapper/hls/HlsMapper.js");
const MapperContext_js_1 = require("../../mapper/MapperContext.js");
/**
 * Convert hls manifest into a ham object.
 *
 * @example
 * Example on how to import the cmaf module and convert the hls `manifest` and
 * `ancillaryManifests` array into the ham manifest.
 * ```ts
 * import cmaf from '@svta/common-media-library/cmaf-ham';
 *
 * const manifest = cmaf.hlsToHam(hlsManifest);
 * ```
 *
 * @param manifest - String of the Main manifest
 * @param ancillaryManifests - Ancillary Manifests . Must be in order, first audio, subtitle and video
 * @returns List of presentations from ham
 *
 * @group CMAF
 * @alpha
 */
function hlsToHam(manifest, ancillaryManifests) {
    const mapperContext = MapperContext_js_1.MapperContext.getInstance();
    mapperContext.setStrategy(new HlsMapper_js_1.HlsMapper());
    return mapperContext.getHamFormat({
        manifest,
        ancillaryManifests: ancillaryManifests.map((ancillaryManifest) => ({
            manifest: ancillaryManifest,
            type: 'hls',
        })),
        type: 'hls',
    });
}
//# sourceMappingURL=hlsToHam.js.map