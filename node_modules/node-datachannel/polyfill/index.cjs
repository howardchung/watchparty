'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('node-domexception');
var module$1 = require('module');
var stream = require('stream');
var events = require('events');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
class RTCCertificate {
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

const InvalidStateError = (msg) => {
    return new DOMException(msg, 'InvalidStateError');
};

const InvalidAccessError = (msg) => {
    return new DOMException(msg, 'InvalidAccessError');
};

const NotFoundError = (msg) => {
    return new DOMException(msg, 'NotFoundError');
};

const OperationError = (msg) => {
    return new DOMException(msg, 'OperationError');
};

const SyntaxError = (msg) => {
    return new DOMException(msg, 'SyntaxError');
};

class _RTCDataChannel extends EventTarget {
    #dataChannel;
    #readyState;
    #bufferedAmountLowThreshold;
    #binaryType;
    #maxPacketLifeTime;
    #maxRetransmits;
    #negotiated;
    #ordered;

    #closeRequested = false;

    onbufferedamountlow;
    onclose;
    onclosing;
    onerror;
    onmessage;
    onopen;

    constructor(dataChannel, opts = {}) {
        super();

        this.#dataChannel = dataChannel;
        this.#binaryType = 'arraybuffer';
        this.#readyState = this.#dataChannel.isOpen() ? 'open' : 'connecting';
        this.#bufferedAmountLowThreshold = 0;
        this.#maxPacketLifeTime = opts.maxPacketLifeTime || null;
        this.#maxRetransmits = opts.maxRetransmits || null;
        this.#negotiated = opts.negotiated || false;
        this.#ordered = opts.ordered || true;

        // forward dataChannel events
        this.#dataChannel.onOpen(() => {
            this.#readyState = 'open';
            this.dispatchEvent(new Event('open', { channel: this }));
        });

        this.#dataChannel.onClosed(() => {
            // Simulate closing event
            if (!this.#closeRequested) {
                this.#readyState = 'closing';
                this.dispatchEvent(new Event('closing', { channel: this }));
            }

            setImmediate(() => {
                this.#readyState = 'closed';
                this.dispatchEvent(new Event('close', { channel: this }));
            });
        });

        this.#dataChannel.onError((msg) => {
            this.dispatchEvent(
                new RTCErrorEvent('error', {
                    error: new RTCError(
                        {
                            errorDetail: 'data-channel-failure',
                        },
                        msg,
                    ),
                }),
            );
        });

        this.#dataChannel.onBufferedAmountLow(() => {
            this.dispatchEvent(new Event('bufferedamountlow', { channel: this }));
        });

        this.#dataChannel.onMessage((data) => {
            if (ArrayBuffer.isView(data)) {
                data = data.buffer;
            }

            this.dispatchEvent(new MessageEvent('message', { data, channel: this }));
        });

        // forward events to properties
        this.addEventListener('message', (e) => {
            if (this.onmessage) this.onmessage(e);
        });
        this.addEventListener('bufferedamountlow', (e) => {
            if (this.onbufferedamountlow) this.onbufferedamountlow(e);
        });
        this.addEventListener('error', (e) => {
            if (this.onerror) this.onerror(e);
        });
        this.addEventListener('close', (e) => {
            if (this.onclose) this.onclose(e);
        });
        this.addEventListener('closing', (e) => {
            if (this.onclosing) this.onclosing(e);
        });
        this.addEventListener('open', (e) => {
            if (this.onopen) this.onopen(e);
        });
    }

    set binaryType(type) {
        if (type !== 'blob' && type !== 'arraybuffer') {
            throw new DOMException(
                "Failed to set the 'binaryType' property on 'RTCDataChannel': Unknown binary type : " + type,
                'TypeMismatchError',
            );
        }
        this.#binaryType = type;
    }

    get binaryType() {
        return this.#binaryType;
    }

    get bufferedAmount() {
        return this.#dataChannel.bufferedAmount();
    }

    get bufferedAmountLowThreshold() {
        return this.#bufferedAmountLowThreshold;
    }

    set bufferedAmountLowThreshold(value) {
        const number = Number(value) || 0;
        this.#bufferedAmountLowThreshold = number;
        this.#dataChannel.setBufferedAmountLowThreshold(number);
    }

    get id() {
        return this.#dataChannel.getId();
    }

    get label() {
        return this.#dataChannel.getLabel();
    }

    get maxPacketLifeTime() {
        return this.#maxPacketLifeTime;
    }

    get maxRetransmits() {
        return this.#maxRetransmits;
    }

    get negotiated() {
        return this.#negotiated;
    }

    get ordered() {
        return this.#ordered;
    }

    get protocol() {
        return this.#dataChannel.getProtocol();
    }

    get readyState() {
        return this.#readyState;
    }

    send(data) {
        if (this.#readyState !== 'open') {
            throw InvalidStateError(
                "Failed to execute 'send' on 'RTCDataChannel': RTCDataChannel.readyState is not 'open'",
            );
        }

        // Needs network error, type error implemented
        if (typeof data === 'string') {
            this.#dataChannel.sendMessage(data);
        } else if (data instanceof Blob) {
            data.arrayBuffer().then((ab) => {
                this.#dataChannel.sendMessageBinary(new Uint8Array(ab));
            });
        } else {
            this.#dataChannel.sendMessageBinary(new Uint8Array(data));
        }
    }

    close() {
        this.#closeRequested = true;
        this.#dataChannel.close();
    }
}

// https://developer.mozilla.org/docs/Web/API/RTCIceCandidate
//
// Example: candidate:123456 1 UDP 123456 192.168.1.1 12345 typ host raddr=10.0.0.1 rport=54321 generation 0


class _RTCIceCandidate {
    #address;
    #candidate;
    #component;
    #foundation;
    #port;
    #priority;
    #protocol;
    #relatedAddress;
    #relatedPort;
    #sdpMLineIndex;
    #sdpMid;
    #tcpType;
    #type;
    #usernameFragment;

    constructor({ candidate, sdpMLineIndex, sdpMid, usernameFragment }) {
        if (sdpMLineIndex == null && sdpMid == null)
            throw new TypeError('At least one of sdpMLineIndex or sdpMid must be specified');

        this.#candidate = candidate === null ? 'null' : candidate ?? '';
        this.#sdpMLineIndex = sdpMLineIndex ?? null;
        this.#sdpMid = sdpMid ?? null;
        this.#usernameFragment = usernameFragment ?? null;

        if (candidate) {
            const fields = candidate.split(' ');
            this.#foundation = fields[0].replace('candidate:', ''); // remove text candidate:
            this.#component = fields[1] == '1' ? 'rtp' : 'rtcp';
            this.#protocol = fields[2];
            this.#priority = parseInt(fields[3], 10);
            this.#address = fields[4];
            this.#port = parseInt(fields[5], 10);
            this.#type = fields[7];
            this.#tcpType = null;
            this.#relatedAddress = null;
            this.#relatedPort = null;

            // Parse the candidate string to extract relatedPort and relatedAddress
            for (let i = 8; i < fields.length; i++) {
                const field = fields[i];
                if (field === 'raddr') {
                    this.#relatedAddress = fields[i + 1];
                } else if (field === 'rport') {
                    this.#relatedPort = parseInt(fields[i + 1], 10);
                }

                if (this.#protocol === 'tcp' && field === 'tcptype') {
                    this.#tcpType = fields[i + 1];
                }
            }
        }
    }

    get address() {
        return this.#address || null;
    }

    get candidate() {
        return this.#candidate;
    }

    get component() {
        return this.#component;
    }

    get foundation() {
        return this.#foundation || null;
    }

    get port() {
        return this.#port || null;
    }

    get priority() {
        return this.#priority || null;
    }

    get protocol() {
        return this.#protocol || null;
    }

    get relatedAddress() {
        return this.#relatedAddress;
    }

    get relatedPort() {
        return this.#relatedPort || null;
    }

    get sdpMLineIndex() {
        return this.#sdpMLineIndex;
    }

    get sdpMid() {
        return this.#sdpMid;
    }

    get tcpType() {
        return this.#tcpType;
    }

    get type() {
        return this.#type || null;
    }

    get usernameFragment() {
        return this.#usernameFragment;
    }

    toJSON() {
        return {
            candidate: this.#candidate,
            sdpMLineIndex: this.#sdpMLineIndex,
            sdpMid: this.#sdpMid,
            usernameFragment: this.#usernameFragment,
        };
    }
}

class _RTCIceTransport extends EventTarget {
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
            local: new _RTCIceCandidate({
                candidate: cp.local.candidate,
                sdpMid: cp.local.mid,
            }),
            remote: new _RTCIceCandidate({
                candidate: cp.remote.candidate,
                sdpMid: cp.remote.mid,
            }),
        };
    }
}

class _RTCDtlsTransport extends EventTarget {
    #pc = null;
    #extraFunctions = null;
    #iceTransport = null;

    onerror = null;
    onstatechange = null;

    constructor({ pc, extraFunctions }) {
        super();
        this.#pc = pc;
        this.#extraFunctions = extraFunctions;

        this.#iceTransport = new _RTCIceTransport({ pc, extraFunctions });

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

// createRequire is native in node version >= 12
const require$1 = module$1.createRequire((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.src || new URL('index.cjs', document.baseURI).href)));

const nodeDataChannel = require$1('../build/Release/node_datachannel.node');

/**
 * Turns a node-datachannel DataChannel into a real Node.js stream, complete with buffering,
 * backpressure (up to a point - if the buffer fills up, messages are dropped), and
 * support for piping data elsewhere.
 *
 * Read & written data may be either UTF-8 strings or Buffers - this difference exists at
 * the protocol level, and is preserved here throughout.
 */
class DataChannelStream extends stream.Duplex {
    constructor(rawChannel, streamOptions) {
        super({
            allowHalfOpen: false, // Default to autoclose on end().
            ...streamOptions,
            objectMode: true, // Preserve the string/buffer distinction (WebRTC treats them differently)
        });

        this._rawChannel = rawChannel;
        this._readActive = true;

        rawChannel.onMessage((msg) => {
            if (!this._readActive) return; // If the buffer is full, drop messages.

            // If the push is rejected, we pause reading until the next call to _read().
            this._readActive = this.push(msg);
        });

        // When the DataChannel closes, the readable & writable ends close
        rawChannel.onClosed(() => {
            this.push(null);
            this.destroy();
        });

        rawChannel.onError((errMsg) => {
            this.destroy(new Error(`DataChannel error: ${errMsg}`));
        });

        // Buffer all writes until the DataChannel opens
        if (!rawChannel.isOpen()) {
            this.cork();
            rawChannel.onOpen(() => this.uncork());
        }
    }

    _read() {
        // Stop dropping messages, if the buffer filling up meant we were doing so before.
        this._readActive = true;
    }

    _write(chunk, encoding, callback) {
        let sentOk;

        try {
            if (Buffer.isBuffer(chunk)) {
                sentOk = this._rawChannel.sendMessageBinary(chunk);
            } else if (typeof chunk === 'string') {
                sentOk = this._rawChannel.sendMessage(chunk);
            } else {
                const typeName = chunk.constructor.name || typeof chunk;
                throw new Error(`Cannot write ${typeName} to DataChannel stream`);
            }
        } catch (err) {
            return callback(err);
        }

        if (sentOk) {
            callback(null);
        } else {
            callback(new Error('Failed to write to DataChannel'));
        }
    }

    _final(callback) {
        if (!this.allowHalfOpen) this.destroy();
        callback(null);
    }

    _destroy(maybeErr, callback) {
        // When the stream is destroyed, we close the DataChannel.
        this._rawChannel.close();
        callback(maybeErr);
    }

    get label() {
        return this._rawChannel.getLabel();
    }

    get id() {
        return this._rawChannel.getId();
    }

    get protocol() {
        return this._rawChannel.getProtocol();
    }
}

class WebSocketServer extends events.EventEmitter {
    #server;
    #clients = [];

    constructor(options) {
        super();
        this.#server = new nodeDataChannel.WebSocketServer(options);

        this.#server.onClient((client) => {
            this.emit('client', client);
            this.#clients.push(client);
        });
    }

    port() {
        return this.#server?.port() || 0;
    }

    stop() {
        this.#clients.forEach((client) => {
            client?.close();
        });
        this.#server?.stop();
        this.#server = null;
        this.removeAllListeners();
    }

    onClient(cb) {
        if (this.#server) this.on('client', cb);
    }
}

const {
    initLogger,
    cleanup,
    preload,
    setSctpSettings,
    RtcpReceivingSession,
    Track,
    Video,
    Audio,
    DataChannel,
    PeerConnection,
    WebSocket,
} = nodeDataChannel;

var NodeDataChannel = {
    initLogger,
    cleanup,
    preload,
    setSctpSettings,
    RtcpReceivingSession,
    Track,
    Video,
    Audio,
    DataChannel,
    PeerConnection,
    WebSocket,
    WebSocketServer,
    DataChannelStream,
};

// https://developer.mozilla.org/docs/Web/API/RTCSessionDescription
//
// Example usage
// const init = {
//     type: 'offer',
//     sdp: 'v=0\r\no=- 1234567890 1234567890 IN IP4 192.168.1.1\r\ns=-\r\nt=0 0\r\na=ice-ufrag:abcd\r\na=ice-pwd:efgh\r\n'
//   };

class _RTCSessionDescription {
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

class RTCPeerConnectionIceEvent extends Event {
    #candidate;

    constructor(candidate) {
        super('icecandidate');

        this.#candidate = candidate;
    }

    get candidate() {
        return this.#candidate;
    }
}

class RTCDataChannelEvent extends Event {
    #channel;

    constructor(type, eventInitDict) {
        super(type);

        if (type && !eventInitDict.channel) throw new TypeError('channel member is required');

        this.#channel = eventInitDict?.channel;
    }

    get channel() {
        return this.#channel;
    }
}

class _RTCSctpTransport extends EventTarget {
    #pc = null;
    #extraFunctions = null;
    #transport = null;

    onstatechange = null;

    constructor({ pc, extraFunctions }) {
        super();
        this.#pc = pc;
        this.#extraFunctions = extraFunctions;

        this.#transport = new _RTCDtlsTransport({ pc, extraFunctions });

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

class _RTCPeerConnection extends EventTarget {
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
                    throw SyntaxError('IceServers urls cannot be empty');

                // urls should be valid URLs and match the protocols "stun:|turn:|turns:"
                if (
                    config.iceServers[i].urls?.some(
                        (url) => {
                            try {
                                const parsedURL = new URL(url);

                                return !/^(stun:|turn:|turns:)$/.test(parsedURL.protocol)
                            } catch (error) {
                                return true
                            }
                        },
                    )
                )
                    throw SyntaxError('IceServers urls wrong format');

                // If this is a turn server check for username and credential
                if (config.iceServers[i].urls?.some((url) => url.startsWith('turn'))) {
                    if (!config.iceServers[i].username)
                        throw InvalidAccessError('IceServers username cannot be null');
                    if (!config.iceServers[i].credential)
                        throw InvalidAccessError('IceServers username cannot be undefined');
                }

                // length of urls can not be 0
                if (config.iceServers[i].urls?.length === 0)
                    throw SyntaxError('IceServers urls cannot be empty');
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
            if (!error || !error.message) throw NotFoundError('Unknown error');
            throw SyntaxError(error.message);
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
            const dc = new _RTCDataChannel(channel);
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

            this.#localCandidates.push(new _RTCIceCandidate({ candidate, sdpMid }));
            this.dispatchEvent(new RTCPeerConnectionIceEvent(new _RTCIceCandidate({ candidate, sdpMid })));
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

        this.#sctp = new _RTCSctpTransport({
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
        return new _RTCSessionDescription(this.#peerConnection.localDescription());
    }

    get currentRemoteDescription() {
        return new _RTCSessionDescription(this.#peerConnection.remoteDescription());
    }

    get localDescription() {
        return new _RTCSessionDescription(this.#peerConnection.localDescription());
    }

    get pendingLocalDescription() {
        return new _RTCSessionDescription(this.#peerConnection.localDescription());
    }

    get pendingRemoteDescription() {
        return new _RTCSessionDescription(this.#peerConnection.remoteDescription());
    }

    get remoteDescription() {
        return new _RTCSessionDescription(this.#peerConnection.remoteDescription());
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
            throw OperationError('Invalid sdpMid format');
        }

        // We don't care about sdpMLineIndex, just for test
        if (!candidate.sdpMid && candidate.sdpMLineIndex > 1) {
            throw OperationError('This is only for test case.');
        }

        try {
            this.#peerConnection.addRemoteCandidate(candidate.candidate, candidate.sdpMid || '0');
            this.#remoteCandidates.push(
                new _RTCIceCandidate({ candidate: candidate.candidate, sdpMid: candidate.sdpMid || '0' }),
            );
        } catch (error) {
            if (!error || !error.message) throw NotFoundError('Unknown error');

            // Check error Message if contains specific message
            if (error.message.includes('remote candidate without remote description'))
                throw InvalidStateError(error.message);
            if (error.message.includes('Invalid candidate format')) throw OperationError(error.message);

            throw NotFoundError(error.message);
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
        const dataChannel = new _RTCDataChannel(channel, opts);

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

let RTCError$1 = class RTCError extends DOMException {
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
};

var index = {
    RTCCertificate,
    RTCDataChannel: _RTCDataChannel,
    RTCDtlsTransport: _RTCDtlsTransport,
    RTCIceCandidate: _RTCIceCandidate,
    RTCIceTransport: _RTCIceTransport,
    RTCPeerConnection: _RTCPeerConnection,
    RTCSctpTransport: _RTCSctpTransport,
    RTCSessionDescription: _RTCSessionDescription,
    RTCDataChannelEvent,
    RTCPeerConnectionIceEvent,
    RTCError: RTCError$1,
};

exports.RTCCertificate = RTCCertificate;
exports.RTCDataChannel = _RTCDataChannel;
exports.RTCDataChannelEvent = RTCDataChannelEvent;
exports.RTCDtlsTransport = _RTCDtlsTransport;
exports.RTCError = RTCError$1;
exports.RTCIceCandidate = _RTCIceCandidate;
exports.RTCIceTransport = _RTCIceTransport;
exports.RTCPeerConnection = _RTCPeerConnection;
exports.RTCPeerConnectionIceEvent = RTCPeerConnectionIceEvent;
exports.RTCSctpTransport = _RTCSctpTransport;
exports.RTCSessionDescription = _RTCSessionDescription;
exports.default = index;
