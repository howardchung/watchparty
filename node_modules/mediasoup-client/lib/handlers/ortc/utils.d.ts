import type { RtpCapabilities, MediaKind, RtpHeaderExtensionUri, RtpHeaderExtensionDirection } from '../../RtpParameters';
/**
 * This function adds RTCP NACK support for OPUS codec in given capabilities.
 */
export declare function addNackSupportForOpus(rtpCapabilities: RtpCapabilities): void;
/**
 * This function adds the given RTP header extension to given capabilities.
 */
export declare function addHeaderExtensionSupport(rtpCapabilities: RtpCapabilities, headerExtension: {
    uri: RtpHeaderExtensionUri;
    kind: MediaKind;
    direction: RtpHeaderExtensionDirection;
}): void;
export declare function getMsidStreamIdAndTrackId(msid?: string): {
    msidStreamId?: string;
    msidTrackId?: string;
};
//# sourceMappingURL=utils.d.ts.map