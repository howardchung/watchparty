import type { Manifest } from '../../types/manifest/Manifest.js';
import type { Presentation } from '../../types/model/Presentation.js';
import type { Mapper } from '../Mapper.js';
export declare class HlsMapper implements Mapper {
    private manifest;
    getManifestMetadata(): any | undefined;
    toHam(manifest: Manifest): Presentation[];
    toManifest(presentation: Presentation[]): Manifest;
}
//# sourceMappingURL=HlsMapper.d.ts.map