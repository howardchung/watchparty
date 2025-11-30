import type { Manifest } from '../types/manifest/Manifest.js';
import type { Presentation } from '../types/model/Presentation.js';
import type { Mapper } from './Mapper.js';
export declare class MapperContext {
    private strategy;
    private static instance;
    private constructor();
    static getInstance(): MapperContext;
    setStrategy(strategy: Mapper): void;
    getHamFormat(manifest: Manifest): Presentation[];
    getManifestFormat(presentation: Presentation[]): Manifest;
    getManifestMetadata(): JSON | undefined;
}
//# sourceMappingURL=MapperContext.d.ts.map