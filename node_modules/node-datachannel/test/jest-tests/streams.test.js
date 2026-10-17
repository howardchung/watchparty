import * as nodeDataChannel from '../../lib';

function waitForGathering(peer) {
    return new Promise((resolve) => {
        peer.onGatheringStateChange((state) => {
            if (state === 'complete') resolve();
        });
        // Handle race conditions where gathering has already completed
        if (peer.gatheringState() === 'complete') resolve();

        resolve();
    });
}

describe('DataChannel streams', () => {
    test('can build an echo pipeline', async () => {
        let clientPeer = new nodeDataChannel.PeerConnection('Client', { iceServers: [] });
        let echoPeer = new nodeDataChannel.PeerConnection('Client', { iceServers: [] });

        const echoStream = new nodeDataChannel.DataChannelStream(echoPeer.createDataChannel('echo-channel'));
        echoStream.pipe(echoStream); // Echo all received data back to the client

        await waitForGathering(echoPeer);

        const { sdp: echoDescSdp, type: echoDescType } = echoPeer.localDescription();
        clientPeer.setRemoteDescription(echoDescSdp, echoDescType);
        await waitForGathering(clientPeer);

        const { sdp: clientDescSdp, type: clientDescType } = clientPeer.localDescription();
        echoPeer.setRemoteDescription(clientDescSdp, clientDescType);

        const clientChannel = await new Promise((resolve) => clientPeer.onDataChannel(resolve));

        const clientResponsePromise = new Promise((resolve) => clientChannel.onMessage(resolve));
        clientChannel.sendMessage('test message');

        expect(await clientResponsePromise).toBe('test message');

        clientChannel.close();
        clientPeer.close();
        echoPeer.close();
    });
});

afterAll(() => {
    // Properly cleanup so Jest does not complain about asynchronous operations that weren't stopped.
    nodeDataChannel.cleanup();
});
