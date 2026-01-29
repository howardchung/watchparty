'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var module$1 = require('module');
var stream = require('stream');
var events = require('events');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
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

const DescriptionType = {
    Unspec: 'unspec',
    Offer: 'offer',
    Answer: 'answer',
    Pranswer: 'pranswer',
    Rollback: 'rollback',
};

var index = {
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

exports.Audio = Audio;
exports.DataChannel = DataChannel;
exports.DataChannelStream = DataChannelStream;
exports.DescriptionType = DescriptionType;
exports.PeerConnection = PeerConnection;
exports.RtcpReceivingSession = RtcpReceivingSession;
exports.Track = Track;
exports.Video = Video;
exports.WebSocket = WebSocket;
exports.WebSocketServer = WebSocketServer;
exports.cleanup = cleanup;
exports.default = index;
exports.initLogger = initLogger;
exports.preload = preload;
exports.setSctpSettings = setSctpSettings;
