import * as nodeDataChannel from '../../lib/index.js';

const ws = new nodeDataChannel.WebSocketServer({ bindAddress: '127.0.0.1', port: 3000 });

ws.onClient((clientSocket) => {
    clientSocket.onOpen(() => {
        console.log('Client socket opened');
        clientSocket.sendMessage('Hello from server');
    });

    clientSocket.onMessage((message) => {
        console.log('Message from client: ' + message);
        clientSocket.sendMessage(message);
    });

    clientSocket.onClosed(() => {
        console.log('Client socket closed');
    });
});

// When done, close the server
// ws.stop();
