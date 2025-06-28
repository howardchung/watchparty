import { MediaSection } from './MediaSection';
import { IceParameters, IceCandidate, DtlsParameters, DtlsRole, PlainRtpParameters } from '../../Transport';
import { ProducerCodecOptions } from '../../Producer';
import { MediaKind, RtpParameters } from '../../RtpParameters';
import { SctpParameters } from '../../SctpParameters';
export declare class RemoteSdp {
    private _iceParameters?;
    private readonly _iceCandidates?;
    private readonly _dtlsParameters?;
    private readonly _sctpParameters?;
    private readonly _plainRtpParameters?;
    private readonly _planB;
    private readonly _mediaSections;
    private readonly _midToIndex;
    private _firstMid?;
    private readonly _sdpObject;
    constructor({ iceParameters, iceCandidates, dtlsParameters, sctpParameters, plainRtpParameters, planB, }: {
        iceParameters?: IceParameters;
        iceCandidates?: IceCandidate[];
        dtlsParameters?: DtlsParameters;
        sctpParameters?: SctpParameters;
        plainRtpParameters?: PlainRtpParameters;
        planB?: boolean;
    });
    updateIceParameters(iceParameters: IceParameters): void;
    updateDtlsRole(role: DtlsRole): void;
    getNextMediaSectionIdx(): {
        idx: number;
        reuseMid?: string;
    };
    send({ offerMediaObject, reuseMid, offerRtpParameters, answerRtpParameters, codecOptions, extmapAllowMixed, }: {
        offerMediaObject: any;
        reuseMid?: string;
        offerRtpParameters: RtpParameters;
        answerRtpParameters: RtpParameters;
        codecOptions?: ProducerCodecOptions;
        extmapAllowMixed?: boolean;
    }): void;
    receive({ mid, kind, offerRtpParameters, streamId, trackId, }: {
        mid: string;
        kind: MediaKind;
        offerRtpParameters: RtpParameters;
        streamId: string;
        trackId: string;
    }): void;
    pauseMediaSection(mid: string): void;
    resumeSendingMediaSection(mid: string): void;
    resumeReceivingMediaSection(mid: string): void;
    disableMediaSection(mid: string): void;
    /**
     * Closes media section. Returns true if the given MID corresponds to a m
     * section that has been indeed closed. False otherwise.
     *
     * NOTE: Closing the first m section is a pain since it invalidates the bundled
     * transport, so instead closing it we just disable it.
     */
    closeMediaSection(mid: string): boolean;
    muxMediaSectionSimulcast(mid: string, encodings: RTCRtpEncodingParameters[]): void;
    planBStopReceiving({ mid, offerRtpParameters, }: {
        mid: string;
        offerRtpParameters: RtpParameters;
    }): void;
    sendSctpAssociation({ offerMediaObject }: {
        offerMediaObject: any;
    }): void;
    receiveSctpAssociation({ oldDataChannelSpec, }?: {
        oldDataChannelSpec?: boolean;
    }): void;
    getSdp(): string;
    _addMediaSection(newMediaSection: MediaSection): void;
    _replaceMediaSection(newMediaSection: MediaSection, reuseMid?: string): void;
    _findMediaSection(mid: string): MediaSection;
    _regenerateBundleMids(): void;
}
//# sourceMappingURL=RemoteSdp.d.ts.map