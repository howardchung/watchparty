import { DashMapper } from '../../mapper/dash/DashMapper.js';
import { MapperContext } from '../../mapper/MapperContext.js';
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
export function dashToHam(manifest) {
    const mapperContext = MapperContext.getInstance();
    mapperContext.setStrategy(new DashMapper());
    return mapperContext.getHamFormat({ manifest, type: 'dash' });
}
//# sourceMappingURL=dashToHam.js.map