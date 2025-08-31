import { RtpCapabilities, RtpParameters } from '../../RtpParameters';
/**
 * Normalize ORTC based Edge's RTCRtpReceiver.getCapabilities() to produce a full
 * compliant ORTC RTCRtpCapabilities.
 */
export declare function getCapabilities(): RtpCapabilities;
/**
 * Generate RTCRtpParameters as ORTC based Edge likes.
 */
export declare function mangleRtpParameters(rtpParameters: RtpParameters): RtpParameters;
//# sourceMappingURL=edgeUtils.d.ts.map