// https://developer.mozilla.org/docs/Web/API/RTCSessionDescription
//
// Example usage
// const init = {
//     type: 'offer',
//     sdp: 'v=0\r\no=- 1234567890 1234567890 IN IP4 192.168.1.1\r\ns=-\r\nt=0 0\r\na=ice-ufrag:abcd\r\na=ice-pwd:efgh\r\n'
//   };

export default class _RTCSessionDescription {
    #type;
    #sdp;

    constructor(init = {}) {
        // Allow Empty Constructor
        // if (!init || !init.type || !init.sdp) {
        //     throw new DOMException('Type and sdp properties are required.');
        // }

        this.#type = init ? init.type : null;
        this.#sdp = init ? init.sdp : null;
    }

    get type() {
        return this.#type;
    }

    get sdp() {
        return this.#sdp;
    }

    toJSON() {
        return {
            sdp: this.#sdp,
            type: this.#type,
        };
    }
}
