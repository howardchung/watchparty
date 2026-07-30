import type { AudioChannelConfiguration } from './AudioChannelConfiguration.js';
import type { ContentComponent } from './ContentComponent.js';
import type { Representation } from './Representation.js';
import type { Role } from './Role.js';
import type { SegmentList } from './SegmentList.js';
import type { SegmentTemplate } from './SegmentTemplate.js';
/**
 * DASH Adaptation Set
 *
 * @group CMAF
 * @alpha
 */
export type AdaptationSet = {
    $: {
        audioSamplingRate?: string;
        codecs?: string;
        contentType?: string;
        frameRate?: string;
        group?: string;
        id?: string;
        lang?: string;
        maxBandwidth?: string;
        maxFrameRate?: string;
        maxHeight?: string;
        maxWidth?: string;
        mimeType?: string;
        minBandwidth?: string;
        par?: string;
        sar?: string;
        segmentAlignment: string;
        startWithSAP?: string;
        subsegmentAlignment?: string;
        subsegmentStartsWithSAP?: string;
    };
    AudioChannelConfiguration?: AudioChannelConfiguration[];
    ContentComponent?: ContentComponent[];
    Role?: Role[];
    Representation: Representation[];
    SegmentTemplate?: SegmentTemplate[];
    SegmentList?: SegmentList[];
};
//# sourceMappingURL=AdaptationSet.d.ts.map