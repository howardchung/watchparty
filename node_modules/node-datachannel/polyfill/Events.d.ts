/// <reference lib="dom" />

export class RTCPeerConnectionIceEvent extends Event {
    readonly candidate: RTCIceCandidate | null;
}

export class RTCDataChannelEvent extends Event {
    readonly channel: RTCDataChannel | null;
}
