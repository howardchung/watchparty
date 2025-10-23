import * as stream from 'stream';

export as namespace NodeDataChannel;

// Enum in d.ts is tricky
export type LogLevel = 'Verbose' | 'Debug' | 'Info' | 'Warning' | 'Error' | 'Fatal';

// SCTP Settings
export interface SctpSettings {
    recvBufferSize?: number;
    sendBufferSize?: number;
    maxChunksOnQueue?: number;
    initialCongestionWindow?: number;
    congestionControlModule?: number;
    delayedSackTime?: number;
}

// Functions
export function preload(): void;
export function initLogger(level: LogLevel, callback?: (level: LogLevel, message: string) => void): void;
export function cleanup(): void;
export function setSctpSettings(settings: SctpSettings): void;

// Proxy Server
export type ProxyServerType = 'Socks5' | 'Http';
export interface ProxyServer {
    type: ProxyServerType;
    ip: string;
    port: number;
    username?: string;
    password?: string;
}

export const enum RelayType {
    TurnUdp = 'TurnUdp',
    TurnTcp = 'TurnTcp',
    TurnTls = 'TurnTls',
}

export interface IceServer {
    hostname: string;
    port: number;
    username?: string;
    password?: string;
    relayType?: RelayType;
}

export type TransportPolicy = 'all' | 'relay';

export interface RtcConfig {
    iceServers: (string | IceServer)[];
    proxyServer?: ProxyServer;
    bindAddress?: string;
    enableIceTcp?: boolean;
    enableIceUdpMux?: boolean;
    disableAutoNegotiation?: boolean;
    forceMediaTransport?: boolean;
    portRangeBegin?: number;
    portRangeEnd?: number;
    maxMessageSize?: number;
    mtu?: number;
    iceTransportPolicy?: TransportPolicy;
}

// Lowercase to match the description type string from libdatachannel
export enum DescriptionType {
    Unspec = 'unspec',
    Offer = 'offer',
    Answer = 'answer',
    Pranswer = 'pranswer',
    Rollback = 'rollback',
}

export interface DataChannelInitConfig {
    protocol?: string;
    negotiated?: boolean;
    id?: number;
    unordered?: boolean; // Reliability
    maxPacketLifeTime?: number; // Reliability
    maxRetransmits?: number; // Reliability
}

export interface SelectedCandidateInfo {
    address: string;
    port: number;
    type: string;
    transportType: string;
    candidate: string;
    mid: string;
    priority: number;
}

// Must be same as rtc enum class Direction
export const enum Direction {
    SendOnly = 'SendOnly',
    RecvOnly = 'RecvOnly',
    SendRecv = 'SendRecv',
    Inactive = 'Inactive',
    Unknown = 'Unknown',
}

export class RtcpReceivingSession {
    //
}

export class Audio {
    constructor(mid: string, dir: Direction);
    addAudioCodec(payloadType: number, codec: string, profile?: string): void;
    addOpusCodec(payloadType: number, profile?: string): string;

    direction(): Direction;
    generateSdp(eol: string, addr: string, port: number): string;
    mid(): string;
    setDirection(dir: Direction): void;
    description(): string;
    removeFormat(fmt: string): void;
    addSSRC(ssrc: number, name?: string, msid?: string, trackID?: string): void;
    removeSSRC(ssrc: number): void;
    replaceSSRC(oldSsrc: number, ssrc: number, name?: string, msid?: string, trackID?: string): void;
    hasSSRC(ssrc: number): boolean;
    getSSRCs(): number[];
    getCNameForSsrc(ssrc: number): string;
    setBitrate(bitRate: number): void;
    getBitrate(): number;
    hasPayloadType(payloadType: number): boolean;
    addRTXCodec(payloadType: number, originalPayloadType: number, clockRate: number): void;
    addRTPMap(): void;
    parseSdpLine(line: string): void;
}

export class Video {
    constructor(mid: string, dir: Direction);
    addVideoCodec(payloadType: number, codec: string, profile?: string): void;
    addH264Codec(payloadType: number, profile?: string): void;
    addVP8Codec(payloadType: number): void;
    addVP9Codec(payloadType: number): void;

    direction(): Direction;
    generateSdp(eol: string, addr: string, port: number): string;
    mid(): string;
    setDirection(dir: Direction): void;
    description(): string;
    removeFormat(fmt: string): void;
    addSSRC(ssrc: number, name?: string, msid?: string, trackID?: string): void;
    removeSSRC(ssrc: number): void;
    replaceSSRC(oldSsrc: number, ssrc: number, name?: string, msid?: string, trackID?: string): void;
    hasSSRC(ssrc: number): boolean;
    getSSRCs(): number[];
    getCNameForSsrc(ssrc: number): string;
    setBitrate(bitRate: number): void;
    getBitrate(): number;
    hasPayloadType(payloadType: number): boolean;
    addRTXCodec(payloadType: number, originalPayloadType: number, clockRate: number): void;
    addRTPMap(): void;
    parseSdpLine(line: string): void;
}

export class Track {
    direction(): Direction;
    mid(): string;
    type(): string;
    close(): void;
    sendMessage(msg: string): boolean;
    sendMessageBinary(buffer: Buffer): boolean;
    isOpen(): boolean;
    isClosed(): boolean;
    bufferedAmount(): number;
    maxMessageSize(): number;
    requestBitrate(bitRate: number): boolean;
    setBufferedAmountLowThreshold(newSize: number): void;
    requestKeyframe(): boolean;
    setMediaHandler(handler: RtcpReceivingSession): void;
    onOpen(cb: () => void): void;
    onClosed(cb: () => void): void;
    onError(cb: (err: string) => void): void;
    onMessage(cb: (msg: Buffer) => void): void;
}

export interface Channel {
    close(): void;
    sendMessage(msg: string): boolean;
    sendMessageBinary(buffer: Uint8Array): boolean;
    isOpen(): boolean;
    bufferedAmount(): number;
    maxMessageSize(): number;
    setBufferedAmountLowThreshold(newSize: number): void;
    onOpen(cb: () => void): void;
    onClosed(cb: () => void): void;
    onError(cb: (err: string) => void): void;
    onBufferedAmountLow(cb: () => void): void;
    onMessage(cb: (msg: string | Buffer) => void): void;
}
export class DataChannel implements Channel {
    getLabel(): string;
    getId(): number;
    getProtocol(): string;

    // Channel implementation
    close(): void;
    sendMessage(msg: string): boolean;
    sendMessageBinary(buffer: Uint8Array): boolean;
    isOpen(): boolean;
    bufferedAmount(): number;
    maxMessageSize(): number;
    setBufferedAmountLowThreshold(newSize: number): void;
    onOpen(cb: () => void): void;
    onClosed(cb: () => void): void;
    onError(cb: (err: string) => void): void;
    onBufferedAmountLow(cb: () => void): void;
    onMessage(cb: (msg: string | Buffer) => void): void;
}

export interface WebSocketConfiguration {
    disableTlsVerification?: boolean; // default = false, if true, don't verify the TLS certificate
    proxyServer?: ProxyServer; // only non-authenticated http supported for now
    protocols?: string[];
    connectionTimeout?: number; // miliseconds, zero to disable
    pingInterval?: number; // millisecondrs, zero to disable
    maxOutstandingPings?: number;
    caCertificatePemFile?: string;
    certificatePemFile?: string;
    keyPemFile?: string;
    keyPemPass?: string;
    maxMessageSize: number;
}
export class WebSocket implements Channel {
    constructor(config?: WebSocketConfiguration);
    open(url: string): void;
    forceClose(): void;
    remoteAddress(): string | undefined;
    path(): string | undefined;

    // Channel implementation
    close(): void;
    sendMessage(msg: string): boolean;
    sendMessageBinary(buffer: Uint8Array): boolean;
    isOpen(): boolean;
    bufferedAmount(): number;
    maxMessageSize(): number;
    setBufferedAmountLowThreshold(newSize: number): void;
    onOpen(cb: () => void): void;
    onClosed(cb: () => void): void;
    onError(cb: (err: string) => void): void;
    onBufferedAmountLow(cb: () => void): void;
    onMessage(cb: (msg: string | Buffer) => void): void;
}

export interface WebSocketServerConfiguration {
    port?: number; // default 8080
    enableTls?: boolean; // default = false;
    certificatePemFile?: string;
    keyPemFile?: string;
    keyPemPass?: string;
    bindAddress?: string;
    connectionTimeout?: number; // milliseconds
    maxMessageSize?: number;
}

export class WebSocketServer {
    constructor(config?: WebSocketServerConfiguration);
    port(): number;
    stop(): void;
    onClient(cb: (ws: WebSocket) => void): void;
}

export class PeerConnection {
    constructor(peerName: string, config: RtcConfig);
    close(): void;
    setLocalDescription(type?: DescriptionType): void;
    setRemoteDescription(sdp: string, type: DescriptionType): void;
    localDescription(): { type: string; sdp: string } | null;
    remoteDescription(): { type: string; sdp: string } | null;
    addRemoteCandidate(candidate: string, mid: string): void;
    createDataChannel(label: string, config?: DataChannelInitConfig): DataChannel;
    addTrack(media: Video | Audio): Track;
    hasMedia(): boolean;
    state(): RTCPeerConnectionState;
    iceState(): RTCIceConnectionState;
    signalingState(): RTCSignalingState;
    gatheringState(): RTCIceGatheringState;
    onLocalDescription(cb: (sdp: string, type: DescriptionType) => void): void;
    onLocalCandidate(cb: (candidate: string, mid: string) => void): void;
    onStateChange(cb: (state: string) => void): void;
    onIceStateChange(cb: (state: string) => void): void;
    onSignalingStateChange(cb: (state: string) => void): void;
    onGatheringStateChange(cb: (state: string) => void): void;
    onDataChannel(cb: (dc: DataChannel) => void): void;
    onTrack(cb: (track: Track) => void): void;
    bytesSent(): number;
    bytesReceived(): number;
    rtt(): number;
    getSelectedCandidatePair(): { local: SelectedCandidateInfo; remote: SelectedCandidateInfo } | null;
    maxDataChannelId(): number;
    maxMessageSize(): number;
}

export class DataChannelStream extends stream.Duplex {
    constructor(rawChannel: DataChannel, options?: Omit<stream.DuplexOptions, 'objectMode'>);
    get label(): string;
}
