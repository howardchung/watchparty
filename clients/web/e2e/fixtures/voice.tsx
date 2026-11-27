import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PartyScreen } from '../../src/screens/PartyScreen';
import type { VoiceState } from '../../src/data/voice';
import '../../src/styles.css';

const query = new URLSearchParams(location.search);
const theme = query.get('theme') === 'dark' ? 'dark' : 'light';
document.documentElement.dataset.theme = theme;
document.documentElement.dir = query.get('dir') || 'ltr';
if (query.get('large')) document.documentElement.style.fontSize = '24px';
const noop = async () => {};

function VoiceFixture() {
  const [voice, setVoice] = useState<VoiceState>({
    status: (query.get('status') || 'degraded') as VoiceState['status'],
    muted: true,
    members: query.get('status') && !query.has('unavailable') ? {} : {
      self: { muted: true, speaking: false, connection: 'connected' },
      mira: { muted: false, speaking: false, connection: 'reconnecting' },
      jo: { muted: true, speaking: false, connection: 'unavailable' },
    },
    error: query.get('error') || undefined,
  });
  return <PartyScreen
    party={{ id: 'VOICE-31', title: 'Friday night screening', role: 'owner', ownerName: 'Nika', ownerPresent: true,
      participants: [
        { id: 'self', name: 'Nika', avatarId: 'mint', isSelf: true, isOwner: true, isMuted: voice.muted },
        { id: 'mira', name: 'Mira', avatarId: 'sunny', isMuted: false },
        { id: 'jo', name: 'Jo', avatarId: 'berry', isMuted: true },
      ], streamUrl: query.has('player') ? 'https://media.example.test/movie.mp4' : '',
    }}
    streamStatus={query.has('player') ? 'playing' : 'empty'} theme={theme} aborting={false}
    onToggleTheme={() => {}} onStartStream={() => {}} onSetStreamStatus={() => {}}
    onAbort={noop} onLeave={() => {}} onNotify={() => {}}
    live={{ connected: !query.has('offline'), leaving: false, voice,
      onToggleVoice: async () => {
        if (voice.status === 'off' || voice.status === 'error') {
          document.documentElement.dataset.joined = 'true';
          setVoice({ status: 'connected', muted: true, members: {} });
        } else setVoice(current => ({ ...current, muted: !current.muted }));
      },
      onRetryVoice: () => { document.documentElement.dataset.retried = 'true'; },
      onResumeVoice: () => { document.documentElement.dataset.resumed = 'true'; },
      onSync: noop, syncing: false, onReport: () => {},
    }}
  />;
}
createRoot(document.getElementById('root')!).render(<VoiceFixture />);
