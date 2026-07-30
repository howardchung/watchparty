import type * as SdpTransform from 'sdp-transform';
import type { IceParameters, IceCandidate, DtlsParameters, DtlsRole, PlainRtpParameters } from '../../Transport';
import type { ProducerCodecOptions } from '../../Producer';
import type { MediaKind, RtpParameters } from '../../RtpParameters';
import type { SctpParameters } from '../../SctpParameters';
export declare abstract class MediaSection {
    protected readonly _mediaObject: SdpTransform.MediaDescription;
    constructor({ iceParameters, iceCandidates, dtlsParameters, }: {
        iceParameters?: IceParameters;
        iceCandidates?: IceCandidate[];
        dtlsParameters?: DtlsParameters;
    });
    abstract setDtlsRole(role: DtlsRole): void;
    get mid(): string;
    get closed(): boolean;
    getObject(): SdpTransform.MediaDescription;
    setIceParameters(iceParameters: IceParameters): void;
    pause(): void;
    abstract resume(): void;
    disable(): void;
    close(): void;
}
export declare class AnswerMediaSection extends MediaSection {
    constructor({ iceParameters, iceCandidates, dtlsParameters, sctpParameters, plainRtpParameters, offerMediaObject, offerRtpParameters, answerRtpParameters, codecOptions, }: {
        iceParameters?: IceParameters;
        iceCandidates?: IceCandidate[];
        dtlsParameters?: DtlsParameters;
        sctpParameters?: SctpParameters;
        plainRtpParameters?: PlainRtpParameters;
        offerMediaObject: SdpTransform.MediaDescription;
        offerRtpParameters?: RtpParameters;
        answerRtpParameters?: RtpParameters;
        codecOptions?: ProducerCodecOptions;
    });
    setDtlsRole(role: DtlsRole): void;
    resume(): void;
    muxSimulcastStreams(encodings: RTCRtpEncodingParameters[]): void;
}
export declare class OfferMediaSection extends MediaSection {
    constructor({ iceParameters, iceCandidates, dtlsParameters, sctpParameters, plainRtpParameters, mid, kind, offerRtpParameters, streamId, trackId, }: {
        iceParameters?: IceParameters;
        iceCandidates?: IceCandidate[];
        dtlsParameters?: DtlsParameters;
        sctpParameters?: SctpParameters;
        plainRtpParameters?: PlainRtpParameters;
        mid: string;
        kind: MediaKind | 'application';
        offerRtpParameters?: RtpParameters;
        streamId?: string;
        trackId?: string;
    });
    setDtlsRole(role: DtlsRole): void;
    resume(): void;
}
//# sourceMappingURL=MediaSection.d.ts.map