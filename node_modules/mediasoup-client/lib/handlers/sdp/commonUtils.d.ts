import type * as SdpTransform from 'sdp-transform';
import type { DtlsParameters } from '../../Transport';
import type { RtpCapabilities, RtpHeaderExtensionUri, RtpParameters } from '../../RtpParameters';
/**
 * This function extracs RTP capabilities from the given SDP.
 *
 * BUNDLE is assumed so, as per spec, all media sections in the SDP must share
 * same ids for codecs and RTP extensions.
 */
export declare function extractRtpCapabilities({ sdpObject, }: {
    sdpObject: SdpTransform.SessionDescription;
}): RtpCapabilities;
export declare function extractDtlsParameters({ sdpObject, }: {
    sdpObject: SdpTransform.SessionDescription;
}): DtlsParameters;
export declare function getCname({ offerMediaObject, }: {
    offerMediaObject: SdpTransform.MediaDescription;
}): string;
/**
 * Apply codec parameters in the given SDP m= section answer based on the
 * given RTP parameters of an offer.
 */
export declare function applyCodecParameters({ offerRtpParameters, answerMediaObject, }: {
    offerRtpParameters: RtpParameters;
    answerMediaObject: SdpTransform.MediaDescription;
}): void;
/**
 * Add header extension in the given SDP m= section offer.
 */
export declare function addHeaderExtension({ offerMediaObject, headerExtensionUri, headerExtensionId, }: {
    offerMediaObject: SdpTransform.MediaDescription;
    headerExtensionUri: RtpHeaderExtensionUri;
    headerExtensionId: number;
}): void;
//# sourceMappingURL=commonUtils.d.ts.map