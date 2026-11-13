import nodeDataChannel from '../lib/index.js';

nodeDataChannel.initLogger('Debug');
nodeDataChannel.preload();

const webSocketServer = new nodeDataChannel.WebSocketServer({ bindAddress: '127.0.0.1', port: 1987 });

webSocketServer.onClient((serverSocket) => {
    console.log(
        'webSocketServer.onClient() remoteAddress: ' + serverSocket.remoteAddress() + ', path: ' + serverSocket.path(),
    );

    serverSocket.onOpen(() => {
        console.log('serverSocket.onOpen()');
    });

    serverSocket.onMessage((message) => {
        console.log('serverSocket.onMessage():', message);
        serverSocket.sendMessage('reply to ' + message);
    });

    serverSocket.onClosed(() => {
        console.log('serverSocket.onClosed()');
        serverSocket.close();
    });
});

const clientSocket = new nodeDataChannel.WebSocket();

clientSocket.onOpen(() => {
    console.log('clientSocket.onOpen()');
    clientSocket.sendMessage('Hello');
});

clientSocket.onMessage((message) => {
    console.log('clientSocket.onMessage():', message);
    clientSocket.forceClose();
    webSocketServer.stop();
});

clientSocket.onClosed(() => {
    console.log('clientSocket.onClosed()');
    clientSocket.close();
});

clientSocket.open('ws://127.0.0.1:1987');

setTimeout(() => {
    nodeDataChannel.cleanup();
}, 1000);
