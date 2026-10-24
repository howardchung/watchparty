import { jest } from '@jest/globals';
import * as nodeDataChannel from '../../lib';

describe('P2P', () => {
    // Default is 5000 ms but we need more
    jest.setTimeout(30000);

    test('P2P Test', () => {
        return new Promise((done) => {
            let peer1 = new nodeDataChannel.PeerConnection('Peer1', { iceServers: ['stun:stun.l.google.com:19302'] });
            let peer2 = new nodeDataChannel.PeerConnection('Peer2', { iceServers: ['stun:stun.l.google.com:19302'] });
            let dc1 = null;
            let dc2 = null;

            // Mocks
            const p1StateMock = jest.fn();
            const p1GatheringStateMock = jest.fn();
            const p2StateMock = jest.fn();
            const p2GatheringStateMock = jest.fn();
            const p1SDPMock = jest.fn();
            const p1CandidateMock = jest.fn();
            const p2SDPMock = jest.fn();
            const p2CandidateMock = jest.fn();

            const p1DCMock = jest.fn();
            const p1DCMessageMock = jest.fn();
            const p2DCMock = jest.fn();
            const p2DCMessageMock = jest.fn();

            // Set Callbacks
            peer1.onStateChange(p1StateMock);
            peer1.onGatheringStateChange(p1GatheringStateMock);
            peer1.onLocalDescription((sdp, type) => {
                p1SDPMock();
                peer2.setRemoteDescription(sdp, type);
            });
            peer1.onLocalCandidate((candidate, mid) => {
                p1CandidateMock();
                peer2.addRemoteCandidate(candidate, mid);
            });

            // Set Callbacks
            peer2.onStateChange(p2StateMock);
            peer2.onGatheringStateChange(p2GatheringStateMock);
            peer2.onLocalDescription((sdp, type) => {
                p2SDPMock();
                peer1.setRemoteDescription(sdp, type);
            });
            peer2.onLocalCandidate((candidate, mid) => {
                p2CandidateMock();
                peer1.addRemoteCandidate(candidate, mid);
            });
            peer2.onDataChannel((dc) => {
                p2DCMock();
                dc2 = dc;
                dc2.onMessage((msg) => {
                    p2DCMessageMock(msg);
                    dc2.sendMessage('Hello From Peer2');
                });
            });

            dc1 = peer1.createDataChannel('test-p2p');
            dc1.onOpen(() => {
                p1DCMock();
                dc1.sendMessage('Hello From Peer1');
            });
            dc1.onMessage((msg) => {
                p1DCMessageMock(msg);
                peer1.close();
                peer2.close();

                // State Callbacks
                expect(p1StateMock.mock.calls.length).toBeGreaterThanOrEqual(1);
                expect(p1GatheringStateMock.mock.calls.length).toBeGreaterThanOrEqual(1);
                expect(p2StateMock.mock.calls.length).toBeGreaterThanOrEqual(1);
                expect(p2GatheringStateMock.mock.calls.length).toBeGreaterThanOrEqual(1);

                // SDP
                expect(p1SDPMock.mock.calls.length).toBe(1);
                expect(p2SDPMock.mock.calls.length).toBe(1);

                // Candidates
                expect(p1CandidateMock.mock.calls.length).toBeGreaterThanOrEqual(1);
                expect(p2CandidateMock.mock.calls.length).toBeGreaterThanOrEqual(1);

                // DataChannel
                expect(p1DCMock.mock.calls.length).toBe(1);
                expect(p1DCMessageMock.mock.calls.length).toBe(1);
                expect(p1DCMessageMock.mock.calls[0][0]).toEqual('Hello From Peer2');
                expect(p2DCMock.mock.calls.length).toBe(1);

                expect(p2DCMessageMock.mock.calls.length).toBe(1);
                expect(p2DCMessageMock.mock.calls[0][0]).toEqual('Hello From Peer1');

                done();
            });
        });
    });
});
