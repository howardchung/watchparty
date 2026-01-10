import type * as SdpTransform from 'sdp-transform';
import type { IceParameters, IceCandidate, DtlsParameters, DtlsRole, PlainRtpParameters } from '../../Transport';
import type { ProducerCodecOptions } from '../../Producer';
import type { MediaKind, RtpParameters } from '../../RtpParameters';
import type { SctpParameters } from '../../SctpParameters';
export declare class RemoteSdp {
    private _iceParameters?;
    private readonly _iceCandidates?;
    private readonly _dtlsParameters?;
    private readonly _sctpParameters?;
    private readonly _plainRtpParameters?;
    private readonly _mediaSections;
    private readonly _midToIndex;
    private _firstMid?;
    private readonly _sdpObject;
    constructor({ iceParameters, iceCandidates, dtlsParameters, sctpParameters, plainRtpParameters, }: {
        iceParameters?: IceParameters;
        iceCandidates?: IceCandidate[];
        dtlsParameters?: DtlsParameters;
        sctpParameters?: SctpParameters;
        plainRtpParameters?: PlainRtpParameters;
    });
    updateIceParameters(iceParameters: IceParameters): void;
    updateDtlsRole(role: DtlsRole): void;
    /**
     * Set session level a=extmap-allow-mixed attibute.
     */
    setSessionExtmapAllowMixed(): void;
    getNextMediaSectionIdx(): {
        idx: number;
        reuseMid?: string;
    };
    send({ offerMediaObject, reuseMid, offerRtpParameters, answerRtpParameters, codecOptions, }: {
        offerMediaObject: SdpTransform.MediaDescription;
        reuseMid?: string;
        offerRtpParameters: RtpParameters;
        answerRtpParameters: RtpParameters;
        codecOptions?: ProducerCodecOptions;
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
    sendSctpAssociation({ offerMediaObject, }: {
        offerMediaObject: SdpTransform.MediaDescription;
    }): void;
    receiveSctpAssociation(): void;
    getSdp(): string;
    private addMediaSection;
    private replaceMediaSection;
    private findMediaSection;
    private regenerateBundleMids;
}
//# sourceMappingURL=RemoteSdp.d.ts.map