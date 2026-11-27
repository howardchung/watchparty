import { logHandledException } from './data/sessionLog';
import { avatarName } from './data/avatarCatalog';
import { t, setLanguage, useLanguage } from './i18n';
import { useThemePalette } from './theme';
import { useEffect, useMemo, useState } from 'react';
import { Snackbar } from './components/Material';
import { fakePartyRepository, getMockPartyPreview } from './data/fakeRepository';
import {
  defaultIdentity,
  makePreviewParty,
  makePreviewRoom,
  previewStates,
} from './previewStates';
import { HomeScreen } from './screens/HomeScreen';
import { PartyManagerScreen, type ManagerMode } from './screens/PartyManagerScreen';
import { PartyScreen } from './screens/PartyScreen';
import { RoomPreviewScreen } from './screens/RoomPreviewScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import type {
  Identity,
  JoinStatus,
  Party,
  PartyPreview,
  Screen,
  StreamStatus,
} from './types';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  const queryTheme = new URLSearchParams(window.location.search).get('theme');
  if (queryTheme === 'dark' || queryTheme === 'light') return queryTheme;
  const saved = window.localStorage.getItem('roomio-theme');
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function PreviewApp() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const preview = previewStates[params.get('preview') || ''];
  const inviteCode = params.get('invite');
  const invitedRoom = inviteCode ? getMockPartyPreview(inviteCode) : null;
  const language = useLanguage();
  const initialIdentity: Identity = {
    ...defaultIdentity,
    language: language === 'fa' ? 'فارسی' : 'English',
    ...preview?.identity,
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const palette = useThemePalette(theme === 'dark');
  const [screen, setScreen] = useState<Screen>(
    preview?.screen || (inviteCode ? (invitedRoom ? 'room-preview' : 'party-manager') : 'home'),
  );
  const [identity, setIdentity] = useState<Identity>({ ...initialIdentity, name: avatarName(initialIdentity.avatarId, initialIdentity.language) });
  const [managerMode, setManagerMode] = useState<ManagerMode>(
    preview?.joinStatus || inviteCode ? 'join' : 'create',
  );
  const [joinStatus, setJoinStatus] = useState<JoinStatus>(
    preview?.joinStatus || (inviteCode && !invitedRoom ? 'error' : 'idle'),
  );
  const [streamStatus, setStreamStatus] = useState<StreamStatus>(
    preview?.streamStatus || 'empty',
  );
  const [party, setParty] = useState<Party | null>(() =>
    preview?.screen === 'party'
      ? makePreviewParty(
          preview.role || 'owner',
          initialIdentity,
          preview.roomPreview !== 'owner-absent',
        )
      : null,
  );
  const [partyPreview, setPartyPreview] = useState<PartyPreview | null>(() =>
    preview?.screen === 'room-preview'
      ? makePreviewRoom(preview.roomPreview)
      : invitedRoom,
  );
  const [returnableParty, setReturnableParty] = useState<Party | null>(null);
  const [aborting, setAborting] = useState(false);
  const [snackbar, setSnackbar] = useState('');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.textScale =
      params.get('largeText') === '1' ? 'large' : 'standard';
    window.localStorage.setItem('roomio-theme', theme);
  }, [params, theme]);

  useEffect(() => {
    if (!snackbar) return;
    const timer = window.setTimeout(() => setSnackbar(''), 3200);
    return () => window.clearTimeout(timer);
  }, [snackbar]);

  const toggleTheme = () => setTheme((current) => (current === 'light' ? 'dark' : 'light'));

  const openManager = (mode: ManagerMode) => {
    setManagerMode(mode);
    setJoinStatus('idle');
    setScreen('party-manager');
  };

  const createParty = async () => {
    setJoinStatus('loading');
    const created = await fakePartyRepository.create(identity);
    setParty(created);
    setStreamStatus('empty');
    setJoinStatus('idle');
    setScreen('party');
  };

  const previewParty = async (code: string) => {
    setJoinStatus('loading');
    try {
      const nextPreview = await fakePartyRepository.preview(code);
      setPartyPreview(nextPreview);
      setJoinStatus('idle');
      setScreen('room-preview');
    } catch (handledError) {
      logHandledException("PreviewApp.PreviewApp.previewParty.1", handledError);
      setJoinStatus('error');
    }
  };

  const joinParty = async () => {
    if (!partyPreview) return;
    setJoinStatus('loading');
    try {
      const joined = await fakePartyRepository.join(partyPreview.id, identity);
      setParty(joined);
      setStreamStatus(joined.streamUrl ? 'playing' : 'empty');
      setJoinStatus('idle');
      setScreen('party');
    } catch (handledError) {
      logHandledException("PreviewApp.PreviewApp.joinParty.2", handledError);
      setJoinStatus('error');
    }
  };

  const startStream = async (url: string) => {
    if (!party) return;
    setStreamStatus('loading');
    try {
      const normalizedUrl = await fakePartyRepository.startStream(url);
      setParty({ ...party, streamUrl: normalizedUrl });
      setStreamStatus('playing');
      setSnackbar(t("Stream started for the room"));
    } catch (handledError) {
      logHandledException("PreviewApp.PreviewApp.startStream.3", handledError);
      setStreamStatus('error');
    }
  };

  const abortStream = async () => {
    setAborting(true);
    await fakePartyRepository.abortStream();
    setParty((current) => (current ? { ...current, streamUrl: '' } : current));
    setStreamStatus('empty');
    setAborting(false);
    setSnackbar(t("Stream ended for everyone"));
  };

  const leaveParty = () => {
    if (party?.role === 'owner') {
      setReturnableParty({
        ...party,
        ownerPresent: false,
        participants: party.participants.filter((participant) => !participant.isSelf),
      });
    }
    setParty(null);
    setStreamStatus('empty');
    setJoinStatus('idle');
    setScreen('home');
    setSnackbar(
      party?.role === 'owner'
        ? t("Your room stays open until you return")
        : t("You left the party"),
    );
  };

  const rejoinOwnedParty = () => {
    if (!returnableParty) return;
    setParty({
      ...returnableParty,
      role: 'owner',
      ownerName: identity.name || returnableParty.ownerName,
      ownerPresent: true,
      participants: [
        {
          id: 'self',
          name: identity.name || returnableParty.ownerName,
          avatarId: identity.avatarId,
          isOwner: true,
          isSelf: true,
        },
        ...returnableParty.participants,
      ],
    });
    setStreamStatus(returnableParty.streamUrl ? 'playing' : 'empty');
    setReturnableParty(null);
    setScreen('party');
    setSnackbar(t("You are back as the room owner"));
  };

  return (
    <div className="app-shell">
      {screen === 'home' ? (
        <HomeScreen
          identity={identity}
          theme={theme}
          onToggleTheme={toggleTheme}
          onSettings={() => setScreen('settings')}
          onCreate={() => openManager('create')}
          onJoin={() => openManager('join')}
          returnableParty={returnableParty}
          onReturnToParty={rejoinOwnedParty}
        />
      ) : null}

      {screen === 'settings' ? (
        <SettingsScreen
          palette={palette}
          identity={identity}
          theme={theme}
          onToggleTheme={toggleTheme}
          onBack={() => setScreen('home')}
          onSave={(nextIdentity) => {
            setLanguage(nextIdentity.language);
            setIdentity(nextIdentity);
            setScreen('home');
            setSnackbar(t("Profile updated"));
          }}
        />
      ) : null}

      {screen === 'party-manager' ? (
        <PartyManagerScreen
          initialMode={managerMode}
          joinStatus={joinStatus}
          theme={theme}
          onToggleTheme={toggleTheme}
          onBack={() => setScreen('home')}
          onCreate={createParty}
          onPreview={previewParty}
          onResetError={() => setJoinStatus('idle')}
        />
      ) : null}

      {screen === 'room-preview' && partyPreview ? (
        <RoomPreviewScreen
          preview={partyPreview}
          joinStatus={joinStatus}
          theme={theme}
          onToggleTheme={toggleTheme}
          onBack={() => {
            setJoinStatus('idle');
            setScreen('party-manager');
            setManagerMode('join');
          }}
          onJoin={joinParty}
        />
      ) : null}

      {screen === 'party' && party ? (
        <PartyScreen
          party={party}
          streamStatus={streamStatus}
          theme={theme}
          aborting={aborting}
          onToggleTheme={toggleTheme}
          onStartStream={startStream}
          onSetStreamStatus={setStreamStatus}
          onAbort={abortStream}
          onLeave={leaveParty}
          onNotify={setSnackbar}
        />
      ) : null}

      <Snackbar message={snackbar} onDismiss={() => setSnackbar('')} />
    </div>
  );
}
