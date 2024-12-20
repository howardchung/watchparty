import { HandlerInterface, HandlerRunOptions, HandlerSendOptions, HandlerSendResult, HandlerReceiveOptions, HandlerReceiveResult, HandlerSendDataChannelOptions, HandlerSendDataChannelResult, HandlerReceiveDataChannelOptions, HandlerReceiveDataChannelResult } from './HandlerInterface';
import { IceParameters, DtlsParameters, IceGatheringState, ConnectionState } from '../Transport';
import { RtpCapabilities } from '../RtpParameters';
import { SctpCapabilities } from '../SctpParameters';
export type FakeParameters = {
    generateNativeRtpCapabilities: () => RtpCapabilities;
    generateNativeSctpCapabilities: () => SctpCapabilities;
    generateLocalDtlsParameters: () => DtlsParameters;
};
export declare class FakeHandler extends HandlerInterface {
    private _closed;
    private fakeParameters;
    private _rtpParametersByKind?;
    private _cname;
    private _transportReady;
    private _nextLocalId;
    private _tracks;
    private _nextSctpStreamId;
    /**
     * Creates a factory function.
     */
    static createFactory(fakeParameters: FakeParameters): () => FakeHandler;
    constructor(fakeParameters: any);
    get name(): string;
    close(): void;
    setIceGatheringState(iceGatheringState: IceGatheringState): void;
    setConnectionState(connectionState: ConnectionState): void;
    getNativeRtpCapabilities(): Promise<RtpCapabilities>;
    getNativeSctpCapabilities(): Promise<SctpCapabilities>;
    run({ direction, iceParameters, iceCandidates, dtlsParameters, sctpParameters, iceServers, iceTransportPolicy, proprietaryConstraints, extendedRtpCapabilities, }: HandlerRunOptions): void;
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
    sendDataChannel({ ordered, maxPacketLifeTime, maxRetransmits, label, protocol, }: HandlerSendDataChannelOptions): Promise<HandlerSendDataChannelResult>;
    receive(optionsList: HandlerReceiveOptions[]): Promise<HandlerReceiveResult[]>;
    stopReceiving(localIds: string[]): Promise<void>;
    pauseReceiving(localIds: string[]): Promise<void>;
    resumeReceiving(localIds: string[]): Promise<void>;
    getReceiverStats(localId: string): Promise<RTCStatsReport>;
    receiveDataChannel({ sctpStreamParameters, label, protocol, }: HandlerReceiveDataChannelOptions): Promise<HandlerReceiveDataChannelResult>;
    private setupTransport;
    private assertNotClosed;
}
//# sourceMappingURL=FakeHandler.d.ts.map