"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hamToDash = hamToDash;
const DashMapper_js_1 = require("../../mapper/dash/DashMapper.js");
const MapperContext_js_1 = require("../../mapper/MapperContext.js");
/**
 * Convert HAM object into Dash Manifest.
 *
 * @example
 * Example on how to import the cmaf module and convert the ham `presentations`
 * array into the dash manifest.
 * ```ts
 * import cmaf from '@svta/common-media-library/cmaf-ham';
 *
 * const manifest = cmaf.hamToDash(presentations);
 * ```
 *
 * @param presentation - List of presentations from ham
 * @returns Manifest object containing the Dash manifest as string
 *
 * @group CMAF
 * @alpha
 */
function hamToDash(presentation) {
    const mapperContext = MapperContext_js_1.MapperContext.getInstance();
    mapperContext.setStrategy(new DashMapper_js_1.DashMapper());
    return mapperContext.getManifestFormat(presentation);
}
//# sourceMappingURL=hamToDash.js.map