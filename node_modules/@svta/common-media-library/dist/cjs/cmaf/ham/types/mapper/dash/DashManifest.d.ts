import type { Period } from './Period.js';
/**
 * Json representation of the DASH Manifest
 *
 * @group CMAF
 * @alpha
 */
export type DashManifest = {
    MPD: {
        $?: {
            maxSegmentDuration?: string;
            mediaPresentationDuration?: string;
            minBufferTime?: string;
            profiles?: string;
            type?: string;
            xmlns?: string;
        };
        Period: Period[];
    };
};
//# sourceMappingURL=DashManifest.d.ts.map