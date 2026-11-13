export declare interface AbrComponentAPI extends ComponentAPI {
    firstAutoLevel: number;
    forcedAutoLevel: number;
    nextAutoLevel: number;
    readonly bwEstimator?: EwmaBandWidthEstimator;
    resetEstimator(abrEwmaDefaultEstimate: number): any;
}

export declare class AbrController extends Logger implements AbrComponentAPI {
    protected hls: Hls;
    private lastLevelLoadSec;
    private lastLoadedFragLevel;
    private firstSelection;
    private firstAutoFloor;
    private _nextAutoLevel;
    private nextAutoLevelKey;
    private audioTracksByGroup;
    private codecTiers;
    private timer;
    private fragCurrent;
    private partCurrent;
    private bitrateTestDelay;
    private rebufferNotice;
    private supportedCache;
    bwEstimator: EwmaBandWidthEstimator;
    constructor(hls: Hls);
    resetEstimator(abrEwmaDefaultEstimate?: number): void;
    private initEstimator;
    protected registerListeners(): void;
    protected unregisterListeners(): void;
    destroy(): void;
    protected onManifestLoading(event: Events.MANIFEST_LOADING, data: ManifestLoadingData): void;
    private onLevelsUpdated;
    private onMaxAutoLevelUpdated;
    protected onFragLoading(event: Events.FRAG_LOADING, data: FragLoadingData): void;
    protected onLevelSwitching(event: Events.LEVEL_SWITCHING, data: LevelSwitchingData): void;
    protected onError(event: Events.ERROR, data: ErrorData): void;
    private getTimeToLoadFrag;
    protected onLevelLoaded(event: Events.LEVEL_LOADED, data: LevelLoadedData): void;
    private _abandonRulesCheck;
    protected onFragLoaded(event: Events.FRAG_LOADED, data: FragLoadedData): void;
    protected onFragBuffered(event: Events.FRAG_BUFFERED, data: FragBufferedData): void;
    private ignoreFragment;
    clearTimer(): void;
    get firstAutoLevel(): number;
    get forcedAutoLevel(): number;
    get nextAutoLevel(): number;
    private getAutoLevelKey;
    private getNextABRAutoLevel;
    private getStarvationDelay;
    private getBwEstimate;
    private findBestLevel;
    set nextAutoLevel(nextLevel: number);
    protected deriveNextAutoLevel(nextLevel: number): number;
}

export declare type ABRControllerConfig = {
    abrEwmaFastLive: number;
    abrEwmaSlowLive: number;
    abrEwmaFastVoD: number;
    abrEwmaSlowVoD: number;
    /**
     * Default bandwidth estimate in bits/s prior to collecting fragment bandwidth samples
     */
    abrEwmaDefaultEstimate: number;
    abrEwmaDefaultEstimateMax: number;
    abrBandWidthFactor: number;
    abrBandWidthUpFactor: number;
    abrMaxWithRealBitrate: boolean;
    abrSwitchInterval: number;
    maxStarvationDelay: number;
    maxLoadingDelay: number;
};

export declare type AssetListJSON = {
    ASSETS: Array<{
        URI: string;
        DURATION: string;
    }>;
};

export declare interface AssetListLoadedData {
    event: InterstitialEventWithAssetList;
    assetListResponse: AssetListJSON;
    networkDetails: NullableNetworkDetails;
}

export declare interface AssetListLoadingData {
    event: InterstitialEventWithAssetList;
}

export declare type AttachMediaSourceData = {
    media: HTMLMediaElement;
    mediaSource: MediaSource | null;
    tracks: SourceBufferTrackSet;
};

export declare class AttrList {
    [key: string]: any;
    constructor(attrs: string | Record<string, any>, parsed?: Pick<ParsedMultivariantPlaylist | LevelDetails, 'variableList' | 'hasVariableRefs' | 'playlistParsingError'>);
    get clientAttrs(): string[];
    decimalInteger(attrName: string): number;
    hexadecimalInteger(attrName: string): Uint8Array<ArrayBuffer> | null;
    hexadecimalIntegerAsNumber(attrName: string): number;
    decimalFloatingPoint(attrName: string): number;
    optionalFloat(attrName: string, defaultValue: number): number;
    enumeratedString(attrName: string): string | undefined;
    enumeratedStringList<T extends {
        [key: string]: boolean;
    }>(attrName: string, dict: T): {
        [key in keyof T]: boolean;
    };
    bool(attrName: string): boolean;
    decimalResolution(attrName: string): {
        width: number;
        height: number;
    } | undefined;
    static parseAttrList(input: string, parsed?: Pick<ParsedMultivariantPlaylist | LevelDetails, 'variableList' | 'hasVariableRefs' | 'playlistParsingError'>): Record<string, string>;
}

export declare type AudioPlaylistType = 'AUDIO';

export declare type AudioSelectionOption = {
    lang?: string;
    assocLang?: string;
    characteristics?: string;
    channels?: string;
    name?: string;
    audioCodec?: string;
    groupId?: string;
    default?: boolean;
    flushImmediate?: boolean;
};

export declare class AudioStreamController extends BaseStreamController implements NetworkComponentAPI {
    private mainAnchor;
    private mainFragLoading;
    private audioOnly;
    private bufferedTrack;
    private switchingTrack;
    private trackId;
    private nextTrackId;
    private waitingData;
    private mainDetails;
    private flushing;
    private bufferFlushed;
    private cachedTrackLoadedData;
    constructor(hls: Hls, fragmentTracker: FragmentTracker, keyLoader: KeyLoader);
    protected onHandlerDestroying(): void;
    private resetItem;
    protected registerListeners(): void;
    protected unregisterListeners(): void;
    onInitPtsFound(event: Events.INIT_PTS_FOUND, data: InitPTSFoundData): void;
    protected getLoadPosition(): number;
    private syncWithAnchor;
    startLoad(startPosition: number, skipSeekToStartPosition?: boolean): void;
    doTick(): void;
    protected resetLoadingState(): void;
    protected onTickEnd(): void;
    private doTickIdle;
    protected onMediaDetaching(event: Events.MEDIA_DETACHING, data: MediaDetachingData): void;
    private onAudioTracksUpdated;
    private onAudioTrackSwitching;
    protected onManifestLoading(): void;
    private onLevelLoaded;
    private onAudioTrackLoaded;
    _handleFragmentLoadProgress(data: FragLoadedData): void;
    protected _handleFragmentLoadComplete(fragLoadedData: FragLoadedData): void;
    private onBufferReset;
    private onBufferCreated;
    private onFragLoading;
    private onFragBuffered;
    getFwdBufferInfo(): BufferInfo | null;
    protected getBufferOutput(): Bufferable | null;
    protected checkFragmentChanged(): boolean;
    protected onError(event: Events.ERROR, data: ErrorData): void;
    private onBufferFlushing;
    private onBufferFlushed;
    private _handleTransmuxComplete;
    private _bufferInitSegment;
    protected loadFragment(frag: MediaFragment, track: Level, targetBufferTime: number): void;
    private flushAudioIfNeeded;
    private completeAudioSwitch;
    /**
     * Index of next audio track loaded as scheduled by audio stream controller.
     */
    get nextAudioTrack(): number;
}

export declare class AudioTrackController extends BasePlaylistController {
    private tracks;
    private groupIds;
    private tracksInGroup;
    private trackId;
    private currentTrack;
    private selectDefaultTrack;
    constructor(hls: Hls);
    private registerListeners;
    private unregisterListeners;
    destroy(): void;
    protected onManifestLoading(): void;
    protected onManifestParsed(event: Events.MANIFEST_PARSED, data: ManifestParsedData): void;
    protected onAudioTrackLoaded(event: Events.AUDIO_TRACK_LOADED, data: AudioTrackLoadedData): void;
    protected onLevelLoading(event: Events.LEVEL_LOADING, data: LevelLoadingData): void;
    protected onLevelSwitching(event: Events.LEVEL_SWITCHING, data: LevelSwitchingData): void;
    private switchLevel;
    protected onError(event: Events.ERROR, data: ErrorData): void;
    get allAudioTracks(): MediaPlaylist[];
    get audioTracks(): MediaPlaylist[];
    get audioTrack(): number;
    set audioTrack(newId: number);
    get nextAudioTrack(): number;
    set nextAudioTrack(newId: number);
    setAudioOption(audioOption: MediaPlaylist | AudioSelectionOption | undefined): MediaPlaylist | null;
    private setAudioTrack;
    private findTrackId;
    protected loadPlaylist(hlsUrlParameters?: HlsUrlParameters): void;
    protected loadingPlaylist(audioTrack: MediaPlaylist, hlsUrlParameters: HlsUrlParameters | undefined): void;
}

export declare interface AudioTrackLoadedData extends TrackLoadedData {
}

export declare interface AudioTracksUpdatedData {
    audioTracks: MediaPlaylist[];
}

export declare interface AudioTrackSwitchedData extends MediaPlaylist {
}

export declare interface AudioTrackSwitchingData extends MediaPlaylist {
    flushImmediate?: boolean;
}

export declare interface AudioTrackUpdatedData {
    details: LevelDetails;
    id: number;
    groupId: string;
}

export declare interface BackBufferData {
    bufferEnd: number;
}

export declare type Base = {
    url: string;
};

export declare type BaseData = {
    url: string;
};

export declare abstract class BaseLoader implements Loader<LoaderContext> {
    protected requestTimeout?: number;
    protected retryTimeout?: number;
    protected retryDelay: number;
    protected config: LoaderConfiguration | null;
    protected callbacks: LoaderCallbacks<LoaderContext> | null;
    context: LoaderContext | null;
    stats: LoadStats;
    destroy(): void;
    load(context: LoaderContext, config: LoaderConfiguration, callbacks: LoaderCallbacks<LoaderContext>): void;
    abort(): void;
    protected loadtimeout(): void;
    protected retry(retryConfig: RetryConfig): void;
    protected abstract loadInternal(): void;
    protected abstract abortInternal(): void;
    protected abstract getNetworkDetails(): NullableNetworkDetails;
    protected abstract resetInternalLoader(): void;
    abstract getCacheAge(): number | null;
    abstract getResponseHeader(name: string): string | null;
}

export declare class BasePlaylistController extends Logger implements NetworkComponentAPI {
    protected hls: Hls;
    protected canLoad: boolean;
    private timer;
    private loadingSync;
    constructor(hls: Hls, logPrefix: string);
    destroy(): void;
    private clearTimer;
    startLoad(): void;
    stopLoad(): void;
    protected switchParams(playlistUri: string, previous: LevelDetails | undefined, current: LevelDetails | undefined): HlsUrlParameters | undefined;
    protected loadPlaylist(hlsUrlParameters?: HlsUrlParameters): void;
    protected loadingPlaylist(playlist: Level | MediaPlaylist, hlsUrlParameters?: HlsUrlParameters): void;
    protected shouldLoadPlaylist(playlist: Level | MediaPlaylist | null | undefined): playlist is Level | MediaPlaylist;
    protected getUrlWithDirectives(uri: string, hlsUrlParameters: HlsUrlParameters | undefined): string;
    protected playlistLoaded(index: number, data: LevelLoadedData | AudioTrackLoadedData | TrackLoadedData, previousDetails?: LevelDetails): void;
    protected scheduleLoading(levelOrTrack: Level | MediaPlaylist, deliveryDirectives?: HlsUrlParameters, updatedDetails?: LevelDetails): void;
    private getDeliveryDirectives;
    protected checkRetry(errorEvent: ErrorData): boolean;
    private checkOfflineStatus;
}

export declare class BaseSegment {
    private _byteRange;
    private _url;
    private _stats;
    private _streams;
    readonly base: Base;
    relurl?: string;
    constructor(base: Base | string);
    setByteRange(value: string, previous?: BaseSegment): void;
    get baseurl(): string;
    get byteRange(): [number, number] | [];
    get byteRangeStartOffset(): number | undefined;
    get byteRangeEndOffset(): number | undefined;
    get elementaryStreams(): ElementaryStreams;
    set elementaryStreams(value: ElementaryStreams);
    get hasStats(): boolean;
    get hasStreams(): boolean;
    get stats(): LoadStats;
    set stats(value: LoadStats);
    get url(): string;
    set url(value: string | null);
    clearElementaryStreamInfo(): void;
}

export declare class BaseStreamController extends TaskLoop implements NetworkComponentAPI {
    protected hls: Hls;
    protected fragPrevious: MediaFragment | null;
    protected fragCurrent: Fragment | null;
    protected fragPlaying: MediaFragment | null;
    protected fragmentTracker: FragmentTracker;
    protected transmuxer: TransmuxerInterface | null;
    protected _state: (typeof State)[keyof typeof State];
    protected playlistType: PlaylistLevelType;
    protected media: HTMLMediaElement | null;
    protected mediaBuffer: Bufferable | null;
    protected config: HlsConfig;
    protected bitrateTest: boolean;
    protected lastCurrentTime: number;
    protected nextLoadPosition: number;
    protected startPosition: number;
    protected startTimeOffset: number | null;
    protected retryDate: number;
    protected levels: Array<Level> | null;
    protected fragmentLoader: FragmentLoader;
    protected initFragmentLoader: FragmentLoader;
    protected keyLoader: KeyLoader;
    protected levelLastLoaded: Level | null;
    protected startFragRequested: boolean;
    protected decrypter: Decrypter;
    protected initPTS: TimestampOffset[];
    protected buffering: boolean;
    protected loadingParts: boolean;
    private loopSn?;
    constructor(hls: Hls, fragmentTracker: FragmentTracker, keyLoader: KeyLoader, logPrefix: string, playlistType: PlaylistLevelType);
    protected registerListeners(): void;
    protected unregisterListeners(): void;
    protected doTick(): void;
    protected onTickEnd(): void;
    startLoad(startPosition: number): void;
    stopLoad(): void;
    get startPositionValue(): number;
    get bufferingEnabled(): boolean;
    /**
     * Get backtrack fragment. Returns null in base class.
     * Override in stream-controller to return actual backtrack fragment.
     */
    protected get backtrackFragment(): Fragment | undefined;
    /**
     * Set backtrack fragment. No-op in base class.
     * Override in stream-controller to set actual backtrack fragment.
     */
    protected set backtrackFragment(_value: Fragment | undefined);
    /**
     * Get could backtrack flag. Returns false in base class.
     * Override in stream-controller to return actual value.
     */
    protected get couldBacktrack(): boolean;
    /**
     * Set could backtrack flag. No-op in base class.
     * Override in stream-controller to set actual value.
     */
    protected set couldBacktrack(_value: boolean);
    pauseBuffering(): void;
    resumeBuffering(): void;
    get inFlightFrag(): InFlightData;
    protected _streamEnded(bufferInfo: BufferInfo, levelDetails: LevelDetails): boolean;
    getLevelDetails(): LevelDetails | undefined;
    protected get timelineOffset(): number;
    protected onMediaAttached(event: Events.MEDIA_ATTACHED, data: MediaAttachedData): void;
    protected onMediaDetaching(event: Events.MEDIA_DETACHING, data: MediaDetachingData): void;
    protected onManifestLoading(): void;
    protected onError(event: Events.ERROR, data: ErrorData): void;
    protected onMediaSeeking: () => void;
    protected onMediaEnded: () => void;
    protected onManifestLoaded(event: Events.MANIFEST_LOADED, data: ManifestLoadedData): void;
    protected onHandlerDestroying(): void;
    protected onHandlerDestroyed(): void;
    protected loadFragment(frag: MediaFragment, level: Level, targetBufferTime: number): void;
    private _loadFragForPlayback;
    protected clearTrackerIfNeeded(frag: Fragment): void;
    protected checkLiveUpdate(details: LevelDetails): void;
    protected waitForLive(levelInfo: Level): boolean | undefined;
    protected flushMainBuffer(startOffset: number, endOffset: number, type?: SourceBufferName | null): void;
    protected _loadInitSegment(initFrag: Fragment): Promise<void>;
    private completeInitSegmentLoad;
    private loadInitSegmentIfNeeded;
    protected unhandledEncryptionError(initSegment: InitSegmentData, frag: Fragment): boolean;
    protected fragContextChanged(frag: Fragment | null): boolean;
    protected fragBufferedComplete(frag: Fragment, part: Part | null): void;
    protected _handleFragmentLoadComplete(fragLoadedEndData: PartsLoadedData): void;
    protected _handleFragmentLoadProgress(frag: PartsLoadedData | FragLoadedData): void;
    private loadKeyFor;
    protected _doFragLoad(frag: MediaFragment, level: Level, targetBufferTime?: number | null, progressCallback?: FragmentLoadProgressCallback): Promise<PartsLoadedData | FragLoadedData | null>;
    private doFragPartsLoad;
    private handleFragLoadError;
    protected _handleTransmuxerFlush(chunkMeta: ChunkMetadata): void;
    private shouldLoadParts;
    protected getCurrentContext(chunkMeta: ChunkMetadata): {
        frag: MediaFragment;
        part: Part | null;
        level: Level;
    } | null;
    protected bufferFragmentData(data: RemuxedTrack, frag: Fragment, part: Part | null, chunkMeta: ChunkMetadata, noBacktracking?: boolean): void;
    protected flushBufferGap(frag: Fragment): void;
    protected getFwdBufferInfo(bufferable: Bufferable | null, type: PlaylistLevelType): BufferInfo | null;
    protected getFwdBufferInfoAtPos(bufferable: Bufferable | null, pos: number, type: PlaylistLevelType, maxBufferHole: number): BufferInfo | null;
    protected getMaxBufferLength(levelBitrate?: number): number;
    protected exceedsMaxBuffer(bufferInfo: BufferInfo, maxBufLen: number, selected: Fragment): boolean;
    protected reduceMaxBufferLength(threshold: number, fragDuration: number): boolean;
    protected getAppendedFrag(position: number): MediaFragment | null;
    protected getNextFragment(pos: number, levelDetails: LevelDetails): MediaFragment | null;
    protected isLoopLoading(frag: Fragment, targetBufferTime: number): boolean;
    protected getNextFragmentLoopLoading(frag: MediaFragment, levelDetails: LevelDetails, bufferInfo: BufferInfo, playlistType: PlaylistLevelType, maxBufLen: number): MediaFragment | null;
    protected get primaryPrefetch(): boolean;
    protected filterReplacedPrimary<T extends MediaFragment | Part>(frag: T | null, details: LevelDetails | undefined): T | null;
    getNextPart(partList: Part[], frag: Fragment, targetBufferTime: number): number;
    private loadedEndOfParts;
    protected getInitialLiveFragment(levelDetails: LevelDetails): MediaFragment | null;
    protected getFragmentAtPosition(bufferEnd: number, end: number, levelDetails: LevelDetails): MediaFragment | null;
    protected alignPlaylists(details: LevelDetails, previousDetails: LevelDetails | undefined, switchDetails: LevelDetails | undefined): number;
    protected waitForCdnTuneIn(details: LevelDetails): boolean | 0;
    protected setStartPosition(details: LevelDetails, sliding: number): void;
    protected getLoadPosition(): number;
    protected get playhead(): number;
    protected get iframesOnly(): boolean | undefined;
    private handleFragLoadAborted;
    protected resetFragmentLoading(frag: Fragment): void;
    protected onFragmentOrKeyLoadError(filterType: PlaylistLevelType, data: ErrorData): void;
    protected checkRetryDate(): void;
    protected reduceLengthAndFlushBuffer(data: ErrorData): boolean;
    protected resetFragmentErrors(filterType: PlaylistLevelType): void;
    protected afterBufferFlushed(media: Bufferable, bufferType: SourceBufferName): void;
    protected resetLoadingState(): void;
    private resetStartWhenNotLoaded;
    protected resetWhenMissingContext(chunkMeta: ChunkMetadata | Fragment): void;
    protected removeUnbufferedFrags(start?: number): void;
    private updateLevelTiming;
    private playlistLabel;
    private fragInfo;
    private treatAsGap;
    protected resetTransmuxer(): void;
    private isFragmentNearlyDownloaded;
    protected recoverWorkerError(data: ErrorData): void;
    set state(nextState: (typeof State)[keyof typeof State]);
    get state(): (typeof State)[keyof typeof State];
    /**
     * Calculate optimal switch point by considering fetch delays and buffer info
     * to avoid causing playback interruption
     */
    protected calculateOptimalSwitchPoint(nextLevel: Level, bufferInfo: BufferInfo): {
        fetchdelay: number;
        okToFlushForwardBuffer: boolean;
    };
    /**
     * Generic track switching scheduler that prevents buffering interruptions
     * by finding optimal flush points in the buffer
     * This method can be overridden by subclasses with specific implementation details
     */
    protected scheduleTrackSwitch(bufferInfo: BufferInfo, fetchdelay: number, okToFlushForwardBuffer: boolean): void;
    /**
     * Handle back-buffer cleanup during track switching
     */
    protected cleanupBackBuffer(): void;
    /**
     * Gets buffered fragment at the specified position
     */
    protected getBufferedFrag(position: number): Fragment | null;
    /**
     * Gets the next buffered fragment following the given fragment
     */
    protected followingBufferedFrag(frag: Fragment | null): Fragment | null;
    /**
     * Aborts the current fragment loading and resets state
     * Can be overridden by subclasses for specific behavior
     */
    protected abortCurrentFrag(): void;
    protected checkFragPlaying(): boolean;
    protected getBufferOutput(): Bufferable | null;
    /**
     * try to switch ASAP without breaking video playback:
     * in order to ensure smooth but quick level switching,
     * we need to find the next flushable buffer range
     * we should take into account new segment fetch time
     */
    nextLevelSwitch(): void;
}

export declare interface BaseTrack {
    id: 'audio' | 'main';
    container: string;
    codec?: string;
    supplemental?: string;
    encrypted?: boolean;
    levelCodec?: string;
    pendingCodec?: string;
    metadata?: {
        channelCount?: number;
        width?: number;
        height?: number;
    };
}

export declare type BaseTrackSet = Partial<Record<SourceBufferName, BaseTrack>>;

export declare type Bufferable = {
    buffered: TimeRanges;
};

export declare interface BufferAppendedData {
    type: SourceBufferName;
    frag: Fragment;
    part: Part | null;
    chunkMeta: ChunkMetadata;
    parent: PlaylistLevelType;
    timeRanges: Partial<Record<SourceBufferName, TimeRanges>>;
}

export declare interface BufferAppendingData {
    type: SourceBufferName;
    frag: Fragment;
    part: Part | null;
    chunkMeta: ChunkMetadata;
    offset?: number | undefined;
    parent: PlaylistLevelType;
    data: Uint8Array<ArrayBuffer>;
}

export declare interface BufferCodecsData {
    video?: ParsedTrack;
    audio?: ParsedTrack;
    audiovideo?: ParsedTrack;
    tracks?: BaseTrackSet;
}

export declare class BufferController extends Logger implements ComponentAPI {
    private hls;
    private fragmentTracker;
    private fragmentAppendProgress;
    private appendsWithoutProgress;
    private details;
    private _objectUrl;
    private operationQueue;
    private bufferCodecEventsTotal;
    private media;
    private mediaSource;
    private lastMpegAudioChunk;
    private lastVideoAppendEnd;
    private appendSource;
    private transferData?;
    private overrides?;
    private appendErrors;
    private appendError?;
    private _quotaEvictionPending;
    private tracks;
    private sourceBuffers;
    constructor(hls: Hls, fragmentTracker: FragmentTracker);
    hasSourceTypes(): boolean;
    destroy(): void;
    private registerListeners;
    private unregisterListeners;
    transferMedia(): AttachMediaSourceData | null;
    private initTracks;
    private onManifestLoading;
    private onManifestParsed;
    private onMediaAttaching;
    private assignMediaSource;
    private attachTransferred;
    private get mediaSourceOpenOrEnded();
    private _onEndStreaming;
    private _onStartStreaming;
    private onMediaDetaching;
    private onBufferReset;
    private resetBuffer;
    private removeBuffer;
    private resetQueue;
    private onBufferCodecs;
    get sourceBufferTracks(): BaseTrackSet;
    private appendChangeType;
    private blockAudio;
    private unblockAudio;
    private onBufferAppending;
    private getClearEvictionPendingOp;
    private getFlushOp;
    private onBufferFlushing;
    private onFragParsed;
    private onFragChanged;
    get bufferedToEnd(): boolean;
    private onBufferEos;
    private tracksEnded;
    private onLevelUpdated;
    private updateDuration;
    private onError;
    private getBackBufferEvictionTarget;
    private getFragmentAppendProgress;
    private checkAppendProgress;
    private resetAppendProgress;
    private resetAppendErrors;
    private trimBuffers;
    /**
     * For looped media, determine the back buffer flush position to remove
     * lower-quality segments on a quality upgrade. Returns 0 if no flush is needed.
     */
    private getLoopBackBufferFlushEnd;
    private getEarliestElementaryStreamStart;
    private flushBackBuffer;
    private flushFrontBuffer;
    /**
     * Update Media Source duration to current level duration or override to Infinity if configuration parameter
     * 'liveDurationInfinity` is set to `true`
     * More details: https://github.com/video-dev/hls.js/issues/355
     */
    private getDurationAndRange;
    private updateMediaSource;
    private get tracksReady();
    private checkPendingTracks;
    private bufferCreated;
    private createSourceBuffers;
    private clearBufferAppendTimeoutId;
    private getTrackCodec;
    private trackSourceBuffer;
    private _onMediaSourceOpen;
    private _onMediaSourceClose;
    private _onMediaSourceEnded;
    private _onMediaEmptied;
    private _onMediaError;
    private get mediaSrc();
    private onSBUpdateStart;
    private onSBUpdateEnd;
    private onSBUpdateError;
    private updateTimestampOffset;
    private removeExecutor;
    private appendExecutor;
    private appendTimeoutHandler;
    private calculateAppendTimeoutTime;
    private blockUntilOpen;
    private isUpdating;
    private isQueued;
    private isPending;
    private isAudioBlocked;
    private isAudioBlocking;
    private blockBuffers;
    private stepOperationQueue;
    private append;
    private insertNext;
    private appendBlocker;
    private currentOp;
    private executeNext;
    private shiftAndExecuteNext;
    private get pendingTrackCount();
    private get sourceBufferCount();
    private get sourceBufferTypes();
    private addBufferListener;
    private removeBufferListeners;
}

export declare type BufferControllerConfig = {
    appendErrorMaxRetry: number;
    appendTimeout: number;
    backBufferLength: number;
    frontBufferFlushThreshold: number;
    loopBackBufferFlush?: boolean;
    liveDurationInfinity: boolean;
    /**
     * @deprecated use backBufferLength
     */
    liveBackBufferLength: number | null;
};

export declare interface BufferCreatedData {
    tracks: BufferCreatedTrackSet;
}

export declare interface BufferCreatedTrack extends BaseTrack {
    buffer: ExtendedSourceBuffer;
}

export declare type BufferCreatedTrackSet = Partial<Record<SourceBufferName, BufferCreatedTrack>>;

export declare interface BufferEOSData {
    type: SourceBufferName | null;
}

export declare interface BufferFlushedData {
    type: SourceBufferName;
    start: number;
    end: number;
    error?: Error;
}

export declare interface BufferFlushingData {
    startOffset: number;
    endOffset: number;
    endOffsetSubtitles?: number;
    type: SourceBufferName | null;
}

export declare type BufferInfo = {
    len: number;
    start: number;
    end: number;
    nextStart?: number;
    buffered?: BufferTimeRange[];
    bufferedIndex: number;
};

/**
 * Provides methods dealing with buffer length retrieval for example.
 *
 * In general, a helper around HTML5 MediaElement TimeRanges gathered from `buffered` property.
 *
 * Also @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/buffered
 */
export declare type BufferTimeRange = {
    start: number;
    end: number;
};

export declare class CapLevelController implements ComponentAPI {
    private hls;
    private autoLevelCapping;
    private media;
    private restrictedLevels;
    private timer?;
    private observer?;
    private clientRect;
    private streamController?;
    constructor(hls: Hls);
    setStreamController(streamController: StreamController): void;
    destroy(): void;
    protected registerListeners(): void;
    protected unregisterListener(): void;
    protected onFpsDropLevelCapping(event: Events.FPS_DROP_LEVEL_CAPPING, data: FPSDropLevelCappingData): void;
    protected onMediaAttaching(event: Events.MEDIA_ATTACHING, data: MediaAttachingData): void;
    protected onManifestParsed(event: Events.MANIFEST_PARSED, data: ManifestParsedData): void;
    private onLevelsUpdated;
    protected onBufferCodecs(event: Events.BUFFER_CODECS, data: BufferCodecsData): void;
    protected onMediaDetaching(): void;
    detectPlayerSize(): void;
    getMaxLevel(capLevelIndex: number): number;
    private observe;
    startCapping(): void;
    stopCapping(): void;
    getDimensions(): {
        width: number;
        height: number;
    };
    get mediaWidth(): number;
    get mediaHeight(): number;
    get contentScaleFactor(): number;
    private isLevelAllowed;
    static getMaxLevelByMediaSize(levels: Array<Level>, width: number, height: number): number;
}

export declare type CapLevelControllerConfig = {
    capLevelToPlayerSize: boolean;
};

/**
 * Keep a CEA-608 screen of 32x15 styled characters
 * @constructor
 */
export declare class CaptionScreen {
    rows: Row[];
    currRow: number;
    nrRollUpRows: number | null;
    lastOutputScreen: CaptionScreen | null;
    logger: CaptionsLogger;
    constructor(logger: CaptionsLogger);
    reset(): void;
    equals(other: CaptionScreen): boolean;
    copy(other: CaptionScreen): void;
    isEmpty(): boolean;
    backSpace(): void;
    clearToEndOfRow(): void;
    /**
     * Insert a character (without styling) in the current row.
     */
    insertChar(char: number): void;
    setPen(styles: Partial<PenStyles>): void;
    moveCursor(relPos: number): void;
    setCursor(absPos: number): void;
    setPAC(pacData: PACData): void;
    /**
     * Set background/extra foreground, but first do back_space, and then insert space (backwards compatibility).
     */
    setBkgData(bkgData: Partial<PenStyles>): void;
    setRollUpRows(nrRows: number | null): void;
    rollUp(): void;
    /**
     * Get all non-empty rows with as unicode text.
     */
    getDisplayText(asOneRow?: boolean): string;
    getTextAndFormat(): Row[];
}

declare class CaptionsLogger {
    time: number | null;
    verboseLevel: VerboseLevel;
    log(severity: VerboseLevel, msg: string | (() => string)): void;
}

export declare class ChunkMetadata {
    readonly level: number;
    readonly sn: number;
    readonly part: number;
    readonly id: number;
    readonly size: number;
    readonly partial: boolean;
    readonly iframe: boolean;
    readonly duration: number;
    readonly decryptRange?: {
        start: number;
        end: number;
    };
    readonly transmuxing: HlsChunkPerformanceTiming;
    readonly buffering: {
        [key in SourceBufferName]: HlsChunkPerformanceTiming;
    };
    constructor(level: number, sn: number, id: number, size?: number, part?: number, partial?: boolean, duration?: number, iframe?: boolean, decryptRange?: {
        start: number;
        end: number;
    });
}

/**
 * Common Media Client Data (CMCD) version 2.
 *
 * A standardized set of HTTP request header fields, query string parameters,
 * and event reporting fields for communicating media playback metrics.
 *
 * This type is the intersection of {@link CmcdRequest}, {@link CmcdResponse},
 * and {@link CmcdEvent}, combining all keys from all reporting modes.
 *
 * @see {@link https://cdn.cta.tech/cta/media/media/resources/standards/pdfs/cta-5004-final.pdf|CMCD v1 Spec}
 *
 * @public
 */
declare type Cmcd = CmcdRequest & CmcdResponse & CmcdEvent;

/**
 * CMCD event type for the 'abe' key (ad break end).
 *
 * @public
 */
declare const CMCD_EVENT_AD_BREAK_END: "abe";

/**
 * CMCD event type for the 'abs' key (ad break start).
 *
 * @public
 */
declare const CMCD_EVENT_AD_BREAK_START: "abs";

/**
 * CMCD event type for the 'ae' key (ad end).
 *
 * @public
 */
declare const CMCD_EVENT_AD_END: "ae";

/**
 * CMCD event type for the 'as' key (ad start).
 *
 * @public
 */
declare const CMCD_EVENT_AD_START: "as";

/**
 * CMCD event type for the 'b' key (backgrounded mode).
 *
 * @public
 */
declare const CMCD_EVENT_BACKGROUNDED_MODE: "b";

/**
 * CMCD event type for the 'bc' key (bitrate change).
 *
 * @public
 */
declare const CMCD_EVENT_BITRATE_CHANGE: "bc";

/**
 * CMCD event type for the 'c' key (content ID).
 *
 * @public
 */
declare const CMCD_EVENT_CONTENT_ID: "c";

/**
 * CMCD event type for the 'ce' key (custom event).
 *
 * @public
 */
declare const CMCD_EVENT_CUSTOM_EVENT: "ce";

/**
 * CMCD event type for the 'e' key (error).
 *
 * @public
 */
declare const CMCD_EVENT_ERROR: "e";

/**
 * CMCD event type for the 'm' key (mute).
 *
 * @public
 */
declare const CMCD_EVENT_MUTE: "m";

/**
 * CMCD event type for the 'ps' key (play state change).
 *
 * @public
 */
declare const CMCD_EVENT_PLAY_STATE: "ps";

/**
 * CMCD event type for the 'pr' key (playback rate change).
 *
 * @public
 */
declare const CMCD_EVENT_PLAYBACK_RATE: "pr";

/**
 * CMCD event type for the 'pc' key (player collapse).
 *
 * @public
 */
declare const CMCD_EVENT_PLAYER_COLLAPSE: "pc";

/**
 * CMCD event type for the 'pe' key (player expand).
 *
 * @public
 */
declare const CMCD_EVENT_PLAYER_EXPAND: "pe";

/**
 * CMCD event type for the 'rr' key (response received).
 *
 * @public
 */
declare const CMCD_EVENT_RESPONSE_RECEIVED: "rr";

/**
 * CMCD event type for the 'sk' key (skip).
 *
 * @public
 */
declare const CMCD_EVENT_SKIP: "sk";

/**
 * CMCD event type for the 't' key (time interval).
 *
 * @public
 */
declare const CMCD_EVENT_TIME_INTERVAL: "t";

/**
 * CMCD event type for the 'um' key (unmute).
 *
 * @public
 */
declare const CMCD_EVENT_UNMUTE: "um";

/**
 * CMCD Version 1
 *
 * @public
 */
declare const CMCD_V1: 1;

/**
 * CMCD Version 2
 *
 * @public
 */
declare const CMCD_V2: 2;

/**
 * Controller to deal with Common Media Client Data (CMCD)
 * @see https://cdn.cta.tech/cta/media/media/resources/standards/pdfs/cta-5004-final.pdf
 */
export declare class CMCDController implements ComponentAPI {
    private hls;
    private config;
    private media?;
    private initialized;
    private starved;
    private buffering;
    private playerState?;
    private reporter?;
    private playheadLevel?;
    constructor(hls: Hls);
    private createReporter;
    private registerListeners;
    private unregisterListeners;
    destroy(): void;
    private onMediaAttaching;
    private onMediaDetached;
    private onWaiting;
    private onPlay;
    private onPlaying;
    private onPause;
    private onSeeking;
    private onSeeked;
    private onRateChange;
    private onMediaEnded;
    private onManifestLoading;
    private onError;
    private onLevelSwitching;
    private onLevelSwitched;
    private setPlayerState;
    /**
     * Get the stream type based on level details.
     */
    private getStreamType;
    /**
     * Apply CMCD data to a request using the reporter.
     */
    private apply;
    /**
     * Apply CMCD data to a manifest request.
     */
    private applyPlaylistData;
    /**
     * Apply CMCD data to a segment request
     */
    private applyFragmentData;
    private getNextFrag;
    private getNextPart;
    /**
     * The CMCD object type.
     */
    private getObjectType;
    /**
     * Get the highest bitrate available for the source backing this fragment.
     * Audio renditions live in hls.audioTracks; everything else (including
     * audio-only main playlists) draws from hls.levels.
     */
    private getTopBandwidth;
    private getLowestBandwidth;
    /**
     * Get the buffer length in milliseconds for the source backing this fragment.
     */
    private getBufferLength;
    /**
     * Get the buffer length in milliseconds without a specific fragment context.
     * Used to keep `bl` fresh on event reports independent of segment requests.
     * Returns the playback bottleneck: min of main and audio forward buffer
     * lengths when both exist; otherwise whichever is available.
     */
    private getEventBufferLength;
    private onBufferInfoChange;
    private recordFragmentResponse;
    /**
     * Create a playlist loader
     */
    private createPlaylistLoader;
    /**
     * Create a fragment loader
     */
    private createFragmentLoader;
}

export declare type CMCDControllerConfig = {
    sessionId?: string;
    contentId?: string;
    useHeaders?: boolean;
    includeKeys?: CmcdKey[];
    version?: CmcdVersion;
    rtpSafetyFactor?: number;
    eventTargets?: (Omit<CmcdEventReportConfig, 'enabledKeys'> & {
        includeKeys?: CmcdKey[];
    })[];
    loader?: (request: {
        url: string;
        method?: string;
        headers?: Record<string, string>;
        body?: BodyInit;
    }) => Promise<{
        status: number;
    }>;
    reporterCallback?: (reporter: CmcdCustomReporter) => void;
};

export declare type CmcdCustomData = {
    [index: CmcdCustomKey]: CmcdCustomValue | undefined;
};

/**
 * A custom key for CMCD. Custom keys MUST carry a hyphenated prefix
 * to ensure that there will not be a namespace collision with future
 * revisions to this specification. Clients SHOULD use a reverse-DNS
 * syntax when defining their own prefix.
 *
 * @public
 */
declare type CmcdCustomKey = `${string}-${string}`;

export declare interface CmcdCustomReporter {
    updateCustomData(data: CmcdCustomData): void;
    recordCustomEvent(eventName: string, data?: CmcdCustomData): void;
}

/**
 * A value type for custom CMCD keys.
 *
 * @public
 */
declare type CmcdCustomValue = string | SfItem<string> | (string | SfItem<string>)[] | number | SfItem<number> | (number | SfItem<number>)[] | boolean | SfItem<boolean> | (boolean | SfItem<boolean>)[] | symbol | SfItem<symbol> | (symbol | SfItem<symbol>)[] | SfToken | SfItem<SfToken> | (SfToken | SfItem<SfToken>)[];

/**
 * Common Media Client Data (CMCD) version 2 - Event Mode.
 *
 * Extends {@link CmcdRequest} with event-specific keys for reporting events
 * according to the CMCD version 2 specification.
 *
 * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#event-mode | CTA-5004-B Event Mode}
 *
 * @public
 */
declare type CmcdEvent = CmcdRequest & {
    /**
     * Custom Event Name
     *
     * Used to define a custom event name. A maximum length of 64 characters is allowed. This key MUST be sent when the event type is
     * 'ce' (custom event) and MUST NOT be sent when the event type is any other value. A custom key-value pair MAY be used to transfer
     * a custom value associated with this event. The names chosen SHOULD associate the custom event name with the custom key name.
     *
     * String
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#custom-event-name | CTA-5004-B Custom Event Name}
     */
    cen?: string;
    /**
     * Event
     *
     * This key MUST only be used in Event mode and MUST be present on all reports. The minimum recommended set of supported events
     * are: `ps`, `e`, `t`, and `rr`.
     *
     * - `abs` - ad break start
     * - `abe` - ad break end
     * - `ae` - ad end
     * - `as` - ad start
     * - `b` - backgrounded mode
     * - `bc` - bitrate change
     * - `c` - content ID changed
     * - `ce` - custom event
     * - `e` - error
     * - `h` - hostname changed
     * - `m` - mute
     * - `pc` - player collapse
     * - `pe` - player expand
     * - `pr` - playback rate change
     * - `ps` - play state change
     * - `rr` - response received
     * - `sk` - skip
     * - `t` - time interval
     * - `um` - unmute
     *
     * Token
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#event | CTA-5004-B Event}
     */
    e?: CmcdEventType;
    /**
     * Hostname
     *
     * A string identifying the current hostname from which the player is retrieving content. Maximum length is 128 characters.
     *
     * String
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#hostname | CTA-5004-B Hostname}
     */
    h?: string;
    /**
     * Timestamp
     *
     * The timestamp at which the associated event occurred, expressed as the number of milliseconds that have elapsed since the Unix
     * Epoch (January 1, 1970, at 00:00:00 UTC), excluding leap seconds. When the event is a request for a media object the time SHOULD
     * reference when the request was first initiated.
     *
     * This key MUST be included with all Event reports.
     *
     * Integer milliseconds
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#timestamp | CTA-5004-B Timestamp}
     */
    ts?: number;
};

/**
 * Configuration for a CMCD event report.
 *
 * @public
 */
declare type CmcdEventReportConfig = CmcdReportConfig & {
    /**
     * The version of the CMCD protocol to use. Must be
     * version 2 or higher for event reporting.
     *
     * @defaultValue `CMCD_V2`
     */
    version?: typeof CMCD_V2;
    /**
     * The URL to which the CMCD event should be sent.
     */
    url: string;
    /**
     * The events to report. If no events are provided,
     * the event target will be effectively disabled.
     *
     * @defaultValue `undefined`
     */
    events?: CmcdEventType[];
    /**
     * When the time interval event is sent, the interval at which the
     * events should be reported as a number of seconds.
     *
     * @defaultValue `CMCD_DEFAULT_TIME_INTERVAL`
     *
     * @see {@link CMCD_DEFAULT_TIME_INTERVAL}
     */
    interval?: number;
    /**
     * The number of events to batch before sending the report.
     *
     * @defaultValue `1`
     */
    batchSize?: number;
};

/**
 * CMCD event types for the 'e' key (event mode).
 *
 * @enum
 *
 * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#event | CTA-5004-B Event}
 *
 * @public
 */
declare const CmcdEventType: {
    /**
     * A change in the bitrate.
     */
    readonly BITRATE_CHANGE: typeof CMCD_EVENT_BITRATE_CHANGE;
    /**
     * A change in the player state.
     */
    readonly PLAY_STATE: typeof CMCD_EVENT_PLAY_STATE;
    /**
     * A change in the playback rate.
     */
    readonly PLAYBACK_RATE: typeof CMCD_EVENT_PLAYBACK_RATE;
    /**
     * An error event.
     */
    readonly ERROR: typeof CMCD_EVENT_ERROR;
    /**
     * A periodic report sent on a time interval.
     */
    readonly TIME_INTERVAL: typeof CMCD_EVENT_TIME_INTERVAL;
    /**
     * A change of the content ID.
     */
    readonly CONTENT_ID: typeof CMCD_EVENT_CONTENT_ID;
    /**
     * A change in the application's backgrounded state.
     */
    readonly BACKGROUNDED_MODE: typeof CMCD_EVENT_BACKGROUNDED_MODE;
    /**
     * The player was muted.
     */
    readonly MUTE: typeof CMCD_EVENT_MUTE;
    /**
     * Player unmuted.
     */
    readonly UNMUTE: typeof CMCD_EVENT_UNMUTE;
    /**
     * The player view was expanded.
     */
    readonly PLAYER_EXPAND: typeof CMCD_EVENT_PLAYER_EXPAND;
    /**
     * The player view was collapsed.
     */
    readonly PLAYER_COLLAPSE: typeof CMCD_EVENT_PLAYER_COLLAPSE;
    /**
     * The receipt of a response.
     */
    readonly RESPONSE_RECEIVED: typeof CMCD_EVENT_RESPONSE_RECEIVED;
    /**
     * The start of an ad.
     */
    readonly AD_START: typeof CMCD_EVENT_AD_START;
    /**
     * The end of an ad.
     */
    readonly AD_END: typeof CMCD_EVENT_AD_END;
    /**
     * The start of an ad break.
     */
    readonly AD_BREAK_START: typeof CMCD_EVENT_AD_BREAK_START;
    /**
     * The end of an ad break.
     */
    readonly AD_BREAK_END: typeof CMCD_EVENT_AD_BREAK_END;
    /**
     * The user skipped an ad.
     */
    readonly SKIP: typeof CMCD_EVENT_SKIP;
    /**
     * A custom event.
     */
    readonly CUSTOM_EVENT: typeof CMCD_EVENT_CUSTOM_EVENT;
};

/**
 * @public
 */
declare type CmcdEventType = ValueOf<typeof CmcdEventType>;

/**
 * A CMCD key including V1-only keys.
 *
 * @public
 */
declare type CmcdKey = keyof Cmcd | keyof CmcdV1;

/**
 * Common Media Client Data Object Type
 *
 * @public
 *
 * @enum
 *
 * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#object-type | CTA-5004-B Object Type}
 */
declare const CmcdObjectType: {
    /**
     * text file, such as a manifest or playlist
     */
    readonly MANIFEST: "m";
    /**
     * audio only
     */
    readonly AUDIO: "a";
    /**
     * video only
     */
    readonly VIDEO: "v";
    /**
     * muxed audio and video
     */
    readonly MUXED: "av";
    /**
     * init segment
     */
    readonly INIT: "i";
    /**
     * caption or subtitle
     */
    readonly CAPTION: "c";
    /**
     * ISOBMFF timed text track
     */
    readonly TIMED_TEXT: "tt";
    /**
     * cryptographic key, license or certificate.
     */
    readonly KEY: "k";
    /**
     * other
     */
    readonly OTHER: "o";
};

/**
 * @public
 */
declare type CmcdObjectType = ValueOf<typeof CmcdObjectType>;

/**
 * A numeric list with an optional object type boolean flag.
 *
 * @public
 */
declare type CmcdObjectTypeList = (number | SfItem<number, ExclusiveRecord<CmcdObjectType, boolean>>)[];

/**
 * CMCD v2 player states for the 'sta' key.
 *
 *
 * @enum
 *
 * @public
 *
 * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#state | CTA-5004-B State}
 */
declare const CmcdPlayerState: {
    /**
     * Starting: Initial startup of the player.
     */
    readonly STARTING: "s";
    /**
     * Playing: The player is actively rendering content.
     */
    readonly PLAYING: "p";
    /**
     * Seeking: The player is seeking to a new position.
     */
    readonly SEEKING: "k";
    /**
     * Rebuffering: The player is buffering data during playback.
     */
    readonly REBUFFERING: "r";
    /**
     * Paused: The player is paused.
     */
    readonly PAUSED: "a";
    /**
     * Waiting: The player is waiting for a user action or another event.
     */
    readonly WAITING: "w";
    /**
     * Ended: The media has finished playing.
     */
    readonly ENDED: "e";
    /**
     * Fatal Error: The player has encountered a fatal error.
     */
    readonly FATAL_ERROR: "f";
    /**
     * Quit: User initiated end of playback before media asset completion.
     */
    readonly QUIT: "q";
    /**
     * Preloading: The player is loading assets ahead of starting in order to provide a fast startup. The expectation is that playback will commence at a future time.
     */
    readonly PRELOADING: "d";
};

/**
 * @public
 */
declare type CmcdPlayerState = ValueOf<typeof CmcdPlayerState>;

/**
 * Configuration for a CMCD report.
 *
 * @public
 */
declare type CmcdReportConfig = {
    /**
     * The version of the CMCD specification to use.
     *
     * @defaultValue `CMCD_V2`
     */
    version?: CmcdVersion;
    /**
     * The list of CMCD keys to include in the report. If not provided,
     * no keys will be reported, unless there are other configuration
     * options that require keys to be reported, specifically in event mode.
     *
     * @defaultValue `undefined`
     */
    enabledKeys?: CmcdKey[];
};

/**
 * Common Media Client Data (CMCD) version 2 - Request Mode.
 *
 * A standardized set of HTTP request header fields and query string parameters
 * for communicating media playback metrics in request mode.
 *
 * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#request-mode | CTA-5004-B Request Mode}
 *
 * @public
 */
declare type CmcdRequest = {
    /**
     * Custom key names may be used, but they MUST carry a hyphenated prefix to ensure that there will not be a namespace collision
     * with future revisions to this specification. Clients SHOULD use a reverse-DNS syntax when defining their own prefix.
     */
    [index: CmcdCustomKey]: CmcdCustomValue | undefined;
    /**
     * Aggregate encoded bitrate
     *
     * The aggregate encoded bitrate across a playable combination of tracks. This metric SHOULD NOT be used when the individual bitrates
     * of the tracks are known. This value SHOULD be derived from a playlist/manifest declaration, or it MAY be estimated by the player.
     * If the playlist declares both peak and average bitrate values, the peak value MUST be transmitted. This value MUST NOT be sent if
     * the encoded bitrate is known.
     *
     * Inner list of integer kbps with token identifiers
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#aggregate-encoded-bitrate | CTA-5004-B Aggregate Encoded Bitrate}
     */
    ab?: CmcdObjectTypeList;
    /**
     * Backgrounded
     *
     * All players in a session are currently in a state that is not visible to the user due to a user interaction. This key SHOULD only
     * be sent if it is TRUE. If the visibility state of the player is not known this key SHOULD NOT be reported.
     *
     * Boolean
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#backgrounded | CTA-5004-B Backgrounded}
     */
    bg?: boolean;
    /**
     * Buffer length
     *
     * The buffer length associated with the media object being requested. This value SHOULD be rounded to the nearest 100 ms.
     *
     * Inner list of integer milliseconds with token identifiers
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#buffer-length | CTA-5004-B Buffer Length}
     */
    bl?: CmcdObjectTypeList;
    /**
     * Encoded bitrate
     *
     * The encoded bitrate. In request mode, this refers to the encoded bitrate of the requested representation.
     * In event mode this refers to the encoded bitrate of the currently selected representation.
     * This SHOULD be derived from playlist/manifest declarations, or it MAY be estimated by the player.
     * If the playlist declares both peak and average bitrate values, the peak value MUST be transmitted.
     *
     * Inner list of integer kbps with token identifiers
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#encoded-bitrate | CTA-5004-B Encoded Bitrate}
     */
    br?: CmcdObjectTypeList;
    /**
     * Buffer starvation
     *
     * TRUE if the player buffer was starved at some point between the prior report and this report per reporting destination, resulting in
     * the player entering a rebuffering state or remaining in a rebuffering state. Note that if the player begins requesting data from a
     * new CDN, then this key might initially report buffering caused by the prior CDN. This key SHOULD NOT be reported if it is FALSE.
     *
     * Boolean
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#buffer-starvation | CTA-5004-B Buffer Starvation}
     */
    bs?: boolean;
    /**
     * Buffer Starvation Absolute
     *
     * An absolute count of buffer starvation events since session initiation. A buffer starvation event occurs when the state changes
     * to rebuffering. Token identifier MAY be omitted if the cause of the rebuffering is unknown.
     *
     * Inner list of integers with optional token identifiers
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#buffer-starvation-absolute | CTA-5004-B Buffer Starvation Absolute}
     */
    bsa?: CmcdObjectTypeList;
    /**
     * Buffer Starvation Duration
     *
     * A list of durations of each buffer starvation period reported once the rebuffering has completed. This value MUST only be reported
     * once per reporting mode and report destination. Token identifier MAY be omitted if the cause of the rebuffering is unknown.
     *
     * Inner list of integer milliseconds with optional token identifiers
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#buffer-starvation-duration | CTA-5004-B Buffer Starvation Duration}
     */
    bsd?: CmcdObjectTypeList;
    /**
     * Buffer Starvation Duration Absolute
     *
     * An absolute count of buffer starvation duration since session initiation. Token identifier MAY be omitted if the cause of the
     * rebuffering is unknown.
     *
     * Inner list of integer milliseconds with optional token identifiers
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#buffer-starvation-duration-absolute | CTA-5004-B Buffer Starvation Duration Absolute}
     */
    bsda?: CmcdObjectTypeList;
    /**
     * CDN ID
     *
     * A string identifying the current delivery network from which the player is retrieving content. Maximum length is 128 characters.
     *
     * String
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#cdn-id | CTA-5004-B CDN ID}
     */
    cdn?: string;
    /**
     * Content ID
     *
     * A unique string identifying the current content. The maximum length is 128 characters. This value is consistent across multiple different
     * sessions and devices and is defined and updated at the discretion of the service provider.
     *
     * String
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#content-id | CTA-5004-B Content ID}
     */
    cid?: string;
    /**
     * Content Signature
     *
     * A string representing a signature of the content being played. This field SHOULD vary with content ID and be bound by some mechanism
     * to the content. For example, this field may be used to transmit the C2PA signature associated with the content being viewed.
     *
     * String
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#content-signature | CTA-5004-B Content Signature}
     */
    cs?: string;
    /**
     * Object duration
     *
     * The playback duration in milliseconds of the object being requested. If a partial segment is being requested,
     * then this value MUST indicate the playback duration of that part and not that of its parent segment.
     * This value can be an approximation of the estimated duration if the explicit value is not known.
     * This value MUST NOT be sent for objects which do not have an object type of 'a', 'v', 'av', 'tt', 'c', or 'o'.
     *
     * Integer milliseconds
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#object-duration | CTA-5004-B Object Duration}
     */
    d?: number;
    /**
     * Dropped Frames Absolute
     *
     * An absolute count of dropped frames since session initiation. This key SHOULD only be sent for content types of 'v', 'av' or 'o'.
     * Note that this value will be driven by the content being rendered rather than the content being retrieved, therefore it is
     * beneficial if accompanied by the playhead time 'pt' key to allow for correct interpretation.
     *
     * Integer
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#dropped-frames-absolute | CTA-5004-B Dropped Frames Absolute}
     */
    dfa?: number;
    /**
     * Deadline
     *
     * Deadline from the request time until the first sample of this Segment/Object needs to be available in order to not create a buffer underrun
     * or any other playback problems. This value MUST be rounded to the nearest 100ms. For a playback rate of 1, this may be equivalent to the
     * player's remaining buffer length.
     *
     * Integer milliseconds
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#deadline | CTA-5004-B Deadline}
     */
    dl?: number;
    /**
     * Player Error Code
     *
     * A string defining an error code produced by the player. The namespace and formatting of this error code is left to the application.
     *
     * Even if only one error code is being specified, the list notation MUST still be used.
     *
     * Inner list of strings
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#player-error-code | CTA-5004-B Player Error Code}
     */
    ec?: string[];
    /**
     * Lowest aggregated encoded bitrate
     *
     * The lowest aggregated bitrate rendition in the manifest or playlist. This SHOULD be derived from playlist/manifest declarations,
     * or it MAY be estimated by the player. If the playlist declares both peak and average bitrate values, the peak value MUST be
     * transmitted. The aggregate encoded bitrate is of the complete media object including all object types. This value MUST NOT be
     * sent if the lowest encoded bitrate is known.
     *
     * Inner list of integer kbps with token identifiers
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#lowest-aggregated-encoded-bitrate | CTA-5004-B Lowest Aggregated Encoded Bitrate}
     */
    lab?: CmcdObjectTypeList;
    /**
     * Lowest encoded bitrate
     *
     * The lowest bitrate rendition in the manifest or playlist. This SHOULD be derived from playlist/manifest declarations, or it MAY be
     * estimated by the player. If the playlist declares both peak and average bitrate values, the peak value MUST be transmitted. This
     * lowest bitrate MUST apply to the object type being requested. Requests for video objects MUST specify the lowest video bitrate and
     * requests for audio objects MUST specify the lowest audio bitrate.
     *
     * Inner list of integer kbps with token identifiers
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#lowest-encoded-bitrate | CTA-5004-B Lowest Encoded Bitrate}
     */
    lb?: CmcdObjectTypeList;
    /**
     * Live stream latency
     *
     * The time delta between when a given media timestamp was made available at the origin and when it was rendered by the player. The
     * accuracy of this estimate is dependent on synchronization between the packager and the player clocks.
     *
     * Integer milliseconds
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#live-stream-latency | CTA-5004-B Live Stream Latency}
     */
    ltc?: number;
    /**
     * Media Start Delay
     *
     * Measures the initial delay in wall-clock time from when a player is instructed to play media for a given session to when any media
     * begins playback, whether it be primary content or interstitial content. This value SHOULD be the time difference between the
     * "starting" and "playing" states.
     *
     * This key MUST only be sent once per Session ID and MUST be sent for each reporting mode which is active within the player.
     *
     * Integer milliseconds
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#media-start-delay | CTA-5004-B Media Start Delay}
     */
    msd?: number;
    /**
     * Measured throughput
     *
     * The throughput between player and server, as measured by the player. Throughput MUST be rounded to the nearest 100 kbps. This value, however
     * derived, SHOULD be the value that the player is using to make its next Adaptive Bitrate switching decision. If the player is requesting
     * different object types from different providers then it SHOULD take care to match the throughput measured against that provider with each
     * object type request. It is acceptable to report aggregate information if objects of the same type are requested from different providers.
     * If the player has multiple concurrent connections to the provider, then the intent is that this value communicates the aggregate throughput
     * the player sees across all those connections. If this key is sent on an interval report, the value transmitted should be the last throughput
     * estimate made by the player prior to making the report. There is no requirement for the player to calculate the average measured throughput
     * since the prior interval report.
     *
     * Inner list of integer kbps with token identifiers
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#measured-throughput | CTA-5004-B Measured Throughput}
     */
    mtp?: CmcdObjectTypeList;
    /**
     * Next object request
     *
     * The relative path, as defined by RFC 3986, to one or more objects which can reasonably be expected to be requested by the player making
     * the current request. Each object SHOULD be fetched in its entirety unless there is a range associated with the future request. Even if
     * only one object is being specified, the list notation MUST still be used. If there is a range associated with the future request, then
     * the range is communicated as the parameter 'r' with a String value. The formatting of the String value is similar to the HTTP Range
     * header, except that the unit MUST be 'byte', the 'Range:' prefix is NOT permitted, specifying multiple ranges is NOT allowed and the
     * only valid combinations are:
     *
     * - `"<range-start>-"`
     * - `"<range-start>-<range-end>"`
     * - `"-<suffix-length>"`
     *
     * The player SHOULD NOT depend upon any pre-fetch action being taken - it is merely a request for such a pre-fetch to take place.
     *
     * Inner list of strings
     *
     * @remarks
     * Values may be provided as absolute URLs for convenience; when {@link CmcdEncodeOptions.baseUrl} is set,
     * same-origin URLs are converted to paths relative to that base. Already-relative values are emitted unchanged.
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#next-object-request | CTA-5004-B Next Object Request}
     */
    nor?: (string | SfItem<string, {
        r: string;
    }>)[];
    /**
     * Non rendered
     *
     * True when the content being retrieved by a player is not rendered as audio or video. The key SHOULD only be sent when it is TRUE.
     *
     * Boolean
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#non-rendered | CTA-5004-B Non Rendered}
     */
    nr?: boolean;
    /**
     * Object type
     *
     * The media type of the current object being requested:
     * - `m` = text file, such as a manifest or playlist
     * - `a` = audio only
     * - `v` = video only
     * - `av` = muxed audio and video
     * - `i` = init segment
     * - `c` = caption or subtitle
     * - `tt` = ISOBMFF timed text track
     * - `k` = cryptographic key, license or certificate.
     * - `o` = other
     *
     * If the object type being requested is unknown, then this key MUST NOT be used.
     *
     * This key is also used as a token parameter for other keys.
     *
     * Token
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#object-type | CTA-5004-B Object Type}
     */
    ot?: CmcdObjectType;
    /**
     * Playhead bitrate
     *
     * The encoded bitrate of the media object(s) being shown to the end user.
     *
     * Inner list of integer kbps with token identifiers
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#playhead-bitrate | CTA-5004-B Playhead Bitrate}
     */
    pb?: CmcdObjectTypeList;
    /**
     * Playback rate
     *
     * 1.0 if real-time, 2.0 if double speed, 0 if not playing. SHOULD only be sent if not equal to 1.0.
     *
     * Decimal
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#playback-rate | CTA-5004-B Playback Rate}
     */
    pr?: number;
    /**
     * Playhead time
     *
     * The playhead time, expressed in milliseconds, which is being rendered to the viewer when the report is made.
     *
     * Integer milliseconds
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#playhead-time | CTA-5004-B Playhead Time}
     */
    pt?: number;
    /**
     * Requested maximum throughput
     *
     * The requested maximum throughput that the player considers sufficient for delivery of the asset. Values MUST be rounded to the
     * nearest 100kbps.
     *
     * Integer kbps
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#requested-maximum-throughput | CTA-5004-B Requested Maximum Throughput}
     */
    rtp?: number;
    /**
     * Streaming format
     *
     * The streaming format that defines the current request.
     *
     * - `d` = MPEG DASH
     * - `h` = HTTP Live Streaming (HLS)
     * - `e` = HESP
     * - `s` = Smooth Streaming
     * - `o` = other
     *
     * Token
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#streaming-format | CTA-5004-B Streaming Format}
     */
    sf?: CmcdStreamingFormat;
    /**
     * Session ID
     *
     * A GUID identifying the current playback session. A playback session typically consists of the playback of a single media asset along
     * with accompanying content such as advertisements. This session may comprise the playback of primary content combined with interstitial
     * content. This session is being played on a single device. The maximum length is 64 characters. It is RECOMMENDED to conform to the
     * UUID specification.
     *
     * String
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#session-id | CTA-5004-B Session ID}
     */
    sid?: string;
    /**
     * Sequence Number
     *
     * A monotonically increasing integer to identify the sequence of a CMCD report to a target within a session. This MUST be reset to
     * zero on the start of a new session-id. Sequence numbers increase independently per each combination of mode and target.
     *
     * Integer
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#sequence-number | CTA-5004-B Sequence Number}
     */
    sn?: number;
    /**
     * Stream type
     *
     * - `v` = all segments are available - e.g., VOD
     * - `l` = segments become available over time - e.g., LIVE
     * - `ll` = low latency LIVE
     *
     * Token
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#stream-type | CTA-5004-B Stream Type}
     */
    st?: CmcdStreamType;
    /**
     * State
     *
     * A token describing the current playback state of the player as perceived by the end user, one of:
     *
     * - `s` - starting: the player has been instructed to play media for a given session, either by a user interaction or by an autoplay action.
     * - `p` - playing: Media is being rendered.
     * - `k` - seeking: The start of the action of moving the playhead position after starting.
     * - `r` - rebuffering: Media has stopped being rendered due to an insufficient buffer. This state is not reported during startup or seeking.
     * - `a` - paused: Playback has been intentionally paused by either the user or the player.
     * - `e` - ended: Rendering has ended due to completion of the media asset playback.
     * - `f` - fatal error: Rendering has ended due to an irrecoverable error.
     * - `q` - quit: User initiated end of playback before media asset completion.
     * - `d` - preloading: the player is loading, or has loaded, assets ahead of starting in order to provide a fast startup. The expectation is that playback will commence at a future time.
     *
     * Token - one of [s,p,k,r,a,e,f,q,d]
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#state | CTA-5004-B State}
     */
    sta?: CmcdPlayerState;
    /**
     * Startup
     *
     * Key is included without a value if the object is needed urgently due to startup, seeking or recovery after a buffer-empty event. The player
     * reports this key as true until its buffer first reaches the target buffer for stable playback.
     *
     * Boolean
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#startup | CTA-5004-B Startup}
     */
    su?: boolean;
    /**
     * Top aggregated encoded bitrate
     *
     * The highest aggregated bitrate rendition in the manifest or playlist. This SHOULD be derived from playlist/manifest declarations,
     * or it MAY be estimated by the player. If the playlist declares both peak and average bitrate values, the peak value MUST be
     * transmitted. The aggregate encoded bitrate is of the complete media object including all object types. This value MUST NOT be
     * sent if the top encoded bitrate is known.
     *
     * Inner list of integer kbps with token identifiers
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#top-aggregated-encoded-bitrate | CTA-5004-B Top Aggregated Encoded Bitrate}
     */
    tab?: CmcdObjectTypeList;
    /**
     * Top encoded bitrate
     *
     * The highest bitrate rendition in the manifest or playlist. This SHOULD be derived from playlist/manifest declarations,
     * or it MAY be estimated by the player. If the playlist declares both peak and average bitrate values, the peak value
     * MUST be transmitted. This top bitrate MUST apply to the object type being requested. Requests for video objects MUST
     * specify the top video bitrate and requests for audio objects MUST specify the top audio bitrate.
     *
     * Inner list of integer kbps with token identifiers
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#top-encoded-bitrate | CTA-5004-B Top Encoded Bitrate}
     */
    tb?: CmcdObjectTypeList;
    /**
     * Target Buffer length
     *
     * The target buffer length associated with the media object being requested at the time of the request. This value SHOULD be rounded
     * to the nearest 100 ms.
     *
     * Inner list of integer milliseconds with token identifiers
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#target-buffer-length | CTA-5004-B Target Buffer Length}
     */
    tbl?: CmcdObjectTypeList;
    /**
     * Top playable bitrate
     *
     * The highest bitrate rendition that the player is currently capable of playing for reasons other than bandwidth limitations. This
     * key captures the cases in which, for example, screen resolution, DRM, or performance constraints limit the player's topmost choice
     * of bitrate. These constraints are intentionally obfuscated for privacy reasons.
     *
     * This key can increase the fingerprinting surface exposed by CMCD transmission and SHOULD NOT be transmitted in a default player
     * configuration.
     *
     * If the playlist declares both peak and average bitrate values, the peak value MUST be transmitted. This top playable bitrate MUST
     * apply to the object type being requested. Requests for video objects MUST specify the top playable video bitrate and requests for
     * audio objects MUST specify the top playable audio bitrate. This value MUST NOT be sent for objects which do not have an object type
     * of 'a', 'v', 'av' or 'c'.
     *
     * Inner list of integer kbps with token identifiers
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#top-playable-bitrate | CTA-5004-B Top Playable Bitrate}
     */
    tpb?: CmcdObjectTypeList;
    /**
     * Version
     *
     * The version of this specification used for interpreting the defined key names and values. If this key is omitted, the player and server
     * MUST interpret the values as being defined by version 1. Player SHOULD omit this field if the version is 1 and MUST include this field
     * if the version is not 1.
     *
     * Integer
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#version | CTA-5004-B Version}
     */
    v?: number;
};

/**
 * Common Media Client Data (CMCD) version 2 - Response Mode.
 *
 * Extends {@link CmcdRequest} with response-specific keys for reporting
 * response data according to the CMCD version 2 specification.
 *
 * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#response-mode | CTA-5004-B Response Mode}
 *
 * @public
 */
declare type CmcdResponse = CmcdRequest & {
    /**
     * CMSD Dynamic Header
     *
     * Holds a Base64 encoded copy of the CMSD data received on the CMSD-Dynamic response header. This key MUST only be reported on
     * events of type `rr` (response received).
     *
     * String
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#cmsd-dynamic-header | CTA-5004-B CMSD Dynamic Header}
     */
    cmsdd?: string;
    /**
     * CMSD Static Header
     *
     * Holds a Base64 encoded copy of the CMSD data received on the CMSD-Static response header. This key MUST only be reported on
     * events of type `rr` (response received).
     *
     * String
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#cmsd-static-header | CTA-5004-B CMSD Static Header}
     */
    cmsds?: string;
    /**
     * Response code
     *
     * The response code received when requesting a media object. In a redirect scenario, this would be the final response code received.
     * A value of 0 SHOULD be used to indicate that a response was not received.
     *
     * This key MUST only be reported on events of type `rr` (response received).
     *
     * Integer
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#response-code | CTA-5004-B Response Code}
     */
    rc?: number;
    /**
     * SMRT-Data Header
     *
     * Holds a Base64 encoded copy of the streaming media response tracing data received on the Request Tracing header. This key MUST
     * only be reported on events of type `rr` (response received).
     *
     * String
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#smrt-data-header | CTA-5004-B SMRT-Data Header}
     */
    smrt?: string;
    /**
     * Time to first byte
     *
     * The elapsed time between when the request was first initiated (captured in ts) and the time when the first byte of the response
     * was received. This key MUST only be reported on events of type `rr` (response received).
     *
     * Integer milliseconds
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#time-to-first-byte | CTA-5004-B Time to First Byte}
     */
    ttfb?: number;
    /**
     * Time to first body byte
     *
     * The elapsed time between when the request was first initiated (captured in ts) and the time the first bytes of the response body
     * are received. This key MUST only be reported on events of type `rr` (response received).
     *
     * Integer milliseconds
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#time-to-first-body-byte | CTA-5004-B Time to First Body Byte}
     */
    ttfbb?: number;
    /**
     * Time to last byte
     *
     * The elapsed time between when the request was first initiated (captured in ts) and the time the response body is fully received.
     * This key MUST only be reported on events of type `rr` (response received).
     *
     * Integer milliseconds
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#time-to-last-byte | CTA-5004-B Time to Last Byte}
     */
    ttlb?: number;
    /**
     * Request URL
     *
     * The URL used to request the media object. If the request is redirected, this key MUST report the initial requested URL. This key
     * MUST be reported on events of type `rr` (response received).
     *
     * String
     *
     * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#request-url | CTA-5004-B Request URL}
     */
    url?: string;
};

/**
 * Common Media Client Data Streaming Format
 *
 * @enum
 *
 * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#streaming-format | CTA-5004-B Streaming Format}
 *
 * @public
 */
declare const CmcdStreamingFormat: {
    /**
     * MPEG DASH
     */
    readonly DASH: "d";
    /**
     * HTTP Live Streaming (HLS)
     */
    readonly HLS: "h";
    /**
     * Smooth Streaming
     */
    readonly SMOOTH: "s";
    /**
     * Other
     */
    readonly OTHER: "o";
};

/**
 * @public
 */
declare type CmcdStreamingFormat = ValueOf<typeof CmcdStreamingFormat>;

/**
 * Common Media Client Data Stream Type
 *
 * @enum
 *
 * @see {@link https://cta-wave.github.io/Resources/common-media-client-data--cta-5004-b.html#stream-type | CTA-5004-B Stream Type}
 *
 * @public
 */
declare const CmcdStreamType: {
    /**
     *  All segments are available – e.g., VOD
     */
    readonly VOD: "v";
    /**
     * Segments become available over time – e.g., LIVE
     */
    readonly LIVE: "l";
    /**
     * Low latency stream
     */
    readonly LOW_LATENCY: "ll";
};

/**
 * @public
 */
declare type CmcdStreamType = ValueOf<typeof CmcdStreamType>;

/**
 * CMCD Version 1
 *
 * @public
 */
declare type CmcdV1 = {
    /**
     * Buffer length
     *
     * The buffer length associated with the media object being requested. This value MUST be rounded to the nearest 100 ms. This key SHOULD only be
     * sent with an object type of ‘a’, ‘v’ or ‘av’.
     *
     * Integer milliseconds
     */
    bl?: number;
    /**
     * Bitrate
     *
     * Integer
     */
    br?: number;
    /**
     * Measured mtp CMCD throughput
     *
     * The throughput between client and server, as measured by the client and MUST be rounded to the nearest 100 kbps. This value, however derived,
     * SHOULD be the value that the client is using to make its next Adaptive Bitrate switching decision. If the client is connected to multiple
     * servers concurrently, it must take care to report only the throughput measured against the receiving server. If the client has multiple concurrent
     * connections to the server, then the intent is that this value communicates the aggregate throughput the client sees across all those connections.
     *
     * Integer kbps
     */
    mtp?: number;
    /**
     * Next object request
     *
     * Relative path of the next object to be requested. This can be used to trigger pre-fetching by the CDN. This MUST be a path relative to the current
     * request. This string MUST be URLEncoded. The client SHOULD NOT depend upon any pre-fetch action being taken - it is merely a request for such a
     * pre-fetch to take place.
     *
     * String
     *
     * @remarks
     * Values may be provided as absolute URLs for convenience; when `CmcdEncodeOptions.baseUrl` is set,
     * same-origin URLs are converted to paths relative to that base. Already-relative values are not
     * converted, but are still URL-encoded on emission as required by CMCD v1.
     */
    nor?: string;
    /**
     * Next range request
     *
     * @deprecated Use 'nor' with the 'r' parameter instead.
     *
     * String
     */
    nrr?: string;
    /**
     * Top bitrate
     *
     * The highest bitrate rendition in the manifest or playlist that the client is allowed to play, given current codec, licensing and
     * sizing constraints.
     *
     * Integer Kbps
     */
    tb?: number;
};

/**
 * The version of the CMCD specification.
 *
 * @public
 */
declare type CmcdVersion = typeof CMCD_V1 | typeof CMCD_V2;

export declare interface CodecsParsed {
    audioCodec?: string;
    videoCodec?: string;
    textCodec?: string;
    imageCodec?: string;
    unknownCodecs?: string[];
}

export declare interface ComponentAPI {
    destroy(): void;
}

export declare class ContentSteeringController extends Logger implements NetworkComponentAPI {
    private readonly hls;
    private loader;
    private uri;
    private pathwayId;
    private _pathwayPriority;
    private timeToLoad;
    private reloadTimer;
    private updated;
    private started;
    private enabled;
    private levels;
    private audioTracks;
    private subtitleTracks;
    private penalizedPathways;
    constructor(hls: Hls);
    private registerListeners;
    private unregisterListeners;
    pathways(): string[];
    get pathwayPriority(): string[] | null;
    set pathwayPriority(pathwayPriority: string[]);
    startLoad(): void;
    stopLoad(): void;
    clearTimeout(): void;
    destroy(): void;
    removeLevel(levelToRemove: Level): void;
    private onManifestLoading;
    private onManifestLoaded;
    private onManifestParsed;
    private onError;
    filterParsedLevels(levels: Level[]): Level[];
    private getLevelsForPathway;
    private updatePathwayPriority;
    private getPathwayForGroupId;
    private clonePathways;
    private loadSteeringManifest;
    private scheduleRefresh;
}

export declare type ContentSteeringOptions = {
    uri: string;
    pathwayId: string;
};

export declare const Cues: CuesInterface;

export declare interface CuesInterface {
    newCue(track: TextTrack | null, startTime: number, endTime: number, captionScreen: CaptionScreen): VTTCue[];
}

export declare interface CuesParsedData {
    type: 'captions' | 'subtitles';
    cues: any;
    track: string;
    closedCaptions?: MediaPlaylist | undefined;
    subtitleTrack?: MediaPlaylist;
}

export declare class DateRange {
    attr: AttrList;
    tagAnchor: MediaFragmentRef | null;
    tagOrder: number;
    private _startDate;
    private _endDate?;
    private _dateAtEnd?;
    private _cue?;
    private _badValueForSameId?;
    constructor(dateRangeAttr: AttrList, dateRangeWithSameId?: DateRange | undefined, tagCount?: number);
    get id(): string;
    get class(): string;
    get cue(): DateRangeCue;
    get startTime(): number;
    get startDate(): Date;
    get endDate(): Date | null;
    get duration(): number | null;
    get plannedDuration(): number | null;
    get endOnNext(): boolean;
    get isInterstitial(): boolean;
    get isValid(): boolean;
    get invalidReason(): string | null;
}

export declare type DateRangeCue = {
    pre: boolean;
    post: boolean;
    once: boolean;
};

export declare interface DecryptData {
    uri: string;
    method: string;
    keyFormat: string;
    keyFormatVersions: number[];
    iv: Uint8Array<ArrayBuffer> | null;
    key: Uint8Array<ArrayBuffer> | null;
    keyId: Uint8Array<ArrayBuffer> | null;
    pssh: Uint8Array<ArrayBuffer> | null;
    encrypted: boolean;
    isCommonEncryption: boolean;
}

export declare class Decrypter {
    private logEnabled;
    private decryptRange?;
    private subtle;
    private softwareDecrypter;
    private key;
    private fastAesKey;
    private remainderData;
    private currentIV;
    private currentResult;
    private useSoftware;
    private enableSoftwareAES;
    constructor(config: HlsConfig, useSoftware?: boolean);
    destroy(): void;
    isSync(): boolean;
    flush(): Uint8Array<ArrayBuffer> | null;
    reset(): void;
    decrypt(data: Uint8Array | ArrayBuffer, key: ArrayBuffer, iv: ArrayBuffer, aesMode: DecrypterAesMode, decryptRange?: {
        start: number;
        end: number;
    }): Promise<ArrayBuffer>;
    private softwareDecrypt;
    private webCryptoDecrypt;
    private onWebCryptoError;
    private getValidChunk;
    private logOnce;
}

export declare const enum DecrypterAesMode {
    cbc = 0,
    ctr = 1
}

export declare type DRMSystemConfiguration = {
    licenseUrl: string;
    serverCertificateUrl?: string;
    generateRequest?: (this: Hls, initDataType: string, initData: ArrayBuffer | null, keyContext: MediaKeySessionContext & {
        decryptdata: LevelKey;
        reason: LicenseRequestReason;
    }) => GenerateRequestFilterResult;
};

export declare type DRMSystemOptions = {
    audioRobustness?: string;
    videoRobustness?: string;
    audioEncryptionScheme?: string | null;
    videoEncryptionScheme?: string | null;
    persistentState?: MediaKeysRequirement;
    distinctiveIdentifier?: MediaKeysRequirement;
    sessionTypes?: string[];
    sessionType?: string;
};

export declare type DRMSystemsConfiguration = Partial<Record<KeySystems, DRMSystemConfiguration>>;

export declare interface ElementaryStreamInfo {
    startPTS: number;
    endPTS: number;
    startDTS: number;
    endDTS: number;
    partial?: boolean;
}

export declare type ElementaryStreams = Record<ElementaryStreamTypes, ElementaryStreamInfo | null>;

export declare const enum ElementaryStreamTypes {
    AUDIO = "audio",
    VIDEO = "video",
    AUDIOVIDEO = "audiovideo"
}

/**
 * Controller to deal with encrypted media extensions (EME)
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Encrypted_Media_Extensions_API
 *
 * @class
 * @constructor
 */
export declare class EMEController extends Logger implements ComponentAPI {
    static CDMCleanupPromise: Promise<void> | void;
    private readonly hls;
    private readonly config;
    private media;
    private mediaResolved?;
    private keyFormatPromise;
    private keySystemAccessPromises;
    private sessionSetupByUri;
    private mediaKeySessions;
    private activeKeys;
    private mediaKeys;
    private setMediaKeysQueue;
    constructor(hls: Hls);
    destroy(): void;
    private registerListeners;
    private unregisterListeners;
    private attemptKeySystemAccess;
    private requestMediaKeySystemAccess;
    private getMediaKeysPromise;
    private getMediaKeySessionContext;
    private resetMediaKeys;
    private updateKeySession;
    private getSelectedKeySystemFormats;
    private getKeySystemAccess;
    private selectKeySystem;
    selectKeySystemFormat(frag: Fragment): Promise<KeySystemFormats>;
    private getKeyFormatPromise;
    loadClear(loadingFrag: Fragment, encryptedFragments: Fragment[], startFragRequested: boolean): Promise<void> | null;
    private getKeyStatus;
    loadKey(frag: EncryptedFragment): Promise<LevelKey>;
    renewKeySession(levelKey: LevelKey, context: MediaKeySessionContext): Promise<LevelKey>;
    private updateUsablePromise;
    private getSessionForKey;
    private findContextForKey;
    private resolveSessionForKey;
    private getUsableKeyPromise;
    private throwIfDestroyed;
    private handleError;
    private getKeySystemForKeyPromise;
    private getKeySystemSelectionPromise;
    private activeLevelKeys;
    private onMediaEncrypted;
    private onWaitingForKey;
    private attemptSetMediaKeys;
    private filterInitData;
    private generateRequestWithPreferredKeySession;
    private generateRequest;
    private getKeyStatuses;
    private fetchServerCertificate;
    private setMediaKeysServerCertificate;
    private renewLicense;
    private unpackPlayReadyKeyMessage;
    private setupLicenseXHR;
    private requestLicense;
    private onDestroying;
    private onMediaAttached;
    private onMediaDetached;
    private _clear;
    private onManifestLoading;
    private onManifestLoaded;
    private removeSession;
}

export declare type EMEControllerConfig = {
    licenseXhrSetup?: (this: Hls, xhr: XMLHttpRequest, url: string, keyContext: MediaKeySessionContext & {
        decryptdata: LevelKey;
    }, licenseChallenge: Uint8Array) => void | Uint8Array | string | Promise<Uint8Array | string | void>;
    licenseResponseCallback?: (this: Hls, xhr: XMLHttpRequest, url: string, keyContext: MediaKeySessionContext & {
        decryptdata: LevelKey;
    }) => ArrayBuffer;
    emeEnabled: boolean;
    widevineLicenseUrl?: string;
    drmSystems: DRMSystemsConfiguration | undefined;
    drmSystemOptions: DRMSystemOptions | undefined;
    requestMediaKeySystemAccessFunc: MediaKeyFunc | null;
    requireKeySystemAccessOnStart: boolean;
};

export declare type EncryptedFragment = Fragment & {
    decryptdata: LevelKey;
};

export declare const enum ErrorActionFlags {
    None = 0,
    MoveAllAlternatesMatchingHost = 1,
    MoveAllAlternatesMatchingHDCP = 2,
    MoveAllAlternatesMatchingKey = 4,
    SwitchToSDR = 8,
    ResetMediaSource = 16
}

export declare class ErrorController extends Logger implements NetworkComponentAPI {
    private readonly hls;
    private playlistError;
    constructor(hls: Hls);
    private registerListeners;
    private unregisterListeners;
    destroy(): void;
    startLoad(startPosition: number): void;
    stopLoad(): void;
    private getVariantLevelIndex;
    private getVariantIndex;
    private variantHasKey;
    private onManifestLoading;
    private onLevelUpdated;
    private onError;
    private getPlaylistRetryOrSwitchAction;
    private getFragRetryOrSwitchAction;
    private getLevelSwitchAction;
    onErrorOut(event: Events.ERROR, data: ErrorData): void;
    private sendAlternateToPenaltyBox;
    private switchLevel;
}

export declare type ErrorControllerConfig = {
    /**
     * Duration in milliseconds after which a penalized level (loadError > 0) becomes
     * eligible for re-election. Set to 0 (default) to disable penalty expiry.
     */
    errorPenaltyExpireMs: number;
};

export declare interface ErrorData {
    type: ErrorTypes;
    details: ErrorDetails;
    error: Error;
    fatal: boolean;
    appendsWithoutProgress?: number;
    errorAction?: IErrorAction;
    buffer?: number;
    bufferInfo?: BufferInfo;
    bytes?: number;
    chunkMeta?: ChunkMetadata;
    context?: PlaylistLoaderContext;
    decryptdata?: LevelKey;
    event?: keyof HlsListeners | 'demuxerWorker';
    frag?: Fragment;
    part?: Part | null;
    level?: number | undefined;
    levelRetry?: boolean;
    loader?: Loader<LoaderContext>;
    networkDetails?: NullableNetworkDetails;
    stalled?: {
        start: number;
    };
    stats?: LoaderStats;
    mimeType?: string;
    reason?: string;
    response?: LoaderResponse;
    url?: string;
    parent?: PlaylistLevelType;
    sourceBufferName?: SourceBufferName;
    interstitial?: InterstitialEvent;
    /**
     * @deprecated Use ErrorData.error
     */
    err?: {
        message: string;
    };
}

export declare enum ErrorDetails {
    KEY_SYSTEM_NO_KEYS = "keySystemNoKeys",
    KEY_SYSTEM_NO_ACCESS = "keySystemNoAccess",
    KEY_SYSTEM_NO_SESSION = "keySystemNoSession",
    KEY_SYSTEM_NO_CONFIGURED_LICENSE = "keySystemNoConfiguredLicense",
    KEY_SYSTEM_LICENSE_REQUEST_FAILED = "keySystemLicenseRequestFailed",
    KEY_SYSTEM_SERVER_CERTIFICATE_REQUEST_FAILED = "keySystemServerCertificateRequestFailed",
    KEY_SYSTEM_SERVER_CERTIFICATE_UPDATE_FAILED = "keySystemServerCertificateUpdateFailed",
    KEY_SYSTEM_SESSION_UPDATE_FAILED = "keySystemSessionUpdateFailed",
    KEY_SYSTEM_STATUS_OUTPUT_RESTRICTED = "keySystemStatusOutputRestricted",
    KEY_SYSTEM_STATUS_INTERNAL_ERROR = "keySystemStatusInternalError",
    KEY_SYSTEM_DESTROY_MEDIA_KEYS_ERROR = "keySystemDestroyMediaKeysError",
    KEY_SYSTEM_DESTROY_CLOSE_SESSION_ERROR = "keySystemDestroyCloseSessionError",
    KEY_SYSTEM_DESTROY_REMOVE_SESSION_ERROR = "keySystemDestroyRemoveSessionError",
    MANIFEST_LOAD_ERROR = "manifestLoadError",
    MANIFEST_LOAD_TIMEOUT = "manifestLoadTimeOut",
    MANIFEST_PARSING_ERROR = "manifestParsingError",
    MANIFEST_INCOMPATIBLE_CODECS_ERROR = "manifestIncompatibleCodecsError",
    LEVEL_EMPTY_ERROR = "levelEmptyError",
    PLAYLIST_UNCHANGED_ERROR = "playlistUnchangedError",
    LEVEL_LOAD_ERROR = "levelLoadError",
    LEVEL_LOAD_TIMEOUT = "levelLoadTimeOut",
    LEVEL_PARSING_ERROR = "levelParsingError",
    LEVEL_SWITCH_ERROR = "levelSwitchError",
    AUDIO_TRACK_LOAD_ERROR = "audioTrackLoadError",
    AUDIO_TRACK_LOAD_TIMEOUT = "audioTrackLoadTimeOut",
    SUBTITLE_LOAD_ERROR = "subtitleTrackLoadError",
    SUBTITLE_TRACK_LOAD_TIMEOUT = "subtitleTrackLoadTimeOut",
    FRAG_LOAD_ERROR = "fragLoadError",
    FRAG_LOAD_TIMEOUT = "fragLoadTimeOut",
    FRAG_DECRYPT_ERROR = "fragDecryptError",
    FRAG_PARSING_ERROR = "fragParsingError",
    FRAG_GAP = "fragGap",
    REMUX_ALLOC_ERROR = "remuxAllocError",
    KEY_LOAD_ERROR = "keyLoadError",
    KEY_LOAD_TIMEOUT = "keyLoadTimeOut",
    BUFFER_ADD_CODEC_ERROR = "bufferAddCodecError",
    BUFFER_INCOMPATIBLE_CODECS_ERROR = "bufferIncompatibleCodecsError",
    BUFFER_APPEND_ERROR = "bufferAppendError",
    BUFFER_APPENDING_ERROR = "bufferAppendingError",
    BUFFER_APPEND_NO_PROGRESS = "bufferAppendNoProgress",
    BUFFER_STALLED_ERROR = "bufferStalledError",
    BUFFER_FULL_ERROR = "bufferFullError",
    BUFFER_SEEK_OVER_HOLE = "bufferSeekOverHole",
    BUFFER_NUDGE_ON_STALL = "bufferNudgeOnStall",
    ASSET_LIST_LOAD_ERROR = "assetListLoadError",
    ASSET_LIST_LOAD_TIMEOUT = "assetListLoadTimeout",
    ASSET_LIST_PARSING_ERROR = "assetListParsingError",
    INTERSTITIAL_ASSET_ITEM_ERROR = "interstitialAssetItemError",
    INTERNAL_EXCEPTION = "internalException",
    INTERNAL_ABORTED = "aborted",
    ATTACH_MEDIA_ERROR = "attachMediaError",
    MEDIA_SOURCE_REQUIRES_RESET = "mediaSourceRequiresReset",
    UNKNOWN = "unknown"
}

export declare enum ErrorTypes {
    NETWORK_ERROR = "networkError",
    MEDIA_ERROR = "mediaError",
    KEY_SYSTEM_ERROR = "keySystemError",
    MUX_ERROR = "muxError",
    OTHER_ERROR = "otherError"
}

export declare enum Events {
    MEDIA_ATTACHING = "hlsMediaAttaching",
    MEDIA_ATTACHED = "hlsMediaAttached",
    MEDIA_DETACHING = "hlsMediaDetaching",
    MEDIA_DETACHED = "hlsMediaDetached",
    MEDIA_ENDED = "hlsMediaEnded",
    STALL_RESOLVED = "hlsStallResolved",
    BUFFER_RESET = "hlsBufferReset",
    BUFFER_CODECS = "hlsBufferCodecs",
    BUFFER_CREATED = "hlsBufferCreated",
    BUFFER_APPENDING = "hlsBufferAppending",
    BUFFER_APPENDED = "hlsBufferAppended",
    BUFFER_EOS = "hlsBufferEos",
    BUFFERED_TO_END = "hlsBufferedToEnd",
    BUFFER_FLUSHING = "hlsBufferFlushing",
    BUFFER_FLUSHED = "hlsBufferFlushed",
    MANIFEST_LOADING = "hlsManifestLoading",
    MANIFEST_LOADED = "hlsManifestLoaded",
    MANIFEST_PARSED = "hlsManifestParsed",
    LEVEL_SWITCHING = "hlsLevelSwitching",
    LEVEL_SWITCHED = "hlsLevelSwitched",
    LEVEL_LOADING = "hlsLevelLoading",
    LEVEL_LOADED = "hlsLevelLoaded",
    LEVEL_UPDATED = "hlsLevelUpdated",
    LEVEL_PTS_UPDATED = "hlsLevelPtsUpdated",
    LEVELS_UPDATED = "hlsLevelsUpdated",
    AUDIO_TRACKS_UPDATED = "hlsAudioTracksUpdated",
    AUDIO_TRACK_SWITCHING = "hlsAudioTrackSwitching",
    AUDIO_TRACK_SWITCHED = "hlsAudioTrackSwitched",
    AUDIO_TRACK_LOADING = "hlsAudioTrackLoading",
    AUDIO_TRACK_LOADED = "hlsAudioTrackLoaded",
    AUDIO_TRACK_UPDATED = "hlsAudioTrackUpdated",
    SUBTITLE_TRACKS_UPDATED = "hlsSubtitleTracksUpdated",
    SUBTITLE_TRACKS_CLEARED = "hlsSubtitleTracksCleared",
    SUBTITLE_TRACK_SWITCH = "hlsSubtitleTrackSwitch",
    SUBTITLE_TRACK_LOADING = "hlsSubtitleTrackLoading",
    SUBTITLE_TRACK_LOADED = "hlsSubtitleTrackLoaded",
    SUBTITLE_TRACK_UPDATED = "hlsSubtitleTrackUpdated",
    SUBTITLE_FRAG_PROCESSED = "hlsSubtitleFragProcessed",
    CUES_PARSED = "hlsCuesParsed",
    NON_NATIVE_TEXT_TRACKS_FOUND = "hlsNonNativeTextTracksFound",
    INIT_PTS_FOUND = "hlsInitPtsFound",
    FRAG_LOADING = "hlsFragLoading",
    FRAG_LOAD_EMERGENCY_ABORTED = "hlsFragLoadEmergencyAborted",
    FRAG_LOADED = "hlsFragLoaded",
    FRAG_DECRYPTED = "hlsFragDecrypted",
    FRAG_PARSING_INIT_SEGMENT = "hlsFragParsingInitSegment",
    FRAG_PARSING_USERDATA = "hlsFragParsingUserdata",
    FRAG_PARSING_METADATA = "hlsFragParsingMetadata",
    FRAG_PARSED = "hlsFragParsed",
    FRAG_BUFFERED = "hlsFragBuffered",
    FRAG_CHANGED = "hlsFragChanged",
    FPS_DROP = "hlsFpsDrop",
    FPS_DROP_LEVEL_CAPPING = "hlsFpsDropLevelCapping",
    MAX_AUTO_LEVEL_UPDATED = "hlsMaxAutoLevelUpdated",
    ERROR = "hlsError",
    DESTROYING = "hlsDestroying",
    KEY_LOADING = "hlsKeyLoading",
    KEY_LOADED = "hlsKeyLoaded",
    LIVE_BACK_BUFFER_REACHED = "hlsLiveBackBufferReached",
    BACK_BUFFER_REACHED = "hlsBackBufferReached",
    STEERING_MANIFEST_LOADED = "hlsSteeringManifestLoaded",
    ASSET_LIST_LOADING = "hlsAssetListLoading",
    ASSET_LIST_LOADED = "hlsAssetListLoaded",
    INTERSTITIALS_UPDATED = "hlsInterstitialsUpdated",
    INTERSTITIALS_BUFFERED_TO_BOUNDARY = "hlsInterstitialsBufferedToBoundary",
    INTERSTITIAL_ASSET_PLAYER_CREATED = "hlsInterstitialAssetPlayerCreated",
    INTERSTITIAL_STARTED = "hlsInterstitialStarted",
    INTERSTITIAL_ASSET_STARTED = "hlsInterstitialAssetStarted",
    INTERSTITIAL_ASSET_ENDED = "hlsInterstitialAssetEnded",
    INTERSTITIAL_ASSET_ERROR = "hlsInterstitialAssetError",
    INTERSTITIAL_ENDED = "hlsInterstitialEnded",
    INTERSTITIALS_PRIMARY_RESUMED = "hlsInterstitialsPrimaryResumed",
    PLAYOUT_LIMIT_REACHED = "hlsPlayoutLimitReached",
    EVENT_CUE_ENTER = "hlsEventCueEnter"
}

export declare class EwmaBandWidthEstimator {
    private defaultEstimate_;
    private minWeight_;
    private minDelayMs_;
    private slow_;
    private fast_;
    private defaultTTFB_;
    private ttfb_;
    constructor(slow: number, fast: number, defaultEstimate: number, defaultTTFB?: number);
    update(slow: number, fast: number): void;
    sample(durationMs: number, numBytes: number): void;
    sampleTTFB(ttfb: number): void;
    canEstimate(): boolean;
    getEstimate(): number;
    getEstimateTTFB(): number;
    get defaultEstimate(): number;
    destroy(): void;
}

/**
 * A record that is exclusive to a given key.
 *
 * @public
 */
declare type ExclusiveRecord<K extends PropertyKey, V> = { [P in K]: Record<P, V> & Partial<Record<Exclude<K, P>, never>> extends infer O ? { [Q in keyof O]: O[Q] } : never }[K];

export declare type ExtendedSourceBuffer = SourceBuffer & {
    onbufferedchange?: ((this: SourceBuffer, ev: Event) => any) | null;
};

export declare class FetchLoader extends BaseLoader {
    private fetchSetup;
    private request;
    private response;
    private controller;
    constructor(config: HlsConfig);
    destroy(): void;
    protected abortInternal(): void;
    protected getNetworkDetails(): Response | null;
    protected resetInternalLoader(): void;
    protected loadInternal(): void;
    getCacheAge(): number | null;
    getResponseHeader(name: string): string | null;
    private loadProgressively;
}

export declare class FPSController implements ComponentAPI {
    private hls;
    private isVideoPlaybackQualityAvailable;
    private timer?;
    private media;
    private lastTime;
    private lastDroppedFrames;
    private lastDecodedFrames;
    private streamController;
    constructor(hls: Hls);
    setStreamController(streamController: StreamController): void;
    protected registerListeners(): void;
    protected unregisterListeners(): void;
    destroy(): void;
    protected onMediaAttaching(event: Events.MEDIA_ATTACHING, data: MediaAttachingData): void;
    private onMediaDetaching;
    checkFPS(video: HTMLVideoElement, decodedFrames: number, droppedFrames: number): void;
    checkFPSInterval(): void;
}

export declare type FPSControllerConfig = {
    capLevelOnFPSDrop: boolean;
    fpsDroppedMonitoringPeriod: number;
    fpsDroppedMonitoringThreshold: number;
};

export declare interface FPSDropData {
    currentDropped: number;
    currentDecoded: number;
    totalDroppedFrames: number;
}

export declare interface FPSDropLevelCappingData {
    droppedLevel: number;
    level: number;
}

export declare interface FragBufferedData {
    stats: LoadStats;
    frag: Fragment;
    part: Part | null;
    id: PlaylistLevelType;
    chunkMeta?: ChunkMetadata;
}

export declare interface FragChangedData {
    frag: MediaFragment;
    previousFrag: MediaFragment | null;
}

export declare interface FragDecryptedData {
    frag: Fragment;
    part: Part | null;
    payload: ArrayBuffer;
    stats: {
        tstart: number;
        tdecrypt: number;
    };
}

export declare interface FragLoadedData {
    frag: Fragment;
    part: Part | null;
    payload: ArrayBuffer;
    networkDetails: NullableNetworkDetails;
}

export declare interface FragLoadEmergencyAbortedData {
    frag: Fragment;
    part: Part | null;
    stats: LoaderStats;
}

export declare interface FragLoadFailResult extends ErrorData {
    frag: Fragment;
    part?: Part;
    response?: {
        data: any;
        code: number;
        text: string;
        url: string;
    };
    networkDetails: NullableNetworkDetails;
}

export declare interface FragLoadingData {
    frag: Fragment;
    part?: Part;
    targetBufferTime: number | null;
}

/**
 * Object representing parsed data from an HLS Segment. Found in {@link hls.js#LevelDetails.fragments}.
 */
export declare class Fragment extends BaseSegment {
    private _decryptdata;
    private _programDateTime;
    private _ref;
    private _bitrate?;
    rawProgramDateTime: string | null;
    tagList: Array<string[]>;
    duration: number;
    sn: number | 'initSegment';
    levelkeys?: {
        [key: string]: LevelKey | undefined;
    };
    readonly type: PlaylistLevelType;
    loader: Loader<FragmentLoaderContext> | null;
    keyLoader: Loader<KeyLoaderContext> | null;
    level: number;
    cc: number;
    startPTS?: number;
    endPTS?: number;
    startDTS?: number;
    endDTS?: number;
    start: number;
    playlistOffset: number;
    deltaPTS?: number;
    maxStartPTS?: number;
    minEndPTS?: number;
    data?: Uint8Array<ArrayBuffer>;
    bitrateTest: boolean;
    title: string | null;
    initSegment: Fragment | null;
    endList?: boolean;
    gap?: boolean;
    urlId: number;
    constructor(type: PlaylistLevelType, base: Base | string);
    get byteLength(): number | null;
    get bitrate(): number | null;
    set bitrate(value: number);
    get decryptdata(): LevelKey | null;
    get end(): number;
    get endProgramDateTime(): number | null;
    get encrypted(): boolean;
    get programDateTime(): number | null;
    set programDateTime(value: number | null);
    get ref(): MediaFragmentRef | null;
    addStart(value: number): void;
    setStart(value: number): void;
    setDuration(value: number): void;
    setKeyFormat(keyFormat: KeySystemFormats): void;
    abortRequests(): void;
    setElementaryStreamInfo(type: ElementaryStreamTypes, startPTS: number, endPTS: number, startDTS: number, endDTS: number, partial?: boolean): void;
}

declare interface FragmentBufferedRange {
    time: Array<FragmentTimeRange>;
    partial: boolean;
}

export declare interface FragmentEntity {
    body: MediaFragment;
    appendedPTS: number | null;
    loaded: FragLoadedData | null;
    buffered: boolean;
    range: {
        [key in SourceBufferName | 'subs']: FragmentBufferedRange;
    };
}

export declare class FragmentLoader {
    private readonly config;
    private loader;
    private partLoadTimeout;
    constructor(config: HlsConfig);
    destroy(): void;
    abort(): void;
    load(frag: Fragment, isIFrame?: boolean, onProgress?: FragmentLoadProgressCallback, progressGate?: Promise<void>): Promise<FragLoadedData>;
    private gateProgress;
    loadPart(frag: Fragment, part: Part, onProgress: FragmentLoadProgressCallback): Promise<FragLoadedData>;
    private updateStatsFromPart;
    private resetLoader;
}

/**
 * @deprecated use fragLoadPolicy.default
 */
export declare type FragmentLoaderConfig = {
    fragLoadingTimeOut: number;
    fragLoadingMaxRetry: number;
    fragLoadingRetryDelay: number;
    fragLoadingMaxRetryTimeout: number;
};

export declare interface FragmentLoaderConstructor {
    new (confg: HlsConfig): Loader<FragmentLoaderContext>;
}

export declare interface FragmentLoaderContext extends LoaderContext {
    type: LoaderContextType.MEDIA_FRAGMENT;
    frag: Fragment;
    part: Part | null;
    resetIV?: boolean;
}

export declare type FragmentLoadProgressCallback = (result: FragLoadedData | PartsLoadedData) => void;

export declare const enum FragmentState {
    NOT_LOADED = "NOT_LOADED",
    APPENDING = "APPENDING",
    PARTIAL = "PARTIAL",
    OK = "OK"
}

declare interface FragmentTimeRange {
    startPTS: number;
    endPTS: number;
}

export declare class FragmentTracker implements ComponentAPI {
    private activePartLists;
    private endListFragments;
    private fragments;
    private timeRanges;
    private bufferPadding;
    private hls;
    private hasGaps;
    constructor(hls: Hls);
    private _registerListeners;
    private _unregisterListeners;
    destroy(): void;
    /**
     * Return a Fragment or Part with an appended range that matches the position and levelType
     * Otherwise, return null
     */
    getAppendedFrag(position: number, levelType: PlaylistLevelType): MediaFragment | Part | null;
    /**
     * Return a buffered Fragment that matches the position and levelType.
     * A buffered Fragment is one whose loading, parsing and appending is done (completed or "partial" meaning aborted).
     * If not found any Fragment, return null
     */
    getBufferedFrag(position: number, levelType: PlaylistLevelType): MediaFragment | null;
    getFragAtPos(position: number, levelType: PlaylistLevelType, buffered?: boolean): MediaFragment | null;
    /**
     * Partial fragments effected by coded frame eviction will be removed
     * The browser will unload parts of the buffer to free up memory for new buffer data
     * Fragments will need to be reloaded when the buffer is freed up, removing partial fragments will allow them to reload(since there might be parts that are still playable)
     */
    detectEvictedFragments(elementaryStream: SourceBufferName, timeRange: TimeRanges, playlistType: PlaylistLevelType, appendedFrag?: MediaFragment | null, appendedPart?: Part | null, removeAppending?: boolean): void;
    /**
     * Checks if the fragment passed in is loaded in the buffer properly
     * Partially loaded fragments will be registered as a partial fragment
     */
    detectPartialFragments(data: FragBufferedData): void;
    addAsGap(frag: MediaFragment): void;
    private bufferedEnd;
    private removeParts;
    fragBuffered(frag: MediaFragment, force?: true): FragmentEntity | undefined;
    private getBufferedTimes;
    /**
     * Gets the partial fragment for a certain time
     */
    getPartialFragment(time: number): MediaFragment | null;
    isEndListAppended(type: PlaylistLevelType): boolean;
    getState(fragment: Fragment): FragmentState;
    private isTimeBuffered;
    private onManifestLoading;
    private onFragLoaded;
    private onBufferAppended;
    private onFragBuffered;
    private hasFragment;
    hasFragments(type?: PlaylistLevelType): boolean;
    hasParts(type: PlaylistLevelType): boolean;
    /**
     * Returns the end position needed to free at least `bytesNeeded` from the
     * back buffer, or 0 if not enough data is available. Walks buffered
     * fragments in key order, accumulating byte sizes using stats.loaded,
     * byteLength, or a bitrate estimate as fallback.
     */
    getBackBufferEvictionEnd(beforePosition: number, levelType: PlaylistLevelType, bytesNeeded: number): number;
    removeFragmentsInRange(start: number, end: number, playlistType: PlaylistLevelType, withGapOnly?: boolean, unbufferedOnly?: boolean): void;
    removeFragment(fragment: Fragment): void;
    removeAllFragments(): void;
}

export declare interface FragParsedData {
    frag: Fragment;
    part: Part | null;
    chunkMeta: ChunkMetadata;
}

export declare interface FragParsingInitSegmentData {
}

export declare interface FragParsingMetadataData {
    id: string;
    frag: Fragment;
    details: LevelDetails;
    samples: MetadataSample[];
}

export declare interface FragParsingUserdataData {
    id: string;
    frag: Fragment;
    details: LevelDetails;
    samples: UserdataSample[];
}

export declare class GapController extends TaskLoop {
    private hls;
    private fragmentTracker;
    private media;
    private mediaSource?;
    private nudgeRetry;
    private skipRetry;
    private stallReported;
    private stalled;
    private moved;
    private seeking;
    private buffered;
    private lastCurrentTime;
    ended: number;
    waiting: number;
    constructor(hls: Hls, fragmentTracker: FragmentTracker);
    private registerListeners;
    private unregisterListeners;
    destroy(): void;
    private onMediaAttached;
    private onMediaDetaching;
    private onBufferAppended;
    private onMediaPlaying;
    private onMediaWaiting;
    private onMediaEnded;
    get hasBuffered(): boolean;
    private getCurrentTime;
    tick(): void;
    /**
     * Checks if the playhead is stuck within a gap, and if so, attempts to free it.
     * A gap is an unbuffered range between two buffered ranges (or the start and the first buffered range).
     *
     * @param lastCurrentTime - Previously read playhead position
     */
    poll(currentTime: number, lastCurrentTime: number): void;
    private stallResolved;
    private nudgeOnVideoHole;
    /**
     * Detects and attempts to fix known buffer stalling issues.
     * @param bufferInfo - The properties of the current buffer.
     * @param stalledDurationMs - The amount of time Hls.js has been stalling for.
     * @private
     */
    private _tryFixBufferStall;
    private adjacentTraversal;
    /**
     * Triggers a BUFFER_STALLED_ERROR event, but only once per stall period.
     * @param bufferLen - The playhead distance from the end of the current buffer segment.
     * @private
     */
    private _reportStall;
    /**
     * Attempts to fix buffer stalls by jumping over known gaps caused by partial fragments
     * @param appended - The fragment or part found at the current time (where playback is stalling).
     * @private
     */
    private _trySkipBufferHole;
    /**
     * Attempts to fix buffer stalls by advancing the mediaElement's current time by a small amount.
     * @private
     */
    private _tryNudgeBuffer;
}

export declare type GapControllerConfig = {
    detectStallWithCurrentTimeMs: number;
    highBufferWatchdogPeriod: number;
    nudgeOffset: number;
    nudgeMaxRetry: number;
    nudgeOnVideoHole: boolean;
    skipBufferHolePadding: number;
};

export declare type GenerateRequestFilterResult = {
    initDataType: string;
    initData: ArrayBuffer | null;
} | undefined | never;

export declare type HdcpLevel = (typeof HdcpLevels)[number];

export declare const HdcpLevels: readonly ["NONE", "TYPE-0", "TYPE-1", null];

/**
 * The `Hls` class is the core of the HLS.js library used to instantiate player instances.
 * @public
 */
declare class Hls implements HlsEventEmitter {
    private static defaultConfig;
    /**
     * The runtime configuration used by the player. At instantiation this is combination of `hls.userConfig` merged over `Hls.DefaultConfig`.
     */
    readonly config: HlsConfig;
    /**
     * The configuration object provided on player instantiation.
     */
    readonly userConfig: Partial<HlsConfig>;
    /**
     * The logger functions used by this player instance, configured on player instantiation.
     */
    readonly logger: ILogger;
    protected _url: string | null;
    protected streamController: StreamController;
    private coreComponents;
    private networkControllers;
    private _emitter;
    private _autoLevelCapping;
    private _maxHdcpLevel;
    private abrController;
    private bufferController?;
    private capLevelController?;
    private latencyController?;
    private levelController;
    private audioStreamController?;
    private subtititleStreamController?;
    private audioTrackController?;
    private subtitleTrackController?;
    private interstitialsController?;
    private iframeController?;
    private gapController?;
    private emeController?;
    private cmcdController?;
    private _media;
    private _sessionId?;
    private triggeringException?;
    private started;
    /**
     * Get the video-dev/hls.js package version.
     */
    static get version(): string;
    /**
     * Check if the required MediaSource Extensions are available.
     */
    static isMSESupported(): boolean;
    /**
     * Check if MediaSource Extensions are available and isTypeSupported checks pass for any baseline codecs.
     */
    static isSupported(): boolean;
    /**
     * Get the MediaSource global used for MSE playback (ManagedMediaSource, MediaSource, or WebKitMediaSource).
     */
    static getMediaSource(): typeof MediaSource | undefined;
    static get Events(): typeof Events;
    static get MetadataSchema(): typeof MetadataSchema;
    static get ErrorTypes(): typeof ErrorTypes;
    static get ErrorDetails(): typeof ErrorDetails;
    /**
     * Get the default configuration applied to new instances.
     */
    static get DefaultConfig(): HlsConfig;
    /**
     * Replace the default configuration applied to new instances.
     */
    static set DefaultConfig(defaultConfig: HlsConfig);
    /**
     * Creates an instance of an HLS client that can attach to exactly one `HTMLMediaElement`.
     * @param userConfig - Configuration options applied over `Hls.DefaultConfig`
     */
    constructor(userConfig?: Partial<HlsConfig>);
    private createController;
    on<E extends keyof HlsListeners, Context = undefined>(event: E, listener: HlsListeners[E], context?: Context): void;
    once<E extends keyof HlsListeners, Context = undefined>(event: E, listener: HlsListeners[E], context?: Context): void;
    removeAllListeners<E extends keyof HlsListeners>(event?: E | undefined): void;
    off<E extends keyof HlsListeners, Context = undefined>(event: E, listener?: HlsListeners[E] | undefined, context?: Context, once?: boolean | undefined): void;
    listeners<E extends keyof HlsListeners>(event: E): HlsListeners[E][];
    emit<E extends keyof HlsListeners>(event: E, name: E, eventObject: Parameters<HlsListeners[E]>[1]): boolean;
    trigger<E extends keyof HlsListeners>(event: E, eventObject: Parameters<HlsListeners[E]>[1]): boolean;
    listenerCount<E extends keyof HlsListeners>(event: E): number;
    /**
     * Dispose of the instance
     */
    destroy(): void;
    /**
     * Attaches Hls.js to a media element
     */
    attachMedia(data: HTMLMediaElement | MediaAttachingData): void;
    /**
     * Detach Hls.js from the media
     */
    detachMedia(): void;
    /**
     * Detach HTMLMediaElement, MediaSource, and SourceBuffers without reset, for attaching to another instance
     */
    transferMedia(): AttachMediaSourceData | null;
    /**
     * Set the source URL. Can be relative or absolute.
     */
    loadSource(url: string): void;
    /**
     * Gets the currently loaded URL
     */
    get url(): string | null;
    /**
     * Whether or not enough has been buffered to seek to start position or use `media.currentTime` to determine next load position
     */
    get hasEnoughToStart(): boolean;
    /**
     * Get the startPosition set on startLoad(position) or on autostart with config.startPosition
     */
    get startPosition(): number;
    /**
     * Start loading data from the stream source.
     * Depending on default config, client starts loading automatically when a source is set.
     *
     * @param startPosition - Set the start position to stream from.
     * Defaults to -1 (None: starts from earliest point)
     */
    startLoad(startPosition?: number, skipSeekToStartPosition?: boolean): void;
    /**
     * Stop loading of any stream data.
     */
    stopLoad(): void;
    /**
     * Returns whether loading, toggled with `startLoad()` and `stopLoad()`, is active or not`.
     */
    get loadingEnabled(): boolean;
    /**
     * Returns state of fragment loading toggled by calling `pauseBuffering()` and `resumeBuffering()`.
     */
    get bufferingEnabled(): boolean;
    /**
     * Resumes stream controller segment loading after `pauseBuffering` has been called.
     */
    resumeBuffering(): void;
    /**
     * Prevents stream controller from loading new segments until `resumeBuffering` is called.
     * This allows for media buffering to be paused without interupting playlist loading.
     */
    pauseBuffering(): void;
    get inFlightFragments(): InFlightFragments;
    /**
     * Swap through possible audio codecs in the stream (for example to switch from stereo to 5.1)
     */
    swapAudioCodec(): void;
    /**
     * When the media-element fails, this allows to detach and then re-attach it
     * as one call (convenience method).
     *
     * Automatic recovery of media-errors by this process is configurable.
     */
    recoverMediaError(): void;
    removeLevel(levelIndex: number): void;
    /**
     * @returns a UUID for this player instance
     */
    get sessionId(): string;
    /**
     * @returns an array of levels (variants) sorted by HDCP-LEVEL, RESOLUTION (height), FRAME-RATE, CODECS, VIDEO-RANGE, and BANDWIDTH
     */
    get levels(): Level[];
    /**
     * @returns LevelDetails of last loaded level (variant) or `null` prior to loading a media playlist.
     */
    get latestLevelDetails(): LevelDetails | null;
    /**
     * @returns Level object of selected level (variant) or `null` prior to selecting a level or once the level is removed.
     */
    get loadLevelObj(): Level | null;
    /**
     * Index of quality level (variant) currently played
     */
    get currentLevel(): number;
    /**
     * Set quality level index immediately. This will flush the current buffer to replace the quality asap. That means playback will interrupt at least shortly to re-buffer and re-sync eventually. Set to -1 for automatic level selection.
     */
    set currentLevel(newLevel: number);
    /**
     * Index of next quality level loaded as scheduled by stream controller.
     */
    get nextLevel(): number;
    /**
     * Set quality level index for next loaded data.
     * This will switch the video quality asap, without interrupting playback.
     * May abort current loading of data, and flush parts of buffer (outside currently played fragment region).
     * @param newLevel - Pass -1 for automatic level selection
     */
    set nextLevel(newLevel: number);
    /**
     * Return the quality level of the currently or last (of none is loaded currently) segment
     */
    get loadLevel(): number;
    /**
     * Set quality level index for next loaded data in a conservative way.
     * This will switch the quality without flushing, but interrupt current loading.
     * Thus the moment when the quality switch will appear in effect will only be after the already existing buffer.
     * @param newLevel - Pass -1 for automatic level selection
     */
    set loadLevel(newLevel: number);
    /**
     * get next quality level loaded
     */
    get nextLoadLevel(): number;
    /**
     * Set quality level of next loaded segment in a fully "non-destructive" way.
     * Same as `loadLevel` but will wait for next switch (until current loading is done).
     */
    set nextLoadLevel(level: number);
    /**
     * Return "first level": like a default level, if not set,
     * falls back to index of first level referenced in manifest
     */
    get firstLevel(): number;
    /**
     * Sets "first-level", see getter.
     */
    set firstLevel(newLevel: number);
    /**
     * Return the desired start level for the first fragment that will be loaded.
     * The default value of -1 indicates automatic start level selection.
     * Setting hls.nextAutoLevel without setting a startLevel will result in
     * the nextAutoLevel value being used for one fragment load.
     */
    get startLevel(): number;
    /**
     * set  start level (level of first fragment that will be played back)
     * if not overrided by user, first level appearing in manifest will be used as start level
     * if -1 : automatic start level selection, playback will start from level matching download bandwidth
     * (determined from download of first segment)
     */
    set startLevel(newLevel: number);
    /**
     * Whether level capping is enabled.
     * Default value is set via `config.capLevelToPlayerSize`.
     */
    get capLevelToPlayerSize(): boolean;
    /**
     * Enables or disables level capping. If disabled after previously enabled, `nextLevelSwitch` will be immediately called.
     */
    set capLevelToPlayerSize(shouldStartCapping: boolean);
    /**
     * Capping/max level value that should be used by automatic level selection algorithm (`ABRController`)
     */
    get autoLevelCapping(): number;
    /**
     * Returns the current bandwidth estimate in bits per second, when available. Otherwise, `NaN` is returned.
     */
    get bandwidthEstimate(): number;
    set bandwidthEstimate(abrEwmaDefaultEstimate: number);
    get abrEwmaDefaultEstimate(): number;
    /**
     * get time to first byte estimate
     * @type {number}
     */
    get ttfbEstimate(): number;
    /**
     * Capping/max level value that should be used by automatic level selection algorithm (`ABRController`)
     */
    set autoLevelCapping(newLevel: number);
    get maxHdcpLevel(): HdcpLevel;
    set maxHdcpLevel(value: HdcpLevel);
    /**
     * True when automatic level selection enabled
     */
    get autoLevelEnabled(): boolean;
    /**
     * Level set manually (if any)
     */
    get manualLevel(): number;
    /**
     * min level selectable in auto mode according to config.minAutoBitrate
     */
    get minAutoLevel(): number;
    /**
     * max level selectable in auto mode according to autoLevelCapping
     */
    get maxAutoLevel(): number;
    get firstAutoLevel(): number;
    /**
     * next automatically selected quality level
     */
    get nextAutoLevel(): number;
    /**
     * this setter is used to force next auto level.
     * this is useful to force a switch down in auto mode:
     * in case of load error on level N, hls.js can set nextAutoLevel to N-1 for example)
     * forced value is valid for one fragment. upon successful frag loading at forced level,
     * this value will be resetted to -1 by ABR controller.
     */
    set nextAutoLevel(nextLevel: number);
    /**
     * get the datetime value relative to media.currentTime for the active level Program Date Time if present
     */
    get playingDate(): Date | null;
    get mainForwardBufferInfo(): BufferInfo | null;
    get audioForwardBufferInfo(): BufferInfo | null;
    get maxBufferLength(): number;
    /**
     * Find and select the best matching audio track, making a level switch when a Group change is necessary.
     * Updates `hls.config.audioPreference`. Returns the selected track, or null when no matching track is found.
     */
    setAudioOption(audioOption: MediaPlaylist | AudioSelectionOption | undefined): MediaPlaylist | null;
    /**
     * Find and select the best matching subtitle track, making a level switch when a Group change is necessary.
     * Updates `hls.config.subtitlePreference`. Returns the selected track, or null when no matching track is found.
     */
    setSubtitleOption(subtitleOption: MediaPlaylist | SubtitleSelectionOption | undefined): MediaPlaylist | null;
    /**
     * Get the complete list of audio tracks across all media groups
     */
    get allAudioTracks(): MediaPlaylist[];
    /**
     * Get the list of selectable audio tracks
     */
    get audioTracks(): MediaPlaylist[];
    /**
     * index of the selected audio track (index in audio track lists)
     */
    get audioTrack(): number;
    /**
     * selects an audio track, based on its index in audio track lists
     */
    set audioTrack(audioTrackId: number);
    /**
     * Index of next audio track as scheduled by audio stream controller.
     */
    get nextAudioTrack(): number;
    /**
     * Set audio track index for next loaded data.
     * This will switch the audio track asap, without interrupting playback.
     * May abort current loading of data, and flush parts of buffer(outside
     * currently played fragment region). Audio Track Switched event will be
     * delayed until the currently playing fragment is of the next audio track.
     * @param audioTrackId - Pass -1 for automatic level selection
     */
    set nextAudioTrack(audioTrackId: number);
    /**
     * get the complete list of subtitle tracks across all media groups
     */
    get allSubtitleTracks(): MediaPlaylist[];
    /**
     * get alternate subtitle tracks list from playlist
     */
    get subtitleTracks(): MediaPlaylist[];
    /**
     * index of the selected subtitle track (index in subtitle track lists)
     */
    get subtitleTrack(): number;
    get media(): HTMLMediaElement | null;
    /**
     * select an subtitle track, based on its index in subtitle track lists
     */
    set subtitleTrack(subtitleTrackId: number);
    /**
     * Whether subtitle display is enabled or not
     */
    get subtitleDisplay(): boolean;
    /**
     * Enable/disable subtitle display rendering
     */
    set subtitleDisplay(value: boolean);
    /**
     * get mode for Low-Latency HLS loading
     */
    get lowLatencyMode(): boolean;
    /**
     * Enable/disable Low-Latency HLS part playlist and segment loading, and start live streams at playlist PART-HOLD-BACK rather than HOLD-BACK.
     */
    set lowLatencyMode(mode: boolean);
    /**
     * Position (in seconds) of live sync point (ie edge of live position minus safety delay defined by ```hls.config.liveSyncDuration```)
     * @returns null prior to loading live Playlist
     */
    get liveSyncPosition(): number | null;
    /**
     * Estimated position (in seconds) of live edge (ie edge of live playlist plus time sync playlist advanced)
     * @returns 0 before first playlist is loaded
     */
    get latency(): number;
    /**
     * maximum distance from the edge before the player seeks forward to ```hls.liveSyncPosition```
     * configured using ```liveMaxLatencyDurationCount``` (multiple of target duration) or ```liveMaxLatencyDuration```
     * @returns 0 before first playlist is loaded
     */
    get maxLatency(): number;
    /**
     * target distance from the edge as calculated by the latency controller
     */
    get targetLatency(): number | null;
    set targetLatency(latency: number);
    /**
     * the rate at which the edge of the current live playlist is advancing or 1 if there is none
     */
    get drift(): number | null;
    /**
     * set to true when startLoad is called before MANIFEST_PARSED event
     */
    get forceStartLoad(): boolean;
    /**
     * ContentSteering pathways getter
     */
    get pathways(): string[];
    /**
     * ContentSteering pathwayPriority getter/setter
     */
    get pathwayPriority(): string[] | null;
    set pathwayPriority(pathwayPriority: string[]);
    /**
     * returns true when all SourceBuffers are buffered to the end
     */
    get bufferedToEnd(): boolean;
    /**
     * returns Interstitials Program Manager
     */
    get interstitialsManager(): InterstitialsManager | null;
    /**
     * returns an array of parsed iframe variants
     */
    get iframeVariants(): LevelParsed[];
    /**
     * Returns an new iframe focused Hls (HlsIFramesOnly) instance based on `iframeVariants` found in the current asset,
     * or null when none are available. An iframe instance uses iframe variants as its `levels`.
     * Use HlsIFramesOnly.loadMediaAt(time) to render video IFrames in an attached video element.
     */
    createIFramePlayer(configOverride?: Partial<HlsConfig>): HlsIFramesOnly | null;
    /**
     * Returns an new image iframe focused Hls (HlsImageIFramesOnly) instance based on `iframeVariants` found in the
     * current asset, or null when no image variants are available. An image iframe instance uses iframe variants with
     * image codec values in CODECS ("mjpg") as its `levels`.
     * Use HlsIFramesOnly.loadMediaAt(time) to load image IFrames.
     * Attach an HTMLImageElement with HlsImageIFramesOnly.attachImage(image), or process image data on FRAG_LOADED.
     */
    createImageIFramePlayer(configOverride?: Partial<HlsConfig>): HlsImageIFramesOnly | null;
    /**
     * returns mediaCapabilities.decodingInfo for a variant/rendition
     */
    getMediaDecodingInfo(level: Level, audioTracks?: MediaPlaylist[]): Promise<MediaDecodingInfo>;
}
export default Hls;

export declare class HlsAssetPlayer {
    hls: Hls | null;
    interstitial: InterstitialEvent;
    readonly assetItem: InterstitialAssetItem;
    tracks: Partial<BufferCodecsData> | null;
    private hasDetails;
    private mediaAttached;
    private _currentTime?;
    private _bufferedEosTime?;
    constructor(HlsPlayerClass: typeof Hls, userConfig: HlsAssetPlayerConfig, interstitial: InterstitialEvent, assetItem: InterstitialAssetItem);
    get appendInPlace(): boolean;
    loadSource(): void;
    bufferedInPlaceToEnd(media?: HTMLMediaElement | null, fromTime?: number): boolean;
    private checkPlayout;
    private reachedPlayout;
    get destroyed(): boolean;
    get assetId(): InterstitialAssetId;
    get interstitialId(): InterstitialId;
    get media(): HTMLMediaElement | null;
    get bufferedEnd(): number;
    get currentTime(): number;
    get duration(): number;
    get remaining(): number;
    get startOffset(): number;
    get timelineOffset(): number;
    set timelineOffset(value: number);
    private getAssetTime;
    private removeMediaListeners;
    private bufferSnapShot;
    destroy(): void;
    attachMedia(data: HTMLMediaElement | MediaAttachingData): void;
    detachMedia(): void;
    resumeBuffering(): void;
    pauseBuffering(): void;
    transferMedia(): AttachMediaSourceData | null;
    resetDetails(): void;
    on<E extends keyof HlsListeners, Context = undefined>(event: E, listener: HlsListeners[E], context?: Context): void;
    once<E extends keyof HlsListeners, Context = undefined>(event: E, listener: HlsListeners[E], context?: Context): void;
    off<E extends keyof HlsListeners, Context = undefined>(event: E, listener: HlsListeners[E], context?: Context): void;
    toString(): string;
}

export declare type HlsAssetPlayerConfig = Partial<HlsConfig> & Required<Pick<HlsConfig, 'assetPlayerId' | 'primarySessionId'>>;

export declare interface HlsChunkPerformanceTiming extends HlsPerformanceTiming {
    executeStart: number;
    executeEnd: number;
}

export declare type HlsConfig = {
    debug: boolean | ILogger;
    enableWorker: boolean;
    workerPath: null | string;
    enableSoftwareAES: boolean;
    minAutoBitrate: number;
    ignoreDevicePixelRatio: boolean;
    maxDevicePixelRatio: number;
    preferManagedMediaSource: boolean;
    preserveManualLevelOnError: boolean;
    timelineOffset?: number;
    ignorePlaylistParsingErrors: boolean;
    loader: {
        new (confg: HlsConfig): Loader<LoaderContext>;
    };
    fLoader?: FragmentLoaderConstructor;
    pLoader?: PlaylistLoaderConstructor;
    fetchSetup?: (context: LoaderContext, initParams: any) => Promise<Request> | Request;
    xhrSetup?: (xhr: XMLHttpRequest, url: string, context: LoaderContext) => Promise<void> | void;
    audioStreamController?: typeof AudioStreamController;
    audioTrackController?: typeof AudioTrackController;
    subtitleStreamController?: typeof SubtitleStreamController;
    subtitleTrackController?: typeof SubtitleTrackController;
    timelineController?: typeof TimelineController;
    emeController?: typeof EMEController;
    cmcd?: CMCDControllerConfig;
    cmcdController?: typeof CMCDController;
    contentSteeringController?: typeof ContentSteeringController;
    iframeController?: typeof IFrameController;
    id3TrackController?: typeof ID3TrackController;
    gapController?: typeof GapController;
    latencyController?: typeof LatencyController;
    interstitialsController?: typeof InterstitialsController;
    enableInterstitialPlayback: boolean;
    interstitialAppendInPlace: boolean;
    interstitialLiveLookAhead: number;
    loggerId?: string;
    assetPlayerId?: string;
    useMediaCapabilities: boolean;
    streamController: typeof StreamController;
    abrController: typeof AbrController;
    bufferController?: typeof BufferController;
    capLevelController?: typeof CapLevelController;
    errorController: typeof ErrorController;
    fpsController?: typeof FPSController;
    progressive: boolean;
    lowLatencyMode: boolean;
    primarySessionId?: string;
} & ABRControllerConfig & BufferControllerConfig & CapLevelControllerConfig & EMEControllerConfig & ErrorControllerConfig & FPSControllerConfig & GapControllerConfig & LevelControllerConfig & MP4RemuxerConfig & IFrameControllerConfig & StreamControllerConfig & SelectionPreferences & LatencyControllerConfig & MetadataControllerConfig & TimelineControllerConfig & TSDemuxerConfig & HlsLoadPolicies & PlaylistControllerConfig & FragmentLoaderConfig & PlaylistLoaderConfig;

export declare interface HlsEventEmitter {
    on<E extends keyof HlsListeners, Context = undefined>(event: E, listener: HlsListeners[E], context?: Context): void;
    once<E extends keyof HlsListeners, Context = undefined>(event: E, listener: HlsListeners[E], context?: Context): void;
    removeAllListeners<E extends keyof HlsListeners>(event?: E): void;
    off<E extends keyof HlsListeners, Context = undefined>(event: E, listener?: HlsListeners[E], context?: Context, once?: boolean): void;
    listeners<E extends keyof HlsListeners>(event: E): HlsListeners[E][];
    emit<E extends keyof HlsListeners>(event: E, name: E, eventObject: Parameters<HlsListeners[E]>[1]): boolean;
    listenerCount<E extends keyof HlsListeners>(event: E): number;
}

export declare interface HlsIFramesOnly extends Omit<Hls, 'createIFramePlayer' | 'createImageIFramePlayer' | 'iframeVariants' | 'swapAudioCodec' | 'setAudioOption' | 'allAudioTracks' | 'audioTracks' | 'audioTrack' | 'nextAudioTrack' | 'setSubtitleOption' | 'allSubtitleTracks' | 'subtitleTracks' | 'subtitleTrack' | 'subtitleDisplay'> {
    loadMediaAt(time: number, options?: Partial<LoadMediaAtOptions>): void;
}

export declare interface HlsImageIFramesOnly extends Omit<HlsIFramesOnly, 'attachMedia' | 'detachMedia' | 'transferMedia' | 'recoverMediaError' | 'media'> {
    loadMediaAt(time: number): void;
    attachImage(image: HTMLImageElement): void;
    detachImage(): void;
}

/**
 * Defines each Event type and payload by Event name. Used in {@link hls.js#HlsEventEmitter} to strongly type the event listener API.
 */
export declare interface HlsListeners {
    [Events.MEDIA_ATTACHING]: (event: Events.MEDIA_ATTACHING, data: MediaAttachingData) => void;
    [Events.MEDIA_ATTACHED]: (event: Events.MEDIA_ATTACHED, data: MediaAttachedData) => void;
    [Events.MEDIA_DETACHING]: (event: Events.MEDIA_DETACHING, data: MediaDetachingData) => void;
    [Events.MEDIA_DETACHED]: (event: Events.MEDIA_DETACHED, data: MediaDetachedData) => void;
    [Events.MEDIA_ENDED]: (event: Events.MEDIA_ENDED, data: MediaEndedData) => void;
    [Events.STALL_RESOLVED]: (event: Events.STALL_RESOLVED, data: {}) => void;
    [Events.BUFFER_RESET]: (event: Events.BUFFER_RESET) => void;
    [Events.BUFFER_CODECS]: (event: Events.BUFFER_CODECS, data: BufferCodecsData) => void;
    [Events.BUFFER_CREATED]: (event: Events.BUFFER_CREATED, data: BufferCreatedData) => void;
    [Events.BUFFER_APPENDING]: (event: Events.BUFFER_APPENDING, data: BufferAppendingData) => void;
    [Events.BUFFER_APPENDED]: (event: Events.BUFFER_APPENDED, data: BufferAppendedData) => void;
    [Events.BUFFER_EOS]: (event: Events.BUFFER_EOS, data: BufferEOSData) => void;
    [Events.BUFFERED_TO_END]: (event: Events.BUFFERED_TO_END) => void;
    [Events.BUFFER_FLUSHING]: (event: Events.BUFFER_FLUSHING, data: BufferFlushingData) => void;
    [Events.BUFFER_FLUSHED]: (event: Events.BUFFER_FLUSHED, data: BufferFlushedData) => void;
    [Events.MANIFEST_LOADING]: (event: Events.MANIFEST_LOADING, data: ManifestLoadingData) => void;
    [Events.MANIFEST_LOADED]: (event: Events.MANIFEST_LOADED, data: ManifestLoadedData) => void;
    [Events.MANIFEST_PARSED]: (event: Events.MANIFEST_PARSED, data: ManifestParsedData) => void;
    [Events.LEVEL_SWITCHING]: (event: Events.LEVEL_SWITCHING, data: LevelSwitchingData) => void;
    [Events.LEVEL_SWITCHED]: (event: Events.LEVEL_SWITCHED, data: LevelSwitchedData) => void;
    [Events.LEVEL_LOADING]: (event: Events.LEVEL_LOADING, data: LevelLoadingData) => void;
    [Events.LEVEL_LOADED]: (event: Events.LEVEL_LOADED, data: LevelLoadedData) => void;
    [Events.LEVEL_UPDATED]: (event: Events.LEVEL_UPDATED, data: LevelUpdatedData) => void;
    [Events.LEVEL_PTS_UPDATED]: (event: Events.LEVEL_PTS_UPDATED, data: LevelPTSUpdatedData) => void;
    [Events.LEVELS_UPDATED]: (event: Events.LEVELS_UPDATED, data: LevelsUpdatedData) => void;
    [Events.AUDIO_TRACKS_UPDATED]: (event: Events.AUDIO_TRACKS_UPDATED, data: AudioTracksUpdatedData) => void;
    [Events.AUDIO_TRACK_SWITCHING]: (event: Events.AUDIO_TRACK_SWITCHING, data: AudioTrackSwitchingData) => void;
    [Events.AUDIO_TRACK_SWITCHED]: (event: Events.AUDIO_TRACK_SWITCHED, data: AudioTrackSwitchedData) => void;
    [Events.AUDIO_TRACK_LOADING]: (event: Events.AUDIO_TRACK_LOADING, data: TrackLoadingData) => void;
    [Events.AUDIO_TRACK_LOADED]: (event: Events.AUDIO_TRACK_LOADED, data: AudioTrackLoadedData) => void;
    [Events.AUDIO_TRACK_UPDATED]: (event: Events.AUDIO_TRACK_UPDATED, data: AudioTrackUpdatedData) => void;
    [Events.SUBTITLE_TRACKS_UPDATED]: (event: Events.SUBTITLE_TRACKS_UPDATED, data: SubtitleTracksUpdatedData) => void;
    [Events.SUBTITLE_TRACKS_CLEARED]: (event: Events.SUBTITLE_TRACKS_CLEARED) => void;
    [Events.SUBTITLE_TRACK_SWITCH]: (event: Events.SUBTITLE_TRACK_SWITCH, data: SubtitleTrackSwitchData) => void;
    [Events.SUBTITLE_TRACK_LOADING]: (event: Events.SUBTITLE_TRACK_LOADING, data: TrackLoadingData) => void;
    [Events.SUBTITLE_TRACK_LOADED]: (event: Events.SUBTITLE_TRACK_LOADED, data: SubtitleTrackLoadedData) => void;
    [Events.SUBTITLE_TRACK_UPDATED]: (event: Events.SUBTITLE_TRACK_UPDATED, data: SubtitleTrackUpdatedData) => void;
    [Events.SUBTITLE_FRAG_PROCESSED]: (event: Events.SUBTITLE_FRAG_PROCESSED, data: SubtitleFragProcessedData) => void;
    [Events.CUES_PARSED]: (event: Events.CUES_PARSED, data: CuesParsedData) => void;
    [Events.NON_NATIVE_TEXT_TRACKS_FOUND]: (event: Events.NON_NATIVE_TEXT_TRACKS_FOUND, data: NonNativeTextTracksData) => void;
    [Events.INIT_PTS_FOUND]: (event: Events.INIT_PTS_FOUND, data: InitPTSFoundData) => void;
    [Events.FRAG_LOADING]: (event: Events.FRAG_LOADING, data: FragLoadingData) => void;
    [Events.FRAG_LOAD_EMERGENCY_ABORTED]: (event: Events.FRAG_LOAD_EMERGENCY_ABORTED, data: FragLoadEmergencyAbortedData) => void;
    [Events.FRAG_LOADED]: (event: Events.FRAG_LOADED, data: FragLoadedData) => void;
    [Events.FRAG_DECRYPTED]: (event: Events.FRAG_DECRYPTED, data: FragDecryptedData) => void;
    [Events.FRAG_PARSING_INIT_SEGMENT]: (event: Events.FRAG_PARSING_INIT_SEGMENT, data: FragParsingInitSegmentData) => void;
    [Events.FRAG_PARSING_USERDATA]: (event: Events.FRAG_PARSING_USERDATA, data: FragParsingUserdataData) => void;
    [Events.FRAG_PARSING_METADATA]: (event: Events.FRAG_PARSING_METADATA, data: FragParsingMetadataData) => void;
    [Events.FRAG_PARSED]: (event: Events.FRAG_PARSED, data: FragParsedData) => void;
    [Events.FRAG_BUFFERED]: (event: Events.FRAG_BUFFERED, data: FragBufferedData) => void;
    [Events.FRAG_CHANGED]: (event: Events.FRAG_CHANGED, data: FragChangedData) => void;
    [Events.FPS_DROP]: (event: Events.FPS_DROP, data: FPSDropData) => void;
    [Events.FPS_DROP_LEVEL_CAPPING]: (event: Events.FPS_DROP_LEVEL_CAPPING, data: FPSDropLevelCappingData) => void;
    [Events.MAX_AUTO_LEVEL_UPDATED]: (event: Events.MAX_AUTO_LEVEL_UPDATED, data: MaxAutoLevelUpdatedData) => void;
    [Events.ERROR]: (event: Events.ERROR, data: ErrorData) => void;
    [Events.DESTROYING]: (event: Events.DESTROYING) => void;
    [Events.KEY_LOADING]: (event: Events.KEY_LOADING, data: KeyLoadingData) => void;
    [Events.KEY_LOADED]: (event: Events.KEY_LOADED, data: KeyLoadedData) => void;
    [Events.LIVE_BACK_BUFFER_REACHED]: (event: Events.LIVE_BACK_BUFFER_REACHED, data: LiveBackBufferData) => void;
    [Events.BACK_BUFFER_REACHED]: (event: Events.BACK_BUFFER_REACHED, data: BackBufferData) => void;
    [Events.STEERING_MANIFEST_LOADED]: (event: Events.STEERING_MANIFEST_LOADED, data: SteeringManifestLoadedData) => void;
    [Events.ASSET_LIST_LOADING]: (event: Events.ASSET_LIST_LOADING, data: AssetListLoadingData) => void;
    [Events.ASSET_LIST_LOADED]: (event: Events.ASSET_LIST_LOADED, data: AssetListLoadedData) => void;
    [Events.INTERSTITIALS_UPDATED]: (event: Events.INTERSTITIALS_UPDATED, data: InterstitialsUpdatedData) => void;
    [Events.INTERSTITIALS_BUFFERED_TO_BOUNDARY]: (event: Events.INTERSTITIALS_BUFFERED_TO_BOUNDARY, data: InterstitialsBufferedToBoundaryData) => void;
    [Events.INTERSTITIAL_ASSET_PLAYER_CREATED]: (event: Events.INTERSTITIAL_ASSET_PLAYER_CREATED, data: InterstitialAssetPlayerCreatedData) => void;
    [Events.INTERSTITIAL_STARTED]: (event: Events.INTERSTITIAL_STARTED, data: InterstitialStartedData) => void;
    [Events.INTERSTITIAL_ASSET_STARTED]: (event: Events.INTERSTITIAL_ASSET_STARTED, data: InterstitialAssetStartedData) => void;
    [Events.INTERSTITIAL_ASSET_ENDED]: (event: Events.INTERSTITIAL_ASSET_ENDED, data: InterstitialAssetEndedData) => void;
    [Events.INTERSTITIAL_ASSET_ERROR]: (event: Events.INTERSTITIAL_ASSET_ERROR, data: InterstitialAssetErrorData) => void;
    [Events.INTERSTITIAL_ENDED]: (event: Events.INTERSTITIAL_ENDED, data: InterstitialEndedData) => void;
    [Events.INTERSTITIALS_PRIMARY_RESUMED]: (event: Events.INTERSTITIALS_PRIMARY_RESUMED, data: InterstitialsPrimaryResumed) => void;
    [Events.PLAYOUT_LIMIT_REACHED]: (event: Events.PLAYOUT_LIMIT_REACHED, data: {}) => void;
    [Events.EVENT_CUE_ENTER]: (event: Events.EVENT_CUE_ENTER, data: {}) => void;
}

export declare type HlsLoadPolicies = {
    fragLoadPolicy: LoadPolicy;
    keyLoadPolicy: LoadPolicy;
    certLoadPolicy: LoadPolicy;
    playlistLoadPolicy: LoadPolicy;
    manifestLoadPolicy: LoadPolicy;
    steeringManifestLoadPolicy: LoadPolicy;
    interstitialAssetListLoadPolicy: LoadPolicy;
};

export declare interface HlsPerformanceTiming {
    start: number;
    end: number;
}

export declare interface HlsProgressivePerformanceTiming extends HlsPerformanceTiming {
    first: number;
}

export declare const enum HlsSkip {
    No = "",
    Yes = "YES",
    v2 = "v2"
}

export declare class HlsUrlParameters {
    msn?: number;
    part?: number;
    skip?: HlsSkip;
    constructor(msn?: number, part?: number, skip?: HlsSkip);
    addDirectives(uri: string): string | never;
}

export declare class ID3TrackController implements ComponentAPI {
    private hls;
    private id3Track;
    private media;
    private dateRangeCuesAppended;
    private removeCues;
    private assetCue?;
    constructor(hls: any);
    destroy(): void;
    private _registerListeners;
    private _unregisterListeners;
    private onEventCueEnter;
    private onMediaAttaching;
    private onMediaAttached;
    private onMediaDetaching;
    private onManifestLoading;
    private createTrack;
    private onFragParsingMetadata;
    private updateId3CueEnds;
    private onBufferFlushing;
    private onLevelUpdated;
    private onLevelPtsUpdated;
    private updateDateRangeCues;
}

export declare type IErrorAction = {
    action: NetworkErrorAction;
    flags: ErrorActionFlags;
    retryCount?: number;
    retryConfig?: RetryConfig;
    hdcpLevel?: HdcpLevel;
    nextAutoLevel?: number;
    resolved?: boolean;
};

export declare class IFrameController extends Logger {
    private hls;
    private stats?;
    private variableList;
    private initPTS;
    private iframeInstances;
    private instanceCounter;
    constructor(hls: Hls, HlsPlayerClass: typeof Hls);
    private registerListeners;
    private unregisterListeners;
    private clearAsset;
    private onDestroying;
    private onManifestLoaded;
    private onLevelsUpdated;
    private onInitPtsFound;
    private onFragBuffered;
    createIFramePlayer(configOverride?: Partial<HlsConfig> | undefined): HlsIFramesOnly | null;
    createImageIFramePlayer(configOverride?: Partial<HlsConfig> | undefined): HlsImageIFramesOnly | null;
    private createInstance;
}

export declare type IFrameControllerConfig = {
    iframeCacheLimit: number;
};

export declare interface ILogFunction {
    (message?: any, ...optionalParams: any[]): void;
}

export declare interface ILogger {
    trace: ILogFunction;
    debug: ILogFunction;
    log: ILogFunction;
    warn: ILogFunction;
    info: ILogFunction;
    error: ILogFunction;
}

export declare type InFlightData = {
    frag: Fragment | null;
    state: (typeof State)[keyof typeof State];
};

export declare type InFlightFragments = {
    [PlaylistLevelType.MAIN]: InFlightData;
    [PlaylistLevelType.AUDIO]?: InFlightData;
    [PlaylistLevelType.SUBTITLE]?: InFlightData;
};

export declare interface InitPTSFoundData {
    timestampOffsets: TimestampOffset[];
    id: PlaylistLevelType;
    frag: MediaFragment;
    initPTS: number;
    timescale: number;
    trackId: number;
}

export declare interface InitSegmentData {
    tracks?: TrackSet;
    initPTS: number | undefined;
    timescale: number | undefined;
    trackId: number | undefined;
}

export declare interface InterstitialAssetEndedData {
    asset: InterstitialAssetItem;
    assetListIndex: number;
    event: InterstitialEvent;
    schedule: InterstitialScheduleItem[];
    scheduleIndex: number;
    player: HlsAssetPlayer;
}

export declare type InterstitialAssetErrorData = {
    asset: InterstitialAssetItem | null;
    assetListIndex: number;
    event: InterstitialEvent | null;
    schedule: InterstitialScheduleItem[] | null;
    scheduleIndex: number;
    player: HlsAssetPlayer | null;
} & ErrorData;

export declare type InterstitialAssetId = string;

export declare type InterstitialAssetItem = {
    parentIdentifier: InterstitialId;
    identifier: InterstitialAssetId;
    duration: number | null;
    startOffset: number;
    timelineStart: number;
    uri: string;
    error?: Error;
};

export declare interface InterstitialAssetPlayerCreatedData {
    asset: InterstitialAssetItem;
    assetListIndex: number;
    assetListResponse?: AssetListJSON;
    event: InterstitialEvent;
    player: HlsAssetPlayer;
}

export declare interface InterstitialAssetStartedData {
    asset: InterstitialAssetItem;
    assetListIndex: number;
    event: InterstitialEvent;
    schedule: InterstitialScheduleItem[];
    scheduleIndex: number;
    player: HlsAssetPlayer;
}

export declare interface InterstitialEndedData {
    event: InterstitialEvent;
    schedule: InterstitialScheduleItem[];
    scheduleIndex: number;
}

export declare class InterstitialEvent {
    private base;
    private _duration;
    private _timelineStart;
    private appendInPlaceDisabled?;
    appendInPlaceStarted?: boolean;
    dateRange: DateRange;
    hasPlayed: boolean;
    cumulativeDuration: number;
    resumeOffset: number;
    playoutLimit: number;
    restrictions: PlaybackRestrictions;
    snapOptions: SnapOptions;
    assetList: InterstitialAssetItem[];
    assetListLoader?: Loader<LoaderContext>;
    assetListResponse: AssetListJSON | null;
    resumeAnchor?: MediaFragmentRef;
    error?: Error;
    resetOnResume?: boolean;
    constructor(dateRange: DateRange, base: BaseData);
    setDateRange(dateRange: DateRange): void;
    reset(): void;
    isAssetPastPlayoutLimit(assetIndex: number): boolean;
    findAssetIndex(asset: InterstitialAssetItem): number;
    get identifier(): InterstitialId;
    get startDate(): Date;
    get startTime(): number;
    get startOffset(): number;
    get startIsAligned(): boolean;
    get resumptionOffset(): number;
    get resumeTime(): number;
    get appendInPlace(): boolean;
    set appendInPlace(value: boolean);
    get timelineStart(): number;
    set timelineStart(value: number);
    get duration(): number;
    set duration(value: number);
    get cue(): DateRangeCue;
    get timelineOccupancy(): TimelineOccupancy;
    get supplementsPrimary(): boolean;
    get contentMayVary(): boolean;
    get assetUrl(): string | undefined;
    get assetListUrl(): string | undefined;
    get baseUrl(): string;
    get assetListLoaded(): boolean;
    toString(): string;
}

export declare interface InterstitialEventWithAssetList extends InterstitialEvent {
    assetListUrl: string;
}

export declare type InterstitialId = string;

export declare interface InterstitialPlayer {
    bufferedEnd: number;
    currentTime: number;
    duration: number;
    assetPlayers: (HlsAssetPlayer | null)[];
    playingIndex: number;
    scheduleItem: InterstitialScheduleEventItem | null;
}

export declare interface InterstitialsBufferedToBoundaryData {
    events: InterstitialEvent[];
    schedule: InterstitialScheduleItem[];
    bufferingIndex: number;
    playingIndex: number;
}

export declare type InterstitialScheduleDurations = {
    primary: number;
    playout: number;
    integrated: number;
};

export declare type InterstitialScheduleEventItem = {
    event: InterstitialEvent;
    start: number;
    end: number;
    playout: {
        start: number;
        end: number;
    };
    integrated: {
        start: number;
        end: number;
    };
};

export declare type InterstitialScheduleItem = InterstitialScheduleEventItem | InterstitialSchedulePrimaryItem;

export declare type InterstitialSchedulePrimaryItem = {
    nextEvent: InterstitialEvent | null;
    previousEvent: InterstitialEvent | null;
    event?: undefined;
    start: number;
    end: number;
    playout: {
        start: number;
        end: number;
    };
    integrated: {
        start: number;
        end: number;
    };
};

export declare class InterstitialsController extends Logger implements NetworkComponentAPI {
    private readonly HlsPlayerClass;
    private readonly hls;
    private readonly assetListLoader;
    private mediaSelection;
    private altSelection;
    private media;
    private detachedData;
    private requiredTracks;
    private manager;
    private playerQueue;
    private bufferedPos;
    private timelinePos;
    private schedule;
    private playingItem;
    private bufferingItem;
    private waitingItem;
    private endedItem;
    private playingAsset;
    private endedAsset;
    private bufferingAsset;
    private bufferPastEdge;
    private shouldPlay;
    constructor(hls: Hls, HlsPlayerClass: typeof Hls);
    private registerListeners;
    private unregisterListeners;
    startLoad(): void;
    stopLoad(): void;
    resumeBuffering(): void;
    pauseBuffering(): void;
    destroy(): void;
    private onDestroying;
    private removeMediaListeners;
    private onMediaAttaching;
    private onMediaAttached;
    private clearScheduleState;
    private onMediaDetaching;
    get interstitialsManager(): InterstitialsManager | null;
    private get effectivePlayingItem();
    private get effectivePlayingAsset();
    private get playingLastItem();
    private get playbackStarted();
    private get currentTime();
    private get primaryMedia();
    private isInterstitial;
    private retreiveMediaSource;
    private transferMediaFromPlayer;
    private transferMediaTo;
    private onPlay;
    private onPause;
    private onSeeking;
    private onInterstitialCueEnter;
    private onTimeupdate;
    private checkStart;
    private advanceAssetBuffering;
    private livePrerollResumption;
    private getNextItemIndex;
    private advanceAfterAssetEnded;
    private setScheduleToAssetAtTime;
    private setSchedulePosition;
    private advanceSchedule;
    private get playbackDisabled();
    private get primaryDetails();
    private get primaryLive();
    private resumePrimary;
    private get seekableStart();
    private getPrimaryResumption;
    private getLiveStartPos;
    private isAssetBuffered;
    private attachPrimary;
    private startLoadingPrimaryAt;
    private onManifestLoading;
    private onLevelUpdated;
    private onAudioTrackUpdated;
    private onSubtitleTrackUpdated;
    private onAudioTrackSwitching;
    private onSubtitleTrackSwitch;
    private onBufferCodecs;
    private onBufferAppended;
    private onBufferFlushed;
    private onBufferedToEnd;
    private onMediaEnded;
    private onScheduleUpdate;
    private updateItem;
    private trimInPlace;
    private itemsMatch;
    private eventItemsMatch;
    private findEventIndex;
    private getEventItem;
    private findItemIndex;
    private updateSchedule;
    private checkBuffer;
    private updateBufferedPos;
    private assetsBuffered;
    private setBufferingItem;
    private bufferedToItem;
    private bufferedToEvent;
    private preloadAssets;
    private flushFrontBuffer;
    private getAssetPlayerQueueIndex;
    private getAssetPlayer;
    private getBufferingPlayer;
    private createAsset;
    private createAssetPlayer;
    private clearInterstitial;
    private clearAssetPlayers;
    private resetAssetPlayer;
    private clearAssetPlayer;
    private emptyPlayerQueue;
    private startAssetPlayer;
    private bufferAssetPlayer;
    private handleInPlaceStall;
    private advanceInPlace;
    private handleAssetItemError;
    private primaryFallback;
    private onAssetListLoaded;
    private onError;
}

export declare interface InterstitialsManager {
    events: InterstitialEvent[];
    schedule: InterstitialScheduleItem[];
    interstitialPlayer: InterstitialPlayer | null;
    playerQueue: HlsAssetPlayer[];
    bufferingAsset: InterstitialAssetItem | null;
    bufferingItem: InterstitialScheduleItem | null;
    bufferingIndex: number;
    playingAsset: InterstitialAssetItem | null;
    playingItem: InterstitialScheduleItem | null;
    playingIndex: number;
    primary: PlayheadTimes;
    integrated: PlayheadTimes;
    skip: () => void;
}

export declare interface InterstitialsPrimaryResumed {
    schedule: InterstitialScheduleItem[];
    scheduleIndex: number;
}

export declare interface InterstitialStartedData {
    event: InterstitialEvent;
    schedule: InterstitialScheduleItem[];
    scheduleIndex: number;
}

export declare interface InterstitialsUpdatedData {
    events: InterstitialEvent[];
    schedule: InterstitialScheduleItem[];
    durations: InterstitialScheduleDurations;
    removedIds: string[];
}

export declare interface KeyLoadedData {
    frag: Fragment;
    keyInfo: KeyLoaderInfo;
}

export declare class KeyLoader extends Logger implements ComponentAPI {
    private readonly config;
    private keyLoaderInfo;
    emeController: EMEController | null;
    constructor(config: HlsConfig, logger: ILogger);
    abort(type?: PlaylistLevelType): void;
    destroy(): void;
    loadClear(loadingFrag: Fragment, encryptedFragments: Fragment[], startFragRequested: boolean): Promise<void> | null;
    load(frag: Fragment, initDataPromise?: Promise<void>): Promise<KeyLoadedData>;
    private loadInternal;
    private loadKeyEME;
    private loadKeyHTTP;
    private resetLoader;
}

export declare interface KeyLoaderContext extends LoaderContext {
    type: LoaderContextType.KEY;
    keyInfo: KeyLoaderInfo;
    frag: Fragment;
}

export declare interface KeyLoaderInfo {
    decryptdata: LevelKey;
    keyLoadPromise?: Promise<KeyLoadedData> | null;
    loader?: Loader<KeyLoaderContext> | null;
}

export declare interface KeyLoadingData {
    frag: Fragment;
}

export declare type KeyRequests = {
    [uri: string]: LicenseAndKeysRequest | undefined;
};

export declare type KeyStatuses = {
    [keyId: string]: MediaKeyStatus;
};

export declare const enum KeySystemFormats {
    CLEARKEY = "org.w3.clearkey",
    FAIRPLAY = "com.apple.streamingkeydelivery",
    PLAYREADY = "com.microsoft.playready",
    WIDEVINE = "urn:uuid:edef8ba9-79d6-4ace-a3c8-27dcd51d21ed"
}

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/requestMediaKeySystemAccess
 */
export declare const enum KeySystems {
    CLEARKEY = "org.w3.clearkey",
    FAIRPLAY = "com.apple.fps",
    PLAYREADY = "com.microsoft.playready",
    WIDEVINE = "com.widevine.alpha"
}

export declare type KeyTimeouts = {
    [keyId: string]: number;
};

export declare class LatencyController implements ComponentAPI {
    private hls;
    private media;
    private currentTime;
    private stallCount;
    private _latency;
    private _targetLatencyUpdated;
    constructor(hls: Hls);
    private get levelDetails();
    get latency(): number;
    get maxLatency(): number;
    get targetLatency(): number | null;
    set targetLatency(latency: number);
    get liveSyncPosition(): number | null;
    get drift(): number;
    get edgeStalled(): number;
    private get forwardBufferLength();
    destroy(): void;
    private registerListeners;
    private unregisterListeners;
    private onMediaAttached;
    private onMediaDetaching;
    private onManifestLoading;
    private onLevelUpdated;
    private onAssetStarted;
    private onError;
    private onTimeupdate;
    private changeMediaPlaybackRate;
    private estimateLiveEdge;
    private computeLatency;
}

export declare type LatencyControllerConfig = {
    liveSyncDurationCount: number;
    liveMaxLatencyDurationCount: number;
    liveSyncDuration?: number;
    liveMaxLatencyDuration?: number;
    maxLiveSyncPlaybackRate: number;
    liveSyncOnStallIncrease: number;
};

export declare class Level {
    readonly _attrs: LevelAttributes[];
    readonly audioCodec: string | undefined;
    readonly bitrate: number;
    readonly codecSet: string;
    readonly url: string[];
    readonly frameRate: number;
    readonly height: number;
    readonly id: number;
    readonly name: string;
    readonly supplemental: CodecsParsed | undefined;
    readonly videoCodec: string | undefined;
    readonly width: number;
    readonly imageCodec?: string;
    readonly iframes?: boolean;
    details?: LevelDetails;
    fragmentError: number;
    loadError: number;
    loadErrorTime: number;
    loaded?: {
        bytes: number;
        duration: number;
    };
    realBitrate: number;
    supportedPromise?: Promise<MediaDecodingInfo>;
    supportedResult?: MediaDecodingInfo;
    private _avgBitrate;
    private _audioGroups?;
    private _subtitleGroups?;
    private readonly _urlId;
    constructor(data: LevelParsed | MediaPlaylist);
    get maxBitrate(): number;
    get averageBitrate(): number;
    get attrs(): LevelAttributes;
    get codecs(): string;
    get pathwayId(): string;
    get videoRange(): VideoRange;
    get score(): number;
    get uri(): string;
    hasAudioGroup(groupId: string | undefined): boolean;
    hasSubtitleGroup(groupId: string | undefined): boolean;
    get audioGroups(): (string | undefined)[] | undefined;
    get subtitleGroups(): (string | undefined)[] | undefined;
    addGroupId(type: string, groupId: string | undefined): void;
    get urlId(): number;
    set urlId(value: number);
    get audioGroupIds(): (string | undefined)[] | undefined;
    get textGroupIds(): (string | undefined)[] | undefined;
    get audioGroupId(): string | undefined;
    get textGroupId(): string | undefined;
    addFallback(): void;
}

export declare interface LevelAttributes extends AttrList {
    'ALLOWED-CPC'?: string;
    AUDIO?: string;
    'AVERAGE-BANDWIDTH'?: string;
    BANDWIDTH?: string;
    'CLOSED-CAPTIONS'?: string;
    CODECS?: string;
    'FRAME-RATE'?: string;
    'HDCP-LEVEL'?: 'TYPE-0' | 'TYPE-1' | 'NONE';
    'PATHWAY-ID'?: string;
    RESOLUTION?: string;
    SCORE?: string;
    'STABLE-VARIANT-ID'?: string;
    SUBTITLES?: string;
    'SUPPLEMENTAL-CODECS'?: string;
    VIDEO?: string;
    'VIDEO-RANGE'?: VideoRange;
}

export declare type LevelControllerConfig = {
    startLevel?: number;
};

/**
 * Object representing parsed data from an HLS Media Playlist. Found in {@link hls.js#Level.details}.
 */
export declare class LevelDetails {
    PTSKnown: boolean;
    alignedSliding: boolean;
    averagetargetduration?: number;
    endCC: number;
    endSN: number;
    fragments: MediaFragment[];
    fragmentHint?: MediaFragment;
    partList: Part[] | null;
    dateRanges: Record<string, DateRange | undefined>;
    dateRangeTagCount: number;
    live: boolean;
    iframesOnly: boolean;
    requestScheduled: number;
    ageHeader: number;
    advancedDateTime?: number;
    updated: boolean;
    advanced: boolean;
    misses: number;
    startCC: number;
    startSN: number;
    startTimeOffset: number | null;
    targetduration: number;
    totalduration: number;
    type: string | null;
    url: string;
    m3u8: string;
    version: number | null;
    canBlockReload: boolean;
    canSkipUntil: number;
    canSkipDateRanges: boolean;
    skippedSegments: number;
    recentlyRemovedDateranges?: string[];
    partHoldBack: number;
    holdBack: number;
    partTarget: number;
    preloadHint?: AttrList;
    renditionReports?: AttrList[];
    tuneInGoal: number;
    deltaUpdateFailed?: boolean;
    driftStartTime: number;
    driftEndTime: number;
    driftStart: number;
    driftEnd: number;
    encryptedFragments: Fragment[];
    playlistParsingError: Error | null;
    variableList: VariableMap | null;
    hasVariableRefs: boolean;
    appliedTimelineOffset?: number;
    constructor(baseUrl: string);
    reloaded(previous: LevelDetails | undefined): void;
    hasKey(levelKey: LevelKey): boolean;
    get hasProgramDateTime(): boolean;
    get levelTargetDuration(): number;
    get drift(): number;
    get edge(): number;
    get partEnd(): number;
    get fragmentEnd(): number;
    get fragmentStart(): number;
    get age(): number;
    get lastPartIndex(): number;
    get maxPartIndex(): number;
    get lastPartSn(): number;
    get expired(): boolean;
}

export declare class LevelKey implements DecryptData {
    readonly uri: string;
    readonly method: string;
    readonly keyFormat: string;
    readonly keyFormatVersions: number[];
    readonly encrypted: boolean;
    readonly isCommonEncryption: boolean;
    iv: Uint8Array<ArrayBuffer> | null;
    key: Uint8Array<ArrayBuffer> | null;
    keyId: Uint8Array<ArrayBuffer> | null;
    pssh: Uint8Array<ArrayBuffer> | null;
    scheme?: string;
    static clearKeyUriToKeyIdMap(): void;
    static setKeyIdForUri(uri: string, keyId: Uint8Array<ArrayBuffer>): void;
    static addKeyIdForUri(uri: string): Uint8Array<ArrayBuffer>;
    constructor(method: string, uri: string, format: string, formatversions?: number[], iv?: Uint8Array<ArrayBuffer> | null, keyId?: string);
    matches(key: LevelKey): boolean;
    isSupported(): boolean;
    getDecryptData(sn: number | 'initSegment', levelKeys?: {
        [key: string]: LevelKey | undefined;
    }): LevelKey | null;
}

export declare interface LevelLoadedData {
    details: LevelDetails;
    id: number;
    level: number;
    levelInfo: Level;
    networkDetails: NullableNetworkDetails;
    stats: LoaderStats;
    deliveryDirectives: HlsUrlParameters | null;
    withoutMultiVariant?: boolean;
    context?: PlaylistLoaderContext;
}

export declare interface LevelLoadingData {
    id: number;
    level: number;
    levelInfo: Level;
    pathwayId: string | undefined;
    url: string;
    deliveryDirectives: HlsUrlParameters | null;
}

export declare interface LevelParsed extends CodecsParsed {
    attrs: LevelAttributes;
    bitrate: number;
    details?: LevelDetails;
    height?: number;
    id?: number;
    name: string;
    supplemental?: CodecsParsed;
    url: string;
    width?: number;
    iframes?: boolean;
}

export declare interface LevelPTSUpdatedData {
    details: LevelDetails;
    level: Level;
    drift: number;
    type: string;
    frag: Fragment;
    start: number;
    end: number;
}

export declare interface LevelsUpdatedData {
    levels: Array<Level>;
}

export declare interface LevelSwitchedData {
    level: number;
}

export declare interface LevelSwitchingData {
    level: number;
    attrs: LevelAttributes;
    details: LevelDetails | undefined;
    bitrate: number;
    averageBitrate: number;
    maxBitrate: number;
    realBitrate: number;
    width: number;
    height: number;
    codecSet: string;
    audioCodec: string | undefined;
    videoCodec: string | undefined;
    audioGroups: (string | undefined)[] | undefined;
    subtitleGroups: (string | undefined)[] | undefined;
    loaded: {
        bytes: number;
        duration: number;
    } | undefined;
    loadError: number;
    fragmentError: number;
    name: string | undefined;
    id: number;
    uri: string;
    url: string[];
    urlId: 0;
    audioGroupIds: (string | undefined)[] | undefined;
    textGroupIds: (string | undefined)[] | undefined;
}

export declare interface LevelUpdatedData {
    details: LevelDetails;
    level: number;
}

export declare type LicenseAndKeysRequest = {
    status: 'initialized' | 'started' | 'generated' | MediaKeyMessageType;
    resolved?: boolean;
    errored?: Error;
    licenseXhr?: XMLHttpRequest;
    requestErrors: {
        status: number;
        message: string;
    }[];
    onmessage?: (this: MediaKeySession, ev: MediaKeyMessageEvent) => any;
    onkeystatuseschange?: (this: MediaKeySession, ev: Event) => any;
};

export declare type LicenseRequestReason = 'playlist-key' | 'encrypted-event-key-match' | 'encrypted-event-no-match' | 'expired';

/**
 * @deprecated Use BackBufferData
 */
export declare interface LiveBackBufferData extends BackBufferData {
}

export declare interface Loader<T extends LoaderContext> {
    destroy(): void;
    abort(): void;
    load(context: T, config: LoaderConfiguration, callbacks: LoaderCallbacks<T>): void;
    /**
     * `getCacheAge()` is called by hls.js to get the duration that a given object
     * has been sitting in a cache proxy when playing live.  If implemented,
     * this should return a value in seconds.
     *
     * For HTTP based loaders, this should return the contents of the "age" header.
     *
     * @returns time object being lodaded
     */
    getCacheAge?: () => number | null;
    getResponseHeader?: (name: string) => string | null;
    context: T | null;
    stats: LoaderStats;
}

export declare interface LoaderCallbacks<T extends LoaderContext> {
    onSuccess: LoaderOnSuccess<T>;
    onError: LoaderOnError<T>;
    onTimeout: LoaderOnTimeout<T>;
    onAbort?: LoaderOnAbort<T>;
    onProgress?: LoaderOnProgress<T>;
}

export declare type LoaderConfig = {
    maxTimeToFirstByteMs: number;
    maxLoadTimeMs: number;
    timeoutRetry: RetryConfig | null;
    errorRetry: RetryConfig | null;
};

export declare interface LoaderConfiguration {
    loadPolicy: LoaderConfig;
    /**
     * @deprecated use LoaderConfig timeoutRetry and errorRetry maxNumRetry
     */
    maxRetry: number;
    /**
     * @deprecated use LoaderConfig maxTimeToFirstByteMs and maxLoadTimeMs
     */
    timeout: number;
    /**
     * @deprecated use LoaderConfig timeoutRetry and errorRetry retryDelayMs
     */
    retryDelay: number;
    /**
     * @deprecated use LoaderConfig timeoutRetry and errorRetry maxRetryDelayMs
     */
    maxRetryDelay: number;
    highWaterMark?: number;
}

export declare interface LoaderContext {
    url: string;
    responseType: string;
    type: LoaderContextType;
    headers?: Record<string, string>;
    rangeStart?: number;
    rangeEnd?: number;
    progressData?: boolean;
}

export declare enum LoaderContextType {
    MANIFEST = "manifest",
    LEVEL = "level",
    AUDIO_TRACK = "audioTrack",
    SUBTITLE_TRACK = "subtitleTrack",
    MEDIA_FRAGMENT = "media-fragment",
    KEY = "key",
    STEERING_MANIFEST = "steering-manifest",
    SERVER_CERTIFICATE = "server-certificate",
    INTERSTITIAL_ASSET_LIST = "interstitial-asset-list"
}

export declare type LoaderOnAbort<T extends LoaderContext> = (stats: LoaderStats, context: T, networkDetails: NullableNetworkDetails) => void;

export declare type LoaderOnError<T extends LoaderContext> = (error: {
    code: number;
    text: string;
}, context: T, networkDetails: NullableNetworkDetails, stats: LoaderStats) => void;

export declare type LoaderOnProgress<T extends LoaderContext> = (stats: LoaderStats, context: T, data: string | ArrayBuffer, networkDetails: NullableNetworkDetails) => void;

export declare type LoaderOnSuccess<T extends LoaderContext> = (response: LoaderResponse, stats: LoaderStats, context: T, networkDetails: NullableNetworkDetails) => void;

export declare type LoaderOnTimeout<T extends LoaderContext> = (stats: LoaderStats, context: T, networkDetails: NullableNetworkDetails) => void;

export declare interface LoaderResponse {
    url: string;
    data?: string | ArrayBuffer | Object;
    code?: number;
    text?: string;
}

export declare class LoadError extends Error {
    readonly data: FragLoadFailResult;
    constructor(data: FragLoadFailResult);
}

export declare interface LoaderStats {
    aborted: boolean;
    loaded: number;
    retry: number;
    total: number;
    chunkCount: number;
    bwEstimate: number;
    loading: HlsProgressivePerformanceTiming;
    parsing: HlsPerformanceTiming;
    buffering: HlsProgressivePerformanceTiming;
}

export declare type LoadMediaAtOptions = {
    seekOnAppend: boolean;
};

export declare type LoadPolicy = {
    default: LoaderConfig;
};

export declare class LoadStats implements LoaderStats {
    aborted: boolean;
    loaded: number;
    retry: number;
    total: number;
    chunkCount: number;
    bwEstimate: number;
    loading: HlsProgressivePerformanceTiming;
    parsing: HlsPerformanceTiming;
    buffering: HlsProgressivePerformanceTiming;
}

export declare class Logger implements ILogger {
    trace: ILogFunction;
    debug: ILogFunction;
    log: ILogFunction;
    warn: ILogFunction;
    info: ILogFunction;
    error: ILogFunction;
    constructor(label: string, logger: ILogger);
}

export declare class M3U8Parser {
    static findGroup(groups: ({
        id?: string;
        audioCodec?: string;
    } | {
        id?: string;
        textCodec?: string;
    })[], mediaGroupId: string): {
        id?: string;
        audioCodec?: string;
    } | {
        id?: string;
        textCodec?: string;
    } | undefined;
    static resolve(url: any, baseUrl: any): string;
    static isMediaPlaylist(str: string): boolean;
    static parseMasterPlaylist(string: string, baseurl: string): ParsedMultivariantPlaylist;
    static parseMasterPlaylistMedia(string: string, baseurl: string, parsed: ParsedMultivariantPlaylist): ParsedMultivariantMediaOptions;
    static parseLevelPlaylist(string: string, baseurl: string, id: number, type: PlaylistLevelType, levelUrlId: number, multivariantVariableList: VariableMap | null): LevelDetails;
}

export declare type MainPlaylistType = AudioPlaylistType | 'VIDEO';

export declare interface ManifestLoadedData {
    audioTracks: MediaPlaylist[];
    captions?: MediaPlaylist[];
    contentSteering: ContentSteeringOptions | null;
    iframeVariants: LevelParsed[];
    levels: LevelParsed[];
    networkDetails: NullableNetworkDetails;
    sessionData: Record<string, AttrList> | null;
    sessionKeys: LevelKey[] | null;
    startTimeOffset: number | null;
    stats: LoaderStats;
    subtitles?: MediaPlaylist[];
    url: string;
    variableList: VariableMap | null;
}

export declare interface ManifestLoadingData {
    url: string;
}

export declare interface ManifestParsedData {
    levels: Level[];
    audioTracks: MediaPlaylist[];
    subtitleTracks: MediaPlaylist[];
    iframeVariants: LevelParsed[];
    sessionData: Record<string, AttrList> | null;
    sessionKeys: LevelKey[] | null;
    firstLevel: number;
    stats: LoaderStats;
    audio: boolean;
    video: boolean;
    altAudio: boolean;
}

export declare interface MaxAutoLevelUpdatedData {
    autoLevelCapping: number;
    levels: Level[] | null;
    maxAutoLevel: number;
    minAutoLevel: number;
    maxHdcpLevel: HdcpLevel;
}

export declare interface MediaAttachedData {
    media: HTMLMediaElement;
    mediaSource?: MediaSource;
}

export declare interface MediaAttachingData {
    media: HTMLMediaElement;
    mediaSource?: MediaSource | null;
    tracks?: SourceBufferTrackSet;
    overrides?: MediaOverrides;
}

export declare interface MediaAttributes extends AttrList {
    'ASSOC-LANGUAGE'?: string;
    AUTOSELECT?: 'YES' | 'NO';
    CHANNELS?: string;
    CHARACTERISTICS?: string;
    DEFAULT?: 'YES' | 'NO';
    FORCED?: 'YES' | 'NO';
    'GROUP-ID': string;
    'INSTREAM-ID'?: string;
    LANGUAGE?: string;
    NAME: string;
    'PATHWAY-ID'?: string;
    'STABLE-RENDITION-ID'?: string;
    TYPE?: 'AUDIO' | 'VIDEO' | 'SUBTITLES' | 'CLOSED-CAPTIONS';
    URI?: string;
}

export declare type MediaDecodingInfo = {
    supported: boolean;
    configurations: readonly MediaDecodingConfiguration[];
    decodingInfoResults: readonly MediaCapabilitiesDecodingInfo[];
    error?: Error;
};

export declare interface MediaDetachedData {
    transferMedia?: AttachMediaSourceData | null;
}

export declare interface MediaDetachingData {
    transferMedia?: AttachMediaSourceData | null;
}

export declare interface MediaEndedData {
    stalled: boolean;
}

export declare interface MediaFragment extends Fragment {
    sn: number;
    ref: MediaFragmentRef;
}

export declare type MediaFragmentRef = {
    base: Base;
    start: number;
    duration: number;
    sn: number;
    programDateTime: number | null;
};

export declare type MediaKeyFunc = (keySystem: KeySystems, supportedConfigurations: MediaKeySystemConfiguration[]) => Promise<MediaKeySystemAccess>;

export declare type MediaKeySessionContext = {
    keySystem: KeySystems;
    mediaKeys: MediaKeys;
    mediaKeysSession: MediaKeySession;
    keyRequests: KeyRequests;
    keyStatuses: KeyStatuses;
    keyStatusTimeouts?: KeyTimeouts;
    createdFor: {
        levelKey: LevelKey;
        reason: LicenseRequestReason;
    };
    initialized: boolean;
};

export declare type MediaOverrides = {
    duration?: number;
    endOfStream?: boolean;
};

export declare interface MediaPlaylist {
    attrs: MediaAttributes;
    audioCodec?: string;
    autoselect: boolean;
    bitrate: number;
    channels?: string;
    characteristics?: string;
    details?: LevelDetails;
    height?: number;
    default: boolean;
    forced: boolean;
    groupId: string;
    id: number;
    instreamId?: string;
    lang?: string;
    assocLang?: string;
    name: string;
    textCodec?: string;
    unknownCodecs?: string[];
    type: MediaPlaylistType | 'main';
    url: string;
    videoCodec?: string;
    width?: number;
    trackNode?: HTMLTrackElement;
}

export declare type MediaPlaylistType = MainPlaylistType | SubtitlePlaylistType;

export declare type MetadataControllerConfig = {
    enableDateRangeMetadataCues: boolean;
    enableEmsgMetadataCues: boolean;
    enableEmsgKLVMetadata: boolean;
    enableID3MetadataCues: boolean;
    emsgKLVSchemaUri?: string;
};

export declare interface MetadataSample {
    pts: number;
    dts: number;
    duration: number;
    len?: number;
    data: Uint8Array;
    type: MetadataSchema;
}

export declare enum MetadataSchema {
    audioId3 = "org.id3",
    dateRange = "com.apple.quicktime.HLS",
    emsg = "https://aomedia.org/emsg/ID3",
    misbklv = "urn:misb:KLV:bin:1910.1"
}

export declare type MP4RemuxerConfig = {
    stretchShortVideoTrack: boolean;
    maxAudioFramesDrift: number;
};

export declare interface NetworkComponentAPI extends ComponentAPI {
    startLoad(startPosition: number, skipSeekToStartPosition?: boolean): void;
    stopLoad(): void;
    pauseBuffering?(): void;
    resumeBuffering?(): void;
}

export declare type NetworkDetails = Response | XMLHttpRequest;

export declare const enum NetworkErrorAction {
    DoNothing = 0,
    SendEndCallback = 1,
    SendAlternateToPenaltyBox = 2,
    RemoveAlternatePermanently = 3,
    InsertDiscontinuity = 4,
    RetryRequest = 5
}

export declare type NonNativeTextTrack = {
    _id?: string;
    label: string;
    kind: string;
    default: boolean;
    closedCaptions?: MediaPlaylist;
    subtitleTrack?: MediaPlaylist;
};

export declare interface NonNativeTextTracksData {
    tracks: Array<NonNativeTextTrack>;
}

export declare type NullableNetworkDetails = NetworkDetails | null;

declare interface PACData {
    row: number;
    indent: number | null;
    color: string | null;
    underline: boolean;
    italics: boolean;
}

export declare type ParsedMultivariantMediaOptions = {
    AUDIO?: MediaPlaylist[];
    SUBTITLES?: MediaPlaylist[];
    'CLOSED-CAPTIONS'?: MediaPlaylist[];
};

export declare type ParsedMultivariantPlaylist = {
    contentSteering: ContentSteeringOptions | null;
    levels: LevelParsed[];
    iframeVariants: LevelParsed[];
    playlistParsingError: Error | null;
    sessionData: Record<string, AttrList> | null;
    sessionKeys: LevelKey[] | null;
    startTimeOffset: number | null;
    variableList: VariableMap | null;
    hasVariableRefs: boolean;
};

export declare interface ParsedTrack extends BaseTrack {
    initSegment?: Uint8Array;
}

/**
 * Object representing parsed data from an HLS Partial Segment. Found in {@link hls.js#LevelDetails.partList}.
 */
export declare class Part extends BaseSegment {
    readonly fragOffset: number;
    readonly duration: number;
    readonly independent: boolean;
    readonly relurl: string;
    readonly fragment: MediaFragment;
    readonly index: number;
    gap: boolean;
    constructor(partAttrs: AttrList, frag: MediaFragment, base: Base | string, index: number, previous?: Part);
    get start(): number;
    get end(): number;
    get loaded(): boolean;
}

export declare interface PartsLoadedData {
    frag: Fragment;
    part: Part | null;
    partsLoaded?: FragLoadedData[];
}

export declare type PathwayClone = {
    'BASE-ID': string;
    ID: string;
    'URI-REPLACEMENT': UriReplacement;
};

declare class PenState {
    styles: Readonly<PenStyles>;
    get foreground(): string | null;
    set foreground(foreground: string | null);
    get underline(): boolean;
    set underline(underline: boolean);
    get italics(): boolean;
    set italics(italics: boolean);
    get background(): string;
    set background(background: string);
    get flash(): boolean;
    set flash(flash: boolean);
    reset(): void;
    setStyles(styles: Partial<PenStyles>): void;
    toString(): string;
}

declare type PenStyles = {
    foreground: string | null;
    underline: boolean;
    italics: boolean;
    background: string;
    flash: boolean;
};

export declare type PlaybackRestrictions = {
    skip: boolean;
    jump: boolean;
};

export declare type PlayheadTimes = {
    bufferedEnd: number;
    currentTime: number;
    duration: number;
    seekableStart: number;
};

export declare type PlaylistContextType = LoaderContextType.MANIFEST | LoaderContextType.LEVEL | LoaderContextType.AUDIO_TRACK | LoaderContextType.SUBTITLE_TRACK;

export declare type PlaylistControllerConfig = {
    liveMaxUnchangedPlaylistRefresh: number;
};

export declare enum PlaylistLevelType {
    MAIN = "main",
    AUDIO = "audio",
    SUBTITLE = "subtitle"
}

/**
 * @deprecated use manifestLoadPolicy.default and playlistLoadPolicy.default
 */
export declare type PlaylistLoaderConfig = {
    manifestLoadingTimeOut: number;
    manifestLoadingMaxRetry: number;
    manifestLoadingRetryDelay: number;
    manifestLoadingMaxRetryTimeout: number;
    levelLoadingTimeOut: number;
    levelLoadingMaxRetry: number;
    levelLoadingRetryDelay: number;
    levelLoadingMaxRetryTimeout: number;
};

export declare interface PlaylistLoaderConstructor {
    new (confg: HlsConfig): Loader<PlaylistLoaderContext>;
}

export declare interface PlaylistLoaderContext extends LoaderContext {
    type: PlaylistContextType;
    level: number | null;
    id: number | null;
    groupId?: string;
    pathwayId?: string;
    levelDetails?: LevelDetails;
    deliveryDirectives: HlsUrlParameters | null;
    levelOrTrack: Level | MediaPlaylist | null;
}

export declare type RationalTimestamp = {
    baseTime: number;
    timescale: number;
};

export declare interface RemuxedMetadata {
    samples: MetadataSample[];
}

export declare interface RemuxedTrack {
    data1: Uint8Array<ArrayBuffer>;
    data2?: Uint8Array<ArrayBuffer>;
    startPTS: number;
    endPTS: number;
    startDTS: number;
    endDTS: number;
    type: SourceBufferName;
    hasAudio: boolean;
    hasVideo: boolean;
    independent?: boolean;
    firstKeyFrame?: number;
    firstKeyFramePTS?: number;
    nb: number;
    transferredData1?: ArrayBuffer;
    transferredData2?: ArrayBuffer;
    dropped?: number;
    encrypted?: boolean;
}

export declare interface RemuxedUserdata {
    samples: UserdataSample[];
}

export declare interface RemuxerResult {
    audio?: RemuxedTrack;
    video?: RemuxedTrack;
    text?: RemuxedUserdata;
    id3?: RemuxedMetadata;
    initSegment?: InitSegmentData;
    independent?: boolean;
}

export declare type RetryConfig = {
    maxNumRetry: number;
    retryDelayMs: number;
    maxRetryDelayMs: number;
    backoff?: 'exponential' | 'linear';
    shouldRetry?: (retryConfig: RetryConfig | null | undefined, retryCount: number, isTimeout: boolean, loaderResponse: LoaderResponse | undefined, retry: boolean) => boolean;
};

/**
 * CEA-608 row consisting of NR_COLS instances of StyledUnicodeChar.
 * @constructor
 */
declare class Row {
    chars: StyledUnicodeChar[];
    pos: number;
    currPenState: PenState;
    cueStartTime: number | null;
    private logger;
    constructor(logger: CaptionsLogger);
    equals(other: Row): boolean;
    copy(other: Row): void;
    isEmpty(): boolean;
    /**
     *  Set the cursor to a valid column.
     */
    setCursor(absPos: number): void;
    /**
     * Move the cursor relative to current position.
     */
    moveCursor(relPos: number): void;
    /**
     * Backspace, move one step back and clear character.
     */
    backSpace(): void;
    insertChar(byte: number): void;
    clearFromPos(startPos: number): void;
    clear(): void;
    clearToEndOfRow(): void;
    getTextString(): string;
    setPenStyles(styles: Partial<PenStyles>): void;
}

export declare type SelectionPreferences = {
    videoPreference?: VideoSelectionOption;
    audioPreference?: AudioSelectionOption;
    subtitlePreference?: SubtitleSelectionOption;
};

/**
 * A type to represent structured field bare items.
 *
 * @public
 */
declare type SfBareItem = string | Uint8Array | boolean | number | symbol | Date | SfToken;

/**
 * Structured Field Item
 *
 * @public
 */
declare class SfItem<V extends SfBareItem = SfBareItem, P = Record<string, any>> {
    /**
     * The value of the item.
     */
    value: V;
    /**
     * The parameters of the item.
     */
    params?: P;
    /**
     * Creates a new structured field item.
     *
     * @param value - The value of the item.
     * @param params - The parameters of the item.
     */
    constructor(value: any, params?: P);
}

/**
 * A class to represent structured field tokens when `Symbol` is not available.
 *
 * @public
 */
declare class SfToken {
    description: string;
    constructor(description: string);
}

export declare type SnapOptions = {
    out: boolean;
    in: boolean;
};

export declare interface SourceBufferListener {
    event: string;
    listener: EventListener;
}

export declare type SourceBufferName = 'video' | 'audio' | 'audiovideo';

export declare interface SourceBufferTrack extends BaseTrack {
    buffer?: ExtendedSourceBuffer;
    bufferAppendTimeoutId?: number;
    listeners: SourceBufferListener[];
    ending?: boolean;
    ended?: boolean;
}

export declare type SourceBufferTrackSet = Partial<Record<SourceBufferName, SourceBufferTrack>>;

export declare const State: {
    STOPPED: string;
    IDLE: string;
    KEY_LOADING: string;
    FRAG_LOADING: string;
    FRAG_LOADING_WAITING_RETRY: string;
    WAITING_TRACK: string;
    PARSING: string;
    PARSED: string;
    ENDED: string;
    ERROR: string;
    WAITING_INIT_PTS: string;
    WAITING_LEVEL: string;
};

export declare type SteeringManifest = {
    VERSION: 1;
    TTL: number;
    'RELOAD-URI'?: string;
    'PATHWAY-PRIORITY': string[];
    'PATHWAY-CLONES'?: PathwayClone[];
};

export declare interface SteeringManifestLoadedData {
    steeringManifest: SteeringManifest;
    url: string;
}

export declare class StreamController extends BaseStreamController implements NetworkComponentAPI {
    private audioCodecSwap;
    private level;
    private _forceStartLoad;
    private _hasEnoughToStart;
    private altAudio;
    private audioOnly;
    private _couldBacktrack;
    private _backtrackFragment;
    private audioCodecSwitch;
    private videoBuffer;
    constructor(hls: Hls, fragmentTracker: FragmentTracker, keyLoader: KeyLoader);
    protected registerListeners(): void;
    protected unregisterListeners(): void;
    protected onHandlerDestroying(): void;
    startLoad(startPosition: number, skipSeekToStartPosition?: boolean): void;
    stopLoad(): void;
    protected doTick(): void;
    protected onTickEnd(): void;
    private doTickIdle;
    protected loadFragment(frag: MediaFragment, level: Level, targetBufferTime: number): void;
    immediateLevelSwitch(): void;
    /**
     * Get the buffer output to use for buffer calculations.
     * Override to use altAudio logic in stream-controller.
     */
    protected getBufferOutput(): Bufferable | null;
    protected checkFragmentChanged(): boolean;
    /**
     * Get backtrack fragment. Override to return actual backtrack fragment.
     */
    protected get backtrackFragment(): Fragment | undefined;
    /**
     * Set backtrack fragment. Override to set actual backtrack fragment.
     */
    protected set backtrackFragment(value: Fragment | undefined);
    /**
     * Get could backtrack flag. Override to return actual value.
     */
    protected get couldBacktrack(): boolean;
    /**
     * Set could backtrack flag. Override to set actual value.
     */
    protected set couldBacktrack(value: boolean);
    protected abortCurrentFrag(): void;
    protected flushMainBuffer(startOffset: number, endOffset: number): void;
    private targetBufferType;
    protected onMediaAttached(event: Events.MEDIA_ATTACHED, data: MediaAttachedData): void;
    protected onMediaDetaching(event: Events.MEDIA_DETACHING, data: MediaDetachingData): void;
    private onMediaPlaying;
    private onMediaSeeked;
    protected onManifestLoading(): void;
    private onManifestParsed;
    private onLevelLoading;
    private onLevelLoaded;
    private synchronizeToLiveEdge;
    protected _handleFragmentLoadProgress(data: FragLoadedData): void;
    private onAudioTrackSwitching;
    private onAudioTrackSwitched;
    private onBufferCreated;
    private onFragBuffered;
    get hasEnoughToStart(): boolean;
    protected onError(event: Events.ERROR, data: ErrorData): void;
    private onFragLoadEmergencyAborted;
    private onBufferFlushed;
    private onLevelsUpdated;
    swapAudioCodec(): void;
    /**
     * Seeks to the set startPosition if not equal to the mediaElement's current time.
     */
    protected seekToStartPos(): void;
    private _getAudioCodec;
    private _loadBitrateTestFrag;
    protected _handleTransmuxComplete(transmuxResult: TransmuxerResult): void;
    private logMuxedErr;
    protected _bufferInitSegment(currentLevel: Level, tracks: TrackSet, frag: Fragment, chunkMeta: ChunkMetadata): void;
    getMainFwdBufferInfo(): BufferInfo | null;
    get maxBufferLength(): number;
    private backtrack;
    get nextLevel(): number;
    get currentFrag(): Fragment | null;
    get currentProgramDateTime(): Date | null;
    get currentLevel(): number;
    get nextBufferedFrag(): Fragment | null;
    get forceStartLoad(): boolean;
}

export declare type StreamControllerConfig = {
    autoStartLoad: boolean;
    startPosition: number;
    defaultAudioCodec?: string;
    initialLiveManifestSize: number;
    maxBufferLength: number;
    maxBufferSize: number;
    maxBufferHole: number;
    maxFragLookUpTolerance: number;
    maxMaxBufferLength: number;
    startFragPrefetch: boolean;
    testBandwidth: boolean;
    liveSyncMode?: 'edge' | 'buffered';
    startOnSegmentBoundary: boolean;
    nextAudioTrackBufferFlushForwardOffset: number;
};

/**
 * Unicode character with styling and background.
 * @constructor
 */
declare class StyledUnicodeChar {
    uchar: string;
    penState: PenState;
    reset(): void;
    setChar(uchar: string, newPenState: PenState): void;
    setPenState(newPenState: PenState): void;
    copy(newChar: StyledUnicodeChar): void;
}

export declare interface SubtitleFragProcessedData {
    success: boolean;
    frag: Fragment;
    part: Part | null;
    error?: Error;
}

export declare type SubtitlePlaylistType = 'SUBTITLES' | 'CLOSED-CAPTIONS';

export declare type SubtitleSelectionOption = {
    id?: number;
    lang?: string;
    assocLang?: string;
    characteristics?: string;
    name?: string;
    groupId?: string;
    default?: boolean;
    forced?: boolean;
};

export declare class SubtitleStreamController extends BaseStreamController implements NetworkComponentAPI {
    private currentTrackId;
    private tracksBuffered;
    private mainDetails;
    constructor(hls: Hls, fragmentTracker: FragmentTracker, keyLoader: KeyLoader);
    protected onHandlerDestroying(): void;
    protected registerListeners(): void;
    protected unregisterListeners(): void;
    startLoad(startPosition: number, skipSeekToStartPosition?: boolean): void;
    protected onManifestLoading(): void;
    protected onMediaDetaching(event: Events.MEDIA_DETACHING, data: MediaDetachingData): void;
    private onLevelLoaded;
    private onSubtitleFragProcessed;
    private onBufferFlushing;
    protected onError(event: Events.ERROR, data: ErrorData): void;
    private onSubtitleTracksUpdated;
    private onSubtitleTrackSwitch;
    private onSubtitleTrackLoaded;
    protected _handleFragmentLoadProgress(data: FragLoadedData): void;
    _handleFragmentLoadComplete(fragLoadedData: FragLoadedData): void;
    private shouldDecrypt;
    private decryptPayload;
    doTick(): void;
    protected loadFragment(frag: MediaFragment, level: Level, targetBufferTime: number): void;
    get mediaBufferTimeRanges(): Bufferable;
}

export declare class SubtitleTrackController extends BasePlaylistController {
    private media;
    private tracks;
    private groupIds;
    private tracksInGroup;
    private trackId;
    private currentTrack;
    private selectDefaultTrack;
    private queuedDefaultTrack;
    private useTextTrackPolling;
    private subtitlePollingInterval;
    private _subtitleDisplay;
    private asyncPollTrackChange;
    constructor(hls: Hls);
    destroy(): void;
    get subtitleDisplay(): boolean;
    set subtitleDisplay(value: boolean);
    private registerListeners;
    private unregisterListeners;
    private createTracksInGroup;
    protected onMediaAttached(event: Events.MEDIA_ATTACHED, data: MediaAttachedData): void;
    private pollTrackChange;
    protected onMediaDetaching(event: Events.MEDIA_DETACHING, data: MediaDetachingData): void;
    protected onManifestLoading(): void;
    protected onManifestParsed(event: Events.MANIFEST_PARSED, data: ManifestParsedData): void;
    protected onSubtitleTrackLoaded(event: Events.SUBTITLE_TRACK_LOADED, data: TrackLoadedData): void;
    protected onLevelLoading(event: Events.LEVEL_LOADING, data: LevelLoadingData): void;
    protected onLevelSwitching(event: Events.LEVEL_SWITCHING, data: LevelSwitchingData): void;
    private switchLevel;
    private findTrackId;
    protected onError(event: Events.ERROR, data: ErrorData): void;
    get allSubtitleTracks(): MediaPlaylist[];
    /** get alternate subtitle tracks list from playlist **/
    get subtitleTracks(): MediaPlaylist[];
    /** get/set index of the selected subtitle track (based on index in subtitle track lists) **/
    get subtitleTrack(): number;
    set subtitleTrack(newId: number);
    setSubtitleOption(subtitleOption: MediaPlaylist | SubtitleSelectionOption | undefined): MediaPlaylist | null;
    protected loadPlaylist(hlsUrlParameters?: HlsUrlParameters): void;
    protected loadingPlaylist(currentTrack: MediaPlaylist, hlsUrlParameters: HlsUrlParameters | undefined): void;
    /**
     * Disables the old subtitleTrack and sets current mode on the next subtitleTrack.
     * This operates on the DOM textTracks.
     * A value of -1 will disable all subtitle tracks.
     */
    private toggleTrackModes;
    /**
     * This method is responsible for validating the subtitle index and periodically reloading if live.
     * Dispatches the SUBTITLE_TRACK_SWITCH event, which instructs the subtitle-stream-controller to load the selected track.
     */
    private setSubtitleTrack;
    private onTextTracksChanged;
}

export declare interface SubtitleTrackLoadedData extends TrackLoadedData {
}

export declare interface SubtitleTracksUpdatedData {
    subtitleTracks: MediaPlaylist[];
}

export declare interface SubtitleTrackSwitchData {
    id: number;
    name?: string;
    groupId?: string;
    type?: MediaPlaylistType | 'main';
    url?: string;
}

export declare interface SubtitleTrackUpdatedData {
    details: LevelDetails;
    id: number;
    groupId: string;
}

/**
 * @ignore
 * Sub-class specialization of EventHandler base class.
 *
 * TaskLoop allows to schedule a task function being called (optionnaly repeatedly) on the main loop,
 * scheduled asynchroneously, avoiding recursive calls in the same tick.
 *
 * The task itself is implemented in `doTick`. It can be requested and called for single execution
 * using the `tick` method.
 *
 * It will be assured that the task execution method (`tick`) only gets called once per main loop "tick",
 * no matter how often it gets requested for execution. Execution in further ticks will be scheduled accordingly.
 *
 * If further execution requests have already been scheduled on the next tick, it can be checked with `hasNextTick`,
 * and cancelled with `clearNextTick`.
 *
 * The task can be scheduled as an interval repeatedly with a period as parameter (see `setInterval`, `clearInterval`).
 *
 * Sub-classes need to implement the `doTick` method which will effectively have the task execution routine.
 *
 * Further explanations:
 *
 * The baseclass has a `tick` method that will schedule the doTick call. It may be called synchroneously
 * only for a stack-depth of one. On re-entrant calls, sub-sequent calls are scheduled for next main loop ticks.
 *
 * When the task execution (`tick` method) is called in re-entrant way this is detected and
 * we are limiting the task execution per call stack to exactly one, but scheduling/post-poning further
 * task processing on the next main loop iteration (also known as "next tick" in the Node/JS runtime lingo).
 */
export declare class TaskLoop extends Logger {
    private readonly _boundTick;
    private _tickTimer;
    private _tickInterval;
    private _tickCallCount;
    constructor(label: string, logger: ILogger);
    destroy(): void;
    protected onHandlerDestroying(): void;
    protected onHandlerDestroyed(): void;
    hasInterval(): boolean;
    hasNextTick(): boolean;
    /**
     * @param millis - Interval time (ms)
     * @eturns True when interval has been scheduled, false when already scheduled (no effect)
     */
    setInterval(millis: number): boolean;
    /**
     * @returns True when interval was cleared, false when none was set (no effect)
     */
    clearInterval(): boolean;
    /**
     * @returns True when timeout was cleared, false when none was set (no effect)
     */
    clearNextTick(): boolean;
    /**
     * Will call the subclass doTick implementation in this main loop tick
     * or in the next one (via setTimeout(,0)) in case it has already been called
     * in this tick (in case this is a re-entrant call).
     */
    tick(): void;
    tickImmediate(): void;
    /**
     * For subclass to implement task logic
     * @abstract
     */
    protected doTick(): void;
}

export declare class TimelineController implements ComponentAPI {
    private hls;
    private media;
    private config;
    private enabled;
    private Cues;
    private tracks;
    private initPTS;
    private unparsedVttFrags;
    private captionsTracks;
    private cueCache;
    private nonNativeCaptionsTracks;
    private cea608Parser1?;
    private cea608Parser2?;
    private lastCc;
    private lastSn;
    private lastPartIndex;
    private prevCC;
    private vttCCs;
    private captionsProperties;
    constructor(hls: Hls);
    destroy(): void;
    private initCea608Parsers;
    addCues(trackName: string, startTime: number, endTime: number, screen: CaptionScreen, cueRanges: Array<[number, number]>): void;
    private onInitPtsFound;
    createCaptionsTrack(trackName: string): void;
    private createNativeTrack;
    private createNonNativeTrack;
    private onMediaAttaching;
    private onMediaDetaching;
    private onManifestLoading;
    private onSubtitleTracksUpdated;
    private onManifestLoaded;
    private closedCaptionsForLevel;
    private onFragLoading;
    private onFragLoaded;
    private _parseIMSC1;
    private _parseVTTs;
    private _fallbackToIMSC1;
    private _appendCues;
    private onFragDecrypted;
    private onSubtitleTracksCleared;
    private onFragParsingUserdata;
    private onBufferAppended;
    onBufferFlushing(event: Events.BUFFER_FLUSHING, data: BufferFlushingData): void;
    private extractCea608Data;
}

export declare type TimelineControllerConfig = {
    cueHandler: CuesInterface;
    enableWebVTT: boolean;
    enableIMSC1: boolean;
    enableCEA708Captions: boolean;
    captionsTextTrack1Label: string;
    captionsTextTrack1LanguageCode: string;
    captionsTextTrack2Label: string;
    captionsTextTrack2LanguageCode: string;
    captionsTextTrack3Label: string;
    captionsTextTrack3LanguageCode: string;
    captionsTextTrack4Label: string;
    captionsTextTrack4LanguageCode: string;
    renderTextTracksNatively: boolean;
};

export declare enum TimelineOccupancy {
    Point = 0,
    Range = 1
}

export declare type TimestampOffset = RationalTimestamp & {
    trackId: number;
};

export declare interface Track extends BaseTrack {
    buffer?: SourceBuffer;
    initSegment?: Uint8Array<ArrayBuffer>;
}

export declare interface TrackLoadedData {
    details: LevelDetails;
    id: number;
    groupId: string;
    networkDetails: NullableNetworkDetails;
    stats: LoaderStats;
    deliveryDirectives: HlsUrlParameters | null;
    track: MediaPlaylist;
    context?: PlaylistLoaderContext;
}

export declare interface TrackLoadingData {
    id: number;
    groupId: string;
    track: MediaPlaylist;
    url: string;
    deliveryDirectives: HlsUrlParameters | null;
}

export declare interface TrackSet {
    audio?: Track;
    video?: Track;
    audiovideo?: Track;
}

export declare class TransmuxerInterface {
    error: Error | null;
    private hls;
    private id;
    private instanceNo;
    private observer;
    private frag;
    private part;
    private useWorker;
    private workerContext;
    private transmuxer;
    private onTransmuxComplete;
    private onFlush;
    constructor(hls: Hls, id: PlaylistLevelType, onTransmuxComplete: (transmuxResult: TransmuxerResult) => void, onFlush: (chunkMeta: ChunkMetadata) => void);
    reset(): void;
    private terminateWorker;
    destroy(): void;
    push(data: ArrayBuffer, initSegmentData: Uint8Array | undefined, audioCodec: string | undefined, videoCodec: string | undefined, frag: MediaFragment, part: Part | null, duration: number, accurateTimeOffset: boolean, chunkMeta: ChunkMetadata, defaultInitPTS?: TimestampOffset): void;
    flush(chunkMeta: ChunkMetadata): void;
    private transmuxerError;
    private handleFlushResult;
    private onWorkerMessage;
    private onWorkerError;
    private configureTransmuxer;
    private handleTransmuxComplete;
}

export declare interface TransmuxerResult {
    remuxResult: RemuxerResult;
    chunkMeta: ChunkMetadata;
}

export declare type TSDemuxerConfig = {
    forceKeyFrameOnDiscontinuity: boolean;
    handleMpegTsVideoIntegrityErrors: 'process' | 'skip';
};

export declare type UriReplacement = {
    HOST?: string;
    PARAMS?: {
        [queryParameter: string]: string;
    };
    'PER-VARIANT-URIS'?: {
        [stableVariantId: string]: string;
    };
    'PER-RENDITION-URIS'?: {
        [stableRenditionId: string]: string;
    };
};

export declare interface UserdataSample {
    pts: number;
    bytes?: Uint8Array;
    type?: number;
    payloadType?: number;
    uuid?: string;
    userData?: string;
    userDataBytes?: Uint8Array;
}

/**
 * Utility type to get the value of a given object type.
 *
 * @public
 */
declare type ValueOf<T> = T[keyof T];

export declare type VariableMap = Record<string, string>;

declare const enum VerboseLevel {
    ERROR = 0,
    TEXT = 1,
    WARNING = 2,
    INFO = 2,
    DEBUG = 3,
    DATA = 3
}

export declare type VideoRange = (typeof VideoRangeValues)[number];

export declare const VideoRangeValues: readonly ["SDR", "PQ", "HLG"];

export declare type VideoSelectionOption = {
    preferHDR?: boolean;
    allowedVideoRanges?: Array<VideoRange>;
    videoCodec?: string;
};

export declare class XhrLoader extends BaseLoader {
    private xhrSetup;
    private loader;
    constructor(config: HlsConfig);
    destroy(): void;
    protected abortInternal(): void;
    protected getNetworkDetails(): XMLHttpRequest | null;
    protected resetInternalLoader(): void;
    protected loadInternal(): void;
    private openAndSendXhr;
    private readystatechange;
    private loadprogress;
    getCacheAge(): number | null;
    getResponseHeader(name: string): string | null;
}

export { }
