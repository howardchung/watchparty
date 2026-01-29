import { mapHamToHls } from './mapHamToHls/mapHamToHls.js';
import { mapHlsToHam } from './mapHlsToHam/mapHlsToHam.js';
import { getMetadata } from '../../utils/manifest/getMetadata.js';
export class HlsMapper {
    getManifestMetadata() {
        return getMetadata(this.manifest);
    }
    toHam(manifest) {
        const presentations = mapHlsToHam(manifest);
        this.manifest = manifest;
        return presentations;
    }
    toManifest(presentation) {
        return mapHamToHls(presentation);
    }
}
//# sourceMappingURL=HlsMapper.js.map