import readline from 'readline';
import nodeDataChannel from '../../lib/index.js';

// Init Logger
nodeDataChannel.initLogger('Error');

// PeerConnection Map
const pcMap = {};

// Local ID
const id = randomId(4);

// Signaling Server
const WS_URL = process.env.WS_URL || 'ws://localhost:8000';
const ws = new nodeDataChannel.WebSocket();
ws.open(WS_URL + '/' + id);

console.log(`The local ID is: ${id}`);
console.log(`Waiting for signaling to be connected...`);

ws.onOpen(() => {
    console.log('WebSocket connected, signaling ready');
    readUserInput();
});

ws.onError((err) => {
    console.log('WebSocket Error: ', err);
});

ws.onMessage((msgStr) => {
    let msg = JSON.parse(msgStr);
    switch (msg.type) {
        case 'offer':
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

function readUserInput() {
    // Read Line Interface
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question('Enter a remote ID to send an offer:\n', (peerId) => {
        if (peerId && peerId.length > 2) {
            console.log('Offering to ', peerId);
            createPeerConnection(peerId);

            console.log('Creating DataChannel with label "test"');
            let dc = pcMap[peerId].createDataChannel('test');
            dc.onOpen(() => {
                dc.sendMessage('Hello from ' + id);
            });

            dc.onMessage((msg) => {
                console.log('Message from ' + peerId + ' received:', msg);
            });
        }

        rl.close();
        readUserInput();
    });
}

function createPeerConnection(peerId) {
    // Create PeerConnection
    let peerConnection = new nodeDataChannel.PeerConnection('pc', { iceServers: ['stun:stun.l.google.com:19302'] });
    peerConnection.onStateChange((state) => {
        console.log('State: ', state);
    });
    peerConnection.onGatheringStateChange((state) => {
        console.log('GatheringState: ', state);
    });
    peerConnection.onLocalDescription((description, type) => {
        ws.sendMessage(JSON.stringify({ id: peerId, type, description }));
    });
    peerConnection.onLocalCandidate((candidate, mid) => {
        ws.sendMessage(JSON.stringify({ id: peerId, type: 'candidate', candidate, mid }));
    });
    peerConnection.onDataChannel((dc) => {
        console.log('DataChannel from ' + peerId + ' received with label "', dc.getLabel() + '"');
        dc.onMessage((msg) => {
            console.log('Message from ' + peerId + ' received:', msg);
        });
        dc.sendMessage('Hello From ' + id);
    });

    pcMap[peerId] = peerConnection;
}

function randomId(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
