import { MediaKind, RtpEncodingParameters } from '../../RtpParameters';
export declare function extractPlainRtpParameters({ sdpObject, kind, }: {
    sdpObject: any;
    kind: MediaKind;
}): {
    ip: string;
    ipVersion: 4 | 6;
    port: number;
};
export declare function getRtpEncodings({ sdpObject, kind, }: {
    sdpObject: any;
    kind: MediaKind;
}): RtpEncodingParameters[];
//# sourceMappingURL=plainRtpUtils.d.ts.map