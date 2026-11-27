import { logHandledException } from '../data/sessionLog';
import type { GroupSyncUi } from '../components/useGroupSync';
import { t } from '../i18n';
import { ChooseVideoDialog } from '../components/ChooseVideoDialog';
import { Bug } from 'lucide-react';
import { BugReportDialog } from '../components/BugReportDialog';
import {
  FolderOpen,
  Clipboard,
  ClipboardCheck,
  FastForward,
  Fullscreen,
  Link2,
  LockKeyhole,
  LogOut,
  Mic,
  MicOff,
  Minimize2,
  Pause,
  Play,
  RefreshCw,
  Rewind,
  Square,
  UserPlus,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AppBar } from '../components/AppBar';
import { ParticipantItem } from '../components/Avatar';
import {
  Button,
  Dialog,
  IconButton,
  LoadingIndicator,
  StatusCard,
  TextField,
} from '../components/Material';
import { VideoPlayer } from '../components/VideoPlayer';
import type { VoiceState } from '../data/voice';
import { sampleVideoUrl } from '../data/fakeRepository';
import type { Party, StreamStatus } from '../types';
import type { ReactNode } from 'react';
import { PartyChat, type ChatControls } from '../components/PartyChat';

const TOTAL_SECONDS = 6138;
const LEADING_POSITION = 1542;

async function writeClipboardText(value: string) {
  if (!navigator.clipboard?.writeText) throw new Error('CLIPBOARD_UNAVAILABLE');
  await Promise.race([
    navigator.clipboard.writeText(value),
    new Promise<never>((_, reject) =>
      window.setTimeout(() => reject(new Error('CLIPBOARD_TIMEOUT')), 600),
    ),
  ]);
}

function formatTime(value: number) {
  const safeValue = Math.max(0, Math.min(value, TOTAL_SECONDS));
  const hours = Math.floor(safeValue / 3600);
  const minutes = Math.floor((safeValue % 3600) / 60);
  const seconds = Math.floor(safeValue % 60);
  return hours > 0
    ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`
    : `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export interface LivePartyControls {
  groupSync?: GroupSyncUi;
  chat?: ChatControls;
  connected: boolean;
  leaving: boolean;
  voice: VoiceState;
  onToggleVoice: () => Promise<void>;
  onResumeVoice: () => void;
  onRetryVoice: () => void;
  onSync: () => void | Promise<void>;
  syncing: boolean;
  syncTarget?: { requestId: string; positionMs: number };
  onReport: (positionMs: number, playing: boolean) => void;
}
export interface MediaSourceControls { local:boolean; active:boolean; url:string; file?:File; fileName:string; name:string; busy:boolean; choose():void; replaceFile():void; replace(url:string):Promise<void>; state(status:StreamStatus):void }
interface PartyScreenProps {
  mediaSource?: MediaSourceControls;
  localFilePreview?: { media?: ReactNode; source: ReactNode; actions?: ReactNode; entryAction?: ReactNode; entryTitle?: string };
  syncPreview?: { band: ReactNode; aside?: ReactNode; overlay?: ReactNode; locked: boolean; position: number; onPositionChange: (position: number) => void };
  chatPreview?: { placement: 'side' | 'dock' | 'floating'; content: ReactNode };
  live?: LivePartyControls;
  party: Party;
  streamStatus: StreamStatus;
  theme: 'light' | 'dark';
  aborting: boolean;
  onToggleTheme: () => void;
  onStartStream: (url: string) => void;
  onSetStreamStatus: (status: StreamStatus) => void;
  onAbort: () => Promise<void>;
  onLeave: () => void;
  onNotify: (message: string) => void;
}

export function PartyScreen({
  party,
  streamStatus,
  theme,
  aborting,
  onToggleTheme,
  onStartStream,
  onSetStreamStatus,
  onAbort,
  onLeave,
  onNotify,
  live,
  chatPreview,
  syncPreview,
  localFilePreview,
  mediaSource,
}: PartyScreenProps) {
  const [chooseSourceOpen,setChooseSourceOpen]=useState(false);
  useEffect(()=>setChooseSourceOpen(false),[party.streamSessionId]);
  const [bugReportOpen, setBugReportOpen] = useState(false);
  const [urlDraft, setUrlDraft] = useState(
    streamStatus === 'error' ? 'not-a-complete-link' : '',
  );
  const [position, setPosition] = useState(1122);
  useEffect(() => { if (syncPreview) setPosition(syncPreview.position); }, [syncPreview?.position]);
  const [volume, setVolume] = useState(72);
  const [previousVolume, setPreviousVolume] = useState(72);
  const [micMuted, setMicMuted] = useState(true);
  const [voiceJoined, setVoiceJoined] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [abortOpen, setAbortOpen] = useState(false);
  const [urlOpen, setUrlOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteCopyState, setInviteCopyState] = useState<
    'idle' | 'code' | 'link' | 'error'
  >('idle');

  const activeUrl = party.streamUrl || sampleVideoUrl;
  const hasPlayer = live ? !!(mediaSource?.local ? mediaSource.url : party.streamUrl) : ['playing', 'paused', 'buffering'].includes(streamStatus);
  const partyCode = party.code || party.id;
  const voiceMuted = live ? live.voice.muted : micMuted;
  const voiceStatus = live?.voice.status ?? (voiceJoined ? 'connected' : 'off');
  const voiceLabel = voiceMuted ? t("Unmute") : t("Mute");
  const voiceMessage = voiceStatus === 'off' ? t("Talk with the room")
    : voiceStatus === 'connecting' ? t("Joining voice…")
    : voiceStatus === 'degraded' ? t("Some voice connections need attention")
    : voiceStatus === 'reconnecting' ? t("Reconnecting voice signaling")
    : voiceStatus === 'error' ? live?.voice.error === 'WEBRTC_UNAVAILABLE'
      ? t("Voice calling is unavailable in this browser")
      : live?.voice.error === 'NETWORK'
      ? t("Could not reach voice. Check your connection and try again.")
      : t("Could not join voice. Try again.")
    : voiceMuted ? t("Your mic is muted") : t("Your mic is on");
  const retryVoiceAvailable = voiceStatus === 'degraded'
    || Object.values(live?.voice.members ?? {}).some(member => member.connection === 'unavailable');
  const toggleMic = () => {
    // Joining is an explicit action in the voice pane, including from fullscreen.
    if (voiceStatus === 'off' || voiceStatus === 'error' || voiceStatus === 'connecting') return;
    if (live) void live.onToggleVoice();
    else setMicMuted(current => !current);
  };
  const joinVoice = () => {
    if (live) void live.onToggleVoice();
    else { setVoiceJoined(true); setMicMuted(true); }
  };
  // Ownership is stable while realtime presence is still connecting or recovering.
  const isOwner = party.role === 'owner';
  const inviteLink = useMemo(() => {
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('invite', party.code || party.id);
    return url.toString();
  }, [party.id, party.code]);

  useEffect(() => {
    if (live || syncPreview || streamStatus !== 'playing') return;
    const timer = window.setInterval(
      () => setPosition((current) => Math.min(current + 1, TOTAL_SECONDS)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [streamStatus, live, !!syncPreview]);

  const participants = useMemo(
    () =>
      party.participants.map((participant) =>
        !live && participant.isSelf
          ? { ...participant, isMuted: micMuted, isSpeaking: !micMuted && participant.isSpeaking }
          : participant,
      ),
    [micMuted, party.participants, live],
  );

  const copyUrl = async () => {
    try {
      await writeClipboardText(activeUrl);
    } catch (handledError) {
      logHandledException("PartyScreen.PartyScreen.copyUrl.1", handledError);
      onNotify(t("Copy is unavailable. Select the link manually."));
      return;
    }
    setCopied(true);
    onNotify(t("Video link copied"));
    window.setTimeout(() => setCopied(false), 1600);
  };

  const pasteUrl = async () => {
    let pasted = '';
    try {
      pasted = await navigator.clipboard.readText();
    } catch (handledError) {
      logHandledException("PartyScreen.PartyScreen.pasteUrl.2", handledError);
      if (live) { onNotify(t("Paste is unavailable. Enter the video URL manually.")); return; }
      pasted = sampleVideoUrl;
    }
    setUrlDraft(pasted || sampleVideoUrl);
    onNotify(t("Video link ready"));
  };

  const copyInvite = async (value: string, target: 'code' | 'link') => {
    try {
      await writeClipboardText(value);
      setInviteCopyState(target);
      onNotify(target === 'code' ? t("Party code copied") : t("Invite link copied"));
    } catch (handledError) {
      logHandledException("PartyScreen.PartyScreen.copyInvite.3", handledError);
      setInviteCopyState('error');
      onNotify(t("Copy is unavailable. You can select the text manually."));
    }
  };

  const toggleMute = () => {
    if (volume === 0) {
      setVolume(previousVolume || 72);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
    }
  };

  const syncPlayback = () => {
    setPosition(LEADING_POSITION);
    onNotify(t("You're caught up with the room"));
  };

  return (
    <div className={`screen party-screen screen-enter${live?.chat ? ' party-screen--chat' : ''}${chatPreview ? ` party-chat-preview party-chat-preview--${chatPreview.placement}` : ''}`}>
      <AppBar
        title={party.title}
        subtitle={`${partyCode} · ${isOwner ? t("Owner") : party.ownerPresent ? t("Guest") : t("Owner away")}`}
        theme={theme}
        onToggleTheme={onToggleTheme}
        actions={
          <>
            <IconButton
              icon={UserPlus}
              label={t("Invite friends")}
              variant="tonal"
              onClick={() => {
                setInviteCopyState('idle');
                setInviteOpen(true);
              }}
            />
            <IconButton icon={Bug} label={t("Report a bug")} onClick={() => setBugReportOpen(true)} />
            {hasPlayer && !localFilePreview && !mediaSource?.local ? (
              <IconButton icon={Link2} label={t("View video link")} onClick={() => setUrlOpen(true)} />
            ) : null}
            <IconButton icon={LogOut} label={t("Leave party")} onClick={() => setLeaveOpen(true)} />
          </>
        }
      />

      <main className="party-layout">
        <section className="cinema-column" aria-label={t("Cinema")}>
          {!isOwner && !party.ownerPresent ? (
            <div className="owner-away-banner" role="status">
              <LockKeyhole size={24} aria-hidden="true" />
              <div>
                <span className="eyebrow">{t("Owner away")}</span>
                <strong>{party.ownerName} {t("left the room")}</strong>
                <p>
                  {t('The current video stays available, but nobody can replace or end it until {name} returns.', { name: party.ownerName })}
                </p>
              </div>
            </div>
          ) : null}
          {mediaSource?.active && mediaSource.local && !hasPlayer ? <section className="local-source-waiting"><FolderOpen size={48} aria-hidden="true"/><h2>{t('Choose your copy')}</h2><bdi>{mediaSource.fileName}</bdi><p>{t('No file, no video. You can still hang out in voice.')}</p><Button disabled={mediaSource.busy||!live?.connected} onClick={mediaSource.choose}>{t('Choose file')}</Button></section> : localFilePreview?.media ?? (!hasPlayer ? (
            <StreamEntry
              status={streamStatus}
              fileAction={mediaSource && isOwner ? <Button fullWidth icon={<FolderOpen size={19}/>} disabled={mediaSource.busy||!live?.connected} onClick={mediaSource.choose}>{t("Choose file")}</Button> : localFilePreview?.entryAction}
              title={mediaSource ? t("Bring in a video") : localFilePreview?.entryTitle}
              url={urlDraft}
              onUrlChange={(value) => {
                setUrlDraft(value);
                if (streamStatus === 'error') onSetStreamStatus('empty');
              }}
              onPaste={pasteUrl}
              onStart={() => onStartStream(urlDraft)}
              isOwner={isOwner}
              ownerPresent={party.ownerPresent}
              ownerName={party.ownerName}
            />
          ) : live ? (
            <VideoPlayer syncBridge={live.groupSync?.bridge} syncLocked={live.groupSync?.locked} syncOverlay={live.groupSync?.overlay} localFile={mediaSource?.file} url={mediaSource?.local ? mediaSource.url : party.streamUrl} sessionId={party.streamSessionId || ''} onReport={live.onReport} onNotify={onNotify} onState={status=>{onSetStreamStatus(status);mediaSource?.state(status);}} syncTarget={live.syncTarget} onSync={() => void live.onSync()} syncDisabled={!live.connected || live.syncing} onToggleMic={toggleMic} micMuted={voiceMuted} micLabel={voiceLabel} />
          ) : (
            <CinemaPlayer
              locked={syncPreview?.locked}
              overlay={syncPreview?.overlay}
              status={streamStatus}
              position={position}
              volume={volume}
              onPositionChange={(value) => { setPosition(value); syncPreview?.onPositionChange(value); }}
              onVolumeChange={setVolume}
              onToggleMute={toggleMute}
              onTogglePlay={() =>
                onSetStreamStatus(streamStatus === 'playing' ? 'paused' : 'playing')
              }
              onSkipBack={() => { const next = Math.max(0, position - 15); setPosition(next); syncPreview?.onPositionChange(next); }}
              onSkipForward={() =>
                { const next = Math.min(TOTAL_SECONDS, position + 15); setPosition(next); syncPreview?.onPositionChange(next); }
              }
            />
          ))}

          {hasPlayer ? syncPreview ? syncPreview.band : (
            <div className="sync-band">
              <div>
                {t("Local playback") && <span className="eyebrow">{t("Local playback")}</span>}
                <strong>{streamStatus === 'paused' ? t("Paused for you") : t("Playing for you")}</strong>
              </div>
              <Button
                variant="tonal"
                icon={<RefreshCw size={19} aria-hidden="true" />}
                onClick={live ? () => void live.onSync() : syncPlayback}
                disabled={live ? !live.connected || live.syncing : false}
              >
                {live?.syncing ? t("Syncing…") : t("Sync to room")}
              </Button>
            </div>
          ) : null}

          <div className="participants-compact">
            <ParticipantStrip participants={participants} voiceMembers={live?.voice.members} />
          </div>
          {chatPreview?.placement === 'dock' && chatPreview.content}
        </section>

        <aside className="party-support" aria-label={t("Party details")}>
          {syncPreview?.aside}
          {live?.chat && <PartyChat chat={live.chat} connected={live.connected && !live.leaving} />}
          {chatPreview?.placement === 'side' && chatPreview.content}
          <div className="participants-wide">
            <ParticipantStrip participants={participants} voiceMembers={live?.voice.members} />
          </div>

          <section className="voice-panel" aria-labelledby="voice-heading">
            <div>
              <span className="eyebrow">{t("Voice room")}</span>
              <h2 id="voice-heading" aria-live={voiceStatus === 'error' ? 'assertive' : 'polite'}>{voiceMessage}</h2>
              {voiceStatus === 'error' && live?.voice.error === 'WEBRTC_UNAVAILABLE' && <p>{t("Enable WebRTC in your browser settings or privacy extension, reload this page, and join voice again.")}</p>}
            </div>
            {voiceStatus === 'connecting' ? (
              <span className="md-loading__shape voice-panel__progress" role="progressbar" aria-label={t("Joining voice")} />
            ) : voiceStatus === 'off' || voiceStatus === 'error' ? (
              <Button onClick={joinVoice}>{t("Join voice")}</Button>
            ) : (
              <IconButton icon={voiceMuted ? MicOff : Mic} label={voiceLabel} variant="tonal" onClick={toggleMic} />
            )}
          </section>
          {live && retryVoiceAvailable && <Button variant="outlined" fullWidth onClick={live.onRetryVoice}>{t("Retry voice connections")}</Button>}
          {live?.voice.error?.includes('playback was blocked') && <Button variant="outlined" fullWidth onClick={live.onResumeVoice}>{t("Resume voice audio")}</Button>}


          {mediaSource?.active ? <section className="source-row"><div><span>{t(mediaSource.local?'Your local file':'Video source')}</span><strong><bdi>{mediaSource.local?mediaSource.name||t('None selected'):new URL(activeUrl).pathname.split('/').pop()}</bdi></strong></div>{(isOwner||mediaSource.local)&&<Button variant="text" disabled={mediaSource.busy||!live?.connected||live.groupSync?.committed} onClick={()=>isOwner?setChooseSourceOpen(true):mediaSource.choose()}>{t('Change')}</Button>}</section> : localFilePreview ? localFilePreview.source : hasPlayer ? (
            <section className="source-row" aria-label={t("Current video source")}>
              <div>
                <span>{t("Video source")}</span>
                <strong>{new URL(activeUrl).pathname.split('/').pop()}</strong>
              </div>
              <IconButton
                icon={copied ? ClipboardCheck : Clipboard}
                label={copied ? t("Link copied") : t("Copy video link")}
                onClick={copyUrl}
              />
            </section>
          ) : null}

          {localFilePreview ? localFilePreview.actions : isOwner && (hasPlayer || mediaSource?.active) ? (
            <Button
              variant="danger"
              icon={<Square size={18} aria-hidden="true" />}
              onClick={() => setAbortOpen(true)}
              fullWidth
            >
              {t("End stream for everyone")}</Button>
          ) : null}
        </aside>
      </main>
      {chatPreview?.placement === 'floating' && chatPreview.content}

      {mediaSource&&<ChooseVideoDialog open={chooseSourceOpen} busy={mediaSource.busy||!live?.connected} close={()=>setChooseSourceOpen(false)} file={mediaSource.replaceFile} stream={mediaSource.replace}/>}
      {live?.groupSync?.dialog}
      <BugReportDialog open={bugReportOpen} roomId={party.id} enabled={!!live} onClose={() => setBugReportOpen(false)} onSent={() => onNotify(t("Bug report sent. Thank you."))} />
      <Dialog
        open={inviteOpen}
        title={t("Invite friends")}
        onClose={() => setInviteOpen(false)}
        actions={
          <Button variant="text" onClick={() => setInviteOpen(false)}>
            {t("Done")}</Button>
        }
      >
        <p>{t("Share either option. Friends will preview the room before they join.")}</p>
        <section className="share-option" aria-labelledby="party-code-label">
          <label className="read-only-field">
            <span id="party-code-label">{t("Party code")}</span>
            <input value={partyCode} readOnly />
          </label>
          <Button
            variant="tonal"
            icon={
              inviteCopyState === 'code' ? (
                <ClipboardCheck size={18} aria-hidden="true" />
              ) : (
                <Clipboard size={18} aria-hidden="true" />
              )
            }
            onClick={() => void copyInvite(partyCode, 'code')}
          >
            {inviteCopyState === 'code' ? t("Code copied") : t("Copy code")}
          </Button>
        </section>
        <section className="share-option" aria-labelledby="invite-link-label">
          <label className="read-only-field">
            <span id="invite-link-label">{t("Invite link")}</span>
            <input value={inviteLink} readOnly />
          </label>
          <Button
            variant="outlined"
            icon={
              inviteCopyState === 'link' ? (
                <ClipboardCheck size={18} aria-hidden="true" />
              ) : (
                <Link2 size={18} aria-hidden="true" />
              )
            }
            onClick={() => void copyInvite(inviteLink, 'link')}
          >
            {inviteCopyState === 'link' ? t("Link copied") : t("Copy link")}
          </Button>
        </section>
        {inviteCopyState === 'error' ? (
          <StatusCard title={t("Unable to copy")} tone="error">
            {t("Select the code or link above to share it manually.")}</StatusCard>
        ) : null}
      </Dialog>

      <Dialog
        open={urlOpen}
        title={t("Current video link")}
        onClose={() => setUrlOpen(false)}
        actions={
          <Button
            variant="tonal"
            icon={copied ? <ClipboardCheck size={18} /> : <Clipboard size={18} />}
            onClick={copyUrl}
          >
            {copied ? t("Copied") : t("Copy link")}
          </Button>
        }
      >
        <label className="read-only-field">
          <span>{t("Direct video URL")}</span>
          <input value={activeUrl} readOnly />
        </label>
        {!isOwner ? (
          <p>
            {party.ownerPresent
              ? t('Only {name}, the room owner, can replace this link.', { name: party.ownerName })
              : t('This link stays locked until {name} returns.', { name: party.ownerName })}
          </p>
        ) : null}
      </Dialog>

      <Dialog
        open={leaveOpen}
        title={t("Leave this party?")}
        onClose={() => setLeaveOpen(false)}
        actions={
          <>
            <Button variant="text" onClick={() => setLeaveOpen(false)}>
              {t("Stay")}</Button>
            <Button variant="danger" onClick={onLeave} disabled={live?.leaving}>
              {live?.leaving ? t("Leaving…") : t("Leave party")}
            </Button>
          </>
        }
      >
        <p>
          {isOwner
            ? t("Your playback will stop. If others remain, the room stays open until you rejoin.")
            : t("Your playback will stop and you will return home.")}
        </p>
      </Dialog>

      <Dialog
        open={abortOpen}
        title={t("End the stream for everyone?")}
        onClose={() => !aborting && setAbortOpen(false)}
        actions={
          aborting ? (
            <LoadingIndicator label={t("Ending stream")} />
          ) : (
            <>
              <Button variant="text" onClick={() => setAbortOpen(false)}>
                {t("Cancel")}</Button>
              <Button
                variant="danger"
                onClick={async () => {
                  await onAbort();
                  setAbortOpen(false);
                  setUrlDraft('');
                }}
              >
                {t("End for everyone")}</Button>
            </>
          )
        }
      >
        <p>
          {t("This is different from pausing. The video will stop for every person in the room.")}</p>
      </Dialog>
    </div>
  );
}

function StreamEntry({
  fileAction,
  title,
  status,
  url,
  onUrlChange,
  onPaste,
  onStart,
  isOwner,
  ownerPresent,
  ownerName,
}: {
  fileAction?: ReactNode;
  title?: string;
  status: StreamStatus;
  url: string;
  onUrlChange: (value: string) => void;
  onPaste: () => void;
  onStart: () => void;
  isOwner: boolean;
  ownerPresent: boolean;
  ownerName: string;
}) {
  if (status === 'loading') {
    return (
      <div className="empty-cinema empty-cinema--loading">
        <CinemaScene quiet />
        <div className="empty-cinema__content">
          <LoadingIndicator label={t("Preparing the cinema")} />
          <p>{t("Opening the video on each device.")}</p>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="empty-cinema">
        <CinemaScene quiet />
        <div className="empty-cinema__content">
          <span className="eyebrow">{t("Waiting room")}</span>
          <h2>
            {ownerPresent
              ? t('{name} is choosing the next video', { name: ownerName })
              : t('Waiting for {name} to return', { name: ownerName })}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="empty-cinema">
      <CinemaScene quiet />
      <div className="empty-cinema__content">
        <span className="eyebrow">{t("Your cinema is empty")}</span>
        <h2>{title ?? t("Bring in a direct video link")}</h2>
        <TextField
          label={t("Direct video URL")}
          value={url}
          onChange={onUrlChange}
          placeholder="https://media.example.org/film.mp4"
          inputMode="url"
          error={status === 'error' ? t("Enter a complete web address for the video.") : undefined}
          trailing={
            <IconButton icon={Clipboard} label={t("Paste video link")} onClick={onPaste} />
          }
        />
        <div className={fileAction ? "cinema-source-actions" : undefined}>
        <Button
          icon={<Play size={19} fill="currentColor" aria-hidden="true" />}
          disabled={!url.trim()}
          onClick={onStart}
          fullWidth
        >
          {t("Start stream")}</Button>
        {fileAction}
        </div>
      </div>
    </div>
  );
}

function CinemaPlayer({
  locked = false,
  overlay,
  status,
  position,
  volume,
  onPositionChange,
  onVolumeChange,
  onToggleMute,
  onTogglePlay,
  onSkipBack,
  onSkipForward,
}: {
  locked?: boolean;
  overlay?: ReactNode;
  status: StreamStatus;
  position: number;
  volume: number;
  onPositionChange: (value: number) => void;
  onVolumeChange: (value: number) => void;
  onToggleMute: () => void;
  onTogglePlay: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
}) {
  const playerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFallbackFullscreen, setIsFallbackFullscreen] = useState(false);
  const paused = status === 'paused';
  const buffering = status === 'buffering';
  const VolumeIcon = volume === 0 ? VolumeX : volume < 55 ? Volume1 : Volume2;

  useEffect(() => {
    const handleFullscreenChange = () => {
      const playerIsFullscreen = document.fullscreenElement === playerRef.current;
      setIsFullscreen(playerIsFullscreen);
      if (playerIsFullscreen) setIsFallbackFullscreen(false);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (!isFallbackFullscreen) return;

    const previousOverflow = document.body.style.overflow;
    const exitFallbackFullscreen = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsFullscreen(false);
      setIsFallbackFullscreen(false);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', exitFallbackFullscreen);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', exitFallbackFullscreen);
    };
  }, [isFallbackFullscreen]);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement === playerRef.current) {
      await document.exitFullscreen();
      return;
    }

    if (isFallbackFullscreen) {
      setIsFullscreen(false);
      setIsFallbackFullscreen(false);
      return;
    }

    if (playerRef.current?.requestFullscreen) {
      try {
        await playerRef.current.requestFullscreen();
        return;
      } catch (handledError) {
        logHandledException("PartyScreen.CinemaPlayer.toggleFullscreen.4", handledError);
        // Embedded webviews may expose but reject the native API.
      }
    }

    setIsFullscreen(true);
    setIsFallbackFullscreen(true);
  };

  return (
    <div
      ref={playerRef}
      className={`cinema-player ${isFallbackFullscreen ? 'is-fullscreen' : ''}`}
      aria-label={t("Aurora Station video player")}
    >
      <div className="cinema-player__visual">
        <CinemaScene />
        {paused && !locked ? (
          <button className="player-big-play" onClick={onTogglePlay} aria-label={t("Play video")}>
            <Play size={34} fill="currentColor" aria-hidden="true" />
          </button>
        ) : null}
        {buffering ? (
          <div className="player-buffering" role="status">
            <span className="md-loading__shape" aria-hidden="true" />
            <span>{t("Buffering")}</span>
          </div>
        ) : null}
        {overlay}
      </div>

      <fieldset disabled={locked} className="player-controls" style={{ border: 0, margin: 0, minWidth: 0 }}>
        <label className="player-progress">
          <span className="sr-only">{t("Playback position")}</span>
          <input
            type="range"
            min="0"
            max={TOTAL_SECONDS}
            value={position}
            onChange={(event) => onPositionChange(Number(event.target.value))}
            style={{ '--range-progress': `${(position / TOTAL_SECONDS) * 100}%` } as React.CSSProperties}
          />
        </label>

        <div className="player-controls__row">
          <span className="player-time">
            {formatTime(position)} <span>/ {formatTime(TOTAL_SECONDS)}</span>
          </span>

          <div className="transport" role="group" aria-label={t("Playback controls")}>
            <IconButton icon={Rewind} label={t("Rewind 15 seconds")} onClick={onSkipBack} />
            <IconButton
              icon={paused ? Play : Pause}
              label={paused ? t("Play") : t("Pause")}
              variant="filled"
              onClick={onTogglePlay}
            />
            <IconButton
              icon={FastForward}
              label={t("Fast-forward 15 seconds")}
              onClick={onSkipForward}
            />
          </div>

          <div className="volume-control">
            <IconButton icon={VolumeIcon} label={volume === 0 ? t("Unmute video") : t("Mute video")} onClick={onToggleMute} />
            <label>
              <span className="sr-only">{t("Volume")}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(event) => onVolumeChange(Number(event.target.value))}
                style={{ '--range-progress': `${volume}%` } as React.CSSProperties}
              />
            </label>
            <IconButton
              icon={isFullscreen ? Minimize2 : Fullscreen}
              label={isFullscreen ? t("Exit fullscreen") : t("Enter fullscreen")}
              aria-pressed={isFullscreen}
              onClick={() => void toggleFullscreen()}
            />
          </div>
        </div>
      </fieldset>
    </div>
  );
}

function CinemaScene({ quiet = false }: { quiet?: boolean }) {
  return (
    <div className={`cinema-scene ${quiet ? 'cinema-scene--quiet' : ''}`} aria-hidden="true">
      <span className="cinema-scene__planet" />
      <span className="cinema-scene__star cinema-scene__star--one" />
      <span className="cinema-scene__star cinema-scene__star--two" />
      <span className="cinema-scene__star cinema-scene__star--three" />
      <span className="cinema-scene__ridge cinema-scene__ridge--back" />
      <span className="cinema-scene__ridge cinema-scene__ridge--front" />
      <span className="cinema-scene__station">
        <i />
        <i />
        <i />
      </span>
      {!quiet ? <strong>{t("AURORA STATION")}</strong> : null}
    </div>
  );
}

function ParticipantStrip({ participants, voiceMembers }: { participants: Party['participants']; voiceMembers?: VoiceState['members'] }) {
  return (
    <section className="participant-section" aria-labelledby="participants-title">
      <div className="participant-section__heading">
        <div>
          <span className="eyebrow">{t("Voice party")}</span>
          <h2 id="participants-title">{t("In the room")}</h2>
        </div>
        <span className="count-badge">{participants.length}</span>
      </div>
      <div className="participant-list">
        {participants.map((participant) => (
          <ParticipantItem key={participant.id} participant={participant} voiceConnection={voiceMembers?.[participant.id]?.connection} />
        ))}
      </div>
    </section>
  );
}
