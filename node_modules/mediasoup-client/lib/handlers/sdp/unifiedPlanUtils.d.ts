import { RtpEncodingParameters } from '../../RtpParameters';
export declare function getRtpEncodings({ offerMediaObject, }: {
    offerMediaObject: any;
}): RtpEncodingParameters[];
/**
 * Adds multi-ssrc based simulcast into the given SDP media section offer.
 */
export declare function addLegacySimulcast({ offerMediaObject, numStreams, }: {
    offerMediaObject: any;
    numStreams: number;
}): void;
//# sourceMappingURL=unifiedPlanUtils.d.ts.map