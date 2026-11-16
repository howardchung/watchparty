import type { Manifest } from '../../types/manifest/Manifest.js';
import type { Presentation } from '../../types/model/Presentation.js';
import type { Mapper } from '../Mapper.js';
export declare class DashMapper implements Mapper {
    private manifest;
    getManifestMetadata(): JSON | undefined;
    toHam(manifest: Manifest): Presentation[];
    toManifest(presentation: Presentation[]): Manifest;
}
//# sourceMappingURL=DashMapper.d.ts.map