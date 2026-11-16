"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashToHam = dashToHam;
const DashMapper_js_1 = require("../../mapper/dash/DashMapper.js");
const MapperContext_js_1 = require("../../mapper/MapperContext.js");
/**
 * Convert dash manifest into a ham object.
 *
 * @example
 * Example on how to import the cmaf module and convert the dash `manifest`
 * into the ham manifest.
 * ```ts
 * import cmaf from '@svta/common-media-library/cmaf-ham';
 *
 * const manifest = cmaf.dashToHam(dashManifest);
 * ```
 *
 * @param manifest - String of the XML Dash manifest
 * @returns List of presentations from ham
 *
 * @group CMAF
 * @alpha
 */
function dashToHam(manifest) {
    const mapperContext = MapperContext_js_1.MapperContext.getInstance();
    mapperContext.setStrategy(new DashMapper_js_1.DashMapper());
    return mapperContext.getHamFormat({ manifest, type: 'dash' });
}
//# sourceMappingURL=dashToHam.js.map