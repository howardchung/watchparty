"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hamToHls = hamToHls;
const HlsMapper_js_1 = require("../../mapper/hls/HlsMapper.js");
const MapperContext_js_1 = require("../../mapper/MapperContext.js");
/**
 * Convert ham object into a hls manifest.
 *
 * @example
 * Example on how to import the cmaf module and convert the ham `presentations`
 * array into the hls manifest.
 * ```ts
 * import cmaf from '@svta/common-media-library/cmaf-ham';
 *
 * const manifest = cmaf.hamToHls(presentations);
 * ```
 *
 * @param presentation - List of presentations from ham
 * @returns Manifest object containing the Hls manifest as string and its playlists
 *
 * @group CMAF
 * @alpha
 */
function hamToHls(presentation) {
    const mapperContext = MapperContext_js_1.MapperContext.getInstance();
    mapperContext.setStrategy(new HlsMapper_js_1.HlsMapper());
    return mapperContext.getManifestFormat(presentation);
}
//# sourceMappingURL=hamToHls.js.map