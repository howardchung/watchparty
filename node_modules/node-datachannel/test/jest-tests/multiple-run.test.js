import { jest } from '@jest/globals';
import * as nodeDataChannel from '../../lib';

describe('P2P', () => {
    // Default is 5000 ms but we need more
    jest.setTimeout(12000);

    test.each(Array(100).fill(0))('P2P Test-%p', (i) => {
        return new Promise((done) => {
            let peer1 = new nodeDataChannel.PeerConnection('Peer1', { iceServers: ['stun:stun.l.google.com:19302'] });
            let peer2 = new nodeDataChannel.PeerConnection('Peer2', { iceServers: ['stun:stun.l.google.com:19302'] });
            let dc1 = null;
            let dc2 = null;

            // Mocks
            const p1DCMessageMock = jest.fn();
            const p2DCMessageMock = jest.fn();

            // Set Callbacks
            peer1.onStateChange(() => {
                /** */
            });
            peer1.onGatheringStateChange(() => {
                /** */
            });
            peer1.onLocalDescription((sdp, type) => {
                peer2.setRemoteDescription(sdp, type);
            });
            peer1.onLocalCandidate((candidate, mid) => {
                peer2.addRemoteCandidate(candidate, mid);
            });

            // Set Callbacks
            peer2.onStateChange(() => {
                /** */
            });
            peer2.onGatheringStateChange(() => {
                /** */
            });
            peer2.onLocalDescription((sdp, type) => {
                peer1.setRemoteDescription(sdp, type);
            });
            peer2.onLocalCandidate((candidate, mid) => {
                peer1.addRemoteCandidate(candidate, mid);
            });
            peer2.onDataChannel((dc) => {
                dc2 = dc;
                dc2.onMessage((msg) => {
                    p2DCMessageMock(msg);
                    dc2.sendMessage('Hello From Peer2');
                });
            });

            dc1 = peer1.createDataChannel('test-p2p');
            dc1.onOpen(() => {
                dc1.sendMessage('Hello From Peer1');
            });
            dc1.onMessage((msg) => {
                p1DCMessageMock(msg);
                peer1.close();
                peer2.close();

                // DataChannel
                expect(p1DCMessageMock.mock.calls.length).toBe(1);
                expect(p1DCMessageMock.mock.calls[0][0]).toEqual('Hello From Peer2');
                expect(p2DCMessageMock.mock.calls.length).toBe(1);
                expect(p2DCMessageMock.mock.calls[0][0]).toEqual('Hello From Peer1');

                done();
            });
        });
    });
});
