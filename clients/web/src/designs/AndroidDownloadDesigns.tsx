import { t } from '../i18n';
import { useEffect, useState } from 'react';
import { ArrowDownToLine, ArrowUpRight, Headphones, Mic, Moon, Plus, Settings, Smartphone, Sun, Ticket, X } from 'lucide-react';
import { Button, Dialog, IconButton } from '../components/Material';
import { Avatar } from '../components/Avatar';
import './android-downloads.css';

const concepts = [
  { title: 'Compact banner', placement: '01 / HOME' },
  { title: 'Download row', placement: '02 / HOME' },
  { title: 'Inline link', placement: '03 / VOICE' },
];

export default function AndroidDownloadDesigns() {
  const params = new URLSearchParams(location.search);
  const [theme, setTheme] = useState(params.get('theme') === 'dark' ? 'dark' : 'light');
  const [large, setLarge] = useState(params.get('scale') === 'large');
  const [rtl, setRtl] = useState(params.get('dir') === 'rtl');
  const [dismissed, setDismissed] = useState(false);
  const [download, setDownload] = useState(false);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.textScale = large ? 'large' : 'default';
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    return () => { document.documentElement.dir = 'ltr'; };
  }, [theme, large, rtl]);
  const cta = () => <Button variant="tonal" aria-label="Download native Android app" icon={<ArrowDownToLine size={18} aria-hidden="true" />} onClick={() => setDownload(true)}>Download</Button>;

  return <main className="ad-designs">
    <header className="ad-intro">
      <div><p className="eyebrow">{t("watchparty")} / DESIGN PREVIEW</p><h1>Android app links</h1></div>
      <div className="ad-tools" aria-label="Preview settings">
        <Button variant="outlined" aria-pressed={large} onClick={() => setLarge(!large)}>Large text</Button>
        <Button variant="outlined" aria-pressed={rtl} onClick={() => setRtl(!rtl)}>RTL</Button>
        <IconButton icon={theme === 'dark' ? Sun : Moon} label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
      </div>
    </header>
    <div className="ad-grid">
      {concepts.map((concept, index) => <section className="ad-concept" key={concept.title} aria-labelledby={`concept-${index}`}>
        <div className="ad-caption"><p className="eyebrow">{concept.placement}</p><h2 id={`concept-${index}`}>{concept.title}</h2></div>
        <div className="ad-phone">
          <div className="ad-appbar"><strong>{t("watchparty")}</strong><Settings size={21} aria-hidden="true" /></div>
          {index < 2 ? <div className="ad-home-context">
            <h3>Stream and chill</h3>
            <div className="identity-pill"><Avatar avatarId="comet" label="Mira" size="large" /><div><span>Watching as</span><strong>Mira</strong></div></div>
            <div className="ad-context-actions" aria-label="Home screen context"><span className="md-button md-button--filled"><Plus size={20} aria-hidden="true" />Create a party</span><span className="md-button md-button--tonal"><Ticket size={20} aria-hidden="true" />Join with code</span></div>
          </div> : <div className="ad-room-context">
            <div className="ad-scene" aria-label="Movie preview illustration"><span className="ad-moon" /><span className="ad-ridge" /><span className="ad-scene-label">Mira’s late show</span></div>
            <p className="eyebrow">THE VOICE PARTY</p><h3>Talk with the room</h3><p>4 friends, one movie night.</p>
            <div className="ad-people"><Avatar avatarId="comet" label="Mira" /><Avatar avatarId="mint" label="Sam" /><Avatar avatarId="sunny" label="Alex" /><Avatar avatarId="berry" label="You" /></div>
            <div className="ad-voice-state"><span><Mic size={20} aria-hidden="true" /> Voice connected</span><span className="ad-muted">Muted</span></div>
          </div>}
          {index === 0 && <div className="ad-promo-space">{dismissed ? <Button variant="text" onClick={() => setDismissed(false)}>Show Android invitation</Button> : <aside className="ad-banner" aria-label="Android app invitation">
            <div className="ad-banner-heading"><Smartphone size={20} aria-hidden="true" /><strong>Native Android app</strong><IconButton icon={X} label="Dismiss Android invitation" onClick={() => setDismissed(true)} /></div>
            <div className="ad-banner-bottom"><p>Background voice party</p>{cta()}</div>
          </aside>}</div>}
          {index === 1 && <aside className="ad-download-row" aria-label="Android app download">
            <Smartphone size={24} aria-hidden="true" /><div><strong>Native Android app</strong><p>Background voice party</p></div><IconButton icon={ArrowDownToLine} variant="tonal" label="Download native Android app" onClick={() => setDownload(true)} />
          </aside>}
          {index === 2 && <aside className="ad-context-promo" aria-label="Background voice on Android">
            <p><Headphones size={18} aria-hidden="true" /> Background voice party</p><Button variant="text" aria-label="Download native Android app" onClick={() => setDownload(true)}>Native Android app <ArrowUpRight size={18} aria-hidden="true" /></Button>
          </aside>}
        </div>
      </section>)}
    </div>
    <footer className="ad-footer">Preview only · Download URL pending.</footer>
    <Dialog open={download} title="Android download preview" onClose={() => setDownload(false)} actions={<Button onClick={() => setDownload(false)}>Back to designs</Button>}><p>This is a design preview. The chosen button will link to the approved Android app download. No download has started.</p></Dialog>
  </main>;
}
