/**
 * Client-side transcoding for file sharing, built on WebCodecs.
 *
 * The host's browser demuxes the chosen file (MP4, MKV, WebM, MOV, ...), decodes and re-encodes any track the
 * browser can't natively play (e.g. HEVC video, AC-3/DTS-less audio, 10-bit H.264), and streams the result as
 * fragmented MP4 into a MediaSource attached to the host's <video> element. The existing fileshare pipeline
 * (video.captureStream() -> WebRTC, optionally via mediasoup) then distributes it exactly as it would a plain file,
 * so no server-side conversion is needed.
 *
 * Demuxing/muxing and the WebCodecs plumbing are handled by mediabunny; it is imported lazily so none of it is
 * downloaded unless the user actually asks for conversion.
 *
 * Tracks that the browser can already play are copied without re-encoding, so MP4/MKV files with H.264 + AAC cost
 * almost nothing.
 *
 * Multi-track files (e.g. an MKV with several languages or a commentary track) can only be played with one audio
 * track at a time. start() reports the file's audio tracks via onAudioTracks, plays the primary one (or the first one
 * that's playable in this browser), and selectAudioTrack() switches to another at the current position.
 *
 * Pacing and seeking:
 * - Transcoding is throttled to stay LOOKAHEAD_SECONDS ahead of the playhead (so we don't encode a whole movie
 *   while the host is paused, and memory use stays bounded).
 * - If the host seeks outside of what's buffered, the running conversion is cancelled and a new one starts at the
 *   seek target (output timestamps restart at 0, so the SourceBuffer's timestampOffset is set to the target).
 */
import type {
  Conversion,
  ConversionAudioOptions,
  ConversionVideoOptions,
  Input,
  InputAudioTrack,
  InputVideoTrack,
} from "mediabunny";

type Mediabunny = typeof import("mediabunny");

/** How far ahead of the playhead (in seconds) we allow converted data to be buffered. */
const LOOKAHEAD_SECONDS = 30;
/** How much already-played data (in seconds) we keep behind the playhead. */
const KEEP_BEHIND_SECONDS = 30;
/** Videos taller than this are downscaled when they need to be re-encoded. */
const MAX_TRANSCODE_HEIGHT = 1080;
/** Wait this long after the last seeking event before restarting the conversion (ms). */
const SEEK_DEBOUNCE_MS = 200;

// Codec parameter strings used to probe MediaSource support for a candidate output codec before encoding with it.
const VIDEO_CANDIDATES = [
  { codec: "avc", probe: "avc1.640028" },
  { codec: "vp9", probe: "vp09.00.10.08" },
  { codec: "av1", probe: "av01.0.08M.08" },
] as const;
const AUDIO_CANDIDATES = [
  { codec: "aac", probe: "mp4a.40.2" },
  { codec: "opus", probe: "opus" },
] as const;

export interface ClientTranscoderOptions {
  /** A local file, or a URL (must support CORS and range requests) */
  source: File | string;
  /** The element that will play the converted media */
  video: HTMLMediaElement;
  /** Where in the media (seconds) to start converting and playing from. Defaults to 0. */
  startTime?: number;
  /** Called with the fraction (0-1) of the file that has been converted so far */
  onProgress?: (fraction: number) => void;
  /** Called if conversion fails after start() has resolved. The transcoder stops itself. */
  onError?: (err: Error) => void;
  /** Which audio track (AudioTrackInfo.id) to start with. Defaults to the primary track, or the first playable one. */
  audioTrackId?: number;
  /**
   * Called once the file's audio tracks are known (before conversion starts), and again whenever the selected track
   * changes. Lists every audio track, including ones this browser may not be able to play.
   */
  onAudioTracks?: (
    tracks: AudioTrackInfo[],
    selectedId: number | undefined,
  ) => void;
}

/** Whether this browser has everything required to transcode client-side. */
export const isClientTranscodeSupported = (): boolean => {
  const w = window as any;
  return Boolean(
    w.VideoDecoder &&
    w.VideoEncoder &&
    w.AudioDecoder &&
    w.AudioEncoder &&
    w.MediaSource,
  );
};

let ac3Registered = false;
const registerAc3 = async () => {
  if (ac3Registered) {
    return;
  }
  ac3Registered = true;
  try {
    // Browsers can't decode AC-3/E-AC-3 (common in MKV/Blu-ray rips) via WebCodecs, so use the WASM decoder
    const { registerAc3Decoder } = await import("@mediabunny/ac3");
    registerAc3Decoder();
  } catch (e) {
    console.warn("[clientTranscode] AC-3 decoder unavailable", e);
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** An audio track in the source file that can be selected for playback. */
export interface AudioTrackInfo {
  /** Identifies the track within the file. Pass to selectAudioTrack() */
  id: number;
  /** Human readable description, unique among the file's tracks, e.g. "Japanese · Commentary · AC-3 5.1" */
  label: string;
  /** ISO 639-2 language code from the file, "und" if unknown */
  languageCode: string;
  /** The track's title from the file, if any */
  name: string | null;
  codec: string | null;
  channels: number;
}

const CODEC_NAMES: Record<string, string> = {
  aac: "AAC",
  mp3: "MP3",
  opus: "Opus",
  vorbis: "Vorbis",
  flac: "FLAC",
  ac3: "AC-3",
  eac3: "E-AC-3",
  dts: "DTS",
};

const channelLabel = (channels: number): string => {
  switch (channels) {
    case 0:
      return "";
    case 1:
      return "Mono";
    case 2:
      return "Stereo";
    case 6:
      return "5.1";
    case 8:
      return "7.1";
    default:
      return `${channels}ch`;
  }
};

/** Turns a language code from a media file (usually ISO 639-2, e.g. "jpn") into a name like "Japanese". */
export const languageName = (code: string): string | undefined => {
  if (!code || code === "und") {
    return undefined;
  }
  try {
    return new Intl.DisplayNames(undefined, {
      type: "language",
      fallback: "none",
    }).of(code);
  } catch {
    return undefined;
  }
};

/** Builds the list shown to the user, with labels made unique so identical-looking tracks can still be told apart. */
export const describeAudioTracks = (
  tracks: Pick<
    InputAudioTrack,
    "id" | "languageCode" | "name" | "codec" | "numberOfChannels"
  >[],
): AudioTrackInfo[] => {
  const infos = tracks.map((track, index): AudioTrackInfo => {
    const language =
      languageName(track.languageCode) ??
      (track.languageCode && track.languageCode !== "und"
        ? track.languageCode.toUpperCase()
        : undefined);
    const name = track.name?.trim() || undefined;
    const format = [
      track.codec
        ? (CODEC_NAMES[track.codec] ?? track.codec.toUpperCase())
        : "",
      channelLabel(track.numberOfChannels),
    ]
      .filter(Boolean)
      .join(" ");
    const parts = [
      language,
      // Titles often just repeat the language ("English")
      name && name.toLowerCase() !== language?.toLowerCase() ? name : undefined,
      format || undefined,
    ].filter(Boolean);
    return {
      id: track.id,
      label: parts.length ? parts.join(" · ") : `Track ${index + 1}`,
      languageCode: track.languageCode,
      name: track.name,
      codec: track.codec,
      channels: track.numberOfChannels,
    };
  });
  // e.g. two plain "English · AAC Stereo" tracks
  const seen = new Map<string, number>();
  infos.forEach((info) =>
    seen.set(info.label, (seen.get(info.label) ?? 0) + 1),
  );
  return infos.map((info, index) => {
    if ((seen.get(info.label) ?? 0) < 2) {
      return info;
    }
    return { ...info, label: `${info.label} (#${index + 1})` };
  });
};

export class ClientTranscoder {
  private mb!: Mediabunny;
  private input?: Input;
  private mediaSource?: MediaSource;
  private sourceBuffer?: SourceBuffer;
  private sourceBufferMime?: string;
  private objectUrl?: string;
  private duration = 0;

  /** All audio tracks in the source, and which one is being converted */
  private audioTracks: InputAudioTrack[] = [];
  private audioInfos: AudioTrackInfo[] = [];
  private selectedAudioTrackId?: number;
  /** True once the user picked a track, so failing to play it is an error instead of silently dropping audio */
  private audioChosenByUser = false;
  private primaryVideoTrackId?: number;

  /** Incremented whenever a conversion is started or the transcoder is stopped, to invalidate older work */
  private generation = 0;
  private active?: Conversion;
  /** Media time (in the source file) at which the current conversion started */
  private sessionStart = 0;
  private sessionRunning = false;
  /** True while a (re)start is in progress, so stalls caused by the restart itself don't trigger another one */
  private beginning = false;
  /** Generation whose output is currently being appended to the SourceBuffer */
  private readyGeneration = -1;
  /** Output chunks that arrived before the SourceBuffer existed (we need the first packets to know the codecs) */
  private pending: Uint8Array[] = [];
  /** Serializes all SourceBuffer operations */
  private chain: Promise<void> = Promise.resolve();

  private seekTimeout?: number;
  private started = false;
  private stopped = false;

  constructor(private readonly opts: ClientTranscoderOptions) {}

  /**
   * Opens the source, attaches a MediaSource to the video element, and resolves once the first converted data has
   * been appended (conversion continues in the background). Throws if the file can't be converted in this browser.
   */
  async start(): Promise<void> {
    const mb = (this.mb = await import("mediabunny"));
    const { source, video } = this.opts;
    this.input = new mb.Input({
      source:
        typeof source === "string"
          ? new mb.UrlSource(source)
          : new mb.BlobSource(source),
      formats: mb.ALL_FORMATS,
    });
    try {
      this.audioTracks = await this.input.getAudioTracks();
      this.audioInfos = describeAudioTracks(this.audioTracks);
      this.primaryVideoTrackId = (await this.input.getPrimaryVideoTrack())?.id;
      this.selectedAudioTrackId = await this.chooseInitialAudioTrack();
      this.duration = await this.input.computeDuration();
    } catch (e) {
      throw new Error(
        `Couldn't read this file${e instanceof Error ? `: ${e.message}` : ""}`,
      );
    }
    this.notifyAudioTracks();

    const mediaSource = new MediaSource();
    this.mediaSource = mediaSource;
    this.objectUrl = URL.createObjectURL(mediaSource);
    const opened = new Promise<void>((resolve) =>
      mediaSource.addEventListener("sourceopen", () => resolve(), {
        once: true,
      }),
    );
    video.src = this.objectUrl;
    await opened;
    if (Number.isFinite(this.duration) && this.duration > 0) {
      // Lets the seek bar show the full length even though we only convert on demand
      mediaSource.duration = this.duration;
    }
    const startTime = Math.min(
      Math.max(this.opts.startTime ?? 0, 0),
      this.duration > 0 ? this.duration : Infinity,
    );
    if (startTime > 0) {
      // Before data arrives this just sets the start position, it doesn't trigger a seek
      video.currentTime = startTime;
    }
    video.addEventListener("seeking", this.onSeeking);
    video.addEventListener("waiting", this.onWaiting);
    await this.begin(startTime);
    this.started = true;
  }

  /** The audio tracks in the source file (empty until start() has read it) */
  getAudioTracks(): AudioTrackInfo[] {
    return this.audioInfos;
  }

  getSelectedAudioTrackId(): number | undefined {
    return this.selectedAudioTrackId;
  }

  /**
   * Switches the audio track, continuing from the current playback position. Throws (and keeps playing the
   * previous track) if this browser can't play the requested one.
   */
  async selectAudioTrack(trackId: number): Promise<void> {
    if (
      this.stopped ||
      !this.started ||
      trackId === this.selectedAudioTrackId
    ) {
      return;
    }
    const track = this.audioTracks.find((t) => t.id === trackId);
    if (!track) {
      throw new Error("That audio track doesn't exist");
    }
    const previousId = this.selectedAudioTrackId;
    const previousChosen = this.audioChosenByUser;
    this.selectedAudioTrackId = trackId;
    this.audioChosenByUser = true;
    this.notifyAudioTracks();
    const resumeAt = this.opts.video.currentTime;
    try {
      await this.prepareAudioDecoder(track);
      await this.begin(resumeAt, true);
    } catch (e) {
      if (this.stopped) {
        throw e;
      }
      // Go back to what was playing before
      this.selectedAudioTrackId = previousId;
      this.audioChosenByUser = previousChosen;
      this.notifyAudioTracks();
      try {
        await this.begin(resumeAt, true);
      } catch (e2) {
        this.onConversionError(this.generation, e2);
      }
      throw e;
    }
  }

  private notifyAudioTracks() {
    this.opts.onAudioTracks?.(this.audioInfos, this.selectedAudioTrackId);
  }

  /** The AC-3 decoder is a sizeable WASM download, so only fetch it if a track we might play needs it */
  private async prepareAudioDecoder(track: InputAudioTrack) {
    if (track.codec === "ac3" || track.codec === "eac3") {
      await registerAc3();
    }
  }

  /** Whether this browser can play the track, either by copying it as-is or by decoding and re-encoding it */
  private async isAudioPlayable(track: InputAudioTrack): Promise<boolean> {
    await this.prepareAudioDecoder(track);
    return (await this.canCopyAudio(track)) || (await track.canDecode());
  }

  /** Picks the track to start with: the requested one, else the primary one, else the first that's playable */
  private async chooseInitialAudioTrack(): Promise<number | undefined> {
    const requested = this.audioTracks.find(
      (t) => t.id === this.opts.audioTrackId,
    );
    if (requested) {
      this.audioChosenByUser = true;
      await this.prepareAudioDecoder(requested);
      return requested.id;
    }
    const primary = await this.input!.getPrimaryAudioTrack();
    if (!primary) {
      return undefined;
    }
    if (await this.isAudioPlayable(primary)) {
      return primary.id;
    }
    // e.g. a DTS track listed before an AC-3 one. Otherwise the file would play without sound
    for (const track of this.audioTracks) {
      if (track !== primary && (await this.isAudioPlayable(track))) {
        return track.id;
      }
    }
    // Nothing is playable, let the conversion report why
    return primary.id;
  }

  /** Stops conversion and releases resources. Safe to call multiple times. */
  stop() {
    if (this.stopped) {
      return;
    }
    this.stopped = true;
    this.generation += 1;
    window.clearTimeout(this.seekTimeout);
    this.opts.video.removeEventListener("seeking", this.onSeeking);
    this.opts.video.removeEventListener("waiting", this.onWaiting);
    const active = this.active;
    this.active = undefined;
    this.sessionRunning = false;
    active?.cancel().catch(() => {});
    this.input?.dispose();
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }
  }

  private isStale(generation: number) {
    return this.stopped || generation !== this.generation;
  }

  /** Starts (or restarts) conversion at the given media time, in the source file's timeline. */
  private async begin(startTime: number, flushAhead = false): Promise<void> {
    const generation = ++this.generation;
    this.beginning = true;
    try {
      await this.beginInner(startTime, generation, flushAhead);
    } finally {
      if (generation === this.generation) {
        this.beginning = false;
      }
    }
  }

  private async beginInner(
    startTime: number,
    generation: number,
    flushAhead: boolean,
  ) {
    const mb = this.mb;
    await this.cancelActive();
    // Let any in-flight SourceBuffer work for the old conversion drain (it exits quickly once stale)
    await this.chain;
    if (this.isStale(generation)) {
      return;
    }
    if (flushAhead && this.sourceBuffer) {
      // Whatever is buffered from here on was converted with the previous audio track. Normally the new conversion
      // overwrites it faster than the playhead gets there, but if it can't keep up (e.g. a heavy re-encode), the
      // playhead would run into the old track's audio. Better to buffer for a moment, like after a seek.
      await this.sourceBufferOp((sb) => sb.remove(startTime, Infinity));
      if (this.isStale(generation)) {
        return;
      }
    }
    this.pending = [];
    this.sessionStart = startTime;

    const writable = new WritableStream<Uint8Array>({
      write: (chunk) => this.write(chunk, generation),
    });
    const output = new mb.Output({
      format: new mb.Mp4OutputFormat({
        fastStart: "fragmented",
        minimumFragmentDuration: 1,
      }),
      target: new mb.AppendOnlyStreamTarget(writable),
    });
    const conversion = await mb.Conversion.init({
      input: this.input!,
      output,
      // MP4 for MSE should carry a single track of each type, so every track except the main video and the
      // selected audio track is discarded. ("primary" would only ever offer the file's default audio track.)
      tracks: "all",
      trim: startTime > 0 ? { start: startTime } : undefined,
      video: (track) =>
        track.id === this.primaryVideoTrackId
          ? this.videoOptions(track)
          : { discard: true },
      audio: (track) =>
        track.id === this.selectedAudioTrackId
          ? this.audioOptions(track)
          : { discard: true },
      showWarnings: false,
    });
    if (!conversion.isValid) {
      throw new Error(describeDiscardedTracks(conversion));
    }
    // A conversion without the selected audio track is still "valid" (it just has no sound)
    const audioProblem = conversion.discardedTracks.find(
      ({ track, reason }) =>
        track.id === this.selectedAudioTrackId &&
        track.type === "audio" &&
        reason !== "discarded_by_user",
    );
    if (audioProblem) {
      const message = `Can't play audio track "${this.audioInfos.find((t) => t.id === audioProblem.track.id)?.label}" in this browser (${audioProblem.reason.replace(/_/g, " ")})`;
      if (this.audioChosenByUser) {
        await conversion.cancel();
        throw new Error(message);
      }
      console.warn("[clientTranscode]", message);
    }
    if (this.isStale(generation)) {
      await conversion.cancel();
      return;
    }
    this.active = conversion;
    this.sessionRunning = true;
    conversion.onProgress = (fraction) => {
      if (this.isStale(generation)) {
        return;
      }
      const remaining = Math.max(this.duration - startTime, 0);
      const absolute =
        this.duration > 0
          ? (startTime + fraction * remaining) / this.duration
          : 0;
      this.opts.onProgress?.(Math.min(Math.max(absolute, 0), 1));
    };

    const execution = conversion.execute();
    execution.then(
      () => this.onConversionDone(generation),
      (e) => this.onConversionError(generation, e),
    );
    // The precise codec strings are only known once the first packets are processed. If the conversion ends
    // (or fails) before then, don't hang forever.
    const mime = await Promise.race([
      output.getMimeType(),
      execution.then(() => output.getMimeType()),
    ]);
    if (this.isStale(generation)) {
      return;
    }
    if (!MediaSource.isTypeSupported(mime)) {
      throw new Error(
        `This browser can't play the converted video (${mime}). Try a different browser.`,
      );
    }
    this.prepareSourceBuffer(mime, startTime);
    this.readyGeneration = generation;
    const queued = this.pending;
    this.pending = [];
    queued.forEach((chunk) => this.enqueue(chunk, generation));
    // Resolves after the initial chunks (init segment + first fragment) are in the buffer
    await this.chain;
  }

  private async cancelActive() {
    const active = this.active;
    this.active = undefined;
    this.sessionRunning = false;
    if (active) {
      try {
        await active.cancel();
      } catch (e) {
        console.warn("[clientTranscode] cancel failed", e);
      }
    }
  }

  private prepareSourceBuffer(mime: string, startTime: number) {
    const mediaSource = this.mediaSource!;
    if (!this.sourceBuffer) {
      this.sourceBuffer = mediaSource.addSourceBuffer(mime);
      this.sourceBufferMime = mime;
    } else {
      const sb = this.sourceBuffer;
      // Reset the parser so it expects a fresh init segment
      if (mediaSource.readyState === "open") {
        sb.abort();
      }
      if (this.sourceBufferMime !== mime) {
        // e.g. the first conversion copied the video but this one had to re-encode it
        sb.changeType(mime);
        this.sourceBufferMime = mime;
      }
    }
    // The new conversion's timestamps start at 0 regardless of where in the source it began
    this.sourceBuffer.timestampOffset = startTime;
  }

  /** Called by the output's WritableStream for every chunk of fragmented MP4. Returns when it's OK to send more. */
  private write(chunk: Uint8Array, generation: number): Promise<void> {
    if (this.isStale(generation)) {
      return Promise.resolve();
    }
    if (this.readyGeneration !== generation) {
      // No SourceBuffer yet; don't block, since the conversion needs to keep going to reveal the codecs
      this.pending.push(chunk);
      return Promise.resolve();
    }
    return this.enqueue(chunk, generation);
  }

  private enqueue(chunk: Uint8Array, generation: number): Promise<void> {
    this.chain = this.chain
      .then(() => this.appendChunk(chunk, generation))
      .catch((e) => this.onConversionError(generation, e));
    return this.chain;
  }

  private async appendChunk(chunk: Uint8Array, generation: number) {
    await this.waitForRoom(generation);
    if (this.isStale(generation)) {
      return;
    }
    await this.evictOldData();
    try {
      await this.sourceBufferOp((sb) => sb.appendBuffer(chunk as BufferSource));
    } catch (e) {
      if ((e as DOMException)?.name !== "QuotaExceededError") {
        throw e;
      }
      // Buffer full: drop everything we can behind the playhead and retry once
      const behind = this.opts.video.currentTime - 2;
      if (behind > 0) {
        await this.sourceBufferOp((sb) => sb.remove(0, behind));
      }
      await this.sourceBufferOp((sb) => sb.appendBuffer(chunk as BufferSource));
    }
  }

  /** Backpressure: hold off while we're already far enough ahead of the playhead. */
  private async waitForRoom(generation: number) {
    const video = this.opts.video;
    while (!this.isStale(generation)) {
      const head = this.bufferedEndAt(video.currentTime);
      if (head === undefined || head - video.currentTime < LOOKAHEAD_SECONDS) {
        return;
      }
      await sleep(250);
    }
  }

  private async evictOldData() {
    const sb = this.sourceBuffer;
    if (!sb || sb.buffered.length === 0) {
      return;
    }
    const keepFrom = this.opts.video.currentTime - KEEP_BEHIND_SECONDS;
    if (keepFrom > 5 && sb.buffered.start(0) < keepFrom - 5) {
      await this.sourceBufferOp((sb) => sb.remove(0, keepFrom));
    }
  }

  /** Runs a SourceBuffer operation and resolves when it finishes. */
  private sourceBufferOp(op: (sb: SourceBuffer) => void): Promise<void> {
    const sb = this.sourceBuffer!;
    return new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        sb.removeEventListener("updateend", onEnd);
        sb.removeEventListener("error", onError);
      };
      const onEnd = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error("SourceBuffer error"));
      };
      sb.addEventListener("updateend", onEnd);
      sb.addEventListener("error", onError);
      try {
        op(sb);
      } catch (e) {
        cleanup();
        reject(e);
      }
    });
  }

  /** End of the buffered range containing time t, if any */
  private bufferedEndAt(t: number): number | undefined {
    const sb = this.sourceBuffer;
    if (!sb) {
      return undefined;
    }
    const ranges = sb.buffered;
    for (let i = 0; i < ranges.length; i++) {
      if (ranges.start(i) - 0.1 <= t && t <= ranges.end(i) + 0.1) {
        return ranges.end(i);
      }
    }
    return undefined;
  }

  private async onConversionDone(generation: number) {
    if (this.isStale(generation)) {
      return;
    }
    this.sessionRunning = false;
    await this.chain;
    const mediaSource = this.mediaSource;
    if (!this.isStale(generation) && mediaSource?.readyState === "open") {
      try {
        // Lets the player fire 'ended' instead of waiting for more data. Appending later (after a seek) reopens it.
        mediaSource.endOfStream();
      } catch (e) {
        console.warn("[clientTranscode] endOfStream failed", e);
      }
    }
  }

  private onConversionError(generation: number, e: unknown) {
    if (this.isStale(generation)) {
      // Expected when a conversion is cancelled by a seek or stop
      return;
    }
    const err = e instanceof Error ? e : new Error(String(e));
    console.error("[clientTranscode]", err);
    if (this.started) {
      // Before start() resolves, the error is delivered by start() rejecting instead
      this.opts.onError?.(err);
    }
    this.stop();
  }

  private onSeeking = () => {
    const t = this.opts.video.currentTime;
    window.clearTimeout(this.seekTimeout);
    if (this.bufferedEndAt(t) !== undefined) {
      // Already have it. If the conversion isn't producing data for this region, onWaiting will catch it.
      return;
    }
    this.seekTimeout = window.setTimeout(() => {
      // Data for the target may have arrived in the meantime (e.g. the start position after initial load)
      const now = this.opts.video.currentTime;
      if (this.bufferedEndAt(now) === undefined) {
        this.restartAt(now);
      }
    }, SEEK_DEBOUNCE_MS);
  };

  private onWaiting = () => {
    // Playback stalled. Normal if we're just at the head of the running conversion; otherwise nothing is
    // going to fill this gap (e.g. we seeked back into data that got evicted or was never converted).
    const t = this.opts.video.currentTime;
    const feeding = this.sessionRunning && t >= this.sessionStart - 0.5;
    if (!this.beginning && !feeding && this.bufferedEndAt(t) === undefined) {
      this.restartAt(t);
    }
  };

  private restartAt(t: number) {
    if (this.stopped) {
      return;
    }
    const target = Math.max(0, Math.min(t, this.duration || t));
    this.begin(target).catch((e) => {
      this.onConversionError(this.generation, e);
    });
  }

  /** Copy tracks the browser can already play; otherwise re-encode to something it can. */
  private async videoOptions(
    track: InputVideoTrack,
  ): Promise<ConversionVideoOptions> {
    const mb = this.mb;
    const codecString = await track.getCodecParameterString();
    if (
      track.codec &&
      codecString &&
      new mb.Mp4OutputFormat().getSupportedCodecs().includes(track.codec) &&
      MediaSource.isTypeSupported(`video/mp4; codecs="${codecString}"`)
    ) {
      return {};
    }
    const tooTall = track.displayHeight > MAX_TRANSCODE_HEIGHT;
    const height = tooTall ? MAX_TRANSCODE_HEIGHT : track.displayHeight;
    const width = Math.round(
      (track.displayWidth * height) / track.displayHeight,
    );
    for (const { codec, probe } of VIDEO_CANDIDATES) {
      if (
        MediaSource.isTypeSupported(`video/mp4; codecs="${probe}"`) &&
        (await mb.canEncodeVideo(codec, { width, height }))
      ) {
        return {
          codec,
          forceTranscode: true,
          // Downscale only if necessary (the other dimension is derived from the aspect ratio)
          ...(tooTall ? { height } : {}),
          // WebRTC will re-encode this again for viewers, so there's no point in a high-quality intermediate
          quality: mb.QUALITY_MEDIUM,
          // Short GOPs keep seeks cheap, since we restart the conversion at the seek target
          keyFrameInterval: 2,
        };
      }
    }
    throw new Error(
      "This browser can't encode a video format it can play back. Try a different browser.",
    );
  }

  /** Whether the track can go into the output as-is, because the browser can already play it from an MP4 */
  private async canCopyAudio(track: InputAudioTrack): Promise<boolean> {
    const mb = this.mb;
    const codecString = await track.getCodecParameterString();
    return Boolean(
      track.codec &&
      codecString &&
      new mb.Mp4OutputFormat().getSupportedCodecs().includes(track.codec) &&
      MediaSource.isTypeSupported(`audio/mp4; codecs="${codecString}"`),
    );
  }

  private async audioOptions(
    track: InputAudioTrack,
  ): Promise<ConversionAudioOptions> {
    const mb = this.mb;
    if (await this.canCopyAudio(track)) {
      return {};
    }
    for (const { codec, probe } of AUDIO_CANDIDATES) {
      if (
        MediaSource.isTypeSupported(`audio/mp4; codecs="${probe}"`) &&
        (await mb.canEncodeAudio(codec, { numberOfChannels: 2 }))
      ) {
        return {
          codec,
          forceTranscode: true,
          // Viewers get stereo over WebRTC anyway
          numberOfChannels: 2,
          // Opus only runs at 48 kHz, and Chrome's MP4 parser rejects Opus whose declared input sample rate
          // differs from the 48 kHz sample entry (i.e. any 44.1 kHz source), so resample up front
          sampleRate: 48000,
        };
      }
    }
    throw new Error(
      "This browser can't encode a compatible audio format. Try a different browser.",
    );
  }
}

const describeDiscardedTracks = (conversion: Conversion): string => {
  const reasons = conversion.discardedTracks
    // Tracks we skipped on purpose (video/audio we weren't asked to play) aren't why this failed
    .filter(({ reason }) => reason !== "discarded_by_user")
    .map(
      ({ track, reason }) =>
        `${track.type} track (${track.codec ?? "unknown codec"}): ${reason.replace(/_/g, " ")}`,
    );
  return (
    "This file can't be converted in your browser" +
    (reasons.length ? ` — ${reasons.join("; ")}` : "")
  );
};
