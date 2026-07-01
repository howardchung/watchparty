/// <reference lib="dom" />

export default class _RTCSessionDescription implements RTCSessionDescription {
    readonly sdp: string;
    readonly type: RTCSdpType;
    toJSON(): any;
    constructor(descriptionInitDict?: RTCSessionDescriptionInit);
}
