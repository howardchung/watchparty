import { jest } from '@jest/globals';
import * as nodeDataChannel from '../../lib';

describe('Websocket', () => {
    const webSocketServer = new nodeDataChannel.WebSocketServer({ bindAddress: '127.0.0.1', port: 1987 });
    const clientSocket = new nodeDataChannel.WebSocket();

    // Mocks
    const clientOnOpenMock = jest.fn();
    const clientOnMessageMock = jest.fn();
    const clientOnCLosedMock = jest.fn();

    const webServerOnClientMock = jest.fn();
    const webServerOnOpenMock = jest.fn();
    const webServerOnMessageMock = jest.fn();
    const webServerOnClosedMock = jest.fn();

    webSocketServer.onClient((serverSocket) => {
        webServerOnClientMock();

        serverSocket.onOpen(() => {
            webServerOnOpenMock();
        });

        serverSocket.onMessage((message) => {
            webServerOnMessageMock(message);
            serverSocket.sendMessage('reply to ' + message);
            serverSocket.close();
        });

        serverSocket.onClosed(() => {
            webServerOnClosedMock();
            serverSocket.close();
        });
    });

    test('can create a websocket client and connect to a server', (done) => {
        clientSocket.open('ws://127.0.0.1:1987');
        clientSocket.onOpen(() => {
            clientOnOpenMock();
            clientSocket.sendMessage('Hello');
        });

        clientSocket.onMessage((message) => {
            clientOnMessageMock(message);
        });

        clientSocket.onClosed(() => {
            clientOnCLosedMock();
        });

        setTimeout(() => {
            expect(clientOnMessageMock.mock.calls[0][0]).toEqual('reply to Hello');
            expect(clientOnOpenMock.mock.calls.length).toBe(1);
            expect(clientOnMessageMock.mock.calls.length).toBe(1);
            expect(clientOnCLosedMock.mock.calls.length).toBe(1);

            expect(webServerOnMessageMock.mock.calls[0][0]).toEqual('Hello');
            expect(webServerOnOpenMock.mock.calls.length).toBe(1);
            expect(webServerOnMessageMock.mock.calls.length).toBe(1);
            expect(webServerOnClosedMock.mock.calls.length).toBe(1);

            clientSocket.close();
            webSocketServer.stop();

            done();
        }, 3000);
    });
});
