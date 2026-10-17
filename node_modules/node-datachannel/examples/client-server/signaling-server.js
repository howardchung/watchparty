import nodeDataChannel from '../../lib/index.js';

// Init Logger
nodeDataChannel.initLogger('Debug');

const clients = {};

const wsServer = new nodeDataChannel.WebSocketServer({ bindAddress: '127.0.0.1', port: 8000 });

wsServer.onClient((ws) => {
    let id = '';

    ws.onOpen(() => {
        id = ws.path().replace('/', '');
        console.log(`New Connection from ${id}`);
        clients[id] = ws;
    });

    ws.onMessage((buffer) => {
        let msg = JSON.parse(buffer);
        let peerId = msg.id;
        let peerWs = clients[peerId];

        console.log(`Message from ${id} to ${peerId} : ${buffer}`);
        if (!peerWs) return console.error(`Can not find peer with ID ${peerId}`);

        msg.id = id;
        peerWs.sendMessage(JSON.stringify(msg));
    });

    ws.onClosed(() => {
        console.log(`${id} disconnected`);
        delete clients[id];
    });

    ws.onError((err) => {
        console.error(err);
    });
});
