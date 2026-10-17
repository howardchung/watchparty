import RTCDtlsTransport from './RTCDtlsTransport.js';

export default class _RTCSctpTransport extends EventTarget {
    #pc = null;
    #extraFunctions = null;
    #transport = null;

    onstatechange = null;

    constructor({ pc, extraFunctions }) {
        super();
        this.#pc = pc;
        this.#extraFunctions = extraFunctions;

        this.#transport = new RTCDtlsTransport({ pc, extraFunctions });

        // forward peerConnection events
        this.#pc.addEventListener('connectionstatechange', () => {
            this.dispatchEvent(new Event('statechange'));
        });

        // forward events to properties
        this.addEventListener('statechange', (e) => {
            if (this.onstatechange) this.onstatechange(e);
        });
    }

    get maxChannels() {
        if (this.state !== 'connected') return null;
        return this.#pc ? this.#extraFunctions.maxDataChannelId() : 0;
    }

    get maxMessageSize() {
        if (this.state !== 'connected') return null;
        return this.#pc ? this.#extraFunctions.maxMessageSize() : 0;
    }

    get state() {
        // reduce state from new, connecting, connected, disconnected, failed, closed, unknown
        // to RTCSctpTransport states connecting, connected, closed
        let state = this.#pc.connectionState;
        if (state === 'new' || state === 'connecting') {
            state = 'connecting';
        } else if (state === 'disconnected' || state === 'failed' || state === 'closed' || state === 'unknown') {
            state = 'closed';
        }
        return state;
    }

    get transport() {
        return this.#transport;
    }
}
