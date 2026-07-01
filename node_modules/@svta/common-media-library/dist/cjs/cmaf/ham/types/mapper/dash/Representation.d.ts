import type { AudioChannelConfiguration } from './AudioChannelConfiguration.js';
import type { SegmentBase } from './SegmentBase.js';
import type { SegmentList } from './SegmentList.js';
import type { SegmentTemplate } from './SegmentTemplate.js';
/**
 * DASH Representation
 *
 * @group CMAF
 * @alpha
 */
export type Representation = {
    $: {
        audioSamplingRate?: string;
        bandwidth: string;
        codecs?: string;
        frameRate?: string;
        height?: string;
        id: string;
        mimeType?: string;
        sar?: string;
        scanType?: string;
        startWithSAP?: string;
        width?: string;
    };
    AudioChannelConfiguration?: AudioChannelConfiguration[];
    BaseURL?: string[];
    SegmentBase?: SegmentBase[];
    SegmentList?: SegmentList[];
    SegmentTemplate?: SegmentTemplate[];
};
//# sourceMappingURL=Representation.d.ts.map