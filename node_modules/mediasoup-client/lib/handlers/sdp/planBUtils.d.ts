import { RtpEncodingParameters } from '../../RtpParameters';
export declare function getRtpEncodings({ offerMediaObject, track, }: {
    offerMediaObject: any;
    track: MediaStreamTrack;
}): RtpEncodingParameters[];
/**
 * Adds multi-ssrc based simulcast into the given SDP media section offer.
 */
export declare function addLegacySimulcast({ offerMediaObject, track, numStreams, }: {
    offerMediaObject: any;
    track: MediaStreamTrack;
    numStreams: number;
}): void;
//# sourceMappingURL=planBUtils.d.ts.map