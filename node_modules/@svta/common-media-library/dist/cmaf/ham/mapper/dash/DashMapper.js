import { mapDashToHam } from './mapDashToHam/mapDashToHam.js';
import { mapHamToDash } from './mapHamToDash/mapHamToDash.js';
import { parseDashManifest } from '../../utils/dash/parseDashManifest.js';
import { addMetadataToDash } from '../../utils/manifest/addMetadataToDash.js';
import { getMetadata } from '../../utils/manifest/getMetadata.js';
export class DashMapper {
    getManifestMetadata() {
        return getMetadata(this.manifest);
    }
    toHam(manifest) {
        const dashManifest = parseDashManifest(manifest.manifest);
        if (!dashManifest) {
            return [];
        }
        addMetadataToDash(dashManifest, manifest);
        return mapDashToHam(dashManifest);
    }
    toManifest(presentation) {
        const manifest = mapHamToDash(presentation);
        return { manifest, ancillaryManifests: [], type: 'dash' };
    }
}
//# sourceMappingURL=DashMapper.js.map