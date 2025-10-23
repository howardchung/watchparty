"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../");
const UuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
describe('FakeMediaStreamTrack', () => {
    test('constructor with arguments', () => {
        const audioTrack = new __1.FakeMediaStreamTrack({
            kind: 'audio',
            label: 'mic',
        });
        const videoTrack = new __1.FakeMediaStreamTrack({
            kind: 'video',
            id: 'c9c15f1e-9ae3-4770-9d95-2ba6992bddc3',
            enabled: false,
            muted: true,
            data: { foo: 123 },
        });
        expect(audioTrack.id).toEqual(expect.stringMatching(UuidV4Regex));
        expect(audioTrack.kind).toBe('audio');
        expect(audioTrack.label).toBe('mic');
        expect(audioTrack.contentHint).toBe('');
        expect(audioTrack.enabled).toBe(true);
        expect(audioTrack.muted).toBe(false);
        expect(audioTrack.readyState).toBe('live');
        expect(audioTrack.data).toEqual({});
        expect(videoTrack.id).toEqual(expect.stringMatching(UuidV4Regex));
        expect(videoTrack.id).toBe('c9c15f1e-9ae3-4770-9d95-2ba6992bddc3');
        expect(videoTrack.kind).toBe('video');
        expect(videoTrack.label).toBe('');
        expect(videoTrack.contentHint).toBe('');
        expect(videoTrack.enabled).toBe(false);
        expect(videoTrack.muted).toBe(true);
        expect(videoTrack.readyState).toBe('live');
        expect(videoTrack.data).toEqual({ foo: 123 });
    });
    test('track.clone()', () => {
        const track = new __1.FakeMediaStreamTrack({
            kind: 'video',
            id: 'c9c15f1e-9ae3-4770-9d95-2ba6992bddc3',
            contentHint: 'motion',
            muted: true,
            data: { foo: 123, bar: 'baz' },
        });
        const clonedTrack1 = track.clone();
        expect(clonedTrack1.id).not.toBe('c9c15f1e-9ae3-4770-9d95-2ba6992bddc3');
        expect(clonedTrack1.id).toEqual(expect.stringMatching(UuidV4Regex));
        expect(clonedTrack1.kind).toBe('video');
        expect(clonedTrack1.label).toBe('');
        expect(clonedTrack1.contentHint).toBe('motion');
        expect(clonedTrack1.enabled).toBe(true);
        expect(clonedTrack1.muted).toBe(true);
        expect(clonedTrack1.readyState).toBe('live');
        expect(clonedTrack1.data).toEqual({ foo: 123, bar: 'baz' });
        // Assert that cloned data is a different object.
        clonedTrack1.data['foo'] = 666;
        expect(clonedTrack1.data['foo']).toBe(666);
        expect(track.data['foo']).toBe(123);
        const clonedTrack2 = track.clone({
            id: '4a552a2c-8568-4d01-906f-6800770846c3',
            data: { lalala: 'foobar' },
        });
        expect(clonedTrack2.id).toBe('4a552a2c-8568-4d01-906f-6800770846c3');
        expect(clonedTrack2.kind).toBe('video');
        expect(clonedTrack2.label).toBe('');
        expect(clonedTrack1.contentHint).toBe('motion');
        expect(clonedTrack2.enabled).toBe(true);
        expect(clonedTrack2.muted).toBe(true);
        expect(clonedTrack2.readyState).toBe('live');
        expect(clonedTrack2.data).toEqual({ lalala: 'foobar' });
    });
    test('track.applyConstraints()', async () => {
        const track = new __1.FakeMediaStreamTrack({
            kind: 'audio',
            constraints: {
                echoCancellation: true,
                noiseSuppression: true,
            },
        });
        expect(track.getConstraints()).toEqual({
            echoCancellation: true,
            noiseSuppression: true,
        });
        await track.applyConstraints({
            echoCancellation: false,
            noiseSuppression: true,
            autoGainControl: true,
        });
        expect(track.getConstraints()).toEqual({
            echoCancellation: false,
            noiseSuppression: true,
            autoGainControl: true,
        });
    });
    describe('events', () => {
        let track;
        let dispatchEventSpy;
        beforeEach(() => {
            track = new __1.FakeMediaStreamTrack({
                kind: 'audio',
            });
            dispatchEventSpy = jest.spyOn(track, 'dispatchEvent');
        });
        test(`track.enabled setter triggers custom 'enabledchange' event`, () => {
            let enabledchangeFired1 = false;
            let enabledchangeFired2 = false;
            track.onenabledchange = () => {
                enabledchangeFired1 = true;
            };
            track.addEventListener('enabledchange', () => {
                enabledchangeFired2 = true;
            });
            track.enabled = false;
            expect(track.enabled).toBe(false);
            expect(enabledchangeFired1).toBe(true);
            expect(enabledchangeFired2).toBe(true);
            expect(dispatchEventSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'enabledchange' }));
            dispatchEventSpy.mockClear();
            // It's already false so it won't emit the event again.
            track.enabled = false;
            expect(dispatchEventSpy).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'enabledchange' }));
            dispatchEventSpy.mockClear();
            track.enabled = true;
            expect(track.enabled).toBe(true);
            expect(dispatchEventSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'enabledchange' }));
        });
        test(`track.stop() triggers custom 'stopped' event`, () => {
            let stoppedFired1 = false;
            let stoppedFired2 = false;
            track.onstopped = () => {
                stoppedFired1 = true;
            };
            track.addEventListener('stopped', () => {
                stoppedFired2 = true;
            });
            track.stop();
            expect(track.readyState).toBe('ended');
            expect(stoppedFired1).toBe(true);
            expect(stoppedFired2).toBe(true);
            expect(dispatchEventSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'stopped' }));
            dispatchEventSpy.mockClear();
            // It's already stopped so it won't emit the event again.
            track.stop();
            expect(dispatchEventSpy).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'stopped' }));
        });
        test(`track.remoteStop() triggers custom 'stopped' event and 'ended' event`, () => {
            let stoppedFired1 = false;
            let stoppedFired2 = false;
            let endedFired1 = false;
            let endedFired2 = false;
            track.onstopped = () => {
                stoppedFired1 = true;
            };
            track.addEventListener('stopped', () => {
                stoppedFired2 = true;
            });
            track.onended = () => {
                endedFired1 = true;
            };
            track.addEventListener('ended', () => {
                endedFired2 = true;
            });
            track.remoteStop();
            expect(track.readyState).toBe('ended');
            expect(stoppedFired1).toBe(true);
            expect(stoppedFired2).toBe(true);
            expect(endedFired1).toBe(true);
            expect(endedFired2).toBe(true);
            expect(dispatchEventSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'stopped' }));
            expect(dispatchEventSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'ended' }));
            dispatchEventSpy.mockClear();
            // It's already stopped so it won't emit the events again.
            track.remoteStop();
            expect(dispatchEventSpy).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'stopped' }));
            expect(dispatchEventSpy).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'ended' }));
        });
        test(`track.remoteMute() triggers 'mute' event`, () => {
            let muteFired1 = false;
            let muteFired2 = false;
            track.onmute = () => {
                muteFired1 = true;
            };
            track.addEventListener('mute', () => {
                muteFired2 = true;
            });
            track.remoteMute();
            expect(track.muted).toBe(true);
            expect(muteFired1).toBe(true);
            expect(muteFired2).toBe(true);
            expect(dispatchEventSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'mute' }));
            dispatchEventSpy.mockClear();
            // It's already muted so it won't emit the event again.
            track.remoteMute();
            expect(dispatchEventSpy).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'mute' }));
        });
        test(`track.remoteUnmute() triggers 'unmute' event`, () => {
            let unmuteFired1 = false;
            let unmuteFired2 = false;
            track.onunmute = () => {
                unmuteFired1 = true;
            };
            track.addEventListener('unmute', () => {
                unmuteFired2 = true;
            });
            // We must mute the track first.
            track.remoteMute();
            dispatchEventSpy.mockClear();
            track.remoteUnmute();
            expect(track.muted).toBe(false);
            expect(unmuteFired1).toBe(true);
            expect(unmuteFired2).toBe(true);
            expect(dispatchEventSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'unmute' }));
            dispatchEventSpy.mockClear();
            // It's already unmuted so it won't emit the event again.
            track.remoteUnmute();
            expect(dispatchEventSpy).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'unmute' }));
        });
    });
});
