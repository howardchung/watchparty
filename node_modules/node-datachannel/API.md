# API

## PeerConnection Class

**Constructor**

let pc = new PeerConnection(peerName[,options])

-   peerName `<string>` Peer name to use for logs etc..
-   options `<Object>` WebRTC Config Options

```
export interface RtcConfig {
    iceServers: (string | IceServer)[];
    proxyServer?: ProxyServer;
    bindAddress?: string;
    enableIceTcp?: boolean;
    enableIceUdpMux?: boolean;
    portRangeBegin?: number;
    portRangeEnd?: number;
    maxMessageSize?: number;
    mtu?: number;
    iceTransportPolicy?: TransportPolicy;
}

export const enum RelayType {
    TurnUdp = 'TurnUdp',
    TurnTcp = 'TurnTcp',
    TurnTls = 'TurnTls'
}

export interface IceServer {
    hostname: string;
    port: number;
    username?: string;
    password?: string;
    relayType?: RelayType;
}

export type TransportPolicy = 'all' | 'relay';

"iceServers" option is an array of stun/turn server urls
Examples;
STUN Server Example          : stun:stun.l.google.com:19302
TURN Server Example          : turn:USERNAME:PASSWORD@TURN_IP_OR_ADDRESS:PORT
TURN Server Example (TCP)    : turn:USERNAME:PASSWORD@TURN_IP_OR_ADDRESS:PORT?transport=tcp
TURN Server Example (TLS)    : turns:USERNAME:PASSWORD@TURN_IP_OR_ADDRESS:PORT

```

**close: () => void**

Close Peer Connection

**destroy: () => void**

Close Peer Connection & Clear all callbacks

**setRemoteDescription: (sdp: string, type: DescriptionType) => void**

Set Remote Description

```
export const enum DescriptionType {
    Unspec = 'Unspec',
    Offer = 'Offer',
    Answer = 'Answer'
}
```

**addRemoteCandidate: (candidate: string, mid: string) => void**

Add remote candidate info

**createDataChannel: (label: string, config?: DataChannelInitConfig) => DataChannel**

Create new data-channel

-   label `<string>` Data channel name
-   config `<Object>` Data channel options

```
export interface DataChannelInitConfig {
    protocol?: string;
    negotiated?: boolean;
    id?: number;
    unordered?: boolean; // Reliability
    maxPacketLifeTime?: number; // Reliability
    maxRetransmits?: number; // Reliability
}
```

**state: () => string**

Get current state

**signalingState: () => string**

Get current signaling state

**gatheringState: () => string**

Get current gathering state

**onLocalDescription: (cb: (sdp: string, type: DescriptionType) => void) => void**

Local Description Callback

```
export const enum DescriptionType {
    Unspec = 'Unspec',
    Offer = 'Offer',
    Answer = 'Answer'
}
```

**onLocalCandidate: (cb: (candidate: string, mid: string) => void) => void**

Local Candidate Callback

**onStateChange: (cb: (state: string) => void) => void**

State Change Callback

**onSignalingStateChange: (state: (sdp: string) => void) => void**

Signaling State Change Callback

**onGatheringStateChange: (state: (sdp: string) => void) => void**

Gathering State Change Callback

**onDataChannel: (cb: (dc: DataChannel) => void) => void**

New Data Channel Callback

**bytesSent: () => number**

Get bytes sent stat

**bytesReceived: () => number**

Get bytes received stat

**rtt: () => number**

Get rtt stat

**getSelectedCandidatePair: () => { local: SelectedCandidateInfo, remote: SelectedCandidateInfo }**

Get info about selected candidate pair

```
export interface SelectedCandidateInfo {
    address: string;
    port: number;
    type: string;
    transportType: string;
}
```

## DataChannel Class

> You can create a new Datachannel instance by calling `PeerConnection.createDataChannel` function.

**close: () => void**

Close data channel

**getLabel: () => string**

Get label of data-channel

**sendMessage: (msg: string) => boolean**

Send Message as string

**sendMessageBinary: (buffer: Buffer) => boolean**

Send Message as binary

**isOpen: () => boolean**

Query data-channel

**bufferedAmount: () => number**

Get current buffered amount level

**maxMessageSize: () => number**

Get max message size of the data-channel, that could be sent

**setBufferedAmountLowThreshold: (newSize: number) => void**

Set buffer level of the `onBufferedAmountLow` callback

**onOpen: (cb: () => void) => void**

Open callback

**onClosed: (cb: () => void) => void**

Closed callback

**onError: (cb: (err: string) => void) => void**

Error callback

**onBufferedAmountLow: (cb: () => void) => void**

Buffer level low callback

**onMessage: (cb: (msg: string | Buffer) => void) => void**

New Message callback
