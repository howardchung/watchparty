import { FakeEventTarget } from './fakeEvents/FakeEventTarget';
import { FakeAddEventListenerOptions, FakeEventListenerOptions } from './fakeEvents/FakeEventListener';
import { FakeEvent } from './fakeEvents/FakeEvent';
export type AppData = {
    [key: string]: unknown;
};
export type FakeMediaStreamTrackOptions<FakeMediaStreamTrackAppData extends AppData = AppData> = {
    kind: string;
    id?: string;
    label?: string;
    contentHint?: string;
    enabled?: boolean;
    muted?: boolean;
    readyState?: MediaStreamTrackState;
    capabilities?: MediaTrackCapabilities;
    constraints?: MediaTrackConstraints;
    settings?: MediaTrackSettings;
    data?: FakeMediaStreamTrackAppData;
};
export interface FakeMediaStreamTrackEventMap extends MediaStreamTrackEventMap {
    stopped: FakeEvent;
    enabledchange: FakeEvent;
}
export declare class FakeMediaStreamTrack<FakeMediaStreamTrackAppData extends AppData = AppData> extends FakeEventTarget implements MediaStreamTrack {
    #private;
    constructor({ kind, id, label, contentHint, enabled, muted, readyState, capabilities, constraints, settings, data, }: FakeMediaStreamTrackOptions<FakeMediaStreamTrackAppData>);
    get id(): string;
    get kind(): string;
    get label(): string;
    get contentHint(): string;
    set contentHint(contentHint: string);
    get enabled(): boolean;
    /**
     * Changes `enabled` member value and fires a custom "enabledchange" event.
     */
    set enabled(enabled: boolean);
    get muted(): boolean;
    get readyState(): MediaStreamTrackState;
    /**
     * Application custom data getter.
     */
    get data(): FakeMediaStreamTrackAppData;
    /**
     * Application custom data setter.
     */
    set data(data: FakeMediaStreamTrackAppData);
    get onmute(): ((this: MediaStreamTrack, ev: FakeEvent) => void) | null;
    set onmute(handler: ((this: MediaStreamTrack, ev: FakeEvent) => void) | null);
    get onunmute(): ((this: MediaStreamTrack, ev: FakeEvent) => void) | null;
    set onunmute(handler: ((this: MediaStreamTrack, ev: FakeEvent) => void) | null);
    get onended(): ((this: MediaStreamTrack, ev: FakeEvent) => void) | null;
    set onended(handler: ((this: MediaStreamTrack, ev: FakeEvent) => void) | null);
    get onenabledchange(): ((this: MediaStreamTrack, ev: FakeEvent) => void) | null;
    set onenabledchange(handler: ((this: MediaStreamTrack, ev: FakeEvent) => void) | null);
    get onstopped(): ((this: MediaStreamTrack, ev: FakeEvent) => void) | null;
    set onstopped(handler: ((this: MediaStreamTrack, ev: FakeEvent) => void) | null);
    addEventListener<K extends keyof FakeMediaStreamTrackEventMap>(type: K, listener: (this: FakeMediaStreamTrack<AppData>, ev: FakeMediaStreamTrackEventMap[K]) => void, options?: boolean | FakeAddEventListenerOptions): void;
    removeEventListener<K extends keyof FakeMediaStreamTrackEventMap>(type: K, listener: (this: FakeMediaStreamTrack<AppData>, ev: FakeMediaStreamTrackEventMap[K]) => void, options?: boolean | FakeEventListenerOptions): void;
    /**
     * Changes `readyState` member to "ended" and fires a custom "stopped" event
     * (if not already stopped).
     */
    stop(): void;
    /**
     * Clones current track into another FakeMediaStreamTrack. `id` and `data`
     * can be optionally given.
     */
    clone<ClonedFakeMediaStreamTrackAppData extends AppData = FakeMediaStreamTrackAppData>({ id, data, }?: {
        id?: string;
        data?: ClonedFakeMediaStreamTrackAppData;
    }): FakeMediaStreamTrack<ClonedFakeMediaStreamTrackAppData>;
    getCapabilities(): MediaTrackCapabilities;
    getConstraints(): MediaTrackConstraints;
    applyConstraints(constraints?: MediaTrackConstraints): Promise<void>;
    getSettings(): MediaTrackSettings;
    /**
     * Simulates a remotely triggered stop. It fires a custom "stopped" event and
     * the standard "ended" event (if the track was not already stopped).
     */
    remoteStop(): void;
    /**
     * Simulates a remotely triggered mute. It fires a "mute" event (if the track
     * was not already muted).
     */
    remoteMute(): void;
    /**
     * Simulates a remotely triggered unmute. It fires an "unmute" event (if the
     * track was muted).
     */
    remoteUnmute(): void;
}
//# sourceMappingURL=index.d.ts.map