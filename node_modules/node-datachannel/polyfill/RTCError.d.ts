/// <reference lib="dom" />

export class _RTCError extends DOMException implements RTCError {
    constructor(init: RTCErrorInit, message?: string);
    // type RTCErrorDetailType = "data-channel-failure" | "dtls-failure" | "fingerprint-failure" | "hardware-encoder-error" | "hardware-encoder-not-available" | "sctp-failure" | "sdp-syntax-error";
    readonly errorDetail: RTCErrorDetailType;
    readonly receivedAlert: number | null;
    readonly sctpCauseCode: number | null;
    readonly sdpLineNumber: number | null;
    readonly sentAlert: number | null;
}
