// createRequire is native in node version >= 12
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// yargs down not supports ES Modules
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

import readline from 'readline';
import nodeDataChannel from '../../lib/index.js';

// Init Logger
nodeDataChannel.initLogger('Info');

// PeerConnection Map
const pcMap = {};

const dcArr = [];

// Local ID
const id = randomId(4);

// Message Size
const MESSAGE_SIZE = 65535;

// Buffer Size
const BUFFER_SIZE = MESSAGE_SIZE * 0;

// Args
const argv = yargs(hideBin(process.argv))
    .option('disableSend', {
        type: 'boolean',
        description: 'Disable Send',
        default: false,
    })
    .option('wsUrl', {
        type: 'string',
        description: 'Web Socket URL',
        default: 'ws://localhost:8000',
    })
    .option('dataChannelCount', {
        type: 'number',
        description: 'Data Channel Count To Create',
        default: 1,
    }).argv;

// Disable Send
const disableSend = argv.disableSend;
if (disableSend) console.log('Send Disabled!');

// Signaling Server
const wsUrl = process.env.WS_URL || argv.wsUrl;
console.log(wsUrl);
const dataChannelCount = argv.dataChannelCount;

// Read Line Interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const ws = new nodeDataChannel.WebSocket();
ws.open(wsUrl + '/' + id);

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

            let msgToSend = randomId(MESSAGE_SIZE);

            for (let i = 1; i <= dataChannelCount; i++) {
                let dcArrItem = {
                    dc: null,
                    bytesSent: 0,
                    bytesReceived: 0,
                };
                console.log('Creating DataChannel with label "test-' + i + '"');
                dcArrItem.dc = pcMap[peerId].createDataChannel('test-' + i);

                dcArrItem.dc.setBufferedAmountLowThreshold(BUFFER_SIZE);
                dcArrItem.dc.onOpen(() => {
                    while (!disableSend && dcArrItem.dc.bufferedAmount() <= BUFFER_SIZE) {
                        dcArrItem.dc.sendMessage(msgToSend);
                        dcArrItem.bytesSent += msgToSend.length;
                    }
                });

                dcArrItem.dc.onBufferedAmountLow(() => {
                    while (!disableSend && dcArrItem.dc.bufferedAmount() <= BUFFER_SIZE) {
                        dcArrItem.dc.sendMessage(msgToSend);
                        dcArrItem.bytesSent += msgToSend.length;
                    }
                });

                dcArrItem.dc.onMessage((msg) => {
                    dcArrItem.bytesReceived += msg.length;
                });

                dcArr.push(dcArrItem);
            }

            // Report
            let i = 0;
            setInterval(() => {
                let totalBytesSent = 0;
                let totalBytesReceived = 0;
                for (let j = 0; j < dcArr.length; j++) {
                    console.log(
                        `${j == 0 ? i + '#' : ''} DC-${j + 1} Sent: ${byte2KB(
                            dcArr[j].bytesSent,
                        )} KB/s / Received: ${byte2KB(dcArr[j].bytesReceived)} KB/s / SendBufferAmount: ${dcArr[
                            j
                        ].dc.bufferedAmount()} / DataChannelOpen: ${dcArr[j].dc.isOpen()}`,
                    );
                    totalBytesSent += dcArr[j].bytesSent;
                    totalBytesReceived += dcArr[j].bytesReceived;
                    dcArr[j].bytesSent = 0;
                    dcArr[j].bytesReceived = 0;
                }
                console.log(
                    `Total Sent: ${byte2KB(totalBytesSent)}  KB/s / Total Received: ${byte2KB(
                        totalBytesReceived,
                    )}  KB/s`,
                );

                if (i % 5 == 0) {
                    console.log(
                        `Stats# Sent: ${byte2MB(pcMap[peerId].bytesSent())} MB / Received: ${byte2MB(
                            pcMap[peerId].bytesReceived(),
                        )} MB / rtt: ${pcMap[peerId].rtt()} ms`,
                    );
                    console.log(`Selected Candidates# ${JSON.stringify(pcMap[peerId].getSelectedCandidatePair())}`);
                    console.log(``);
                }
                i++;
            }, 1000);
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

        while (!disableSend && dc.bufferedAmount() <= BUFFER_SIZE) {
            dc.sendMessage(msgToSend);
        }

        dc.onBufferedAmountLow(() => {
            while (!disableSend && dc.bufferedAmount() <= BUFFER_SIZE) {
                dc.sendMessage(msgToSend);
            }
        });

        dc.onMessage((msg) => {
            // bytesReceived += msg.length;
        });
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
    return `${Math.round(bytes / 1000)}`;
}

function byte2MB(bytes) {
    return `${Math.round(bytes / (1000 * 1000))}`;
}
