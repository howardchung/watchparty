import readline from 'readline';
import nodeDataChannel from '../../lib/index.js';

// Init Logger
nodeDataChannel.initLogger('Info');

// PeerConnection Map
const pcMap = {};

// Local ID
const id = randomId(4);

// Message Size
const MESSAGE_SIZE = 500;

// Buffer Size
const BUFFER_SIZE = MESSAGE_SIZE * 10;

// Read Line Interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

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
    rl.question('Enter a remote ID to send an offer: ', (peerId) => {
        if (peerId && peerId.length > 2) {
            rl.close();
            console.log('Offering to ', peerId);
            createPeerConnection(peerId);

            console.log('Creating DataChannel with label "test"');
            let dc = pcMap[peerId].createDataChannel('test');

            let msgToSend = randomId(MESSAGE_SIZE);
            let bytesSent = 0;
            let bytesReceived = 0;

            dc.onOpen(() => {
                setInterval(() => {
                    if (dc.bufferedAmount() <= BUFFER_SIZE) {
                        dc.sendMessage(msgToSend);
                        bytesSent += msgToSend.length;
                    }
                }, 2);
            });

            dc.onMessage((msg) => {
                bytesReceived += msg.length;
            });

            // Report
            let i = 0;
            setInterval(() => {
                console.log(
                    `${i++}# Sent: ${byte2KB(bytesSent)} KB/s / Received: ${byte2KB(
                        bytesReceived,
                    )} KB/s / SendBufferAmount: ${dc.bufferedAmount()} / DataChannelOpen: ${dc.isOpen()}`,
                );
                bytesSent = 0;
                bytesReceived = 0;
            }, 1000);

            setInterval(() => {
                console.log(
                    `Stats# Sent: ${byte2MB(pcMap[peerId].bytesSent())} MB / Received: ${byte2MB(
                        pcMap[peerId].bytesReceived(),
                    )} MB / rtt: ${pcMap[peerId].rtt()} ms`,
                );
                console.log(`Selected Candidates# ${JSON.stringify(pcMap[peerId].getSelectedCandidatePair())}`);
                console.log(``);
            }, 5 * 1000);
        }
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
        rl.close();
        console.log('DataChannel from ' + peerId + ' received with label "', dc.getLabel() + '"');

        let msgToSend = randomId(MESSAGE_SIZE);
        let bytesSent = 0;
        let bytesReceived = 0;

        setInterval(() => {
            if (dc.bufferedAmount() <= BUFFER_SIZE) {
                dc.sendMessage(msgToSend);
                bytesSent += msgToSend.length;
            }
        }, 2);

        dc.onMessage((msg) => {
            bytesReceived += msg.length;
        });

        // Report
        let i = 0;
        setInterval(() => {
            console.log(
                `${i++}# Sent: ${byte2KB(bytesSent)} KB/s / Received: ${byte2KB(
                    bytesReceived,
                )} KB/s / SendBufferAmount: ${dc.bufferedAmount()} / DataChannelOpen: ${dc.isOpen()}`,
            );
            bytesSent = 0;
            bytesReceived = 0;
        }, 1000);

        setInterval(() => {
            console.log(
                `Stats# Sent: ${byte2MB(pcMap[peerId].bytesSent())} MB / Received: ${byte2MB(
                    pcMap[peerId].bytesReceived(),
                )} MB / rtt: ${pcMap[peerId].rtt()} ms`,
            );
            console.log(`Selected Candidates# ${JSON.stringify(pcMap[peerId].getSelectedCandidatePair())}`);
            console.log(``);
        }, 5 * 1000);
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

function byte2KB(bytes) {
    return `${Math.round(bytes / 1024)}`;
}

function byte2MB(bytes) {
    return `${Math.round(bytes / (1024 * 1024))}`;
}
