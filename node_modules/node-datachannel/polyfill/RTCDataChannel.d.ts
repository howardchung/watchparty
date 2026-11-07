/// <reference lib="dom" />

import * as NodeDataChannel from '../lib/index.js';

export default class _RTCDataChannel extends EventTarget implements RTCDataChannel {
    constructor(dataChannel: NodeDataChannel.DataChannel, opts: RTCDataChannelInit);

    // events
    onbufferedamountlow: ((this: RTCDataChannel, ev: Event) => any) | null;
    onclose: ((this: RTCDataChannel, ev: Event) => any) | null;
    onclosing: ((this: RTCDataChannel, ev: Event) => any) | null;
    onerror: ((this: RTCDataChannel, ev: Event) => any) | null;
    onmessage: ((this: RTCDataChannel, ev: MessageEvent) => any) | null;
    onopen: ((this: RTCDataChannel, ev: Event) => any) | null;

    // props
    binaryType: BinaryType;
    bufferedAmountLowThreshold: number;
    readonly bufferedAmount: number;
    readonly id: number | null;
    readonly label: string;
    readonly maxPacketLifeTime: number | null;
    readonly maxRetransmits: number | null;
    readonly negotiated: boolean;
    readonly ordered: boolean;
    readonly protocol: string;
    readonly readyState: RTCDataChannelState;

    // methods
    close(): void;
    send(data: string): void;
    send(data: ArrayBuffer): void;
    send(data: ArrayBufferView): void;
    send(data: Blob): void;
}
