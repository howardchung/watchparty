import { logHandledException } from '../data/sessionLog';
import type { PlayerSyncBridge } from './playerSync';
import type { MutableRefObject, ReactNode } from 'react';
import { diagnosticEvent } from '../data/sessionLog';
import { t } from '../i18n';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Hls from 'hls.js';
import { AudioLines, FastForward, Fullscreen, Mic, MicOff, Minimize2, Pause, Play, RefreshCw, Rewind, Subtitles, Volume2, VolumeX } from 'lucide-react';
import { Button, Dialog, IconButton, LoadingIndicator, StatusCard } from './Material';
import type { StreamStatus } from '../types';
import { subtitleFileToVtt } from './subtitles';
import { AvMedia, usesIntegratedPlayer, type PlayerMedia } from './avPlayer';

interface NativeAudioTrack { id: string; label: string; language: string; enabled: boolean; }
interface NativeAudioTrackList extends EventTarget { readonly length: number; [index: number]: NativeAudioTrack; }
type TrackMedia = HTMLVideoElement & { audioTracks?: NativeAudioTrackList };
type TrackChoice = { id: string; name: string };


export interface VideoPlayerProps {
  url: string;
  localFile?: File;
  sessionId: string;
  syncBridge?: MutableRefObject<PlayerSyncBridge | null>;
  syncLocked?: boolean;
  syncOverlay?: ReactNode;
  onReport: (positionMs: number, playing: boolean) => void;
  onNotify: (message: string) => void;
  syncTarget?: { requestId: string; positionMs: number };
  onState?: (state: StreamStatus) => void;
  onSync?: () => void;
  syncDisabled?: boolean;
  onToggleMic?: () => void;
  micMuted?: boolean;
  micLabel?: string;
  micDisabled?: boolean;
}

/** Explicit owner catch-up may move forward or backward on the media timeline. */
export function syncPosition(current: number, targetMs: number, end: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(targetMs) || targetMs < 0) return null;
  const target = Math.min(targetMs / 1000, Number.isFinite(end) ? end : Infinity);
  return target !== current ? target : null;
}

export function playbackReport(media: Pick<HTMLVideoElement, 'readyState' | 'currentTime' | 'paused' | 'ended' | 'seeking' | 'error'>) {
  if (media.readyState < 2 || media.seeking || media.error || !Number.isFinite(media.currentTime)) return null;
  return { positionMs: Math.max(0, Math.round(media.currentTime * 1000)), playing: !media.paused && !media.ended && media.readyState >= 3 };
}

// During a seek, the decoder may expose a temporary time or pause for a preview.
function checkpoint(media: PlayerMedia | null) {
  if (!media || media.seeking || media.error || media.readyState < 2 ||
      !Number.isFinite(media.currentTime) || !Number.isFinite(media.duration)) return null;
  return { position: media.currentTime, playing: !media.paused && !media.ended };
}

/** Older Firefox scans every AAC frame in an MKV before exposing metadata (Mozilla bug 2000420). */
export function slowLoadingMessage(url: string, userAgent: string): string {
  const firefox = /Firefox\/(\d+)/.exec(userAgent);
  if (/\.mkv(?:$|[?#])/i.test(url) && firefox && Number(firefox[1]) < 158) {
    return 'This Firefox version may download the entire MKV before playing. Try Firefox 158 or newer, Chrome, or an MP4/HLS link. You can also keep waiting.';
  }
  return t("The video source is taking longer than usual. You can keep waiting or retry the video.");
}

function time(seconds: number) {
  if (!Number.isFinite(seconds)) return '—';
  const n = Math.max(0, Math.floor(seconds));
  return n >= 3600 ? `${Math.floor(n / 3600)}:${String(Math.floor(n / 60) % 60).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}` : `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`;
}

export function VideoPlayer(props: VideoPlayerProps) {
  // Remount the entire media lifecycle on stream changes, including the same URL restarted.
  const previous = useRef({ session: props.sessionId, request: props.syncTarget?.requestId, blocked: undefined as string | undefined });
  if (previous.current.session !== props.sessionId) {
    previous.current = { session: props.sessionId, request: props.syncTarget?.requestId, blocked: previous.current.request };
  } else previous.current.request = props.syncTarget?.requestId;
  return <MediaPlayer key={`${props.sessionId}:${props.url}`} {...props} syncTarget={props.syncTarget?.requestId === previous.current.blocked ? undefined : props.syncTarget} />;
}

function MediaPlayer({ url, localFile, sessionId, syncBridge, syncLocked, syncOverlay, onReport, onNotify, onState, syncTarget, onSync, syncDisabled, onToggleMic, micMuted = true, micLabel, micDisabled }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const engineSurfaceRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<AvMedia | null>(null);
  const [browserPlayback, setBrowserPlayback] = useState(false);
  const [downloadedCopy, setDownloadedCopy] = useState<File>();
  const copyInput = useRef<HTMLInputElement>(null);
  const integrated = (localFile ? !/\.(mp4|m4v|webm|mov)$/i.test(localFile.name) : usesIntegratedPlayer(url)) && !browserPlayback;
  const media = (): PlayerMedia | null => engineRef.current ?? videoRef.current;
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if(!syncBridge)return;
    const bridge:PlayerSyncBridge={sessionId,
      info:()=>{const m=media();let bufferedUntilMs=0;
        if(m)for(let i=0;i<m.buffered.length;i++)if(m.buffered.start(i)<=m.currentTime+.1&&m.buffered.end(i)>=m.currentTime)bufferedUntilMs=m.buffered.end(i)*1000;
        return {positionMs:(m?.currentTime??0)*1000,durationMs:(m?.duration??NaN)*1000,playing:!!m&&!m.paused,paused:!!m?.paused,seeking:!!m?.seeking,ready:(m?.readyState??0)>=3,localFileOpened:!!localFile && !!engineRef.current && Number.isFinite(m?.duration),error:!!m?.error,bufferedUntilMs,seekable:engineRef.current?.canSeek ?? !!m?.seekable.length};},
      pause:async()=>{await media()?.pause();},play:async()=>{const m=media();if(!m)throw Error('PLAYER_UNAVAILABLE');await m.play();},
      prepare:async(positionMs)=>{const engine=engineRef.current;if(engine)await engine.prepareForSync(positionMs);else{const m=media();await m?.pause();if(m)m.currentTime=positionMs/1000;}},
      seek:(positionMs)=>{const m=media();if(m)m.currentTime=positionMs/1000;},
    };syncBridge.current=bridge;return()=>{if(syncBridge.current===bridge)syncBridge.current=null;};
  },[syncBridge,sessionId,integrated,browserPlayback,localFile]);

  const hlsRef = useRef<Hls | null>(null);
  const callbacks = useRef({ onReport, onNotify, onState });
  callbacks.current = { onReport, onNotify, onState };
  const [retry, setRetry] = useState(0);
  const [status, setStatus] = useState<StreamStatus>('loading');
  useEffect(() => { diagnosticEvent('player.state', { state: status, engine: integrated ? 'avplayer' : 'browser' }); }, [status, integrated]);
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [slowLoading, setSlowLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(NaN);
  const [buffered, setBuffered] = useState(0);
  const [live, setLive] = useState(false);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(true);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [audio, setAudio] = useState<TrackChoice[]>([]);
  const [subtitles, setSubtitles] = useState<TrackChoice[]>([]);
  const [unsupportedSubtitles, setUnsupportedSubtitles] = useState(0);
  const [audioId, setAudioId] = useState('automatic');
  const [trackDialog, setTrackDialog] = useState<'subtitles' | 'audio' | null>(null);
  const [subtitleError, setSubtitleError] = useState('');
  const [importing, setImporting] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [fallbackFullscreen, setFallbackFullscreen] = useState(false);
  const [activity, setActivity] = useState(0);
  const controlsRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const subtitleSelection = useRef('off');
  const audioSelection = useRef('automatic');
  const importGeneration = useRef(0);
  const automaticAudioId = useRef<string | null>(null);
  const localTrackRef = useRef<HTMLTrackElement | null>(null);
  const pointerActive = useRef(false);
  const keyboardInteraction = useRef(false);
  const [subtitleId, setSubtitleId] = useState('off');
  const [localSubtitle, setLocalSubtitle] = useState<{ url: string; name: string } | null>(null);
  const appliedRequest = useRef<string | undefined>(undefined);
  const fallbackUsed = useRef(false);
  const lastPlayback = useRef<ReturnType<typeof checkpoint>>(null);
  const retryPlayback = useRef<ReturnType<typeof checkpoint>>(null);
  const retryVideo = () => {
    retryPlayback.current ??= checkpoint(media()) ?? lastPlayback.current;
    setRetry(value => value + 1);
  };
  const handoff = useRef<{ position: number; playing: boolean; volume: number; muted: boolean; audio?: string; subtitle?: string } | null>(null);
  const selections = useRef({ audio, subtitles, audioId, subtitleId, blocked, paused, ready });
  selections.current = { audio, subtitles, audioId, subtitleId, blocked, paused, ready };

  useEffect(() => { callbacks.current.onState?.(status); }, [status]);
  useEffect(() => {
    setSlowLoading(false);
    if (status !== 'loading' && status !== 'buffering') return;
    // A slow source is not a fatal error. Keep its existing download alive.
    const timer = window.setTimeout(() => setSlowLoading(true), 15_000);
    return () => window.clearTimeout(timer);
  }, [status, retry]);
  useEffect(() => () => { importGeneration.current++; }, []);
  useEffect(() => () => { if (localSubtitle) URL.revokeObjectURL(localSubtitle.url); }, [localSubtitle]);
  useEffect(() => {
    const change = () => { setFullscreen(document.fullscreenElement === containerRef.current); setControlsVisible(true); };
    document.addEventListener('fullscreenchange', change);
    return () => document.removeEventListener('fullscreenchange', change);
  }, []);

  const expanded = fullscreen || fallbackFullscreen;
  const revealControls = () => { setControlsVisible(true); setActivity(value => value + 1); };
  useEffect(() => {
    if (!expanded || !controlsVisible || trackDialog || paused || error || blocked) return;
    const timer = window.setTimeout(() => {
      const focused = document.activeElement;
      // Range inputs can retain :focus-visible after a mouse/touch interaction.
      // Only keyboard interaction should keep idle controls on screen.
      const keyboardFocus = keyboardInteraction.current && focused instanceof HTMLElement && controlsRef.current?.contains(focused);
      if (!keyboardFocus && !pointerActive.current) setControlsVisible(false);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [expanded, controlsVisible, trackDialog, paused, error, blocked, activity]);
  useEffect(() => {
    const release = () => {
      if (pointerActive.current) { pointerActive.current = false; setActivity(value => value + 1); }
    };
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    return () => { window.removeEventListener('pointerup', release); window.removeEventListener('pointercancel', release); };
  }, []);
  useEffect(() => {
    if (!expanded) return;
    const reveal = () => { keyboardInteraction.current = true; setControlsVisible(true); setActivity(value => value + 1); };
    document.addEventListener('keydown', reveal);
    return () => document.removeEventListener('keydown', reveal);
  }, [expanded]);
  useEffect(() => {
    if (!fallbackFullscreen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape' && !trackDialog) setFallbackFullscreen(false); };
    document.addEventListener('keydown', escape);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', escape); };
  }, [fallbackFullscreen, trackDialog]);

  useEffect(() => {
    const video = videoRef.current!;
    let active = true;
    let failed = false;
    let startupReady = false;
    const resume = retryPlayback.current;
    importGeneration.current++; setImporting(false); setSubtitleError('');
    setStatus('loading'); setReady(false); setError(''); setBlocked(false); setPosition(0); setDuration(NaN); setBuffered(0); setLive(false); setAudio([]); setSubtitles([]); setUnsupportedSubtitles(0); if (!handoff.current) setLocalSubtitle(null); automaticAudioId.current = null;
    // A local Retry rebuilds the source and returns track selection to its defaults.
    audioSelection.current = 'automatic'; setAudioId('automatic');
    if (!handoff.current || selections.current.subtitleId !== 'local') { subtitleSelection.current = 'off'; setSubtitleId('off'); }
    const fallback = () => {
      if (!active || failed || !integrated || fallbackUsed.current || !navigator.onLine) return false;
      const current = media()!;
      const selection = selections.current;
      handoff.current = {
        position: retryPlayback.current?.position ?? (Number.isFinite(current.currentTime) ? current.currentTime : 0),
        playing: retryPlayback.current?.playing ?? (selection.ready ? !selection.paused && !current.ended : !selection.blocked),
        volume: current.volume, muted: current.muted,
        audio: selection.audio.find(track => track.id === selection.audioId)?.name,
        subtitle: selection.subtitles.find(track => track.id === selection.subtitleId)?.name,
      };
      diagnosticEvent('player.fallback', { reason: startupReady ? 'engine_failure' : 'startup_failure', positionMs: Math.round(current.currentTime * 1000) });
      fallbackUsed.current = true;
      failed = true;
      setBrowserPlayback(true);
      setDownloadedCopy(undefined);
      callbacks.current.onNotify(t("Switched to browser playback."));
      return true;
    };
    const fail = (message: string) => { if (fallback()) return; if (active && !failed) { failed = true; setError(message); setStatus('error'); setReady(false); } };
    const update = () => {
      if (!active || failed) return;
      const current = media()!;
      if (current.readyState >= 2) startupReady = true;
      if (!current.seeking) setPosition(current.currentTime);
      if (!retryPlayback.current) lastPlayback.current = checkpoint(current) ?? lastPlayback.current;
      setDuration(current.duration); setPaused(current.paused); setVolume(current.volume); setMuted(current.muted);
      if (current.duration === Infinity) setLive(true);
      setBuffered(current.buffered.length ? current.buffered.end(current.buffered.length - 1) : 0);
    };
    const autoplay = () => {
      if (resume ? !resume.playing : localFile || handoff.current && !handoff.current.playing) return;
      void media()!.play().catch((reason: unknown) => {
        logHandledException("VideoPlayer.MediaPlayer.autoplay.1", reason);
        if (!active || failed) return;
        if (reason instanceof DOMException && reason.name === 'AbortError') return;
        if (reason instanceof DOMException && reason.name === 'NotAllowedError') { diagnosticEvent('player.autoplay_blocked'); setBlocked(true); setStatus('paused'); }
        else fail(t("This video could not start. Check its format and connection, then retry."));
      });
    };
    const canplay = () => { if (!active || failed) return; setReady(true); setStatus(media()!.paused ? 'paused' : 'playing'); update(); };
    const playing = () => { if (!active || failed) return; setBlocked(false); setPaused(false); setStatus('playing'); };
    const pause = () => { if (!active || failed) return; setPaused(true); if (!failed && !video.error) setStatus('paused'); };
    const waiting = () => { if (!failed && !video.paused) setStatus(video.readyState ? 'buffering' : 'loading'); };
    const mediaError = () => fail(navigator.onLine ? t("Unable to load video. The link may be unavailable, blocked by cross-origin rules, or use an unsupported format.") : t("You are offline. Reconnect, then retry the video."));
    const nativeTracks = () => {
      if (hlsRef.current || !active) return;
      const media = video as TrackMedia;
      const list = media.audioTracks;
      const choices = list ? Array.from({ length: list.length }, (_, index) => ({ id: `native:${index}`, name: list[index].label || list[index].language || t('Audio {number}', { number: index + 1 }) })) : [];
      if (list && automaticAudioId.current === null) {
        const index = choices.findIndex((_, i) => list[i].enabled);
        if (index >= 0) automaticAudioId.current = choices[index].id;
      }
      setAudio(choices);
      const desiredAudio = choices.find(track => track.name === handoff.current?.audio);
      if (desiredAudio && list) {
        for (let index = 0; index < list.length; index++) list[index].enabled = desiredAudio.id === `native:${index}`;
        audioSelection.current = desiredAudio.id; setAudioId(desiredAudio.id); handoff.current!.audio = undefined;
      }
      const desiredSubtitle = Array.from(video.textTracks).findIndex(track => (track.label || track.language) === handoff.current?.subtitle);
      if (desiredSubtitle >= 0) { subtitleSelection.current = `native:${desiredSubtitle}`; setSubtitleId(subtitleSelection.current); handoff.current!.subtitle = undefined; }
      Array.from(video.textTracks).forEach((track, index) => {
        track.mode = subtitleSelection.current === `native:${index}` || subtitleSelection.current === 'local' && track === localTrackRef.current?.track ? 'showing' : 'disabled';
      });
      setSubtitles(Array.from(video.textTracks).flatMap((track, index) =>
        track.kind !== 'subtitles' && track.kind !== 'captions' || track === localTrackRef.current?.track ? [] : [{ id: `native:${index}`, name: track.label || track.language || t('Subtitles {number}', { number: index + 1 }) }]));
    };
    if (integrated) {
      let startupTimer: number | undefined;
      const watchStartup = () => {
        if (startupReady || startupTimer !== undefined) return;
        startupTimer = window.setTimeout(() => {
          startupTimer = undefined;
          if (active && !failed && !startupReady && engine.readyState < 2 && !selections.current.blocked) fallback();
        }, 30_000);
      };
      const stopWatchingStartup = () => {
        window.clearTimeout(startupTimer);
        startupTimer = undefined;
      };
      const engine = new AvMedia(engineSurfaceRef.current!, url, {
        tracks: (audio, subtitles, automatic, unsupported) => {
          if (!active || failed) return;
          setAudio(audio); setSubtitles(subtitles); automaticAudioId.current = automatic; setUnsupportedSubtitles(unsupported);
        },
        state: state => {
          if (!active || failed) return;
          if (state === 'playing') { canplay(); playing(); }
          else if (state === 'buffering') setStatus('buffering');
          else pause();
        },
        update, error: fail,
        startRequested: localFile ? watchStartup : undefined,
        pauseRequested: localFile ? stopWatchingStartup : undefined,
      }, localFile ?? downloadedCopy);
      engineRef.current = engine;
      void engine.ready.then(async () => {
        if (!active || failed) return;
        if (downloadedCopy) {
          engine.muted = video.muted;
          engine.volume = video.volume;
        }
        // A local selection opens paused. Its first decoded frame is only due
        // after Play or sync preparation, even though tracks are available now.
        if (resume) {
          if (resume.position > 0 && Number.isFinite(engine.duration)) await engine.seek(Math.min(resume.position, engine.duration));
          if (!active || failed) return;
          retryPlayback.current = null;
          canplay();
          autoplay();
        } else if (localFile) { setReady(true); setStatus('paused'); update(); }
        else autoplay();
      }).catch((handledError) => {
        logHandledException("VideoPlayer.MediaPlayer.2", handledError);
        if (active) fail(navigator.onLine ? t("Unable to load this video. The source may block access or use an unsupported format. Retry or use browser playback.") : t("You are offline. Reconnect, then retry the video."));
      });
      if (!localFile) watchStartup();
      const timer = window.setInterval(() => { const report = playbackReport(engine); if (active && !failed && !retryPlayback.current && report) callbacks.current.onReport(report.positionMs, report.playing); }, 1000);
      return () => { active = false; window.clearTimeout(startupTimer); window.clearInterval(timer); engine.destroy(); engineRef.current = null; };
    }
    diagnosticEvent('player.source_attached', { engine: 'browser', source: localFile ? 'local' : 'remote' });
    video.textTracks.addEventListener('addtrack', nativeTracks);
    video.textTracks.addEventListener('removetrack', nativeTracks);
    const nativeAudio = (video as TrackMedia).audioTracks;
    nativeAudio?.addEventListener('addtrack', nativeTracks);
    nativeAudio?.addEventListener('removetrack', nativeTracks);
    if (handoff.current) { video.volume = handoff.current.volume; video.muted = handoff.current.muted; }
    let restored = false;
    const restore = () => {
      const saved = resume ?? handoff.current;
      if (restored || !saved || !active || failed) return;
      restored = true;
      retryPlayback.current = null;
      if (saved.position > 0 && Number.isFinite(video.duration)) video.currentTime = Math.min(saved.position, Math.max(0, video.duration - 0.05));
      if (saved.playing) autoplay();
      else { video.pause(); canplay(); }
    };
    const start = () => {
      const saved = resume ?? handoff.current;
      if (!saved) autoplay();
      else if (saved.position === 0) { restored = true; retryPlayback.current = null; autoplay(); }
      else if (video.readyState >= 1) restore();
    };
    const volumeChange = () => { setVolume(video.volume); setMuted(video.muted); };
    const listeners: [string, EventListener][] = [['timeupdate', update], ['durationchange', update], ['progress', update], ['canplay', canplay], ['playing', playing], ['pause', pause], ['ended', pause], ['waiting', waiting], ['error', mediaError], ['volumechange', volumeChange], ['loadedmetadata', restore], ['loadedmetadata', update], ['loadedmetadata', nativeTracks]];
    listeners.forEach(([event, listener]) => video.addEventListener(event, listener));
    let hls: Hls | null = null;
    const isHls = /\.m3u8(?:$|[?#])/i.test(url);
    if (isHls && !video.canPlayType('application/vnd.apple.mpegurl') && Hls.isSupported()) {
      hls = new Hls(); hlsRef.current = hls;
      hls.on(Hls.Events.ERROR, (_event, data) => { if (data.fatal) fail(t("Unable to play this HLS stream. Check the connection, cross-origin access, and supported codecs, then retry.")); });
      hls.on(Hls.Events.LEVEL_LOADED, (_event, data) => setLive(data.details.live));
      const tracks = () => { if (!hls) return; setAudio(hls.audioTracks.map((track, id) => ({ id: `hls:${id}`, name: track.name || track.lang || t('Audio {number}', { number: id + 1 }) }))); setSubtitles(hls.subtitleTracks.map((track, id) => ({ id: `hls:${id}`, name: track.name || track.lang || t('Subtitles {number}', { number: id + 1 }) }))); if (automaticAudioId.current === null && hls.audioTrack >= 0) automaticAudioId.current = `hls:${hls.audioTrack}`;
        const audioIndex = hls.audioTracks.findIndex(track => (track.name || track.lang) === handoff.current?.audio);
        if (handoff.current?.audio && audioIndex >= 0) { handoff.current!.audio = undefined; audioSelection.current = `hls:${audioIndex}`; hls.audioTrack = audioIndex; setAudioId(audioSelection.current); }
        const subtitleIndex = hls.subtitleTracks.findIndex(track => (track.name || track.lang) === handoff.current?.subtitle);
        if (handoff.current?.subtitle && subtitleIndex >= 0) { handoff.current!.subtitle = undefined; subtitleSelection.current = `hls:${subtitleIndex}`; hls.subtitleTrack = subtitleIndex; hls.subtitleDisplay = true; setSubtitleId(subtitleSelection.current); }
      };
      hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, tracks); hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, tracks);
      hls.on(Hls.Events.SUBTITLE_TRACK_SWITCH, (_event, data) => { if (subtitleSelection.current !== 'local') { const id = data.id >= 0 ? `hls:${data.id}` : 'off'; subtitleSelection.current = id; setSubtitleId(id); } });
      hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, (_event, data) => { if (audioSelection.current !== 'automatic') setAudioId(`hls:${data.id}`); });
      hls.on(Hls.Events.MANIFEST_PARSED, start);
      hls.loadSource(url); hls.attachMedia(video);
    } else {
      video.src = url; video.load();
      // Request playback now, so the browser need not finish a metadata-only
      // preload, suspend, and then reopen the source to start buffering.
      start();
    }
    const timer = window.setInterval(() => { const report = playbackReport(video); if (active && !failed && !retryPlayback.current && report) callbacks.current.onReport(report.positionMs, report.playing); }, 1000);
    return () => {
      active = false; window.clearInterval(timer); listeners.forEach(([event, listener]) => video.removeEventListener(event, listener));
      video.textTracks.removeEventListener('addtrack', nativeTracks); video.textTracks.removeEventListener('removetrack', nativeTracks);
      nativeAudio?.removeEventListener('addtrack', nativeTracks); nativeAudio?.removeEventListener('removetrack', nativeTracks);
      diagnosticEvent('player.source_detached', { engine: 'browser' });
      hls?.destroy(); hlsRef.current = null; video.pause(); video.removeAttribute('src'); video.load();
    };
  }, [url, retry, integrated, downloadedCopy]);

  useEffect(() => {
    const video = media();
    if (!syncTarget || !video || !ready || appliedRequest.current === syncTarget.requestId) return;
    appliedRequest.current = syncTarget.requestId;
    const end = live && video.seekable.length ? video.seekable.end(video.seekable.length - 1) : video.duration;
    const next = syncPosition(video.currentTime, syncTarget.positionMs, end);
    if (next !== null) {
      if (live && (!video.seekable.length || next < video.seekable.start(0))) { callbacks.current.onNotify(t("That position is outside the live window.")); return; }
      try { video.currentTime = next; } catch (handledError) { logHandledException("VideoPlayer.MediaPlayer.3", handledError);  callbacks.current.onNotify(t("This video cannot seek to that position.")); }
    }
  }, [syncTarget, ready, live]);

  const play = async () => {
    if(syncLocked)return;
    setBlocked(false);
    try { await media()?.play(); }
    catch (handledError) { logHandledException("VideoPlayer.MediaPlayer.play.4", handledError);  setBlocked(true); callbacks.current.onNotify(t("Playback could not start. Try Play again or retry the video.")); }
  };
  const seek = (value: number) => {
    if(syncLocked)return;
    diagnosticEvent('player.seek_requested', { seconds: Math.round(value) });
    const video = media();
    if (!video || !ready || !Number.isFinite(video.duration) || live) return;
    try { const target = Math.max(0, Math.min(value, video.duration)); video.currentTime = target; setPosition(target); }
    catch (handledError) { logHandledException("VideoPlayer.MediaPlayer.seek.5", handledError);  callbacks.current.onNotify(t("Seeking is unavailable for this video.")); }
  };
  const selectSubtitle = (value: string) => {
    subtitleSelection.current = value;
    setSubtitleId(value);
    if (engineRef.current) {
      void engineRef.current.selectSubtitle(value).catch((handledError) => {
        logHandledException("VideoPlayer.MediaPlayer.selectSubtitle.6", handledError);  setSubtitleError(t("Unable to select that subtitle track. Choose another track or a local file.")); setTrackDialog('subtitles'); });
      return;
    }
    const video = videoRef.current;
    if (video) Array.from(video.textTracks).forEach((track, index) => {
      track.mode = value === `native:${index}` || value === 'local' && track === localTrackRef.current?.track ? 'showing' : 'disabled';
    });
    if (hlsRef.current) {
      hlsRef.current.subtitleTrack = value.startsWith('hls:') ? Number(value.slice(4)) : -1;
      hlsRef.current.subtitleDisplay = value.startsWith('hls:');
    }
  };
  const selectAudio = (value: string) => {
    audioSelection.current = value;
    setAudioId(value);
    if (engineRef.current) {
      void engineRef.current.selectAudio(value === 'automatic' ? automaticAudioId.current || 'av:1' : value).catch((handledError) => {
        logHandledException("VideoPlayer.MediaPlayer.selectAudio.7", handledError); return callbacks.current.onNotify(t("Unable to select that audio track. Choose another track.")); });
      setTrackDialog(null);
      return;
    }
    const hls = hlsRef.current;
    if (hls) {
      // hls.js setAudioOption(undefined) clears a manual language preference.
      if (value === 'automatic') {
        hls.setAudioOption(undefined);
        const fallback = hls.audioTracks.findIndex(track => track.default);
        if (fallback >= 0) hls.audioTrack = fallback;
        else if (automaticAudioId.current?.startsWith('hls:')) hls.audioTrack = Number(automaticAudioId.current.slice(4));
      } else hls.audioTrack = Number(value.slice(4));
    } else {
      const tracks = (videoRef.current as TrackMedia | null)?.audioTracks;
      if (tracks) {
        const selected = value === 'automatic' ? automaticAudioId.current || 'native:0' : value;
        Array.from({ length: tracks.length }, (_, index) => { tracks[index].enabled = selected === `native:${index}`; });
      }
    }
    setTrackDialog(null);
  };
  const importSubtitle = async (file: File) => {
    const generation = ++importGeneration.current;
    setSubtitleError(''); setImporting(true);
    try {
      if (file.size > 5_000_000) throw new Error(t("Choose a subtitle file smaller than 5 MB."));
      const content = await subtitleFileToVtt(file);
      if (generation !== importGeneration.current || !videoRef.current) return;
      selectSubtitle('off');
      if (engineRef.current) {
        await engineRef.current.importSubtitle(content, file.name);
        if (generation !== importGeneration.current || !engineRef.current) return;
        setLocalSubtitle({ url: URL.createObjectURL(new Blob([content], { type: 'text/vtt' })), name: file.name });
      } else setLocalSubtitle({ url: URL.createObjectURL(new Blob([content], { type: 'text/vtt' })), name: file.name });
      subtitleSelection.current = 'local'; setSubtitleId('local'); setTrackDialog(null);
    } catch (reason) {
      logHandledException("VideoPlayer.MediaPlayer.importSubtitle.8", reason);
      if (generation === importGeneration.current) setSubtitleError(reason instanceof Error ? reason.message : t("Unable to read that subtitle file."));
    } finally { if (generation === importGeneration.current) setImporting(false); }
  };
  const toggleFullscreen = async () => {
    if (fallbackFullscreen) { setFallbackFullscreen(false); return; }
    try {
      if (document.fullscreenElement === containerRef.current) await document.exitFullscreen();
      else if (containerRef.current?.requestFullscreen) await containerRef.current.requestFullscreen();
      else setFallbackFullscreen(true);
    } catch (handledError) { logHandledException("VideoPlayer.MediaPlayer.toggleFullscreen.9", handledError);  setFallbackFullscreen(true); }
    revealControls();
  };
  const tryEnhancedPlayer = () => {
    fallbackUsed.current = false;
    handoff.current = null;
    setBrowserPlayback(false);
    setRetry(value => value + 1);
    setTrackDialog(null);
  };
  const seekable = ready && Number.isFinite(duration) && duration > 0 && !live;
  return <div ref={containerRef} className={`cinema-player media-player ${fallbackFullscreen ? 'is-fullscreen' : ''} ${expanded && !controlsVisible ? 'controls-hidden' : ''}`} aria-label={t("Video player")} tabIndex={0} onPointerDown={() => { keyboardInteraction.current = false; revealControls(); }} onPointerUp={() => { pointerActive.current = false; revealControls(); }} onPointerMove={revealControls} onKeyDown={revealControls} onFocus={revealControls}>
    <div className="cinema-player__visual" onClick={() => { if (expanded) setControlsVisible(value => !value); }}>
      <div ref={engineSurfaceRef} className="integrated-player" hidden={!integrated} />
      <video ref={videoRef} hidden={integrated} aria-hidden={integrated || undefined} playsInline preload="auto" aria-label={t("Room video")} style={{ width: '100%', height: '100%', objectFit: 'contain' }}>
        {!integrated && localSubtitle?.url && <track ref={element => { localTrackRef.current = element; if (element) element.track.mode = subtitleSelection.current === 'local' ? 'showing' : 'disabled'; }} key={localSubtitle.url} kind="subtitles" src={localSubtitle.url} label={localSubtitle.name} onLoad={(event) => { event.currentTarget.track.mode = subtitleSelection.current === 'local' ? 'showing' : 'disabled'; }} onError={() => { setSubtitleError(t("Unable to display that subtitle file. Choose another file.")); setTrackDialog('subtitles'); selectSubtitle('off'); }} />}
      </video>
      {error ? <div className="player-buffering"><StatusCard title={t("Unable to play video")} tone="error" actions={<><Button onClick={retryVideo}>{t("Retry video")}</Button>{integrated && <Button variant="text" onClick={() => { setBrowserPlayback(true); setRetry(value => value + 1); }}>{t("Use browser player")}</Button>}</>}>{error}</StatusCard></div>
        : status === 'loading' || status === 'buffering' ? <div className="player-buffering"><LoadingIndicator label={status === 'loading' ? t("Loading video") : t("Buffering")} />{slowLoading && <><p className="player-loading-help">{slowLoadingMessage(ready || integrated ? '' : url, navigator.userAgent)}</p><Button onClick={retryVideo}>{t("Retry video")}</Button></>}</div>
        : paused && !syncLocked ? <button className="player-big-play" aria-label={t("Play video")} onClick={event => { event.stopPropagation(); void play(); }}><Play size={38} aria-hidden="true" /></button> : null}
      {syncOverlay}
    </div>
    <div ref={controlsRef} className="player-controls" onPointerDown={() => { pointerActive.current = true; revealControls(); }} onPointerUp={() => { pointerActive.current = false; revealControls(); }} onPointerCancel={() => { pointerActive.current = false; revealControls(); }} onBlur={revealControls}>
      {blocked && <StatusCard title={t("Ready to play")}>{t("Select Play to start the video on this device.")}</StatusCard>}
      {live ? <span className="player-live"><span aria-hidden="true">●</span> {t("Live")}</span> : <label className="player-progress"><span className="sr-only">{t("Playback position")}</span><input type="range" min={0} max={seekable ? duration : 1} step="0.1" value={seekable ? Math.min(position, duration) : 0} disabled={!seekable || syncLocked} onChange={event => seek(Number(event.target.value))} aria-valuetext={time(position)} style={{ '--range-progress': `${seekable ? position / duration * 100 : 0}%` } as CSSProperties} /></label>}
      <div className="player-controls__row">
        <span className="player-time">{time(position)} {!live && <span>/ {time(duration)}</span>}<span className="sr-only"> {t("Buffered to")}{time(buffered)}</span></span>
        <div className="transport" role="group" aria-label={t("Playback controls")}>
          {!live && <IconButton icon={Rewind} label={t("Rewind 15 seconds")} disabled={!seekable || syncLocked} onClick={() => seek(position - 15)} />}
          <IconButton icon={paused ? Play : Pause} label={paused ? t("Play") : t("Pause")} variant="filled" disabled={!!error || syncLocked} onClick={() => paused ? void play() : media()?.pause()} />
          {!live && <IconButton icon={FastForward} label={t("Fast-forward 15 seconds")} disabled={!seekable || syncLocked} onClick={() => seek(position + 15)} />}
        </div>
        <div className="volume-control">
          <IconButton icon={RefreshCw} label={t("Sync to room")} disabled={!onSync || syncDisabled} onClick={onSync} />
          <IconButton icon={Subtitles} label={t("Subtitles")} variant={subtitleId !== 'off' ? 'tonal' : 'standard'} aria-pressed={subtitleId !== 'off'} onClick={() => { setSubtitleError(''); setTrackDialog('subtitles'); }} />
          {(audio.length > 0 || browserPlayback) && <IconButton icon={AudioLines} label={t("Audio tracks")} variant={audioId !== 'automatic' ? 'tonal' : 'standard'} aria-pressed={audioId !== 'automatic'} onClick={() => setTrackDialog('audio')} />}
          <IconButton icon={micMuted ? MicOff : Mic} label={micLabel || (micMuted ? t("Unmute microphone") : t("Mute microphone"))} disabled={!onToggleMic || micDisabled} aria-pressed={!micMuted} onClick={onToggleMic} />
          <IconButton icon={muted || volume === 0 ? VolumeX : Volume2} label={muted || volume === 0 ? t("Unmute video") : t("Mute video")} onClick={() => { const video = media()!; if (video.muted || !video.volume) { video.muted = false; if (!video.volume) video.volume = 1; } else video.muted = true; }} />
          <label><span className="sr-only">{t("Volume")}</span><input type="range" min={0} max={100} value={muted ? 0 : volume * 100} onChange={event => { const video = media()!; video.volume = Number(event.target.value) / 100; video.muted = false; }} style={{ '--range-progress': `${muted ? 0 : volume * 100}%` } as CSSProperties} /></label>
          <IconButton icon={expanded ? Minimize2 : Fullscreen} label={expanded ? t("Exit fullscreen") : t("Enter fullscreen")} aria-pressed={expanded} onClick={() => void toggleFullscreen()} />
        </div>
      </div>
    </div>
    <input ref={fileRef} type="file" accept=".vtt,.srt,.ssa,.ass,.ttml,.dfxp,.xml" aria-label={t("Local subtitle file")} hidden onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) void importSubtitle(file); }} />
    <Dialog open={trackDialog === 'subtitles'} title={t("Subtitles")} onClose={() => setTrackDialog(null)} actions={<><Button variant="text" disabled={importing || integrated && !ready} icon={<Subtitles size={18} aria-hidden="true" />} onClick={() => fileRef.current?.click()}>{importing ? t("Reading subtitles…") : t("Choose subtitle file")}</Button><Button variant="text" onClick={() => setTrackDialog(null)}>{t("Done")}</Button></>}>
      {subtitles.length === 0 && !localSubtitle && !browserPlayback && <p>{integrated && status === 'loading' ? t("Subtitle tracks will appear when the video is ready.") : t("No supported subtitle tracks are available from this source in your browser. You can choose a local subtitle file.")}</p>}
      <div className="player-track-choices" role="radiogroup" aria-label={t("Subtitle track")}>
        {[{ id: 'off', name: t("Off") }, ...subtitles, ...(localSubtitle ? [{ id: 'local', name: localSubtitle.name }] : [])].map(track => <label key={track.id} className="player-track-choice"><input type="radio" name="subtitle-track" value={track.id} checked={subtitleId === track.id} onChange={() => { selectSubtitle(track.id); setTrackDialog(null); }} /><span>{track.name}</span></label>)}
      </div>
      <p className="player-subtitle-help">{t('SRT, VTT, SSA/ASS or TTML files · Up to 5 MB. Advanced subtitle styling may look different.')}</p>
      {unsupportedSubtitles > 0 && <p>{t("Some embedded subtitle formats are not supported. You can choose a local subtitle file.")}</p>}
      {browserPlayback && <p>{t("Some embedded tracks may be unavailable in browser playback.")}<Button variant="text" onClick={tryEnhancedPlayer}>{t("Try enhanced player")}</Button></p>}
      {browserPlayback && !localFile && !subtitles.length && /\.mkv(?:$|[?#])/i.test(url) && <div>
        <p>{t("Open a downloaded copy of this MKV to use its embedded subtitles on this device.")}</p>
        <a href={url} target="_blank" rel="noreferrer" download>{t("Download video")}</a>
        <Button variant="text" disabled={syncLocked} onClick={() => copyInput.current?.click()}>{t("Open downloaded MKV")}</Button>
        <input ref={copyInput} type="file" accept=".mkv" aria-label={t("Open downloaded MKV")} hidden onChange={event => {
          const copy = event.target.files?.[0];
          event.target.value = '';
          if (!copy) return;
          retryPlayback.current = checkpoint(media());
          setDownloadedCopy(copy);
          tryEnhancedPlayer();
        }} />
      </div>}
      {subtitleError && <StatusCard title={t("Unable to load subtitles")} tone="error">{subtitleError}</StatusCard>}
    </Dialog>
    <Dialog open={trackDialog === 'audio'} title={t("Audio tracks")} onClose={() => setTrackDialog(null)} actions={<Button variant="text" onClick={() => setTrackDialog(null)}>{t("Done")}</Button>}>
      {browserPlayback && <p>{t("Some embedded tracks may be unavailable in browser playback.")}<Button variant="text" onClick={tryEnhancedPlayer}>{t("Try enhanced player")}</Button></p>}
      {audio.length === 0 ? <p>{t("No selectable audio tracks are available in this browser.")}</p> : <div className="player-track-choices" role="radiogroup" aria-label={t("Audio track")}>
        {[{ id: 'automatic', name: t("Automatic") }, ...(audio.length > 1 ? audio : [])].map(track => <label key={track.id} className="player-track-choice"><input type="radio" name="audio-track" value={track.id} checked={audioId === track.id} onChange={() => selectAudio(track.id)} /><span>{track.name}</span></label>)}
      </div>}
    </Dialog>
  </div>;
}
