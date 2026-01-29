/// <reference lib="dom" />

export default class _RTCDtlsTransport extends EventTarget implements RTCDtlsTransport {
    readonly iceTransport: RTCIceTransport;
    readonly state: RTCDtlsTransportState;
    getRemoteCertificates(): ArrayBuffer[];

    onstatechange: ((this: RTCDtlsTransport, ev: Event) => any) | null;
    onerror: ((this: RTCDtlsTransport, ev: Event) => any) | null;
}
