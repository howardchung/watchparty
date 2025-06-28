import { IceParameters, IceCandidate, DtlsParameters, DtlsRole, PlainRtpParameters } from '../../Transport';
import { ProducerCodecOptions } from '../../Producer';
import { MediaKind, RtpParameters } from '../../RtpParameters';
import { SctpParameters } from '../../SctpParameters';
export declare abstract class MediaSection {
    protected readonly _mediaObject: any;
    protected readonly _planB: boolean;
    constructor({ iceParameters, iceCandidates, dtlsParameters, planB, }: {
        iceParameters?: IceParameters;
        iceCandidates?: IceCandidate[];
        dtlsParameters?: DtlsParameters;
        planB: boolean;
    });
    abstract setDtlsRole(role: DtlsRole): void;
    get mid(): string;
    get closed(): boolean;
    getObject(): object;
    setIceParameters(iceParameters: IceParameters): void;
    pause(): void;
    abstract resume(): void;
    disable(): void;
    close(): void;
}
export declare class AnswerMediaSection extends MediaSection {
    constructor({ iceParameters, iceCandidates, dtlsParameters, sctpParameters, plainRtpParameters, planB, offerMediaObject, offerRtpParameters, answerRtpParameters, codecOptions, extmapAllowMixed, }: {
        iceParameters?: IceParameters;
        iceCandidates?: IceCandidate[];
        dtlsParameters?: DtlsParameters;
        sctpParameters?: SctpParameters;
        plainRtpParameters?: PlainRtpParameters;
        planB?: boolean;
        offerMediaObject: any;
        offerRtpParameters?: RtpParameters;
        answerRtpParameters?: RtpParameters;
        codecOptions?: ProducerCodecOptions;
        extmapAllowMixed?: boolean;
    });
    setDtlsRole(role: DtlsRole): void;
    resume(): void;
    muxSimulcastStreams(encodings: RTCRtpEncodingParameters[]): void;
}
export declare class OfferMediaSection extends MediaSection {
    constructor({ iceParameters, iceCandidates, dtlsParameters, sctpParameters, plainRtpParameters, planB, mid, kind, offerRtpParameters, streamId, trackId, oldDataChannelSpec, }: {
        iceParameters?: IceParameters;
        iceCandidates?: IceCandidate[];
        dtlsParameters?: DtlsParameters;
        sctpParameters?: SctpParameters;
        plainRtpParameters?: PlainRtpParameters;
        planB?: boolean;
        mid: string;
        kind: MediaKind | 'application';
        offerRtpParameters?: RtpParameters;
        streamId?: string;
        trackId?: string;
        oldDataChannelSpec?: boolean;
    });
    setDtlsRole(role: DtlsRole): void;
    resume(): void;
    planBReceive({ offerRtpParameters, streamId, trackId, }: {
        offerRtpParameters: RtpParameters;
        streamId: string;
        trackId: string;
    }): void;
    planBStopReceiving({ offerRtpParameters, }: {
        offerRtpParameters: RtpParameters;
    }): void;
}
//# sourceMappingURL=MediaSection.d.ts.map