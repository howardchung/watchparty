/// <reference lib="dom" />

export default class _RTCIceTransport extends EventTarget implements RTCIceTransport {
    readonly component: RTCIceComponent;
    readonly gatheringState: RTCIceGatheringState;
    readonly role: string; // RTCIceRole;
    readonly state: RTCIceTransportState;

    getLocalCandidates(): RTCIceCandidate[];
    getLocalParameters(): any; // RTCIceParameters;
    getRemoteCandidates(): RTCIceCandidate[];
    getRemoteParameters(): any; // RTCIceParameters;
    getSelectedCandidatePair(): RTCIceCandidatePair | null;

    ongatheringstatechange: ((this: RTCIceTransport, ev: Event) => any) | null;
    onselectedcandidatepairchange: ((this: RTCIceTransport, ev: Event) => any) | null;
    onstatechange: ((this: RTCIceTransport, ev: Event) => any) | null;
}
