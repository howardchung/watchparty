export default class RTCCertificate {
    #expires;
    #fingerprints;

    constructor() {
        this.#expires = null;
        this.#fingerprints = [];
    }

    get expires() {
        return this.#expires;
    }

    getFingerprints() {
        return this.#fingerprints;
    }
}
