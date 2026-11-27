import { diagnosticEvent, logHandledException } from '../data/sessionLog';
import { t } from '../i18n';
import { plainCueText } from './subtitles';

export type PlayerMedia = Pick<HTMLVideoElement, 'currentTime' | 'duration' | 'paused' | 'ended' | 'seeking' | 'readyState' | 'error' | 'buffered' | 'seekable' | 'volume' | 'muted' | 'play' | 'pause'>;
export interface SourceTrack { id: string; name: string }
interface Stream { id: number; mediaType: string; metadata: Record<string, string>; codecparProxy: { codecId: number } }
interface RuntimePlayer {
  currentTime: bigint;
  load(url: string | File, options?: unknown): Promise<void>;
  play(options?: unknown): Promise<void>;
  pause(): Promise<void>;
  seek(time: bigint): Promise<void>;
  destroy(): Promise<void>;
  isMSE(): boolean;
  getPacketHorizon(): Promise<number>;
  getStats(): { videoFrameRenderCount: bigint; videoCurrentTime: bigint };
  getDuration(): bigint;
  isLive(): boolean;
  getAudioList(): Promise<{ list: { lang: string }[]; selectedIndex: number }>;
  getSubtitleList(): Promise<{ list: { lang: string }[]; selectedIndex: number }>;
  getStreams(): Stream[];
  getSelectedAudioStreamId(): number;
  getSelectedSubtitleStreamId(): number;
  selectAudio(id: number): Promise<void>;
  selectSubtitle(id: number): Promise<void>;
  loadExternalSubtitle(track: { source: File; title: string }): Promise<number | undefined>;
  setSubtitleEnable(enabled: boolean): void;
  setVolume(volume: number): void;
  getVolume(): number;
  isSuspended(): boolean;
  resume(): Promise<void>;
  on(event: string, listener: (...args: unknown[]) => void): void;
}
type Runtime = new (options: Record<string, unknown>) => RuntimePlayer;
interface Callbacks {
  tracks(audio: SourceTrack[], subtitles: SourceTrack[], automaticAudio: string | null, unsupported: number): void;
  state(state: 'playing' | 'paused' | 'buffering' | 'ended'): void;
  update(): void;
  error(message: string): void;
  startRequested?(): void;
  pauseRequested?(): void;
}

const assetBase = `${import.meta.env.BASE_URL}vendor/avplayer/1.3.1-watchparty.1/`;
const hevcCodecId = 173;
const aacCodecId = 86018;
let runtime: Promise<Runtime> | undefined;
function script(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const element = document.createElement('script');
    element.src = src; element.async = true;
    element.onload = () => resolve();
    element.onerror = () => { element.remove(); reject(new Error(t("Unable to load the video player. Check your connection, then retry."))); };
    document.head.append(element);
  });
}
function loadRuntime(): Promise<Runtime> {
  if (!runtime) runtime = (async () => {
    await script(`${assetBase}cheap-polyfill.js`);
    await script(`${assetBase}avplayer.js`);
    const constructor = (window as unknown as { AVPlayer?: Runtime }).AVPlayer;
    if (!constructor) throw new Error(t("Unable to initialize the video player. Retry the video."));
    return constructor;
  })().catch(reason => {
    logHandledException("avPlayer.loadRuntime.1", reason);  runtime = undefined; throw reason; });
  return runtime;
}

const emptyRanges: TimeRanges = { length: 0, start: () => { throw new DOMException(t("No buffered ranges"), 'IndexSizeError'); }, end: () => { throw new DOMException(t("No buffered ranges"), 'IndexSizeError'); } };
const textCodecs = new Set([94210, 94212, 94213, 94225, 94226, 94230, 94232]);
export function usesIntegratedPlayer(url: string): boolean {
  try { return ['http:', 'https:'].includes(new URL(url).protocol); } catch (handledError) { logHandledException("avPlayer.usesIntegratedPlayer.2", handledError);  return false; }
}

/** Keep engine commands ordered: AVPlayer does not allow overlapping asynchronous calls. */
export class AvMedia implements PlayerMedia {
  readonly ready: Promise<void>;
  private player: RuntimePlayer | null = null;
  private closed = false;
  private chain: Promise<unknown> = Promise.resolve();
  private observer: MutationObserver;
  private timer: number;
  private pausedValue = true;
  private seekingValue = false;
  private endedValue = false;
  private volumeValue = 1;
  private mutedValue = false;
  private mediaError: MediaError | null = null;
  private localTrack: HTMLTrackElement | null = null;
  private localCanvasSubtitleId?: number;
  private localUrl: string | null = null;
  private rejectLocal: ((reason: Error) => void) | null = null;
  private loaded = false;
  private durationValue = NaN;
  private manifest = false;
  private localHevc = false;
  private preparedRange: TimeRanges = emptyRanges;
  private previewing = false;
  private pendingSeeks = 0;
  private seekRevision = 0;
  private nativeVideo: HTMLVideoElement | null = null;
  private removeNativeListeners: (() => void) | null = null;
  private container: HTMLDivElement;
  private lifetime = new AbortController();

  constructor(host: HTMLDivElement, url: string, private callbacks: Callbacks, private localFile?: File) {
    const container = this.container = document.createElement('div');
    container.className = 'integrated-player__engine';
    host.append(container);
    container.dataset.subtitles = 'off';
    // AVPlayer 1.3.1's SubRip renderer prints embedded HTML/SSA decorations as
    // literal text. Normalize only text nodes in its pinned ASS output surface;
    // timing, cue lifetime and all media reads remain owned by the engine.
    this.observer = new MutationObserver(() => { this.attachNativeVideo(); this.normalizeSubtitles(); });
    this.observer.observe(container, { childList: true, subtree: true, characterData: true });
    this.timer = window.setInterval(() => { if (!this.closed) callbacks.update(); }, 250);
    this.ready = this.initialize(url);
    this.chain = this.ready;
  }

  private get softwarePlayback() { return this.localHevc && this.player?.isMSE() === false; }

  private codecResource(type: string, codecId?: number) {
    if (!this.localHevc) return null;
    const base = `${assetBase}codecs/`;
    // AVPlayer requests these only after its built-in MSE capability check fails.
    if (type === 'decoder' && codecId === hevcCodecId) {
      // Validate a module containing i8x16.splat before serving the SIMD build.
      const simd = WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,8,1,6,0,65,0,253,15,11]));
      return base + (simd ? 'hevc-simd.wasm' : 'hevc.wasm');
    }
    if (type === 'decoder' && codecId === aacCodecId) return base + 'aac.wasm';
    if (type === 'resampler') return base + 'resample.wasm';
    if (type === 'stretchpitcher') return base + 'stretchpitch.wasm';
    return null;
  }

  private attachNativeVideo() {
    const video = this.video();
    if (!video || video === this.nativeVideo) return;
    this.removeNativeListeners?.(); this.nativeVideo = video;
    video.setAttribute('aria-label', t("Room video"));
    if (this.localTrack && this.localTrack.parentElement !== video) video.append(this.localTrack);
    // The upstream paused-play path does not await its native play promise.
    // Handle its promise here; our adapter owns autoplay recovery below.
    const play = video.play.bind(video);
    video.play = () => {
      // Finish AVPlayer's MSE setup even when autoplay is denied. Our play()
      // checks the actual paused state afterward and owns the Play recovery.
      const result = play().catch(reason => {
        logHandledException("avPlayer.attachNativeVideo.result.3", reason);
        if (reason instanceof DOMException && reason.name === 'NotAllowedError') return;
        throw reason;
      });
      void result.catch((handledError) => { logHandledException("avPlayer.attachNativeVideo.4", handledError); }); return result;
    };
    const waiting = () => { if (!this.closed && !this.pausedValue && !this.previewing) this.callbacks.state('buffering'); };
    const playing = () => { if (!this.closed && !this.previewing && !this.pendingSeeks) { this.pausedValue = false; this.callbacks.state('playing'); this.callbacks.update(); } };
    const error = () => this.fail(t("Unable to play this video. Check the source connection and supported format, then retry."));
    video.addEventListener('waiting', waiting); video.addEventListener('playing', playing); video.addEventListener('error', error);
    this.removeNativeListeners = () => { video.removeEventListener('waiting', waiting); video.removeEventListener('playing', playing); video.removeEventListener('error', error); };
  }

  private normalizeSubtitles() {
    for (const element of this.container.querySelectorAll<HTMLElement>('.ASS-box [data-text]')) {
      const raw = element.getAttribute('data-text') ?? '';
      const clean = plainCueText(raw.replace(/\{\\[^}]*\}/g, '').replace(/\\r$/g, ''));
      if (raw !== clean) { element.setAttribute('data-text', clean); element.textContent = clean; }
    }
  }
  private async initialize(url: string) {
    const Constructor = await loadRuntime();
    if (this.closed) return;
    const player = this.player = new Constructor({
      container: this.container, enableWorker: false, checkUseMSE: () => true,
      preLoadTime: this.localFile ? 4 : 30, getWasm: (type: string, codecId?: number) => this.codecResource(type, codecId),
    });
    const listen = (name: string, action: () => void) => player.on(name, () => { if (!this.closed) action(); });
    listen('played', () => { this.attachNativeVideo(); if (this.previewing) return; this.pausedValue = false; this.endedValue = false; this.seekingValue = false; this.callbacks.state(this.softwarePlayback && this.readyState < 2 ? 'buffering' : 'playing'); this.callbacks.update(); });
    listen('firstVideoRendered', () => {
      if (this.softwarePlayback && !this.previewing && !this.paused && !this.pendingSeeks) this.callbacks.state('playing');
      this.callbacks.update();
    });
    listen('paused', () => { if (this.previewing) return; this.pausedValue = true; this.callbacks.state('paused'); this.callbacks.update(); });
    listen('ended', () => { this.endedValue = true; this.pausedValue = true; this.callbacks.state('ended'); });
    listen('seeking', () => { this.seekingValue = true; if (!this.pausedValue) this.callbacks.state('buffering'); });
    listen('seeked', () => { if (this.pendingSeeks) return; this.seekingValue = false; this.callbacks.state(this.pausedValue ? 'paused' : 'playing'); this.callbacks.update(); });
    player.on('error', () => this.fail(t("Unable to play this video. Check browser codec support and the source connection, then retry.")));
    player.on('timeout', () => this.fail(t("The video source timed out. Check your connection, then retry.")));
    await player.load(this.localFile ?? url, { http: { credentials: 'omit' }, ioLoaderOptions: { retryCount: 1 } });
    if (this.closed) return;
    this.loaded = true;
    this.durationValue = player.isLive() ? Infinity : Number(player.getDuration()) / 1000;
    this.manifest = /\.(m3u8|mpd)(?:$|[?#])/i.test(url);
    const streams = player.getStreams();
    const hevc = streams.some(stream => stream.mediaType === 'Video' && stream.codecparProxy.codecId === hevcCodecId);
    this.localHevc = !!this.localFile && hevc;
    diagnosticEvent('player.source_attached', { source: this.localFile ? 'local' : 'remote',
      codec: hevc ? 'hevc' : 'other', decoder: player.isMSE() ? 'mse' : 'non_mse' });
    const choices = (items: Stream[]) => items.map(stream => ({ id: `av:${stream.id}`, name: [stream.metadata.title, stream.metadata.language === 'und' ? '' : stream.metadata.language].filter(Boolean).join(' · ') || `${stream.mediaType} ${stream.id + 1}` }));
    // Engine media types are protocol identifiers, independent of the UI language.
    const subtitles = streams.filter(stream => stream.mediaType === 'Subtitle');
    const supported = subtitles.filter(stream => textCodecs.has(stream.codecparProxy.codecId));
    const automatic = player.getSelectedAudioStreamId();
    if (this.manifest) {
      const [audio, subtitles] = await Promise.all([player.getAudioList(), player.getSubtitleList()]);
      if (this.closed) return;
      // The pinned MSE runtime can stall/recreate SourceBuffers when switching
      // manifest renditions. Preserve working hls.js/native track controls.
      if (audio.list.length > 1 || subtitles.list.length > 0) throw new Error('This manifest needs browser playback for track selection.');
      const tracks = (list: { lang: string }[], kind: string) => list.map((track, index) => ({ id: `avh:${index}`, name: track.lang || `${kind} ${index + 1}` }));
      this.callbacks.tracks(tracks(audio.list, t("Audio")), tracks(subtitles.list, t("Subtitles")), audio.selectedIndex >= 0 ? `avh:${audio.selectedIndex}` : null, 0);
    } else this.callbacks.tracks(choices(streams.filter(stream => stream.mediaType === 'Audio')), choices(supported), automatic >= 0 ? `av:${automatic}` : null, subtitles.length - supported.length);
    this.callbacks.update();
  }
  private enqueue<T>(action: (player: RuntimePlayer) => Promise<T>): Promise<T | undefined> {
    const result = this.chain.catch((handledError) => {
      logHandledException("avPlayer.enqueue.result.5", handledError); }).then(() => this.closed || !this.player ? undefined : action(this.player));
    this.chain = result;
    return result;
  }
  private fail(message: string) {
    if (this.closed) return;
    this.mediaError = { code: 4, message } as MediaError;
    this.callbacks.error(message);
  }
  private video(): HTMLVideoElement | null { return this.container.querySelector('video'); }
  private waitForMedia(predicate: () => boolean): Promise<void> {
    return new Promise((resolve, reject) => {
      const finish = (reason?: Error) => { window.clearInterval(poll); window.clearTimeout(timeout); this.lifetime.signal.removeEventListener('abort', aborted); reason ? reject(reason) : resolve(); };
      const aborted = () => finish(new DOMException('Video closed', 'AbortError'));
      const check = () => { if (this.closed) aborted(); else if (predicate()) finish(); };
      const poll = window.setInterval(check, 50);
      const timeout = window.setTimeout(() => finish(new Error(t("The video source took too long to seek."))), 30_000);
      this.lifetime.signal.addEventListener('abort', aborted, { once: true });
      check();
    });
  }
  get currentTime() { return this.loaded ? this.video()?.currentTime ?? Number(this.player?.currentTime ?? 0n) / 1000 : 0; }
  set currentTime(value: number) {
    void this.seek(value).catch((handledError) => {
      logHandledException("avPlayer.handler.6", handledError); return this.fail(t("Unable to seek this video. Retry the video.")); });
  }
  seek(seconds: number) { return this.seekTo(seconds); }
  private seekTo(target: number | (() => number), audioId?: number): Promise<unknown> {
    const revision = audioId === undefined ? ++this.seekRevision : this.seekRevision;
    this.preparedRange = emptyRanges;
    this.seekingValue = true; this.pendingSeeks++;
    return this.enqueue(async player => {
      // Range inputs emit repeatedly during a drag. Only the newest queued
      // target matters; replaying every intermediate position stalls seeking.
      if (audioId === undefined && revision !== this.seekRevision) return;
      if (audioId !== undefined && player.getSelectedAudioStreamId() === audioId) return;
      const value = typeof target === 'function' ? target() : target;
      const paused = this.pausedValue || !!this.video()?.paused;
      this.callbacks.state('buffering');
      this.previewing = paused; player.setVolume(0);
      try {
        // Resume the MSE packet pump before seeking: for an uncached target,
        // afterSeek can otherwise wait for packets from the paused pipeline.
        if (paused) { await player.play(); await this.video()?.play(); }
        // Same-codec AVPlayer switches only reconnect the demuxer, leaving old
        // MSE audio buffered. Flush at the local position so the chosen track is
        // audible immediately, including when returning to Automatic.
        if (audioId !== undefined) await player.selectAudio(audioId);
        const previousFrames = this.softwarePlayback ? player.getStats().videoFrameRenderCount : 0n;
        await player.seek(BigInt(Math.round(value * 1000)));
        const video = this.video();
        if (this.softwarePlayback) await this.waitForSoftwareFrame(player, value, previousFrames);
        if (!this.closed && video) {
          // AVPlayer can land on the preceding keyframe (597s for a 600s
          // request in the stakeholder's file). Align within the MSE buffer,
          // otherwise Sync could rewind a viewer already ahead of that frame.
          // Audio/video timestamps may begin a fraction after the requested
          // time. Accept that gap instead of waiting forever for absent samples.
          const range = () => Array.from({ length: video.buffered.length }, (_, index) => index).find(index => video.buffered.start(index) <= value + 0.25 && video.buffered.end(index) >= Math.min(value + 0.05, this.durationValue));
          await this.waitForMedia(() => range() !== undefined || (video.readyState >= 2 && video.buffered.length > 0 && video.buffered.start(0) > value + 0.25));
          // Some Matroska cue indexes choose the following cluster near the
          // beginning. Retry from an earlier position so the target is decoded.
          if (range() === undefined) await player.seek(BigInt(Math.round(Math.max(0, value - 15) * 1000)));
          await this.waitForMedia(() => range() !== undefined);
          video.currentTime = Math.max(value, video.buffered.start(range()!));
          await this.waitForMedia(() => !video.seeking && video.readyState >= 2);
        }
        if (!this.closed && paused && video) {
          // The silent preview has decoded the target. Restore the local pause.
          if (!video.paused) await player.pause();
        }
        this.pausedValue = paused || !!video?.ended;
      } finally {
        if (!this.closed && paused && (this.softwarePlayback || (this.video() && !this.video()!.paused))) await player.pause();
        this.previewing = false;
        if (!this.closed) player.setVolume(this.mutedValue || this.pendingSeeks > 1 ? 0 : this.volumeValue);
      }
    }).finally(() => {
      this.pendingSeeks--; this.seekingValue = false;
      if (!this.closed && !this.pendingSeeks) {
        this.player?.setVolume(this.mutedValue ? 0 : this.volumeValue);
        this.callbacks.state(this.pausedValue ? 'paused' : 'playing'); this.callbacks.update();
      }
    });
  }
  get duration() { return this.durationValue; }
  get paused() { return this.previewing ? true : this.video()?.paused ?? this.pausedValue; }
  get ended() { return this.endedValue; }
  get seeking() { return this.seekingValue || this.pendingSeeks > 0 || !!this.video()?.seeking; }
  get readyState() {
    if (this.softwarePlayback && this.seeking) return 1;
    if (this.softwarePlayback && Number(this.player?.getStats().videoFrameRenderCount) > 0) return 3;
    return this.video()?.readyState ?? 0;
  }
  get canSeek() { return !!this.seekable.length || (this.softwarePlayback && Number.isFinite(this.duration)); }
  private waitForSoftwareFrame(player: RuntimePlayer, target: number, previousFrames: bigint) {
    return this.waitForMedia(() => {
      const stats = player.getStats();
      return stats.videoFrameRenderCount > previousFrames && Math.abs(Number(stats.videoCurrentTime) / 1000 - target) < 0.45;
    });
  }
  get error() { return this.mediaError ?? this.video()?.error ?? null; }
  get buffered() { return this.video()?.buffered ?? this.preparedRange; }
  get seekable() { return this.video()?.seekable ?? emptyRanges; }
  get volume() { return this.volumeValue; }
  set volume(value: number) { this.volumeValue = Math.min(1, Math.max(0, value)); this.player?.setVolume(this.mutedValue || this.pendingSeeks > 0 ? 0 : this.volumeValue); this.callbacks.update(); }
  get muted() { return this.mutedValue || (!this.previewing && !!this.video()?.muted); }
  set muted(value: boolean) { this.mutedValue = value; const video = this.video(); if (video) video.muted = value; this.player?.setVolume(value || this.pendingSeeks > 0 ? 0 : this.volumeValue); this.callbacks.update(); }
  async play() {
    this.callbacks.startRequested?.();
    await this.enqueue(async player => {
      if (player.isSuspended()) await player.resume();
      await player.play();
      await this.video()?.play();
      // MSE uses a real media element: preserve browser autoplay recovery.
      if (this.video()?.paused) throw new DOMException(t("Select Play to start video"), 'NotAllowedError');
    });
  }
  pause() {
    this.callbacks.pauseRequested?.();
    return this.enqueue(async player => {
      // An invitation pauses both participants. Before the first play, AVPlayer
      // is already idle; calling its pause changes LOADED into a resumable state
      // even though no playback pipeline exists to resume.
      if (this.localFile && this.pausedValue && !this.video()) return;
      return player.pause();
    }).catch((handledError) => { logHandledException("avPlayer.pause.7", handledError); return this.fail(t("Unable to pause this video. Retry the video.")); });
  }
  /** Keep the packet pump active while the native media element stays paused. */
  async prepareForSync(positionMs: number) {
    this.callbacks.startRequested?.();
    const target = positionMs / 1000;
    // A freshly decoded beginning already has the requested frame. Seeking the
    // MSE demuxer back to zero here can flush its first packets during startup.
    if (!(target === 0 && (this.currentTime < 0.5 || this.buffered.length > 0 && this.buffered.start(0) <= 0.25))) await this.seekTo(target);
    await this.enqueue(async player => {
      this.previewing = true;
      player.setVolume(0);
      try {
        const previousFrames = this.localHevc ? player.getStats().videoFrameRenderCount : 0n;
        await player.play();
        const video = this.video();
        if (this.softwarePlayback) {
          if (Math.abs(this.currentTime - target) >= 0.25) await player.seek(BigInt(Math.round(target * 1000)));
          await this.waitForSoftwareFrame(player, target, previousFrames);
          await player.pause();
          // Verify libmedia has read the required audio and video packets before scheduling playback.
          const requiredEnd = Math.min(positionMs + 2000, this.duration * 1000);
          let horizon = 0;
          const deadline = performance.now() + 30000;
          while (!this.closed && performance.now() < deadline) {
            horizon = Math.min(await player.getPacketHorizon(), this.duration * 1000);
            if (horizon >= requiredEnd) break;
            await new Promise(resolve => window.setTimeout(resolve, 50));
          }
          if (this.closed || horizon < requiredEnd) throw new Error('Software playback buffer unavailable');
          const start = Math.min(target, this.currentTime);
          this.preparedRange = { length: 1, start: () => start, end: () => horizon / 1000 };
          this.pausedValue = true;
          return;
        }
        if (!video) throw new Error('PLAYER_UNAVAILABLE');
        video.pause();
        const end = Math.min(target + 2, this.durationValue);
        const range = () => Array.from({length:video.buffered.length}, (_,i)=>i).find(i=>video.buffered.start(i)<=target+.25 && video.buffered.end(i)>=end);
        await this.waitForMedia(() => range() !== undefined);
        // Containers may start just after zero; stay inside the playable range.
        const playableTarget = Math.max(target, video.buffered.start(range()!));
        if (Math.abs(video.currentTime - playableTarget) > 0.05) video.currentTime = playableTarget;
        await this.waitForMedia(() => !video.seeking && video.readyState >= 3);
        await player.pause();
        this.pausedValue = true;
      } finally {
        await player.pause();
        this.previewing = false;
        player.setVolume(this.mutedValue ? 0 : this.volumeValue);
        this.callbacks.update();
      }
    });
  }
  async selectAudio(id: string) {
    if (id.startsWith('avh:')) await this.enqueue(player => player.selectAudio(Number(id.slice(4))));
    else await this.seekTo(() => this.currentTime, Number(id.slice(3)));
  }
  async selectSubtitle(id: string) {
    if (this.localTrack) this.localTrack.track.mode = id === 'local' ? 'showing' : 'disabled';
    if (id === 'off') { this.container.dataset.subtitles = 'off'; return; }
    if (id === 'local') {
      const selected = this.localCanvasSubtitleId;
      if (selected !== undefined) {
        await this.enqueue(async player => {
          if (player.getSelectedSubtitleStreamId() !== selected) await player.selectSubtitle(selected);
        });
      }
      this.container.dataset.subtitles = selected === undefined ? 'off' : 'on';
      return;
    }
    await this.enqueue(async player => {
      const selected = Number(id.slice(id.startsWith('avh:') ? 4 : 3));
      if (id.startsWith('avh:') || player.getSelectedSubtitleStreamId() !== selected) await player.selectSubtitle(selected);
      this.container.dataset.subtitles = 'on';
    });
  }
  async importSubtitle(content: string, name: string) {
    await this.ready;
    if (this.closed) return;
    if (this.softwarePlayback) {
      await this.enqueue(async player => {
        // The libmedia demuxer consumes a blank line to finish the final cue.
        const source = new File([content.trimEnd(), '\n\n'], 'subtitle.vtt', { type: 'text/vtt' });
        if (await player.loadExternalSubtitle({ source, title: name }) !== 0) throw new Error('Subtitle load failed');
        const track = player.getStreams().at(-1);
        if (!track || track.mediaType !== 'Subtitle') throw new Error('Subtitle stream unavailable');
        if (player.getSelectedSubtitleStreamId() !== track.id) await player.selectSubtitle(track.id);
        this.localCanvasSubtitleId = track.id;
        this.container.dataset.subtitles = 'on';
      });
      return;
    }
    const video = this.video();
    if (!video) throw new Error(t("Wait for the video to load, then choose the subtitle file again."));
    this.clearLocal();
    const track = this.localTrack = document.createElement('track');
    track.kind = 'subtitles'; track.label = name;
    track.src = this.localUrl = URL.createObjectURL(new Blob([content], { type: 'text/vtt' }));
    this.container.dataset.subtitles = 'off';
    await new Promise<void>((resolve, reject) => {
      this.rejectLocal = reject;
      track.onload = () => { this.rejectLocal = null; resolve(); };
      track.onerror = () => { this.rejectLocal = null; reject(new Error(t("Unable to display that subtitle file. Choose another file."))); };
      video.append(track); track.track.mode = 'showing';
    });
  }
  private clearLocal() {
    this.rejectLocal?.(new DOMException('Subtitle import cancelled', 'AbortError')); this.rejectLocal = null;
    this.localTrack?.remove(); this.localTrack = null;
    if (this.localUrl) URL.revokeObjectURL(this.localUrl);
    this.localUrl = null;
  }
  destroy() {
    if (this.closed) return;
    diagnosticEvent('player.source_detached', {engine: 'avplayer'});
    this.closed = true; this.observer.disconnect(); this.removeNativeListeners?.(); window.clearInterval(this.timer);
    this.lifetime.abort();
    this.clearLocal();
    this.container.hidden = true; this.video()?.pause();
    // destroy also interrupts the I/O loader during initialization or a seek.
    void Promise.resolve(this.player?.destroy()).catch((handledError) => {
      logHandledException("avPlayer.destroy.8", handledError); }).finally(() => this.container.remove());
  }
}
