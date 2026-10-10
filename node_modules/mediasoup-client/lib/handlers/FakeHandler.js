"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeHandler = void 0;
const fake_mediastreamtrack_1 = require("fake-mediastreamtrack");
const enhancedEvents_1 = require("../enhancedEvents");
const Logger_1 = require("../Logger");
const utils = require("../utils");
const ortc = require("../ortc");
const errors_1 = require("../errors");
const FakeEventTarget_1 = require("./fakeEvents/FakeEventTarget");
const logger = new Logger_1.Logger('FakeHandler');
const NAME = 'FakeHandler';
class FakeHandler extends enhancedEvents_1.EnhancedEventEmitter {
    // Closed flag.
    _closed = false;
    // Fake parameters source of RTP and SCTP parameters and capabilities.
    _fakeParameters;
    // Callback to request sending extended RTP capabilities on demand.
    _getSendExtendedRtpCapabilities;
    // Local RTCP CNAME.
    _cname = `CNAME-${utils.generateRandomNumber()}`;
    // Default sending MediaStream id.
    _defaultSendStreamId = `${utils.generateRandomNumber()}`;
    // Got transport local and remote parameters.
    _transportReady = false;
    // Next localId.
    _nextLocalId = 1;
    // Sending and receiving tracks indexed by localId.
    _tracks = new Map();
    // DataChannel id value counter. It must be incremented for each new DataChannel.
    _nextSctpStreamId = 0;
    /**
     * Creates a factory function.
     */
    static createFactory(fakeParameters) {
        return {
            name: NAME,
            factory: (options) => new FakeHandler(options, fakeParameters),
            getNativeRtpCapabilities: async () => {
                logger.debug('getNativeRtpCapabilities()');
                return FakeHandler.getLocalRtpCapabilities(fakeParameters);
            },
            getNativeSctpCapabilities: async () => {
                logger.debug('getNativeSctpCapabilities()');
                return fakeParameters.generateNativeSctpCapabilities();
            },
        };
    }
    static getLocalRtpCapabilities(fakeParameters) {
        const nativeRtpCapabilities = fakeParameters.generateNativeRtpCapabilities();
        // Need to validate and normalize native RTP capabilities.
        ortc.validateAndNormalizeRtpCapabilities(nativeRtpCapabilities);
        return nativeRtpCapabilities;
    }
    constructor({ 
    // direction,
    // iceParameters,
    // iceCandidates,
    // dtlsParameters,
    // sctpParameters,
    // iceServers,
    // iceTransportPolicy,
    // additionalSettings,
    getSendExtendedRtpCapabilities, }, fakeParameters) {
        super();
        logger.debug('constructor()');
        this._getSendExtendedRtpCapabilities = getSendExtendedRtpCapabilities;
        this._fakeParameters = fakeParameters;
    }
    get name() {
        return NAME;
    }
    close() {
        logger.debug('close()');
        if (this._closed) {
            return;
        }
        this._closed = true;
        // Invoke close() in EnhancedEventEmitter classes.
        super.close();
    }
    // NOTE: Custom method for simulation purposes.
    setIceGatheringState(iceGatheringState) {
        this.emit('@icegatheringstatechange', iceGatheringState);
    }
    // NOTE: Custom method for simulation purposes.
    setConnectionState(connectionState) {
        this.emit('@connectionstatechange', connectionState);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async updateIceServers(iceServers) {
        this.assertNotClosed();
        logger.debug('updateIceServers()');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async restartIce(iceParameters) {
        this.assertNotClosed();
        logger.debug('restartIce()');
    }
    async getTransportStats() {
        this.assertNotClosed();
        return new Map(); // NOTE: Whatever.
    }
    async send(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    { track, streamId, encodings, codecOptions, codec }) {
        this.assertNotClosed();
        logger.debug('send() [kind:%s, track.id:%s]', track.kind, track.id);
        if (!this._transportReady) {
            await this.setupTransport({ localDtlsRole: 'server' });
        }
        const nativeRtpCapabilities = FakeHandler.getLocalRtpCapabilities(this._fakeParameters);
        const sendExtendedRtpCapabilities = this._getSendExtendedRtpCapabilities(nativeRtpCapabilities);
        // Generic sending RTP parameters.
        const sendingRtpParameters = ortc.getSendingRtpParameters(track.kind, sendExtendedRtpCapabilities);
        // This may throw.
        sendingRtpParameters.codecs = ortc.reduceCodecs(sendingRtpParameters.codecs, codec);
        const useRtx = sendingRtpParameters.codecs.some(_codec => /.+\/rtx$/i.test(_codec.mimeType));
        sendingRtpParameters.mid = `mid-${utils.generateRandomNumber()}`;
        sendingRtpParameters.msid = `${streamId ?? '-'} ${track.id}`;
        if (!encodings) {
            encodings = [{}];
        }
        for (const encoding of encodings) {
            encoding.ssrc = utils.generateRandomNumber();
            if (useRtx) {
                encoding.rtx = { ssrc: utils.generateRandomNumber() };
            }
        }
        sendingRtpParameters.encodings = encodings;
        // Fill RTCRtpParameters.rtcp.
        sendingRtpParameters.rtcp = {
            cname: this._cname,
            reducedSize: true,
            mux: true,
        };
        // Set msid.
        sendingRtpParameters.msid = `${streamId ?? this._defaultSendStreamId} ${track.id}`;
        const localId = this._nextLocalId++;
        this._tracks.set(localId, track);
        return { localId: String(localId), rtpParameters: sendingRtpParameters };
    }
    async stopSending(localId) {
        logger.debug('stopSending() [localId:%s]', localId);
        if (this._closed) {
            return;
        }
        if (!this._tracks.has(Number(localId))) {
            throw new Error('local track not found');
        }
        this._tracks.delete(Number(localId));
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async pauseSending(localId) {
        this.assertNotClosed();
        // Unimplemented.
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async resumeSending(localId) {
        this.assertNotClosed();
        // Unimplemented.
    }
    async replaceTrack(localId, track) {
        this.assertNotClosed();
        if (track) {
            logger.debug('replaceTrack() [localId:%s, track.id:%s]', localId, track.id);
        }
        else {
            logger.debug('replaceTrack() [localId:%s, no track]', localId);
        }
        this._tracks.delete(Number(localId));
        this._tracks.set(Number(localId), track);
    }
    async setMaxSpatialLayer(localId, spatialLayer) {
        this.assertNotClosed();
        logger.debug('setMaxSpatialLayer() [localId:%s, spatialLayer:%s]', localId, spatialLayer);
    }
    async setRtpEncodingParameters(localId, params) {
        this.assertNotClosed();
        logger.debug('setRtpEncodingParameters() [localId:%s, params:%o]', localId, params);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getSenderStats(localId) {
        this.assertNotClosed();
        return new Map(); // NOTE: Whatever.
    }
    async sendDataChannel({ ordered, maxPacketLifeTime, maxRetransmits, label, protocol, }) {
        this.assertNotClosed();
        if (!this._transportReady) {
            await this.setupTransport({ localDtlsRole: 'server' });
        }
        logger.debug('sendDataChannel()');
        const dataChannel = new FakeRTCDataChannel({
            id: this._nextSctpStreamId++,
            ordered,
            maxPacketLifeTime,
            maxRetransmits,
            label,
            protocol,
        });
        const sctpStreamParameters = {
            streamId: this._nextSctpStreamId,
            ordered: ordered,
            maxPacketLifeTime: maxPacketLifeTime,
            maxRetransmits: maxRetransmits,
        };
        return { dataChannel, sctpStreamParameters };
    }
    async receive(optionsList) {
        this.assertNotClosed();
        const results = [];
        for (const options of optionsList) {
            const { trackId, kind } = options;
            if (!this._transportReady) {
                await this.setupTransport({ localDtlsRole: 'client' });
            }
            logger.debug('receive() [trackId:%s, kind:%s]', trackId, kind);
            const localId = this._nextLocalId++;
            const track = new fake_mediastreamtrack_1.FakeMediaStreamTrack({ kind });
            this._tracks.set(localId, track);
            results.push({ localId: String(localId), track });
        }
        return results;
    }
    async stopReceiving(localIds) {
        if (this._closed) {
            return;
        }
        for (const localId of localIds) {
            logger.debug('stopReceiving() [localId:%s]', localId);
            this._tracks.delete(Number(localId));
        }
    }
    async pauseReceiving(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    localIds) {
        this.assertNotClosed();
        // Unimplemented.
    }
    async resumeReceiving(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    localIds) {
        this.assertNotClosed();
        // Unimplemented.
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getReceiverStats(localId) {
        this.assertNotClosed();
        return new Map(); //
    }
    async receiveDataChannel({ sctpStreamParameters, label, protocol, }) {
        this.assertNotClosed();
        if (!this._transportReady) {
            await this.setupTransport({ localDtlsRole: 'client' });
        }
        logger.debug('receiveDataChannel()');
        const dataChannel = new FakeRTCDataChannel({
            id: sctpStreamParameters.streamId,
            ordered: sctpStreamParameters.ordered,
            maxPacketLifeTime: sctpStreamParameters.maxPacketLifeTime,
            maxRetransmits: sctpStreamParameters.maxRetransmits,
            label,
            protocol,
        });
        return { dataChannel };
    }
    async setupTransport({ localDtlsRole, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    localSdpObject, }) {
        const dtlsParameters = utils.clone(this._fakeParameters.generateLocalDtlsParameters());
        // Set our DTLS role.
        if (localDtlsRole) {
            dtlsParameters.role = localDtlsRole;
        }
        // Assume we are connecting now.
        this.emit('@connectionstatechange', 'connecting');
        // Need to tell the remote transport about our parameters.
        await new Promise((resolve, reject) => this.emit('@connect', { dtlsParameters }, resolve, reject));
        this._transportReady = true;
    }
    assertNotClosed() {
        if (this._closed) {
            throw new errors_1.InvalidStateError('method called in a closed handler');
        }
    }
}
exports.FakeHandler = FakeHandler;
/**
 * @remarks
 * - We use a custom FakeEventTarget class because Hermes JS engine in
 *   React-Native doesn't implement EventListener.
 */
class FakeRTCDataChannel extends FakeEventTarget_1.FakeEventTarget {
    // Members for RTCDataChannel standard public getters/setters.
    _id;
    _negotiated = true; // mediasoup just uses negotiated DataChannels.
    _ordered;
    _maxPacketLifeTime;
    _maxRetransmits;
    _label;
    _protocol;
    _readyState = 'connecting';
    _bufferedAmount = 0;
    _bufferedAmountLowThreshold = 0;
    _binaryType = 'arraybuffer';
    // Events.
    _onopen = null;
    _onclosing = null;
    _onclose = null;
    _onmessage = null;
    _onbufferedamountlow = null;
    _onerror = null;
    constructor({ id, ordered = true, maxPacketLifeTime = null, maxRetransmits = null, label = '', protocol = '', }) {
        super();
        logger.debug(`constructor() [id:${id}, ordered:${ordered}, maxPacketLifeTime:${maxPacketLifeTime}, maxRetransmits:${maxRetransmits}, label:${label}, protocol:${protocol}`);
        this._id = id;
        this._ordered = ordered;
        this._maxPacketLifeTime = maxPacketLifeTime;
        this._maxRetransmits = maxRetransmits;
        this._label = label;
        this._protocol = protocol;
    }
    get id() {
        return this._id;
    }
    get negotiated() {
        return this._negotiated;
    }
    get ordered() {
        return this._ordered;
    }
    get maxPacketLifeTime() {
        return this._maxPacketLifeTime;
    }
    get maxRetransmits() {
        return this._maxRetransmits;
    }
    get label() {
        return this._label;
    }
    get protocol() {
        return this._protocol;
    }
    get readyState() {
        return this._readyState;
    }
    get bufferedAmount() {
        return this._bufferedAmount;
    }
    get bufferedAmountLowThreshold() {
        return this._bufferedAmountLowThreshold;
    }
    set bufferedAmountLowThreshold(value) {
        this._bufferedAmountLowThreshold = value;
    }
    get binaryType() {
        return this._binaryType;
    }
    set binaryType(binaryType) {
        this._binaryType = binaryType;
    }
    get onopen() {
        return this._onopen;
    }
    set onopen(handler) {
        if (this._onopen) {
            this.removeEventListener('open', this._onopen);
        }
        this._onopen = handler;
        if (handler) {
            this.addEventListener('open', handler);
        }
    }
    get onclosing() {
        return this._onclosing;
    }
    set onclosing(handler) {
        if (this._onclosing) {
            this.removeEventListener('closing', this._onclosing);
        }
        this._onclosing = handler;
        if (handler) {
            this.addEventListener('closing', handler);
        }
    }
    get onclose() {
        return this._onclose;
    }
    set onclose(handler) {
        if (this._onclose) {
            this.removeEventListener('close', this._onclose);
        }
        this._onclose = handler;
        if (handler) {
            this.addEventListener('close', handler);
        }
    }
    get onmessage() {
        return this._onmessage;
    }
    set onmessage(handler) {
        if (this._onmessage) {
            this.removeEventListener('message', this._onmessage);
        }
        this._onmessage = handler;
        if (handler) {
            this.addEventListener('message', handler);
        }
    }
    get onbufferedamountlow() {
        return this._onbufferedamountlow;
    }
    set onbufferedamountlow(handler) {
        if (this._onbufferedamountlow) {
            this.removeEventListener('bufferedamountlow', this._onbufferedamountlow);
        }
        this._onbufferedamountlow = handler;
        if (handler) {
            this.addEventListener('bufferedamountlow', handler);
        }
    }
    get onerror() {
        return this._onerror;
    }
    set onerror(handler) {
        if (this._onerror) {
            this.removeEventListener('error', this._onerror);
        }
        this._onerror = handler;
        if (handler) {
            this.addEventListener('error', handler);
        }
    }
    addEventListener(type, listener, options) {
        super.addEventListener(type, listener, options);
    }
    removeEventListener(type, listener, options) {
        super.removeEventListener(type, listener, options);
    }
    close() {
        if (['closing', 'closed'].includes(this._readyState)) {
            return;
        }
        this._readyState = 'closed';
    }
    /**
     * We extend the definition of send() to allow Node Buffer. However
     * ArrayBufferView and Blob do not exist in Node.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    send(data) {
        if (this._readyState !== 'open') {
            throw new errors_1.InvalidStateError('not open');
        }
    }
}
