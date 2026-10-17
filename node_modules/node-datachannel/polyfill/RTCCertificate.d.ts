/// <reference lib="dom" />

export default class RTCCertificate implements RTCCertificate {
    constructor();
    readonly expires: number;
    getFingerprints(): RTCDtlsFingerprint[];
}
