import RTCIceTransport from './RTCIceTransport.js';

export default class _RTCDtlsTransport extends EventTarget {
    #pc = null;
    #extraFunctions = null;
    #iceTransport = null;

    onerror = null;
    onstatechange = null;

    constructor({ pc, extraFunctions }) {
        super();
        this.#pc = pc;
        this.#extraFunctions = extraFunctions;

        this.#iceTransport = new RTCIceTransport({ pc, extraFunctions });

        // forward peerConnection events
        this.#pc.addEventListener('connectionstatechange', () => {
            this.dispatchEvent(new Event('statechange'));
        });

        // forward events to properties
        this.addEventListener('statechange', (e) => {
            if (this.onstatechange) this.onstatechange(e);
        });
    }

    get iceTransport() {
        return this.#iceTransport;
    }

    get state() {
        // reduce state from new, connecting, connected, disconnected, failed, closed, unknown
        // to RTCDtlsTRansport states new, connecting, connected, closed, failed
        let state = this.#pc ? this.#pc.connectionState : 'new';
        if (state === 'disconnected' || state === 'unknown') {
            state = 'closed';
        }
        return state;
    }

    getRemoteCertificates() {
        // TODO: implement
        return new ArrayBuffer(0);
    }
}
