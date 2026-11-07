import { EnhancedEventEmitter } from '../enhancedEvents';
import type { IceParameters } from '../Transport';
import type { HandlerFactory, HandlerInterface, HandlerEvents, HandlerOptions, HandlerSendOptions, HandlerSendResult, HandlerReceiveOptions, HandlerReceiveResult, HandlerSendDataChannelOptions, HandlerSendDataChannelResult, HandlerReceiveDataChannelOptions, HandlerReceiveDataChannelResult } from './HandlerInterface';
export declare class Safari12 extends EnhancedEventEmitter<HandlerEvents> implements HandlerInterface {
    private _closed;
    private _direction;
    private _remoteSdp;
    private _getSendExtendedRtpCapabilities;
    private _forcedLocalDtlsRole?;
    private _pc;
    private readonly _mapMidTransceiver;
    private readonly _sendStream;
    private _hasDataChannelMediaSection;
    private _nextSendSctpStreamId;
    private _transportReady;
    /**
     * Creates a factory function.
     */
    static createFactory(): HandlerFactory;
    private static getLocalRtpCapabilities;
    constructor({ direction, iceParameters, iceCandidates, dtlsParameters, sctpParameters, iceServers, iceTransportPolicy, additionalSettings, getSendExtendedRtpCapabilities, }: HandlerOptions);
    get name(): string;
    close(): void;
    updateIceServers(iceServers: RTCIceServer[]): Promise<void>;
    restartIce(iceParameters: IceParameters): Promise<void>;
    getTransportStats(): Promise<RTCStatsReport>;
    send({ track, streamId, encodings, codecOptions, headerExtensionOptions, codec, onRtpSender, }: HandlerSendOptions): Promise<HandlerSendResult>;
    stopSending(localId: string): Promise<void>;
    pauseSending(localId: string): Promise<void>;
    resumeSending(localId: string): Promise<void>;
    replaceTrack(localId: string, track: MediaStreamTrack | null): Promise<void>;
    setMaxSpatialLayer(localId: string, spatialLayer: number): Promise<void>;
    setRtpEncodingParameters(localId: string, params: Partial<RTCRtpEncodingParameters>): Promise<void>;
    getSenderStats(localId: string): Promise<RTCStatsReport>;
    sendDataChannel({ ordered, maxPacketLifeTime, maxRetransmits, label, protocol, }: HandlerSendDataChannelOptions): Promise<HandlerSendDataChannelResult>;
    receive(optionsList: HandlerReceiveOptions[]): Promise<HandlerReceiveResult[]>;
    stopReceiving(localIds: string[]): Promise<void>;
    pauseReceiving(localIds: string[]): Promise<void>;
    resumeReceiving(localIds: string[]): Promise<void>;
    getReceiverStats(localId: string): Promise<RTCStatsReport>;
    receiveDataChannel({ sctpStreamParameters, label, protocol, }: HandlerReceiveDataChannelOptions): Promise<HandlerReceiveDataChannelResult>;
    private setupTransport;
    private onIceGatheringStateChange;
    private onIceCandidateError;
    private onConnectionStateChange;
    private onIceConnectionStateChange;
    private assertNotClosed;
    private assertSendDirection;
    private assertRecvDirection;
}
//# sourceMappingURL=Safari12.d.ts.map