/// <reference lib="dom" />

export default class _RTCSctpTransport extends EventTarget implements RTCSctpTransport {
    readonly maxChannels: number | null;
    readonly maxMessageSize: number;
    readonly transport: RTCDtlsTransport;
    readonly state: RTCSctpTransportState;

    onstatechange: ((this: RTCSctpTransport, ev: Event) => any) | null;
}
