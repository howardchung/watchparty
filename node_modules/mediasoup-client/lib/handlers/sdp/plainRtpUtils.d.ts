import type * as SdpTransform from 'sdp-transform';
import type { MediaKind, RtpEncodingParameters } from '../../RtpParameters';
export declare function extractPlainRtpParameters({ sdpObject, kind, }: {
    sdpObject: SdpTransform.SessionDescription;
    kind: MediaKind;
}): {
    ip: string;
    ipVersion: number;
    port: number;
};
export declare function getRtpEncodings({ sdpObject, kind, }: {
    sdpObject: SdpTransform.SessionDescription;
    kind: MediaKind;
}): RtpEncodingParameters[];
//# sourceMappingURL=plainRtpUtils.d.ts.map