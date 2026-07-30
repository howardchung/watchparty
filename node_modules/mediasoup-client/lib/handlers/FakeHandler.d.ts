import { EnhancedEventEmitter } from '../enhancedEvents';
import type { IceParameters, DtlsParameters, IceGatheringState, ConnectionState } from '../Transport';
import type { RtpCapabilities } from '../RtpParameters';
import type { SctpCapabilities } from '../SctpParameters';
import type { HandlerFactory, HandlerInterface, HandlerEvents, HandlerSendOptions, HandlerSendResult, HandlerReceiveOptions, HandlerReceiveResult, HandlerSendDataChannelOptions, HandlerSendDataChannelResult, HandlerReceiveDataChannelOptions, HandlerReceiveDataChannelResult } from './HandlerInterface';
export type FakeParameters = {
    generateNativeRtpCapabilities: () => RtpCapabilities;
    generateNativeSctpCapabilities: () => SctpCapabilities;
    generateLocalDtlsParameters: () => DtlsParameters;
};
export declare class FakeHandler extends EnhancedEventEmitter<HandlerEvents> implements HandlerInterface {
    private _closed;
    private _fakeParameters;
    private _getSendExtendedRtpCapabilities;
    private _cname;
    private _defaultSendStreamId;
    private _transportReady;
    private _nextLocalId;
    private _tracks;
    private _nextSctpStreamId;
    /**
     * Creates a factory function.
     */
    static createFactory(fakeParameters: FakeParameters): HandlerFactory;
    private static getLocalRtpCapabilities;
    private constructor();
    get name(): string;
    close(): void;
    setIceGatheringState(iceGatheringState: IceGatheringState): void;
    setConnectionState(connectionState: ConnectionState): void;
    updateIceServers(iceServers: RTCIceServer[]): Promise<void>;
    restartIce(iceParameters: IceParameters): Promise<void>;
    getTransportStats(): Promise<RTCStatsReport>;
    send({ track, streamId, encodings, codecOptions, codec }: HandlerSendOptions): Promise<HandlerSendResult>;
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
    private assertNotClosed;
}
//# sourceMappingURL=FakeHandler.d.ts.map