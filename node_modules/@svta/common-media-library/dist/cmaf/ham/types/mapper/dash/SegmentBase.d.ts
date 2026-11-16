import type { Initialization } from './Initialization.js';
/**
 * DASH Segment Base
 *
 * @group CMAF
 * @alpha
 */
export type SegmentBase = {
    $: {
        indexRange: string;
        indexRangeExact: string;
        timescale: string;
    };
    Initialization: Initialization[];
};
//# sourceMappingURL=SegmentBase.d.ts.map