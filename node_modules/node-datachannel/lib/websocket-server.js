import { EventEmitter } from 'events';
import nodeDataChannel from './node-datachannel.js';

export default class WebSocketServer extends EventEmitter {
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
