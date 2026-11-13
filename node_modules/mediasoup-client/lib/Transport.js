"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transport = void 0;
const awaitqueue_1 = require("awaitqueue");
const Logger_1 = require("./Logger");
const enhancedEvents_1 = require("./enhancedEvents");
const errors_1 = require("./errors");
const utils = require("./utils");
const ortc = require("./ortc");
const Producer_1 = require("./Producer");
const Consumer_1 = require("./Consumer");
const DataProducer_1 = require("./DataProducer");
const DataConsumer_1 = require("./DataConsumer");
const logger = new Logger_1.Logger('Transport');
class ConsumerCreationTask {
    consumerOptions;
    promise;
    resolve;
    reject;
    constructor(consumerOptions) {
        this.consumerOptions = consumerOptions;
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}
class Transport extends enhancedEvents_1.EnhancedEventEmitter {
    // Id.
    _id;
    // Closed flag.
    _closed = false;
    // Direction.
    _direction;
    // Callback for sending Transports to request sending extended RTP capabilities
    // on demand.
    _getSendExtendedRtpCapabilities;
    // Recv RTP capabilities.
    _recvRtpCapabilities;
    // Whether we can produce audio/video based on computed extended RTP
    // capabilities.
    _canProduceByKind;
    // SCTP max message size if enabled, null otherwise.
    _maxSctpMessageSize;
    // RTC handler isntance.
    _handler;
    // Transport ICE gathering state.
    _iceGatheringState = 'new';
    // Transport connection state.
    _connectionState = 'new';
    // App custom data.
    _appData;
    // Map of Producers indexed by id.
    _producers = new Map();
    // Map of Consumers indexed by id.
    _consumers = new Map();
    // Map of DataProducers indexed by id.
    _dataProducers = new Map();
    // Map of DataConsumers indexed by id.
    _dataConsumers = new Map();
    // Whether the Consumer for RTP probation has been created.
    _probatorConsumerCreated = false;
    // AwaitQueue instance to make async tasks happen sequentially.
    _awaitQueue = new awaitqueue_1.AwaitQueue();
    // Consumer creation tasks awaiting to be processed.
    _pendingConsumerTasks = [];
    // Consumer creation in progress flag.
    _consumerCreationInProgress = false;
    // Consumers pending to be paused.
    _pendingPauseConsumers = new Map();
    // Consumer pause in progress flag.
    _consumerPauseInProgress = false;
    // Consumers pending to be resumed.
    _pendingResumeConsumers = new Map();
    // Consumer resume in progress flag.
    _consumerResumeInProgress = false;
    // Consumers pending to be closed.
    _pendingCloseConsumers = new Map();
    // Consumer close in progress flag.
    _consumerCloseInProgress = false;
    // Observer instance.
    _observer = new enhancedEvents_1.EnhancedEventEmitter();
    constructor({ direction, id, iceParameters, iceCandidates, dtlsParameters, sctpParameters, iceServers, iceTransportPolicy, additionalSettings, appData, handlerFactory, getSendExtendedRtpCapabilities, recvRtpCapabilities, canProduceByKind, }) {
        super();
        logger.debug('constructor() [id:%s, direction:%s]', id, direction);
        this._id = id;
        this._direction = direction;
        this._getSendExtendedRtpCapabilities = getSendExtendedRtpCapabilities;
        this._recvRtpCapabilities = recvRtpCapabilities;
        this._canProduceByKind = canProduceByKind;
        this._maxSctpMessageSize = sctpParameters
            ? sctpParameters.maxMessageSize
            : null;
        // Clone and sanitize additionalSettings.
        const clonedAdditionalSettings = utils.clone(additionalSettings) ?? {};
        delete clonedAdditionalSettings.iceServers;
        delete clonedAdditionalSettings.iceTransportPolicy;
        delete clonedAdditionalSettings.bundlePolicy;
        delete clonedAdditionalSettings.rtcpMuxPolicy;
        this._handler = handlerFactory.factory({
            direction,
            iceParameters,
            iceCandidates,
            dtlsParameters,
            sctpParameters,
            iceServers,
            iceTransportPolicy,
            additionalSettings: clonedAdditionalSettings,
            getSendExtendedRtpCapabilities: this._getSendExtendedRtpCapabilities,
        });
        this._appData = appData ?? {};
        this.handleHandler();
    }
    /**
     * Transport id.
     */
    get id() {
        return this._id;
    }
    /**
     * Whether the Transport is closed.
     */
    get closed() {
        return this._closed;
    }
    /**
     * Transport direction.
     */
    get direction() {
        return this._direction;
    }
    /**
     * RTC handler instance.
     */
    get handler() {
        return this._handler;
    }
    /**
     * ICE gathering state.
     */
    get iceGatheringState() {
        return this._iceGatheringState;
    }
    /**
     * Connection state.
     */
    get connectionState() {
        return this._connectionState;
    }
    /**
     * App custom data.
     */
    get appData() {
        return this._appData;
    }
    /**
     * App custom data setter.
     */
    set appData(appData) {
        this._appData = appData;
    }
    get observer() {
        return this._observer;
    }
    /**
     * Close the Transport.
     */
    close() {
        if (this._closed) {
            return;
        }
        logger.debug('close()');
        this._closed = true;
        // Stop the AwaitQueue.
        this._awaitQueue.stop();
        // Close the handler.
        this._handler.close();
        // Change connection state to 'closed' since the handler may not emit
        // '@connectionstatechange' event.
        this._connectionState = 'closed';
        // Close all Producers.
        for (const producer of this._producers.values()) {
            producer.transportClosed();
        }
        this._producers.clear();
        // Close all Consumers.
        for (const consumer of this._consumers.values()) {
            consumer.transportClosed();
        }
        this._consumers.clear();
        // Close all DataProducers.
        for (const dataProducer of this._dataProducers.values()) {
            dataProducer.transportClosed();
        }
        this._dataProducers.clear();
        // Close all DataConsumers.
        for (const dataConsumer of this._dataConsumers.values()) {
            dataConsumer.transportClosed();
        }
        this._dataConsumers.clear();
        // Emit observer event.
        this._observer.safeEmit('close');
        // Invoke close() in EnhancedEventEmitter classes.
        super.close();
        this._observer.close();
    }
    /**
     * Get associated Transport (RTCPeerConnection) stats.
     *
     * @returns {RTCStatsReport}
     */
    async getStats() {
        if (this._closed) {
            throw new errors_1.InvalidStateError('closed');
        }
        return this._handler.getTransportStats();
    }
    /**
     * Restart ICE connection.
     */
    async restartIce({ iceParameters, }) {
        logger.debug('restartIce()');
        if (this._closed) {
            throw new errors_1.InvalidStateError('closed');
        }
        else if (!iceParameters) {
            throw new TypeError('missing iceParameters');
        }
        // Enqueue command.
        return this._awaitQueue.push(async () => await this._handler.restartIce(iceParameters), 'transport.restartIce()');
    }
    /**
     * Update ICE servers.
     */
    async updateIceServers({ iceServers, } = {}) {
        logger.debug('updateIceServers()');
        if (this._closed) {
            throw new errors_1.InvalidStateError('closed');
        }
        else if (!Array.isArray(iceServers)) {
            throw new TypeError('missing iceServers');
        }
        // Enqueue command.
        return this._awaitQueue.push(async () => this._handler.updateIceServers(iceServers), 'transport.updateIceServers()');
    }
    /**
     * Create a Producer.
     */
    async produce({ track, streamId, encodings, codecOptions, headerExtensionOptions, codec, stopTracks = true, disableTrackOnPause = true, zeroRtpOnPause = false, onRtpSender, appData = {}, } = {}) {
        logger.debug('produce() [track:%o]', track);
        if (this._closed) {
            throw new errors_1.InvalidStateError('closed');
        }
        else if (!track) {
            throw new TypeError('missing track');
        }
        else if (this._direction !== 'send') {
            throw new errors_1.UnsupportedError('not a sending Transport');
        }
        else if (!this._canProduceByKind[track.kind]) {
            throw new errors_1.UnsupportedError(`cannot produce ${track.kind}`);
        }
        else if (track.readyState === 'ended') {
            throw new errors_1.InvalidStateError('track ended');
        }
        else if (this.listenerCount('connect') === 0 &&
            this._connectionState === 'new') {
            throw new TypeError('no "connect" listener set into this transport');
        }
        else if (this.listenerCount('produce') === 0) {
            throw new TypeError('no "produce" listener set into this transport');
        }
        else if (appData && typeof appData !== 'object') {
            throw new TypeError('if given, appData must be an object');
        }
        // Enqueue command.
        return (this._awaitQueue
            .push(async () => {
            let normalizedEncodings;
            if (encodings && !Array.isArray(encodings)) {
                throw TypeError('encodings must be an array');
            }
            else if (encodings?.length === 0) {
                normalizedEncodings = undefined;
            }
            else if (encodings) {
                normalizedEncodings = encodings.map(encoding => {
                    const normalizedEncoding = {
                        active: true,
                    };
                    if (encoding.active === false) {
                        normalizedEncoding.active = false;
                    }
                    if (typeof encoding.dtx === 'boolean') {
                        normalizedEncoding.dtx = encoding.dtx;
                    }
                    if (typeof encoding.scalabilityMode === 'string') {
                        normalizedEncoding.scalabilityMode = encoding.scalabilityMode;
                    }
                    if (typeof encoding.scaleResolutionDownBy === 'number') {
                        normalizedEncoding.scaleResolutionDownBy =
                            encoding.scaleResolutionDownBy;
                    }
                    if (typeof encoding.maxBitrate === 'number') {
                        normalizedEncoding.maxBitrate = encoding.maxBitrate;
                    }
                    if (typeof encoding.maxFramerate === 'number') {
                        normalizedEncoding.maxFramerate = encoding.maxFramerate;
                    }
                    if (typeof encoding.adaptivePtime === 'boolean') {
                        normalizedEncoding.adaptivePtime = encoding.adaptivePtime;
                    }
                    if (typeof encoding.priority === 'string') {
                        normalizedEncoding.priority = encoding.priority;
                    }
                    if (typeof encoding.networkPriority === 'string') {
                        normalizedEncoding.networkPriority = encoding.networkPriority;
                    }
                    return normalizedEncoding;
                });
            }
            const { localId, rtpParameters, rtpSender } = await this._handler.send({
                track,
                streamId,
                encodings: normalizedEncodings,
                codecOptions,
                headerExtensionOptions,
                codec,
                onRtpSender,
            });
            try {
                // This will fill rtpParameters's missing fields with default values.
                ortc.validateAndNormalizeRtpParameters(rtpParameters);
                const { id } = await new Promise((resolve, reject) => {
                    this.safeEmit('produce', {
                        kind: track.kind,
                        rtpParameters,
                        appData,
                    }, resolve, reject);
                });
                const producer = new Producer_1.Producer({
                    id,
                    localId,
                    rtpSender,
                    track,
                    rtpParameters,
                    stopTracks,
                    disableTrackOnPause,
                    zeroRtpOnPause,
                    appData,
                });
                this._producers.set(producer.id, producer);
                this.handleProducer(producer);
                // Emit observer event.
                this._observer.safeEmit('newproducer', producer);
                return producer;
            }
            catch (error) {
                this._handler.stopSending(localId).catch(() => { });
                throw error;
            }
        }, 'transport.produce()')
            // This catch is needed to stop the given track if the command above
            // failed due to closed Transport.
            .catch((error) => {
            if (stopTracks) {
                try {
                    track.stop();
                }
                catch (error2) { }
            }
            throw error;
        }));
    }
    /**
     * Create a Consumer to consume a remote Producer.
     */
    async consume({ id, producerId, kind, rtpParameters, streamId, onRtpReceiver, appData = {}, }) {
        logger.debug('consume()');
        if (this._closed) {
            throw new errors_1.InvalidStateError('closed');
        }
        else if (this._direction !== 'recv') {
            throw new errors_1.UnsupportedError('not a receiving Transport');
        }
        else if (typeof id !== 'string') {
            throw new TypeError('missing id');
        }
        else if (typeof producerId !== 'string') {
            throw new TypeError('missing producerId');
        }
        else if (kind !== 'audio' && kind !== 'video') {
            throw new TypeError(`invalid kind '${kind}'`);
        }
        else if (this.listenerCount('connect') === 0 &&
            this._connectionState === 'new') {
            throw new TypeError('no "connect" listener set into this transport');
        }
        else if (appData && typeof appData !== 'object') {
            throw new TypeError('if given, appData must be an object');
        }
        // Clone given RTP parameters to not modify input data.
        const clonedRtpParameters = utils.clone(rtpParameters);
        // Ensure the device can consume it.
        const canConsume = ortc.canReceive(clonedRtpParameters, this._recvRtpCapabilities);
        if (!canConsume) {
            throw new errors_1.UnsupportedError('cannot consume this Producer');
        }
        const consumerCreationTask = new ConsumerCreationTask({
            id,
            producerId,
            kind,
            rtpParameters: clonedRtpParameters,
            streamId,
            onRtpReceiver,
            appData,
        });
        // Store the Consumer creation task.
        this._pendingConsumerTasks.push(consumerCreationTask);
        // There is no Consumer creation in progress, create it now.
        queueMicrotask(() => {
            if (this._closed) {
                return;
            }
            if (this._consumerCreationInProgress === false) {
                this.createPendingConsumers();
            }
        });
        return consumerCreationTask.promise;
    }
    /**
     * Create a DataProducer
     */
    async produceData({ ordered = true, maxPacketLifeTime, maxRetransmits, label = '', protocol = '', appData = {}, } = {}) {
        logger.debug('produceData()');
        if (this._closed) {
            throw new errors_1.InvalidStateError('closed');
        }
        else if (this._direction !== 'send') {
            throw new errors_1.UnsupportedError('not a sending Transport');
        }
        else if (!this._maxSctpMessageSize) {
            throw new errors_1.UnsupportedError('SCTP not enabled by remote Transport');
        }
        else if (this.listenerCount('connect') === 0 &&
            this._connectionState === 'new') {
            throw new TypeError('no "connect" listener set into this transport');
        }
        else if (this.listenerCount('producedata') === 0) {
            throw new TypeError('no "producedata" listener set into this transport');
        }
        else if (appData && typeof appData !== 'object') {
            throw new TypeError('if given, appData must be an object');
        }
        if (maxPacketLifeTime || maxRetransmits) {
            ordered = false;
        }
        // Enqueue command.
        return this._awaitQueue.push(async () => {
            const { dataChannel, sctpStreamParameters } = await this._handler.sendDataChannel({
                ordered,
                maxPacketLifeTime,
                maxRetransmits,
                label,
                protocol,
            });
            // This will fill sctpStreamParameters's missing fields with default values.
            ortc.validateAndNormalizeSctpStreamParameters(sctpStreamParameters);
            const { id } = await new Promise((resolve, reject) => {
                this.safeEmit('producedata', {
                    sctpStreamParameters,
                    label,
                    protocol,
                    appData,
                }, resolve, reject);
            });
            const dataProducer = new DataProducer_1.DataProducer({
                id,
                dataChannel,
                sctpStreamParameters,
                appData,
            });
            this._dataProducers.set(dataProducer.id, dataProducer);
            this.handleDataProducer(dataProducer);
            // Emit observer event.
            this._observer.safeEmit('newdataproducer', dataProducer);
            return dataProducer;
        }, 'transport.produceData()');
    }
    /**
     * Create a DataConsumer
     */
    async consumeData({ id, dataProducerId, sctpStreamParameters, label = '', protocol = '', appData = {}, }) {
        logger.debug('consumeData()');
        if (this._closed) {
            throw new errors_1.InvalidStateError('closed');
        }
        else if (this._direction !== 'recv') {
            throw new errors_1.UnsupportedError('not a receiving Transport');
        }
        else if (!this._maxSctpMessageSize) {
            throw new errors_1.UnsupportedError('SCTP not enabled by remote Transport');
        }
        else if (typeof id !== 'string') {
            throw new TypeError('missing id');
        }
        else if (typeof dataProducerId !== 'string') {
            throw new TypeError('missing dataProducerId');
        }
        else if (this.listenerCount('connect') === 0 &&
            this._connectionState === 'new') {
            throw new TypeError('no "connect" listener set into this transport');
        }
        else if (appData && typeof appData !== 'object') {
            throw new TypeError('if given, appData must be an object');
        }
        // Clone given SCTP stream parameters to not modify input data.
        const clonedSctpStreamParameters = utils.clone(sctpStreamParameters);
        // This may throw.
        ortc.validateAndNormalizeSctpStreamParameters(clonedSctpStreamParameters);
        // Enqueue command.
        return this._awaitQueue.push(async () => {
            const { dataChannel } = await this._handler.receiveDataChannel({
                sctpStreamParameters: clonedSctpStreamParameters,
                label,
                protocol,
            });
            const dataConsumer = new DataConsumer_1.DataConsumer({
                id,
                dataProducerId,
                dataChannel,
                sctpStreamParameters: clonedSctpStreamParameters,
                appData,
            });
            this._dataConsumers.set(dataConsumer.id, dataConsumer);
            this.handleDataConsumer(dataConsumer);
            // Emit observer event.
            this._observer.safeEmit('newdataconsumer', dataConsumer);
            return dataConsumer;
        }, 'transport.consumeData()');
    }
    // This method is guaranteed to never throw.
    createPendingConsumers() {
        this._consumerCreationInProgress = true;
        this._awaitQueue
            .push(async () => {
            if (this._pendingConsumerTasks.length === 0) {
                logger.debug('createPendingConsumers() | there is no Consumer to be created');
                return;
            }
            const pendingConsumerTasks = [...this._pendingConsumerTasks];
            // Clear pending Consumer tasks.
            this._pendingConsumerTasks = [];
            // Video Consumer in order to create the probator.
            let videoConsumerForProbator = undefined;
            // Fill options list.
            const optionsList = [];
            for (const task of pendingConsumerTasks) {
                const { id, kind, rtpParameters, streamId, onRtpReceiver } = task.consumerOptions;
                optionsList.push({
                    trackId: id,
                    kind: kind,
                    rtpParameters,
                    streamId,
                    onRtpReceiver,
                });
            }
            try {
                const results = await this._handler.receive(optionsList);
                for (let idx = 0; idx < results.length; ++idx) {
                    const task = pendingConsumerTasks[idx];
                    const result = results[idx];
                    const { id, producerId, kind, rtpParameters, appData } = task.consumerOptions;
                    const { localId, rtpReceiver, track } = result;
                    const consumer = new Consumer_1.Consumer({
                        id,
                        localId,
                        producerId,
                        rtpReceiver,
                        track,
                        rtpParameters,
                        appData: appData,
                    });
                    this._consumers.set(consumer.id, consumer);
                    this.handleConsumer(consumer);
                    // If this is the first video Consumer and the Consumer for RTP probation
                    // has not yet been created, it's time to create it.
                    if (!this._probatorConsumerCreated &&
                        !videoConsumerForProbator &&
                        kind === 'video') {
                        videoConsumerForProbator = consumer;
                    }
                    // Emit observer event.
                    this._observer.safeEmit('newconsumer', consumer);
                    task.resolve(consumer);
                }
            }
            catch (error) {
                for (const task of pendingConsumerTasks) {
                    task.reject(error);
                }
            }
            // If RTP probation must be handled, do it now.
            if (videoConsumerForProbator) {
                try {
                    const probatorRtpParameters = ortc.generateProbatorRtpParameters(videoConsumerForProbator.rtpParameters);
                    await this._handler.receive([
                        {
                            trackId: 'probator',
                            kind: 'video',
                            rtpParameters: probatorRtpParameters,
                        },
                    ]);
                    logger.debug('createPendingConsumers() | Consumer for RTP probation created');
                    this._probatorConsumerCreated = true;
                }
                catch (error) {
                    logger.error('createPendingConsumers() | failed to create Consumer for RTP probation:%o', error);
                }
            }
        }, 'transport.createPendingConsumers()')
            .then(() => {
            this._consumerCreationInProgress = false;
            // There are pending Consumer tasks, enqueue their creation.
            if (this._pendingConsumerTasks.length > 0) {
                this.createPendingConsumers();
            }
        })
            // NOTE: We only get here when the await queue is closed.
            .catch(() => { });
    }
    pausePendingConsumers() {
        this._consumerPauseInProgress = true;
        this._awaitQueue
            .push(async () => {
            if (this._pendingPauseConsumers.size === 0) {
                logger.debug('pausePendingConsumers() | there is no Consumer to be paused');
                return;
            }
            const pendingPauseConsumers = Array.from(this._pendingPauseConsumers.values());
            // Clear pending pause Consumer map.
            this._pendingPauseConsumers.clear();
            try {
                const localIds = pendingPauseConsumers.map(consumer => consumer.localId);
                await this._handler.pauseReceiving(localIds);
            }
            catch (error) {
                logger.error('pausePendingConsumers() | failed to pause Consumers:', error);
            }
        }, 'transport.pausePendingConsumers()')
            .then(() => {
            this._consumerPauseInProgress = false;
            // There are pending Consumers to be paused, do it.
            if (this._pendingPauseConsumers.size > 0) {
                this.pausePendingConsumers();
            }
        })
            // NOTE: We only get here when the await queue is closed.
            .catch(() => { });
    }
    resumePendingConsumers() {
        this._consumerResumeInProgress = true;
        this._awaitQueue
            .push(async () => {
            if (this._pendingResumeConsumers.size === 0) {
                logger.debug('resumePendingConsumers() | there is no Consumer to be resumed');
                return;
            }
            const pendingResumeConsumers = Array.from(this._pendingResumeConsumers.values());
            // Clear pending resume Consumer map.
            this._pendingResumeConsumers.clear();
            try {
                const localIds = pendingResumeConsumers.map(consumer => consumer.localId);
                await this._handler.resumeReceiving(localIds);
            }
            catch (error) {
                logger.error('resumePendingConsumers() | failed to resume Consumers:', error);
            }
        }, 'transport.resumePendingConsumers()')
            .then(() => {
            this._consumerResumeInProgress = false;
            // There are pending Consumer to be resumed, do it.
            if (this._pendingResumeConsumers.size > 0) {
                this.resumePendingConsumers();
            }
        })
            // NOTE: We only get here when the await queue is closed.
            .catch(() => { });
    }
    closePendingConsumers() {
        this._consumerCloseInProgress = true;
        this._awaitQueue
            .push(async () => {
            if (this._pendingCloseConsumers.size === 0) {
                logger.debug('closePendingConsumers() | there is no Consumer to be closed');
                return;
            }
            const pendingCloseConsumers = Array.from(this._pendingCloseConsumers.values());
            // Clear pending close Consumer map.
            this._pendingCloseConsumers.clear();
            try {
                await this._handler.stopReceiving(pendingCloseConsumers.map(consumer => consumer.localId));
            }
            catch (error) {
                logger.error('closePendingConsumers() | failed to close Consumers:', error);
            }
        }, 'transport.closePendingConsumers()')
            .then(() => {
            this._consumerCloseInProgress = false;
            // There are pending Consumer to be resumed, do it.
            if (this._pendingCloseConsumers.size > 0) {
                this.closePendingConsumers();
            }
        })
            // NOTE: We only get here when the await queue is closed.
            .catch(() => { });
    }
    handleHandler() {
        const handler = this._handler;
        handler.on('@connect', ({ dtlsParameters }, callback, errback) => {
            if (this._closed) {
                errback(new errors_1.InvalidStateError('closed'));
                return;
            }
            this.safeEmit('connect', { dtlsParameters }, callback, errback);
        });
        handler.on('@icegatheringstatechange', (iceGatheringState) => {
            if (iceGatheringState === this._iceGatheringState) {
                return;
            }
            logger.debug('ICE gathering state changed to %s', iceGatheringState);
            this._iceGatheringState = iceGatheringState;
            if (!this._closed) {
                this.safeEmit('icegatheringstatechange', iceGatheringState);
            }
        });
        handler.on('@icecandidateerror', (event) => {
            logger.warn(`ICE candidate error [url:${event.url}, localAddress:${event.address}, localPort:${event.port}]: ${event.errorCode} "${event.errorText}"`);
            this.safeEmit('icecandidateerror', event);
        });
        handler.on('@connectionstatechange', (connectionState) => {
            if (connectionState === this._connectionState) {
                return;
            }
            logger.debug('connection state changed to %s', connectionState);
            this._connectionState = connectionState;
            if (!this._closed) {
                this.safeEmit('connectionstatechange', connectionState);
            }
        });
    }
    handleProducer(producer) {
        producer.on('@close', () => {
            this._producers.delete(producer.id);
            if (this._closed) {
                return;
            }
            this._awaitQueue
                .push(async () => await this._handler.stopSending(producer.localId), 'producer @close event')
                .catch((error) => logger.warn('producer.close() failed:%o', error));
        });
        producer.on('@pause', (callback, errback) => {
            this._awaitQueue
                .push(async () => await this._handler.pauseSending(producer.localId), 'producer @pause event')
                .then(callback)
                .catch(errback);
        });
        producer.on('@resume', (callback, errback) => {
            this._awaitQueue
                .push(async () => await this._handler.resumeSending(producer.localId), 'producer @resume event')
                .then(callback)
                .catch(errback);
        });
        producer.on('@replacetrack', (track, callback, errback) => {
            this._awaitQueue
                .push(async () => await this._handler.replaceTrack(producer.localId, track), 'producer @replacetrack event')
                .then(callback)
                .catch(errback);
        });
        producer.on('@setmaxspatiallayer', (spatialLayer, callback, errback) => {
            this._awaitQueue
                .push(async () => await this._handler.setMaxSpatialLayer(producer.localId, spatialLayer), 'producer @setmaxspatiallayer event')
                .then(callback)
                .catch(errback);
        });
        producer.on('@setrtpencodingparameters', (params, callback, errback) => {
            this._awaitQueue
                .push(async () => await this._handler.setRtpEncodingParameters(producer.localId, params), 'producer @setrtpencodingparameters event')
                .then(callback)
                .catch(errback);
        });
        producer.on('@getstats', (callback, errback) => {
            if (this._closed) {
                return errback(new errors_1.InvalidStateError('closed'));
            }
            this._handler
                .getSenderStats(producer.localId)
                .then(callback)
                .catch(errback);
        });
    }
    handleConsumer(consumer) {
        consumer.on('@close', () => {
            this._consumers.delete(consumer.id);
            this._pendingPauseConsumers.delete(consumer.id);
            this._pendingResumeConsumers.delete(consumer.id);
            if (this._closed) {
                return;
            }
            // Store the Consumer into the close list.
            this._pendingCloseConsumers.set(consumer.id, consumer);
            // There is no Consumer close in progress, do it now.
            if (this._consumerCloseInProgress === false) {
                this.closePendingConsumers();
            }
        });
        consumer.on('@pause', () => {
            // If Consumer is pending to be resumed, remove from pending resume list.
            if (this._pendingResumeConsumers.has(consumer.id)) {
                this._pendingResumeConsumers.delete(consumer.id);
            }
            // Store the Consumer into the pending list.
            this._pendingPauseConsumers.set(consumer.id, consumer);
            // There is no Consumer pause in progress, do it now.
            queueMicrotask(() => {
                if (this._closed) {
                    return;
                }
                if (this._consumerPauseInProgress === false) {
                    this.pausePendingConsumers();
                }
            });
        });
        consumer.on('@resume', () => {
            // If Consumer is pending to be paused, remove from pending pause list.
            if (this._pendingPauseConsumers.has(consumer.id)) {
                this._pendingPauseConsumers.delete(consumer.id);
            }
            // Store the Consumer into the pending list.
            this._pendingResumeConsumers.set(consumer.id, consumer);
            // There is no Consumer resume in progress, do it now.
            queueMicrotask(() => {
                if (this._closed) {
                    return;
                }
                if (this._consumerResumeInProgress === false) {
                    this.resumePendingConsumers();
                }
            });
        });
        consumer.on('@getstats', (callback, errback) => {
            if (this._closed) {
                return errback(new errors_1.InvalidStateError('closed'));
            }
            this._handler
                .getReceiverStats(consumer.localId)
                .then(callback)
                .catch(errback);
        });
    }
    handleDataProducer(dataProducer) {
        dataProducer.on('@close', () => {
            this._dataProducers.delete(dataProducer.id);
        });
    }
    handleDataConsumer(dataConsumer) {
        dataConsumer.on('@close', () => {
            this._dataConsumers.delete(dataConsumer.id);
        });
    }
}
exports.Transport = Transport;
