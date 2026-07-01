"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataConsumer = void 0;
const Logger_1 = require("./Logger");
const enhancedEvents_1 = require("./enhancedEvents");
const logger = new Logger_1.Logger('DataConsumer');
class DataConsumer extends enhancedEvents_1.EnhancedEventEmitter {
    // Id.
    _id;
    // Associated DataProducer Id.
    _dataProducerId;
    // The underlying RTCDataChannel instance.
    _dataChannel;
    // Closed flag.
    _closed = false;
    // SCTP stream parameters.
    _sctpStreamParameters;
    // App custom data.
    _appData;
    // Observer instance.
    _observer = new enhancedEvents_1.EnhancedEventEmitter();
    constructor({ id, dataProducerId, dataChannel, sctpStreamParameters, appData, }) {
        super();
        logger.debug('constructor()');
        this._id = id;
        this._dataProducerId = dataProducerId;
        this._dataChannel = dataChannel;
        this._sctpStreamParameters = sctpStreamParameters;
        this._appData = appData ?? {};
        this.handleDataChannel();
    }
    /**
     * DataConsumer id.
     */
    get id() {
        return this._id;
    }
    /**
     * Associated DataProducer id.
     */
    get dataProducerId() {
        return this._dataProducerId;
    }
    /**
     * Whether the DataConsumer is closed.
     */
    get closed() {
        return this._closed;
    }
    /**
     * SCTP stream parameters.
     */
    get sctpStreamParameters() {
        return this._sctpStreamParameters;
    }
    /**
     * DataChannel readyState.
     */
    get readyState() {
        return this._dataChannel.readyState;
    }
    /**
     * DataChannel label.
     */
    get label() {
        return this._dataChannel.label;
    }
    /**
     * DataChannel protocol.
     */
    get protocol() {
        return this._dataChannel.protocol;
    }
    /**
     * DataChannel binaryType.
     */
    get binaryType() {
        return this._dataChannel.binaryType;
    }
    /**
     * Set DataChannel binaryType.
     */
    set binaryType(binaryType) {
        this._dataChannel.binaryType = binaryType;
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
     * Closes the DataConsumer.
     */
    close() {
        if (this._closed) {
            return;
        }
        logger.debug('close()');
        this._closed = true;
        this._dataChannel.close();
        this.emit('@close');
        // Emit observer event.
        this._observer.safeEmit('close');
        // Invoke close() in EnhancedEventEmitter classes.
        super.close();
        this._observer.close();
    }
    /**
     * Transport was closed.
     */
    transportClosed() {
        if (this._closed) {
            return;
        }
        logger.debug('transportClosed()');
        this._closed = true;
        this._dataChannel.close();
        this.safeEmit('transportclose');
        // Emit observer event.
        this._observer.safeEmit('close');
    }
    handleDataChannel() {
        this._dataChannel.addEventListener('open', () => {
            if (this._closed) {
                return;
            }
            logger.debug('DataChannel "open" event');
            this.safeEmit('open');
        });
        this._dataChannel.addEventListener('error', event => {
            if (this._closed) {
                return;
            }
            const error = event.error ?? new Error('unknown DataChannel error');
            if (event.error?.errorDetail === 'sctp-failure') {
                logger.error('DataChannel SCTP error [sctpCauseCode:%s]: %s', event.error?.sctpCauseCode, event.error.message);
            }
            else {
                logger.error('DataChannel "error" event: %o', error);
            }
            this.safeEmit('error', error);
        });
        this._dataChannel.addEventListener('close', () => {
            if (this._closed) {
                return;
            }
            logger.warn('DataChannel "close" event');
            this._closed = true;
            this.emit('@close');
            this.safeEmit('close');
            // Emit observer event.
            this._observer.safeEmit('close');
        });
        this._dataChannel.addEventListener('message', event => {
            if (this._closed) {
                return;
            }
            this.safeEmit('message', event.data);
        });
    }
}
exports.DataConsumer = DataConsumer;
