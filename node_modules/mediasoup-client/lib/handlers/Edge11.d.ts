import { HandlerFactory, HandlerInterface, HandlerRunOptions, HandlerSendOptions, HandlerSendResult, HandlerReceiveOptions, HandlerReceiveResult, HandlerSendDataChannelOptions, HandlerSendDataChannelResult, HandlerReceiveDataChannelOptions, HandlerReceiveDataChannelResult } from './HandlerInterface';
import { IceParameters } from '../Transport';
import { RtpCapabilities } from '../RtpParameters';
import { SctpCapabilities } from '../SctpParameters';
export declare class Edge11 extends HandlerInterface {
    private _sendingRtpParametersByKind?;
    private _remoteIceParameters?;
    private _remoteIceCandidates?;
    private _remoteDtlsParameters?;
    private _iceGatherer?;
    private _iceTransport?;
    private _dtlsTransport?;
    private readonly _rtpSenders;
    private readonly _rtpReceivers;
    private _nextSendLocalId;
    private _cname?;
    private _transportReady;
    /**
     * Creates a factory function.
     */
    static createFactory(): HandlerFactory;
    constructor();
    get name(): string;
    close(): void;
    getNativeRtpCapabilities(): Promise<RtpCapabilities>;
    getNativeSctpCapabilities(): Promise<SctpCapabilities>;
    run({ direction, // eslint-disable-line @typescript-eslint/no-unused-vars
    iceParameters, iceCandidates, dtlsParameters, sctpParameters, // eslint-disable-line @typescript-eslint/no-unused-vars
    iceServers, iceTransportPolicy, additionalSettings, // eslint-disable-line @typescript-eslint/no-unused-vars
    proprietaryConstraints, // eslint-disable-line @typescript-eslint/no-unused-vars
    extendedRtpCapabilities, }: HandlerRunOptions): void;
    updateIceServers(iceServers: RTCIceServer[]): Promise<void>;
    restartIce(iceParameters: IceParameters): Promise<void>;
    getTransportStats(): Promise<RTCStatsReport>;
    send({ track, encodings, codecOptions, codec }: HandlerSendOptions): Promise<HandlerSendResult>;
    stopSending(localId: string): Promise<void>;
    pauseSending(localId: string): Promise<void>;
    resumeSending(localId: string): Promise<void>;
    replaceTrack(localId: string, track: MediaStreamTrack | null): Promise<void>;
    setMaxSpatialLayer(localId: string, spatialLayer: number): Promise<void>;
    setRtpEncodingParameters(localId: string, params: any): Promise<void>;
    getSenderStats(localId: string): Promise<RTCStatsReport>;
    sendDataChannel(options: HandlerSendDataChannelOptions): Promise<HandlerSendDataChannelResult>;
    receive(optionsList: HandlerReceiveOptions[]): Promise<HandlerReceiveResult[]>;
    stopReceiving(localIds: string[]): Promise<void>;
    pauseReceiving(localIds: string[]): Promise<void>;
    resumeReceiving(localIds: string[]): Promise<void>;
    getReceiverStats(localId: string): Promise<RTCStatsReport>;
    receiveDataChannel(options: HandlerReceiveDataChannelOptions): Promise<HandlerReceiveDataChannelResult>;
    private setIceGatherer;
    private setIceTransport;
    private setDtlsTransport;
    private setupTransport;
}
//# sourceMappingURL=Edge11.d.ts.map