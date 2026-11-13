/* eslint-disable @typescript-eslint/no-var-requires */
const nodeDataChannel = require('node-datachannel');
const WebSocket = require('ws');
const { ipcMain } = require('electron');

export function run(mainWindow) {
    nodeDataChannel.initLogger('Debug');
    nodeDataChannel.preload();

    // My ID
    let myId = getRandomString(4);
    let _remoteId = '';
    mainWindow.webContents.send('my-id', myId);

    // PeerConnection Map
    const pcMap = {};
    const dcMap = {};

    // Signaling Server
    const WS_URL = process.env.WS_URL || 'ws://localhost:8000';
    const ws = new WebSocket(WS_URL + '/' + myId, {
        perMessageDeflate: false,
    });

    ws.on('open', () => {
        console.log('WebSocket connected, signaling ready');
    });

    ws.on('error', (err) => {
        console.log('WebSocket Error: ', err);
    });

    ws.on('message', (msgStr) => {
        let msg = JSON.parse(msgStr);
        switch (msg.type) {
            case 'offer':
                _remoteId = msg.id;
                mainWindow.webContents.send('connect', _remoteId);
                createPeerConnection(msg.id);
                pcMap[msg.id].setRemoteDescription(msg.description, msg.type);
                break;
            case 'answer':
                pcMap[msg.id].setRemoteDescription(msg.description, msg.type);
                break;
            case 'candidate':
                pcMap[msg.id].addRemoteCandidate(msg.candidate, msg.mid);
                break;

            default:
                break;
        }
    });

    ipcMain.on('connect', (e, remoteId) => {
        _remoteId = remoteId;
        createPeerConnection(remoteId);
        dcMap[remoteId] = pcMap[remoteId].createDataChannel('chat');
        dcMap[remoteId].onOpen(() => {
            mainWindow.webContents.send('message', remoteId, '[DataChannel opened]');
        });

        dcMap[remoteId].onMessage((msg) => {
            console.log('Message from ' + remoteId + ' received:', msg);
            // Add message to textarea
            mainWindow.webContents.send('message', remoteId, msg);
        });
    });

    ipcMain.on('send-message', (e, remoteId, msg) => {
        dcMap[remoteId].sendMessage(msg);
    });

    let intervalref = null;
    ipcMain.on('send-random-message', (e, enabled, interval) => {
        if (intervalref) clearInterval(intervalref);
        if (!enabled) return;

        intervalref = setInterval(() => {
            if (_remoteId && _remoteId.length > 2) {
                let msg = getRandomString(10);
                mainWindow.webContents.send('message', 'me', msg);
                dcMap[_remoteId].sendMessage(msg);
            }
        }, interval);
    });

    function createPeerConnection(peerId) {
        // Create PeerConnection
        let peerConnection = new nodeDataChannel.PeerConnection(myId, { iceServers: ['stun:stun.l.google.com:19302'] });
        peerConnection.onStateChange((state) => {
            console.log('State: ', state);
            // set state value
            mainWindow.webContents.send('state-update', state);
        });
        peerConnection.onGatheringStateChange((state) => {
            console.log('GatheringState: ', state);
        });
        peerConnection.onLocalDescription((description, type) => {
            ws.send(JSON.stringify({ id: peerId, type, description }));
        });
        peerConnection.onLocalCandidate((candidate, mid) => {
            ws.send(JSON.stringify({ id: peerId, type: 'candidate', candidate, mid }));
        });
        peerConnection.onDataChannel((dc) => {
            console.log('DataChannel from ' + peerId + ' received with label "', dc.getLabel() + '"');
            mainWindow.webContents.send('message', peerId, '[DataChannel opened]');
            dcMap[peerId] = dc;
            dc.onMessage((msg) => {
                console.log('Message from ' + peerId + ' received:', msg);
                // Add message to textarea
                mainWindow.webContents.send('message', peerId, msg);
            });
        });

        pcMap[peerId] = peerConnection;
    }

    function getRandomString(length) {
        return Math.random()
            .toString(36)
            .substring(2, 2 + length);
    }
}
