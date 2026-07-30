import RTCIceCandidate from './RTCIceCandidate.js';

export default class _RTCIceTransport extends EventTarget {
    #pc = null;
    #extraFunctions = null;

    ongatheringstatechange = null;
    onselectedcandidatepairchange = null;
    onstatechange = null;

    constructor({ pc, extraFunctions }) {
        super();
        this.#pc = pc;
        this.#extraFunctions = extraFunctions;

        // forward peerConnection events
        this.#pc.addEventListener('icegatheringstatechange', () => {
            this.dispatchEvent(new Event('gatheringstatechange'));
        });
        this.#pc.addEventListener('iceconnectionstatechange', () => {
            this.dispatchEvent(new Event('statechange'));
        });

        // forward events to properties
        this.addEventListener('gatheringstatechange', (e) => {
            if (this.ongatheringstatechange) this.ongatheringstatechange(e);
        });
        this.addEventListener('statechange', (e) => {
            if (this.onstatechange) this.onstatechange(e);
        });
    }

    get component() {
        let cp = this.getSelectedCandidatePair();
        if (!cp) return null;
        return cp.local.component;
    }

    get gatheringState() {
        return this.#pc ? this.#pc.iceGatheringState : 'new';
    }

    get role() {
        return this.#pc.localDescription.type == 'offer' ? 'controlling' : 'controlled';
    }

    get state() {
        return this.#pc ? this.#pc.iceConnectionState : 'new';
    }

    getLocalCandidates() {
        return this.#pc ? this.#extraFunctions.localCandidates() : [];
    }

    getLocalParameters() {
        /** */
    }

    getRemoteCandidates() {
        return this.#pc ? this.#extraFunctions.remoteCandidates() : [];
    }

    getRemoteParameters() {
        /** */
    }

    getSelectedCandidatePair() {
        let cp = this.#extraFunctions.selectedCandidatePair();
        if (!cp) return null;
        return {
            local: new RTCIceCandidate({
                candidate: cp.local.candidate,
                sdpMid: cp.local.mid,
            }),
            remote: new RTCIceCandidate({
                candidate: cp.remote.candidate,
                sdpMid: cp.remote.mid,
            }),
        };
    }
}
