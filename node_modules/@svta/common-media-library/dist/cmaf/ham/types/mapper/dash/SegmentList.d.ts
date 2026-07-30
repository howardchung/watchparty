import type { Initialization } from './Initialization.js';
import type { SegmentURL } from './SegmentUrl.js';
/**
 * DASH Segment List
 *
 * @group CMAF
 * @alpha
 */
export type SegmentList = {
    $: {
        duration: string;
        timescale: string;
    };
    Initialization: Initialization[];
    SegmentURL?: SegmentURL[];
};
//# sourceMappingURL=SegmentList.d.ts.map