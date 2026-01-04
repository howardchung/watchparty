import type { ManifestFormat } from './ManifestFormat.js';
/**
 * Manifest object received as an input by the conversion to HAM object
 *
 * @group CMAF
 * @alpha
 */
export type Manifest = {
    manifest: string;
    fileName?: string;
    ancillaryManifests?: Manifest[];
    type: ManifestFormat;
    metadata?: Map<string, string>;
};
//# sourceMappingURL=Manifest.d.ts.map