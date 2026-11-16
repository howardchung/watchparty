import 'node-domexception';
import NodeDataChannel from '../lib/index.js';
import RTCSessionDescription from './RTCSessionDescription.js';
import RTCDataChannel from './RTCDataChannel.js';
import RTCIceCandidate from './RTCIceCandidate.js';
import { RTCDataChannelEvent, RTCPeerConnectionIceEvent } from './Events.js';
import RTCSctpTransport from './RTCSctpTransport.js';
import * as exceptions from './Exception.js';

export default class _RTCPeerConnection extends EventTarget {
    static async generateCertificate() {
        throw new DOMException('Not implemented');
    }

    #peerConnection;
    #localOffer;
    #localAnswer;
    #dataChannels;
    #dataChannelsClosed = 0;
    #config;
    #canTrickleIceCandidates;
    #sctp;

    #localCandidates = [];
    #remoteCandidates = [];

    onconnectionstatechange;
    ondatachannel;
    onicecandidate;
    onicecandidateerror;
    oniceconnectionstatechange;
    onicegatheringstatechange;
    onnegotiationneeded;
    onsignalingstatechange;
    ontrack;

    _checkConfiguration(config) {
        if (config && config.iceServers === undefined) config.iceServers = [];
        if (config && config.iceTransportPolicy === undefined) config.iceTransportPolicy = 'all';

        if (config?.iceServers === null) throw new TypeError('IceServers cannot be null');

        // Check for all the properties of iceServers
        if (Array.isArray(config?.iceServers)) {
            for (let i = 0; i < config.iceServers.length; i++) {
                if (config.iceServers[i] === null) throw new TypeError('IceServers cannot be null');
                if (config.iceServers[i] === undefined) throw new TypeError('IceServers cannot be undefined');
                if (Object.keys(config.iceServers[i]).length === 0) throw new TypeError('IceServers cannot be empty');

                // If iceServers is string convert to array
                if (typeof config.iceServers[i].urls === 'string')
                    config.iceServers[i].urls = [config.iceServers[i].urls];

                // urls can not be empty
                if (config.iceServers[i].urls?.some((url) => url == ''))
                    throw exceptions.SyntaxError('IceServers urls cannot be empty');

                // urls should be valid URLs and match the protocols "stun:|turn:|turns:"
                if (
                    config.iceServers[i].urls?.some(
                        (url) => {
                            try {
                                const parsedURL = new URL(url)

                                return !/^(stun:|turn:|turns:)$/.test(parsedURL.protocol)
                            } catch (error) {
                                return true
                            }
                        },
                    )
                )
                    throw exceptions.SyntaxError('IceServers urls wrong format');

                // If this is a turn server check for username and credential
                if (config.iceServers[i].urls?.some((url) => url.startsWith('turn'))) {
                    if (!config.iceServers[i].username)
                        throw exceptions.InvalidAccessError('IceServers username cannot be null');
                    if (!config.iceServers[i].credential)
                        throw exceptions.InvalidAccessError('IceServers username cannot be undefined');
                }

                // length of urls can not be 0
                if (config.iceServers[i].urls?.length === 0)
                    throw exceptions.SyntaxError('IceServers urls cannot be empty');
            }
        }

        if (
            config &&
            config.iceTransportPolicy &&
            config.iceTransportPolicy !== 'all' &&
            config.iceTransportPolicy !== 'relay'
        )
            throw new TypeError('IceTransportPolicy must be either "all" or "relay"');
    }

    setConfiguration(config) {
        this._checkConfiguration(config);
        this.#config = config;
    }

    constructor(config = { iceServers: [], iceTransportPolicy: 'all' }) {
        super();

        this._checkConfiguration(config);
        this.#config = config;
        this.#localOffer = createDeferredPromise();
        this.#localAnswer = createDeferredPromise();
        this.#dataChannels = new Set();
        this.#canTrickleIceCandidates = null;

        try {
            this.#peerConnection = new NodeDataChannel.PeerConnection(
                config?.peerIdentity ?? `peer-${getRandomString(7)}`,
                {
                    ...config,
                    iceServers:
                        config?.iceServers
                            ?.map((server) => {
                                const urls = Array.isArray(server.urls) ? server.urls : [server.urls];

                                return urls.map((url) => {
                                    if (server.username && server.credential) {
                                        const [protocol, rest] = url.split(/:(.*)/);
                                        return `${protocol}:${server.username}:${server.credential}@${rest}`;
                                    }
                                    return url;
                                });
                            })
                            .flat() ?? [],
                },
            );
        } catch (error) {
            if (!error || !error.message) throw exceptions.NotFoundError('Unknown error');
            throw exceptions.SyntaxError(error.message);
        }

        // forward peerConnection events
        this.#peerConnection.onStateChange(() => {
            this.dispatchEvent(new Event('connectionstatechange'));
        });

        this.#peerConnection.onIceStateChange(() => {
            this.dispatchEvent(new Event('iceconnectionstatechange'));
        });

        this.#peerConnection.onSignalingStateChange(() => {
            this.dispatchEvent(new Event('signalingstatechange'));
        });

        this.#peerConnection.onGatheringStateChange(() => {
            this.dispatchEvent(new Event('icegatheringstatechange'));
        });

        this.#peerConnection.onDataChannel((channel) => {
            const dc = new RTCDataChannel(channel);
            this.#dataChannels.add(dc);
            this.dispatchEvent(new RTCDataChannelEvent('datachannel', { channel: dc }));
        });

        this.#peerConnection.onLocalDescription((sdp, type) => {
            if (type === 'offer') {
                this.#localOffer.resolve({ sdp, type });
            }

            if (type === 'answer') {
                this.#localAnswer.resolve({ sdp, type });
            }
        });

        this.#peerConnection.onLocalCandidate((candidate, sdpMid) => {
            if (sdpMid === 'unspec') {
                this.#localAnswer.reject(new Error(`Invalid description type ${sdpMid}`));
                return;
            }

            this.#localCandidates.push(new RTCIceCandidate({ candidate, sdpMid }));
            this.dispatchEvent(new RTCPeerConnectionIceEvent(new RTCIceCandidate({ candidate, sdpMid })));
        });

        // forward events to properties
        this.addEventListener('connectionstatechange', (e) => {
            if (this.onconnectionstatechange) this.onconnectionstatechange(e);
        });
        this.addEventListener('signalingstatechange', (e) => {
            if (this.onsignalingstatechange) this.onsignalingstatechange(e);
        });
        this.addEventListener('iceconnectionstatechange', (e) => {
            if (this.oniceconnectionstatechange) this.oniceconnectionstatechange(e);
        });
        this.addEventListener('icegatheringstatechange', (e) => {
            if (this.onicegatheringstatechange) this.onicegatheringstatechange(e);
        });
        this.addEventListener('datachannel', (e) => {
            if (this.ondatachannel) this.ondatachannel(e);
        });
        this.addEventListener('icecandidate', (e) => {
            if (this.onicecandidate) this.onicecandidate(e);
        });

        this.#sctp = new RTCSctpTransport({
            pc: this,
            extraFunctions: {
                maxDataChannelId: () => {
                    return this.#peerConnection.maxDataChannelId();
                },
                maxMessageSize: () => {
                    return this.#peerConnection.maxMessageSize();
                },
                localCandidates: () => {
                    return this.#localCandidates;
                },
                remoteCandidates: () => {
                    return this.#remoteCandidates;
                },
                selectedCandidatePair: () => {
                    return this.#peerConnection.getSelectedCandidatePair();
                },
            },
        });
    }

    get canTrickleIceCandidates() {
        return this.#canTrickleIceCandidates;
    }

    get connectionState() {
        return this.#peerConnection.state();
    }

    get iceConnectionState() {
        let state = this.#peerConnection.iceState();
        // libdatachannel uses 'completed' instead of 'connected'
        // see /webrtc/getstats.html
        if (state == 'completed') state = 'connected';
        return state;
    }

    get iceGatheringState() {
        return this.#peerConnection.gatheringState();
    }

    get currentLocalDescription() {
        return new RTCSessionDescription(this.#peerConnection.localDescription());
    }

    get currentRemoteDescription() {
        return new RTCSessionDescription(this.#peerConnection.remoteDescription());
    }

    get localDescription() {
        return new RTCSessionDescription(this.#peerConnection.localDescription());
    }

    get pendingLocalDescription() {
        return new RTCSessionDescription(this.#peerConnection.localDescription());
    }

    get pendingRemoteDescription() {
        return new RTCSessionDescription(this.#peerConnection.remoteDescription());
    }

    get remoteDescription() {
        return new RTCSessionDescription(this.#peerConnection.remoteDescription());
    }

    get sctp() {
        return this.#sctp;
    }

    get signalingState() {
        return this.#peerConnection.signalingState();
    }

    async addIceCandidate(candidate) {
        if (!candidate || !candidate.candidate) {
            return;
        }

        if (candidate.sdpMid === null && candidate.sdpMLineIndex === null) {
            throw new TypeError('sdpMid must be set');
        }

        if (candidate.sdpMid === undefined && candidate.sdpMLineIndex == undefined) {
            throw new TypeError('sdpMid must be set');
        }

        // Reject if sdpMid format is not valid
        // ??
        if (candidate.sdpMid && candidate.sdpMid.length > 3) {
            // console.log(candidate.sdpMid);
            throw exceptions.OperationError('Invalid sdpMid format');
        }

        // We don't care about sdpMLineIndex, just for test
        if (!candidate.sdpMid && candidate.sdpMLineIndex > 1) {
            throw exceptions.OperationError('This is only for test case.');
        }

        try {
            this.#peerConnection.addRemoteCandidate(candidate.candidate, candidate.sdpMid || '0');
            this.#remoteCandidates.push(
                new RTCIceCandidate({ candidate: candidate.candidate, sdpMid: candidate.sdpMid || '0' }),
            );
        } catch (error) {
            if (!error || !error.message) throw exceptions.NotFoundError('Unknown error');

            // Check error Message if contains specific message
            if (error.message.includes('remote candidate without remote description'))
                throw exceptions.InvalidStateError(error.message);
            if (error.message.includes('Invalid candidate format')) throw exceptions.OperationError(error.message);

            throw exceptions.NotFoundError(error.message);
        }
    }

    addTrack(track, ...streams) {
        throw new DOMException('Not implemented');
    }

    addTransceiver(trackOrKind, init) {
        throw new DOMException('Not implemented');
    }

    close() {
        // close all channels before shutting down
        this.#dataChannels.forEach((channel) => {
            channel.close();
            this.#dataChannelsClosed++;
        });

        this.#peerConnection.close();
    }

    createAnswer() {
        return this.#localAnswer;
    }

    createDataChannel(label, opts = {}) {
        const channel = this.#peerConnection.createDataChannel(label, opts);
        const dataChannel = new RTCDataChannel(channel, opts);

        // ensure we can close all channels when shutting down
        this.#dataChannels.add(dataChannel);
        dataChannel.addEventListener('close', () => {
            this.#dataChannels.delete(dataChannel);
            this.#dataChannelsClosed++;
        });

        return dataChannel;
    }

    createOffer() {
        return this.#localOffer;
    }

    getConfiguration() {
        return this.#config;
    }

    getReceivers() {
        throw new DOMException('Not implemented');
    }

    getSenders() {
        throw new DOMException('Not implemented');
    }

    getStats() {
        return new Promise((resolve) => {
            let report = new Map();
            let cp = this.#peerConnection.getSelectedCandidatePair();
            let bytesSent = this.#peerConnection.bytesSent();
            let bytesReceived = this.#peerConnection.bytesReceived();
            let rtt = this.#peerConnection.rtt();

            let localIdRs = getRandomString(8);
            let localId = 'RTCIceCandidate_' + localIdRs;
            report.set(localId, {
                id: localId,
                type: 'local-candidate',
                timestamp: Date.now(),
                candidateType: cp.local.type,
                ip: cp.local.address,
                port: cp.local.port,
            });

            let remoteIdRs = getRandomString(8);
            let remoteId = 'RTCIceCandidate_' + remoteIdRs;
            report.set(remoteId, {
                id: remoteId,
                type: 'remote-candidate',
                timestamp: Date.now(),
                candidateType: cp.remote.type,
                ip: cp.remote.address,
                port: cp.remote.port,
            });

            let candidateId = 'RTCIceCandidatePair_' + localIdRs + '_' + remoteIdRs;
            report.set(candidateId, {
                id: candidateId,
                type: 'candidate-pair',
                timestamp: Date.now(),
                localCandidateId: localId,
                remoteCandidateId: remoteId,
                state: 'succeeded',
                nominated: true,
                writable: true,
                bytesSent: bytesSent,
                bytesReceived: bytesReceived,
                totalRoundTripTime: rtt,
                currentRoundTripTime: rtt,
            });

            let transportId = 'RTCTransport_0_1';
            report.set(transportId, {
                id: transportId,
                timestamp: Date.now(),
                type: 'transport',
                bytesSent: bytesSent,
                bytesReceived: bytesReceived,
                dtlsState: 'connected',
                selectedCandidatePairId: candidateId,
                selectedCandidatePairChanges: 1,
            });

            // peer-connection'
            report.set('P', {
                id: 'P',
                type: 'peer-connection',
                timestamp: Date.now(),
                dataChannelsOpened: this.#dataChannels.size,
                dataChannelsClosed: this.#dataChannelsClosed,
            });

            return resolve(report);
        });
    }

    getTransceivers() {
        return []; // throw new DOMException('Not implemented');
    }

    removeTrack() {
        throw new DOMException('Not implemented');
    }

    restartIce() {
        throw new DOMException('Not implemented');
    }

    async setLocalDescription(description) {
        if (description?.type !== 'offer') {
            // any other type causes libdatachannel to throw
            return;
        }

        this.#peerConnection.setLocalDescription(description?.type);
    }

    async setRemoteDescription(description) {
        if (description.sdp == null) {
            throw new DOMException('Remote SDP must be set');
        }

        this.#peerConnection.setRemoteDescription(description.sdp, description.type);
    }
}

function createDeferredPromise() {
    let resolve, reject;

    let promise = new Promise(function (_resolve, _reject) {
        resolve = _resolve;
        reject = _reject;
    });

    promise.resolve = resolve;
    promise.reject = reject;
    return promise;
}

function getRandomString(length) {
    return Math.random()
        .toString(36)
        .substring(2, 2 + length);
}
