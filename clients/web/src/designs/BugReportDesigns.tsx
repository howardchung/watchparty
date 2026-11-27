import { t } from '../i18n';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Bug, Check, ChevronRight, Ellipsis, Headphones, Moon, Play, Plus, Settings, Sun, Ticket } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { Button, Dialog, IconButton, StatusCard } from '../components/Material';
import './bug-reports.css';

const concepts = [
  { title: 'Quiet & familiar', place: '01 / SETTINGS ROW', description: 'A predictable home for feedback. One simple form.', detail: 'Best for a permanent, low-distraction action.' },
  { title: 'Right in the moment', place: '02 / PARTY MENU', description: 'Report a playback or voice issue without leaving the room.', detail: 'Best for reporting while the problem is happening.' },
  { title: 'Easy to find', place: '03 / HOME SHORTCUT', description: 'A small, visible invitation below the main actions.', detail: 'Best for an early release where feedback matters.' },
];
type ReportState = 'editing' | 'sending' | 'error' | 'success';
type Outcome = 'success' | 'error' | 'offline';

export default function BugReportDesigns() {
  const params = new URLSearchParams(location.search);
  const [theme, setTheme] = useState(params.get('theme') === 'dark' ? 'dark' : 'light');
  const [large, setLarge] = useState(params.get('scale') === 'large');
  const [rtl, setRtl] = useState(params.get('dir') === 'rtl');
  const [active, setActive] = useState<number | null>(null);
  const [menu, setMenu] = useState(false);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [expected, setExpected] = useState('');
  const [state, setState] = useState<ReportState>('editing');
  const [outcome, setOutcome] = useState<Outcome>('success');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.textScale = large ? 'large' : 'default';
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    return () => { document.documentElement.dir = 'ltr'; };
  }, [theme, large, rtl]);
  useEffect(() => () => clearTimeout(timer.current), []);
  const open = (index: number) => { setActive(index); setMenu(false); setState('editing'); };
  const close = () => { clearTimeout(timer.current); setActive(null); if (state === 'sending') setState('editing'); };
  const send = () => {
    setState('sending');
    timer.current = setTimeout(() => {
      setState(outcome === 'success' ? 'success' : 'error');
      if (outcome === 'success') { setDescription(''); setCategory(''); setExpected(''); }
    }, 900);
  };
  const canSend = !!description.trim() && (active !== 1 || !!category) && state !== 'sending' && outcome !== 'offline';

  return <main className="br-designs">
    <header className="br-intro">
      <div><p className="eyebrow">{t("watchparty")} / DESIGN EXPLORATION</p><h1>A little help. A better movie night.</h1><p>Three ways to report a bug. Tap an action to try its flow.</p></div>
      <div className="br-tools" aria-label="Preview settings">
        <Button variant="outlined" aria-pressed={large} onClick={() => setLarge(!large)}>Large text</Button>
        <Button variant="outlined" aria-pressed={rtl} onClick={() => setRtl(!rtl)}>RTL</Button>
        <IconButton icon={theme === 'dark' ? Sun : Moon} label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
      </div>
    </header>
    <div className="br-grid">
      {concepts.map((concept, index) => <section className="br-concept" key={concept.title} aria-labelledby={`br-title-${index}`}>
        <div className="br-caption"><p className="eyebrow">{concept.place}</p><h2 id={`br-title-${index}`}>{concept.title}</h2><p>{concept.description}</p></div>
        <div className="br-phone">
          <div className="br-appbar">{index === 0 && <ArrowLeft aria-hidden="true" />}<strong>{index === 0 ? 'Your profile' : index === 1 ? 'Friday night crew' : t('watchparty')}</strong>{index === 1 ? <IconButton icon={Ellipsis} label="Party options" aria-expanded={menu} onClick={() => setMenu(!menu)} /> : <Settings size={22} aria-hidden="true" />}</div>
          {index === 0 ? <div className="br-context">
            <div className="br-profile"><Avatar avatarId="comet" label="Spider-Man" size="large" /><div><small>Ready to watch</small><strong>Spider-Man</strong></div></div>
            <div className="br-setting"><span>Display name</span><strong>Spider-Man</strong></div><div className="br-setting"><span>Avatar</span><div className="br-avatars"><Avatar avatarId="comet" label="Comet" /><Avatar avatarId="mint" label="Mint" /><Avatar avatarId="sunny" label="Sunny" /></div></div><div className="br-setting"><span>App language</span><strong>English</strong></div>
            <p className="eyebrow br-support-heading">HELP & FEEDBACK</p>
            <button className="br-report-row" onClick={() => open(0)}><Bug aria-hidden="true" /><span><strong>Report a bug</strong><small>Tell us what went wrong</small></span><ChevronRight className="br-forward" aria-hidden="true" /></button>
          </div> : index === 1 ? <div className="br-context">
            <div className="br-scene"><span className="br-planet" /><Play size={32} aria-hidden="true" /><span>Sintel · 12:48 / 14:48</span></div>
            <div className="br-room-heading"><Headphones size={20} aria-hidden="true" /><strong>Talk with the room</strong></div><p className="br-muted">Voice connected · Mic muted</p><div className="br-avatars"><Avatar avatarId="comet" label="You" /><Avatar avatarId="mint" label="Sam" /><Avatar avatarId="sunny" label="Alex" /></div>
            <div className="br-room-note">Your playback. Your pace.</div>
            {menu && <div className="br-menu"><p className="eyebrow">PARTY OPTIONS</p><button className="br-report-row" onClick={() => open(1)}><Bug aria-hidden="true" /><span><strong>Report a bug</strong><small>Keep your party open</small></span></button></div>}
            {!menu && <p className="br-menu-hint">Try the ••• menu above</p>}
          </div> : <div className="br-context br-home">
            <h3>Stream and chill</h3><div className="br-profile"><Avatar avatarId="comet" label="Spider-Man" size="large" /><div><small>Watching as</small><strong>Spider-Man</strong></div></div>
            <div className="br-static-actions" aria-label="Home screen context"><span className="md-button md-button--filled"><Plus size={20} aria-hidden="true" />Create a party</span><span className="md-button md-button--tonal"><Ticket size={20} aria-hidden="true" />Join with code</span></div>
            <div className="br-home-report"><Bug size={20} aria-hidden="true" /><span>Something not working?</span><Button variant="text" onClick={() => open(2)}>Report a bug <ArrowRight size={16} className="br-forward" aria-hidden="true" /></Button></div>
          </div>}
        </div><p className="br-verdict">{concept.detail}</p>
      </section>)}
    </div>
    <footer className="br-footer"><span>Interactive concepts · No reports are sent.</span><label>Simulate submission <select value={outcome} onChange={e => { setOutcome(e.target.value as Outcome); setState('editing'); }}><option value="success">Success</option><option value="error">Send failure</option><option value="offline">Offline</option></select></label></footer>
    <div className={`br-report-modal br-report-modal--${active}`}>
      <Dialog open={active !== null} title={state === 'success' ? t('Thanks for helping watchparty') : 'Report a bug'} onClose={close} actions={state === 'success' ? <Button onClick={close}>Done</Button> : <><Button variant="text" onClick={close}>{state === 'sending' ? 'Cancel' : 'Close'}</Button><Button disabled={!canSend} onClick={send}>{state === 'sending' ? 'Sending…' : state === 'error' ? 'Try again' : 'Send report'}</Button></>}>
        {state === 'success' ? <div className="br-success"><span><Check size={32} aria-hidden="true" /></span><p role="status">Your report would be sent here.</p><p className="br-muted">This was a preview. Nothing was submitted.</p></div> : <div className="br-form">
          <p>{active === 1 ? 'What went wrong in your party?' : active === 2 ? 'Help us understand what happened.' : 'Something not working? Tell us about it.'}</p>
          {active === 1 && <fieldset disabled={state === 'sending'}><legend>Where is the problem?</legend><div className="br-categories">{['Video', 'Voice', 'Joining', 'Other'].map(value => <Button key={value} variant="outlined" aria-pressed={category === value} onClick={() => setCategory(value)}>{value}</Button>)}</div></fieldset>}
          <label className="br-field">{active === 2 ? 'What happened?' : 'Describe the problem'}<textarea value={description} disabled={state === 'sending'} maxLength={2000} onChange={e => { setDescription(e.target.value); if (state === 'error') setState('editing'); }} placeholder={active === 1 ? 'I joined voice but couldn’t hear my friends…' : 'What were you doing, and what went wrong?'} /></label>
          {active === 2 && <label className="br-field">What did you expect? <small>Optional</small><textarea className="br-short-field" value={expected} disabled={state === 'sending'} maxLength={1000} onChange={e => setExpected(e.target.value)} placeholder="What should have happened?" /></label>}
          <p className="br-muted">Please leave out passwords, private links, and personal details.</p>
          {outcome === 'offline' && <StatusCard tone="error" title="You’re offline">Your draft stays here. Reconnect before sending.</StatusCard>}
          {state === 'sending' && <StatusCard loading title="Sending your report…" />}
          {state === 'error' && <StatusCard tone="error" title="Couldn’t send your report">Your draft is still here. Try again.</StatusCard>}
          <p className="br-preview-note">Design preview · Submission is simulated.</p>
        </div>}
      </Dialog>
    </div>
  </main>;
}
