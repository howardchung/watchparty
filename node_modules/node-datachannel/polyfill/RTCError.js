export default class RTCError extends DOMException {
    constructor(init, message = '') {
        super(message, 'OperationError');

        if (!init || !init.errorDetail) throw new TypeError('Cannot construct RTCError, errorDetail is required');
        if (
            [
                'data-channel-failure',
                'dtls-failure',
                'fingerprint-failure',
                'hardware-encoder-error',
                'hardware-encoder-not-available',
                'sctp-failure',
                'sdp-syntax-error',
            ].indexOf(init.errorDetail) === -1
        )
            throw new TypeError('Cannot construct RTCError, errorDetail is invalid');

        this._errorDetail = init.errorDetail;
        this._receivedAlert = init.receivedAlert ?? null;
        this._sctpCauseCode = init.sctpCauseCode ?? null;
        this._sdpLineNumber = init.sdpLineNumber ?? null;
        this._sentAlert = init.sentAlert ?? null;
    }

    get errorDetail() {
        return this._errorDetail;
    }

    set errorDetail(value) {
        throw new TypeError('Cannot set errorDetail, it is read-only');
    }

    get receivedAlert() {
        return this._receivedAlert;
    }

    set receivedAlert(value) {
        throw new TypeError('Cannot set receivedAlert, it is read-only');
    }

    get sctpCauseCode() {
        return this._sctpCauseCode;
    }

    set sctpCauseCode(value) {
        throw new TypeError('Cannot set sctpCauseCode, it is read-only');
    }

    get sdpLineNumber() {
        return this._sdpLineNumber;
    }

    set sdpLineNumber(value) {
        throw new TypeError('Cannot set sdpLineNumber, it is read-only');
    }

    get sentAlert() {
        return this._sentAlert;
    }

    set sentAlert(value) {
        throw new TypeError('Cannot set sentAlert, it is read-only');
    }
}
