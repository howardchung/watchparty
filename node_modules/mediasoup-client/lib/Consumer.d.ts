import { EnhancedEventEmitter } from './enhancedEvents';
import type { MediaKind, RtpParameters } from './RtpParameters';
import type { AppData } from './types';
export type ConsumerOptions<ConsumerAppData extends AppData = AppData> = {
    id?: string;
    producerId?: string;
    kind?: 'audio' | 'video';
    rtpParameters: RtpParameters;
    streamId?: string;
    onRtpReceiver?: OnRtpReceiverCallback;
    appData?: ConsumerAppData;
};
/**
 * Invoked synchronously immediately after a new RTCRtpReceiver is created.
 * This allows for creating encoded streams in chromium browsers.
 */
export type OnRtpReceiverCallback = (rtpReceiver: RTCRtpReceiver) => void;
export type ConsumerEvents = {
    transportclose: [];
    trackended: [];
    '@getstats': [(stats: RTCStatsReport) => void, (error: Error) => void];
    '@close': [];
    '@pause': [];
    '@resume': [];
};
export type ConsumerObserver = EnhancedEventEmitter<ConsumerObserverEvents>;
export type ConsumerObserverEvents = {
    close: [];
    pause: [];
    resume: [];
    trackended: [];
};
export declare class Consumer<ConsumerAppData extends AppData = AppData> extends EnhancedEventEmitter<ConsumerEvents> {
    private readonly _id;
    private readonly _localId;
    private readonly _producerId;
    private _closed;
    private readonly _rtpReceiver?;
    private readonly _track;
    private readonly _rtpParameters;
    private _paused;
    private _appData;
    protected readonly _observer: ConsumerObserver;
    constructor({ id, localId, producerId, rtpReceiver, track, rtpParameters, appData, }: {
        id: string;
        localId: string;
        producerId: string;
        rtpReceiver?: RTCRtpReceiver;
        track: MediaStreamTrack;
        rtpParameters: RtpParameters;
        appData?: ConsumerAppData;
    });
    /**
     * Consumer id.
     */
    get id(): string;
    /**
     * Local id.
     */
    get localId(): string;
    /**
     * Associated Producer id.
     */
    get producerId(): string;
    /**
     * Whether the Consumer is closed.
     */
    get closed(): boolean;
    /**
     * Media kind.
     */
    get kind(): MediaKind;
    /**
     * Associated RTCRtpReceiver.
     */
    get rtpReceiver(): RTCRtpReceiver | undefined;
    /**
     * The associated track.
     */
    get track(): MediaStreamTrack;
    /**
     * RTP parameters.
     */
    get rtpParameters(): RtpParameters;
    /**
     * Whether the Consumer is paused.
     */
    get paused(): boolean;
    /**
     * App custom data.
     */
    get appData(): ConsumerAppData;
    /**
     * App custom data setter.
     */
    set appData(appData: ConsumerAppData);
    get observer(): ConsumerObserver;
    /**
     * Closes the Consumer.
     */
    close(): void;
    /**
     * Transport was closed.
     */
    transportClosed(): void;
    /**
     * Get associated RTCRtpReceiver stats.
     */
    getStats(): Promise<RTCStatsReport>;
    /**
     * Pauses receiving media.
     */
    pause(): void;
    /**
     * Resumes receiving media.
     */
    resume(): void;
    private onTrackEnded;
    private handleTrack;
    private destroyTrack;
}
//# sourceMappingURL=Consumer.d.ts.map