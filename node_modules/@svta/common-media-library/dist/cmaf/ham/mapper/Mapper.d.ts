import type { Manifest } from '../types/manifest/Manifest.js';
import type { Presentation } from '../types/model/Presentation.js';
export type Mapper = {
    toHam(manifest: Manifest): Presentation[];
    toManifest(presentation: Presentation[]): Manifest;
    getManifestMetadata(): any | undefined;
};
//# sourceMappingURL=Mapper.d.ts.map