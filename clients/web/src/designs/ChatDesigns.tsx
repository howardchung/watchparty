import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowDown, Check, ChevronDown, ChevronUp, Columns2, MessageCircle, PanelBottom, PanelsTopLeft, Send, WifiOff } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { Button, IconButton, LoadingIndicator, Snackbar } from '../components/Material';
import { PartyScreen } from '../screens/PartyScreen';
import { defaultIdentity, makePreviewParty } from '../previewStates';
import { setLanguage, useLanguage } from '../i18n';
import { useThemePalette } from '../theme';
import type { AvatarId, StreamStatus } from '../types';
import './chat-designs.css';

type Variation = 'side' | 'dock' | 'floating';
type Scene = 'populated' | 'empty' | 'loading' | 'error' | 'offline';
type Message = { id: number; name: string; avatar: AvatarId; text: string; self?: boolean; state?: 'sending' | 'failed' | 'sent' };
const concepts = [
  { id: 'side', icon: Columns2, title: ['Side by side', 'کنار هم'], description: ['A seat for the conversation. Keep the movie and the room in view.', 'جایی برای گپ؛ فیلم و دوستانت را کنار هم ببین.'] },
  { id: 'dock', icon: PanelBottom, title: ['Chat dock', 'گپ زیر فیلم'], description: ['Movie up top. Conversation below. A little more room for every message.', 'فیلم بالا، گپ پایین؛ فضای بیشتر برای پیام‌ها.'] },
  { id: 'floating', icon: PanelsTopLeft, title: ['Floating chat', 'گپ شناور'], description: ['Drop into the conversation, then tuck it away and enjoy the movie.', 'وارد گپ شو، بعد جمعش کن و فیلم را ببین.'] },
] as const;
const initialMessages = (): Message[] => [
  { id: 1, name: 'Ellis', avatar: 'sunny', text: 'Okay, snacks acquired. I’m ready 🍿' },
  { id: 2, name: 'Jo', avatar: 'berry', text: 'The colours in this scene are unreal.' },
  { id: 3, name: 'Nika', avatar: 'comet', text: 'Right? This is the part I wanted you to see.', self: true, state: 'sent' },
  { id: 4, name: 'Ellis', avatar: 'sunny', text: 'No spoilers! I’m going in completely blind.' },
];

export default function ChatDesigns() {
  const params = new URLSearchParams(location.search);
  const language = useLanguage();
  const fa = language === 'fa';
  const copy = (en: string, persian: string) => fa ? persian : en;
  const [variation, setVariation] = useState<Variation>(() => concepts.find(c => c.id === params.get('variant'))?.id || 'side');
  const [theme, setTheme] = useState<'light' | 'dark'>(params.get('theme') === 'light' ? 'light' : 'dark');
  const [large, setLarge] = useState(params.get('scale') === 'large');
  const [rtl, setRtl] = useState(params.get('dir') === 'rtl' || fa);
  const [scene, setScene] = useState<Scene>('populated');
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState(true);
  const [unread, setUnread] = useState(0);
  const [status, setStatus] = useState<StreamStatus>('playing');
  const [snackbar, setSnackbar] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const [announcement, setAnnouncement] = useState('');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const feed = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const nextId = useRef(100);
  useThemePalette(theme === 'dark');
  const concept = concepts.find(c => c.id === variation)!;
  const party = makePreviewParty('owner', defaultIdentity);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.textScale = large ? 'large' : 'standard';
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
  }, [theme, large, rtl, language]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    if (!snackbar) return;
    const timer = setTimeout(() => setSnackbar(''), 3200);
    return () => clearTimeout(timer);
  }, [snackbar]);
  useLayoutEffect(() => {
    if (open && atBottom && feed.current) feed.current.scrollTop = feed.current.scrollHeight;
  }, [messages, open, atBottom, variation, scene]);
  useEffect(() => {
    if (open && atBottom) setUnread(0);
  }, [open, atBottom]);

  function changeVariation(value: Variation) {
    setVariation(value);
    const url = new URL(location.href);
    url.searchParams.set('variant', value);
    history.replaceState(null, '', url);
  }
  function changeScene(value: Scene) {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setScene(value);
    setUnread(0);
    setAtBottom(true);
    setMessages(value === 'empty' || value === 'loading' ? [] : value === 'error'
      ? [...initialMessages(), { id: ++nextId.current, name: 'Nika', avatar: 'comet', text: copy('Wait, did anyone else see that?', 'صبر کن، شما هم دیدین؟'), self: true, state: 'failed' }]
      : initialMessages());
  }
  function send(text = draft, retryId?: number) {
    const body = text.trim();
    if (!body || scene === 'offline' || scene === 'loading') return;
    const id = retryId ?? ++nextId.current;
    if (retryId) setMessages(current => current.map(m => m.id === id ? { ...m, state: 'sending' } : m));
    else {
      setMessages(current => [...current, { id, name: 'Nika', avatar: 'comet', text: body, self: true, state: 'sending' }]);
      setDraft('');
    }
    setAtBottom(true);
    setEmojiOpen(false);
    composer.current?.focus();
    const fails = scene === 'error' && !retryId;
    timers.current.push(setTimeout(() => {
      setMessages(current => current.map(m => m.id === id ? { ...m, state: fails ? 'failed' : 'sent' } : m));
      setAnnouncement(fails ? copy('Message not sent. Retry available.', 'پیام ارسال نشد. دوباره تلاش کن.') : copy('Message sent in preview.', 'پیام در پیش‌نمایش ارسال شد.'));
    }, 650));
  }
  function incoming() {
    if (scene === 'loading') changeScene('populated');
    setMessages(current => [...current, { id: ++nextId.current, name: 'Jo', avatar: 'berry', text: copy('That shot! Can we just appreciate it for a second? ✨', 'این صحنه! یک لحظه ازش لذت ببریم ✨') }]);
    if (!open || !atBottom) setUnread(current => current + 1);
    setAnnouncement(copy('New message from Jo.', 'پیام جدید از Jo.'));
  }
  const toggleOpen = () => { setOpen(!open); setEmojiOpen(false); if (!open) { setAtBottom(true); setUnread(0); } };
  const jumpToLatest = () => { setAtBottom(true); setUnread(0); };
  const chat = <section className={`chat-panel chat-panel--${variation} ${open ? 'is-open' : 'is-collapsed'}`} aria-label={copy('Party chat', 'گپ دورهمی')}
    onKeyDown={event => { if (event.key === 'Escape') { setOpen(false); setEmojiOpen(false); toggle.current?.focus(); } }}>
    <header className="chat-panel__header">
      <span className="chat-panel__mark"><MessageCircle size={22} aria-hidden="true" /></span>
      <div className="chat-panel__title"><h2>{copy('Party chat', 'گپ دورهمی')}</h2><span>{open ? copy('Three friends. One good movie.', 'سه دوست، یک فیلم خوب.') : copy('The conversation is right here', 'گپ همین‌جاست')}</span></div>
      {unread > 0 && <span className="chat-unread" aria-label={copy(`${unread} unread messages`, `${unread} پیام خوانده‌نشده`)}>{unread}</span>}
      <button ref={toggle} type="button" className="md-icon-button" aria-label={open ? copy('Collapse chat', 'جمع کردن گپ') : copy('Open chat', 'باز کردن گپ')} aria-expanded={open} aria-controls="chat-body" onClick={toggleOpen}>
        {open ? <ChevronDown aria-hidden="true" size={22} /> : <ChevronUp aria-hidden="true" size={22} />}
      </button>
    </header>
    <div id="chat-body" className="chat-panel__body" hidden={!open}>
      <div className="chat-feed-wrap">
        <div ref={feed} className="chat-feed" role="log" aria-label={copy('Chat messages', 'پیام‌های گپ')} aria-live="off" tabIndex={0}
          onScroll={event => { const el = event.currentTarget; setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 40); }}>
          {scene === 'loading' ? <div className="chat-empty"><LoadingIndicator label={copy('Loading conversation…', 'در حال بارگذاری گپ…')} /><Button variant="text" onClick={() => changeScene('populated')}>{copy('Finish loading', 'نمایش گپ')}</Button></div>
            : messages.length === 0 ? <div className="chat-empty"><span className="chat-empty__icon"><MessageCircle size={30} aria-hidden="true" /></span><h3>{copy('First word is yours', 'اولین پیام با تو')}</h3></div>
            : <><div className="chat-start"><span />{copy('Tonight’s conversation', 'گپ امشب')}<span /></div>
              {messages.map(message => <article key={message.id} className={`chat-message ${message.self ? 'chat-message--self' : ''}`}>
                {!message.self && <Avatar avatarId={message.avatar} label={message.name} size="small" />}
                <div className="chat-message__main"><div className="chat-message__meta"><strong><bdi>{message.self ? copy('You', 'تو') : message.name}</bdi></strong><span>{message.id <= 4 ? '20:42' : '20:43'}</span></div>
                  <p dir="auto" className="chat-message__bubble">{message.text}</p>
                  {message.self && <div className={`chat-delivery ${message.state === 'failed' ? 'chat-delivery--failed' : ''}`}>
                    {message.state === 'failed' ? <><span>{copy('Not sent', 'ارسال نشد')}</span><button disabled={scene === 'offline'} onClick={() => send(message.text, message.id)}>{copy('Retry', 'تلاش مجدد')}</button></>
                      : message.state === 'sending' ? copy('Sending…', 'در حال ارسال…') : <><Check size={13} aria-hidden="true" />{copy('Sent', 'ارسال شد')}</>}
                  </div>}
                </div>
              </article>)}
            </>}
        </div>
        {!atBottom && messages.length > 0 && <button className="chat-latest" onClick={jumpToLatest}><ArrowDown size={16} aria-hidden="true" />{copy('Latest messages', 'تازه‌ترین پیام‌ها')}{unread > 0 ? ` · ${unread}` : ''}</button>}
      </div>
      {scene === 'offline' && <div className="chat-offline" role="status"><WifiOff size={18} aria-hidden="true" /><span>{copy('Offline. Your draft stays here.', 'آفلاین هستی. پیش‌نویس اینجا می‌ماند.')}</span><Button variant="text" onClick={() => setScene('populated')}>{copy('Reconnect', 'اتصال مجدد')}</Button></div>}
      <form className="chat-composer" onSubmit={event => { event.preventDefault(); send(); }}>
        {emojiOpen && <div className="chat-emoji" role="group" aria-label={copy('Choose an emoji', 'انتخاب ایموجی')}>{['🍿', '😂', '❤️', '✨', '😮'].map(emoji => <button key={emoji} type="button" aria-label={copy(`Add ${emoji}`, `افزودن ${emoji}`)} onClick={() => { setDraft(current => current + emoji); setEmojiOpen(false); composer.current?.focus(); }}>{emoji}</button>)}</div>}
        <div className="chat-composer__field"><label className="chat-sr-only" htmlFor="chat-draft">{copy('Message the party', 'پیام به دورهمی')}</label>
          <textarea ref={composer} id="chat-draft" rows={2} maxLength={500} dir="auto" placeholder={copy('Message the party…', 'پیامی برای دورهمی…')} value={draft} disabled={scene === 'loading'} aria-describedby="chat-composer-hint" onChange={event => setDraft(event.target.value)}
            onKeyDown={event => { if (event.key === 'Enter' && event.ctrlKey && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(); } }} />
          <div className="chat-composer__actions"><button className="md-icon-button" type="button" aria-label={copy('Add emoji', 'افزودن ایموجی')} aria-expanded={emojiOpen} disabled={scene === 'loading'} onClick={() => setEmojiOpen(!emojiOpen)}>☺</button><span>{draft.length > 400 ? `${draft.length}/500` : ''}</span><IconButton type="submit" icon={Send} label={copy('Send message', 'ارسال پیام')} variant="filled" disabled={!draft.trim() || scene === 'offline' || scene === 'loading'} /></div>
        </div>
        <span className="chat-composer__hint" id="chat-composer-hint">{copy('Ctrl + Enter to send', 'ارسال با Ctrl + Enter')}</span>
      </form>
    </div>
  </section>;

  return <div className={`chat-designs chat-designs--${variation}`}>
    <section className="chat-preview-bar" aria-label={copy('Chat design preview', 'پیش‌نمایش طراحی گپ')}>
      <div className="chat-preview-bar__intro"><span className="eyebrow">{copy('DESIGN PREVIEW / PARTY CHAT', 'پیش‌نمایش طراحی / گپ دورهمی')}</span><p>{copy('Same movie. Three ways to hang out.', 'یک فیلم، سه راه برای دورهمی.')}</p><span className="chat-preview-label">{copy('Local demo · Messages aren’t shared', 'نمایش محلی · پیام‌ها به اشتراک گذاشته نمی‌شوند')}</span></div>
      <nav className="chat-concepts" aria-label={copy('Chat variations', 'طرح‌های گپ')}>{concepts.map((item, index) => <button key={item.id} aria-pressed={variation === item.id} onClick={() => changeVariation(item.id)}><item.icon size={19} aria-hidden="true" /><span><small>0{index + 1}</small>{item.title[fa ? 1 : 0]}</span>{variation === item.id && <Check size={16} aria-hidden="true" />}</button>)}</nav>
      <div className="chat-preview-tools"><label>{copy('State', 'وضعیت')}<select aria-label={copy('Preview state', 'وضعیت پیش‌نمایش')} value={scene} onChange={event => changeScene(event.target.value as Scene)}>{(['populated', 'empty', 'loading', 'error', 'offline'] as const).map((value, index) => <option key={value} value={value}>{(fa ? ['گپ', 'خالی', 'بارگذاری', 'خطای ارسال', 'آفلاین'] : ['Conversation', 'Empty', 'Loading', 'Send failure', 'Offline'])[index]}</option>)}</select></label><Button variant="text" onClick={incoming}>{copy('+ Incoming message', '+ پیام جدید')}</Button><Button variant="text" aria-pressed={large} onClick={() => setLarge(!large)}>Aa</Button><Button variant="text" aria-pressed={rtl} onClick={() => setRtl(!rtl)}>RTL</Button><Button variant="outlined" onClick={() => { setLanguage(fa ? 'English' : 'فارسی'); setRtl(!fa); }}>{fa ? 'English' : 'فارسی'}</Button></div>
    </section>
    <div className="chat-direction"><span className="chat-direction__number">0{concepts.indexOf(concept) + 1}</span><div><h1>{concept.title[fa ? 1 : 0]}</h1><p>{concept.description[fa ? 1 : 0]}</p></div></div>
    <PartyScreen party={party} streamStatus={status} theme={theme} aborting={false} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} onStartStream={() => setStatus('playing')} onSetStreamStatus={setStatus} onAbort={async () => setStatus('empty')} onLeave={() => setSnackbar(copy('You’re in a preview. Switch designs above to keep exploring.', 'این یک پیش‌نمایش است. طرح‌ها را از بالا عوض کن.'))} onNotify={setSnackbar} chatPreview={{ placement: variation, content: chat }} />
    <span className="chat-sr-only" role="status">{announcement}</span>
    <Snackbar message={snackbar} onDismiss={() => setSnackbar('')} />
  </div>;
}
