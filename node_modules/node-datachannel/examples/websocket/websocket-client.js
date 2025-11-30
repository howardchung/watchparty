import * as nodeDataChannel from '../../lib/index.js';

const clientSocket = new nodeDataChannel.WebSocket();

clientSocket.open('ws://127.0.0.1:3000');

clientSocket.onOpen(() => {
    console.log('Client socket opened');
    clientSocket.sendMessage('Echo this!');
});

clientSocket.onMessage((message) => {
    console.log('Message from server: ' + message);
});

clientSocket.onClosed(() => {
    console.log('Client socket closed');
});

// clientSocket.close();
