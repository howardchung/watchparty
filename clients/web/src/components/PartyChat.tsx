import { logHandledException } from '../data/sessionLog';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowDown, Check, ChevronDown, ChevronUp, MessageCircle, Send } from 'lucide-react';
import { t, useLanguage } from '../i18n';
import { deliverChat } from '../data/chatDelivery';
import { errorMessage } from '../data/api';
import { avatarId, type ChatMessage, type ChatPage } from '../data/contracts';
import { Avatar } from './Avatar';
import { Button, IconButton, LoadingIndicator } from './Material';
import './party-chat.css';

export interface ChatControls {
  identityId: string;
  history?: ChatPage;
  send(messageId: string, text: string): Promise<ChatMessage>;
  loadEarlier(): Promise<void>;
  refresh(): Promise<void>;
}
type Pending = { id: string; text: string; state: 'sending' | 'failed' | 'sent'; error?: string; accepted?: ChatMessage };
const normalize = (value: string) => value.replace(/\r\n?/g, '\n').trim();
export function PartyChat({ chat, connected }: { chat: ChatControls; connected: boolean }) {
  const language = useLanguage();
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState<Pending[]>([]);
  const [open, setOpen] = useState(true);
  const [unread, setUnread] = useState(0);
  const [atBottom, setAtBottom] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const feed = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const mounted = useRef(true);
  const delivery = useRef(new Map<string, AbortController>());
  const connection = useRef({ connected, chat });
  connection.current = { connected, chat };
  const remote = chat.history?.messages || [];
  const latestSeen = useRef(remote.at(-1)?.sequence || 0);
  const previousFeed = useRef<{ first?: string; height: number }>({ height: 0 });
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; delivery.current.forEach(controller => controller.abort()); delivery.current.clear(); }; }, []);
  useEffect(() => {
    const ids = new Set(remote.map(m => m.id));
    for (const id of ids) { delivery.current.get(id)?.abort(); delivery.current.delete(id); }
    setPending(current => current.filter(m => !ids.has(m.id)));
    const newer = remote.filter(m => m.sequence > latestSeen.current && m.identityId !== chat.identityId);
    if (newer.length && (!open || !atBottom)) setUnread(value => value + newer.length);
    if (newer.length) setNotice(t('New party message'));
    latestSeen.current = Math.max(latestSeen.current, remote.at(-1)?.sequence || 0);
  }, [chat.history, chat.identityId, open, atBottom]);
  useEffect(() => { if (open && atBottom) setUnread(0); }, [open, atBottom]);
  useLayoutEffect(() => {
    const el = feed.current;
    if (!el || !open) return;
    const before = previousFeed.current;
    const prepended = before.first && remote[0]?.id !== before.first && remote.some(m => m.id === before.first);
    if (prepended) el.scrollTop += el.scrollHeight - before.height;
    else if (atBottom) el.scrollTop = el.scrollHeight;
    previousFeed.current = { first: remote[0]?.id, height: el.scrollHeight };
  }, [chat.history, pending, open, atBottom]);
  async function send(retry?: Pending) {
    const text = retry?.text || normalize(draft);
    if (!text || text.length > 500 || (!retry && pending.length >= 20)) return;
    const message = retry || { id: crypto.randomUUID(), text, state: 'sending' as const };
    if (retry) setPending(current => current.map(m => m.id === retry.id ? { ...m, state: 'sending', error: undefined } : m));
    else { setPending(current => [...current, message]); setDraft(''); }
    setAtBottom(true); setEmojiOpen(false); composer.current?.focus();
    if (delivery.current.has(message.id)) return;
    const controller = new AbortController();
    delivery.current.set(message.id, controller);
    try {
      const accepted = await deliverChat(
        () => connection.current.chat.send(message.id, text),
        () => connection.current.connected && !!connection.current.chat.history,
        controller.signal,
      );
      if (mounted.current) {
        setPending(current => current.map(m => m.id === message.id ? { ...m, accepted, state: 'sent' } : m));
        setNotice(t('Message sent'));
      }
    } catch (error) {
      logHandledException("chat.send", error);
      if (controller.signal.aborted) return;
      if (mounted.current) setPending(current => current.map(m => m.id === message.id ? { ...m, state: 'failed', error: errorMessage(error) } : m));
    } finally {
      if (delivery.current.get(message.id) === controller) delivery.current.delete(message.id);
    }
  }
  async function history(refresh = false) {
    if (loadingMore) return;
    setLoadingMore(true); setHistoryError('');
    if (!refresh) setAtBottom(false);
    try { if (refresh) { await chat.refresh(); setAtBottom(true); } else await chat.loadEarlier(); }
    catch (error) { logHandledException("PartyChat.PartyChat.history.2", error);  if (mounted.current) setHistoryError(errorMessage(error)); }
    finally { if (mounted.current) setLoadingMore(false); }
  }
  const ids = new Set(remote.map(m => m.id));
  const outgoing = pending.filter(m => !ids.has(m.id));
  const confirmed = [...remote, ...outgoing.flatMap(m => m.accepted ? [m.accepted] : [])].sort((a, b) => a.sequence - b.sequence);
  const unsent = outgoing.filter(m => !m.accepted);
  const time = (value: string) => new Intl.DateTimeFormat(language, { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
  return <section className="chat-panel" aria-label={t('Party chat')} onKeyDown={event => {
    if (event.key === 'Escape') { setOpen(false); setEmojiOpen(false); toggle.current?.focus(); }
  }}>
    <header className="chat-panel__header"><span className="chat-panel__mark"><MessageCircle size={22} aria-hidden="true" /></span><div className="chat-panel__title"><h2>{t('Party chat')}</h2></div>
      {unread > 0 && <span className="chat-unread" aria-label={t('{count} unread messages', { count: unread })}>{unread}</span>}
      <button ref={toggle} type="button" className="md-icon-button" aria-label={open ? t('Collapse chat') : t('Open chat')} aria-expanded={open} aria-controls="party-chat-body" onClick={() => { setOpen(!open); setEmojiOpen(false); if (!open) setAtBottom(true); }}>{open ? <ChevronDown aria-hidden="true" /> : <ChevronUp aria-hidden="true" />}</button>
    </header>
    <div id="party-chat-body" className="chat-panel__body" hidden={!open}>
      <div className="chat-feed-wrap"><div ref={feed} className="chat-feed" role="log" aria-label={t('Chat messages')} aria-live="off" tabIndex={0} onScroll={event => { const el = event.currentTarget; setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 40); }}>
        {!chat.history && <div className="chat-empty"><LoadingIndicator label={t('Loading conversation…')} /><Button variant="text" disabled={!connected || loadingMore} onClick={() => void history(true)}>{t('Retry')}</Button></div>}
          {chat.history?.hasMore && <div className="chat-history"><Button variant="text" disabled={!connected || loadingMore} onClick={() => void history(remote.length >= 500)}>{loadingMore ? t('Loading…') : remote.length >= 500 ? t('Return to latest messages') : t('Load earlier messages')}</Button></div>}
          {chat.history && confirmed.length === 0 && unsent.length === 0 && <div className="chat-empty"><span className="chat-empty__icon"><MessageCircle aria-hidden="true" size={30} /></span><h3>{t('First word is yours')}</h3></div>}
          {confirmed.map((message, index) => {
            const self = message.identityId === chat.identityId;
            const first = confirmed[index - 1]?.identityId !== message.identityId;
            const last = confirmed[index + 1]?.identityId !== message.identityId && !(self && index === confirmed.length - 1 && unsent.length > 0);
            return <article key={message.id} className={`chat-message ${self ? 'chat-message--self' : ''} ${!first ? 'chat-message--continuation' : ''}`}>
              {!self && (first ? <Avatar avatarId={avatarId(message.avatar)} label={message.displayName} size="small" /> : <span className="chat-message__avatar-space" aria-hidden="true" />)}
              <div className="chat-message__main">{first && <div className="chat-message__meta"><strong><bdi>{self ? t('You') : message.displayName}</bdi></strong><time dateTime={message.createdAt}>{time(message.createdAt)}</time></div>}<p dir="auto" className="chat-message__bubble">{message.text}</p>{self && last && <div className="chat-delivery"><Check size={13} aria-hidden="true" />{t('Sent')}</div>}</div>
            </article>;
          })}
          {unsent.map((message, index) => {
            const first = index === 0 && confirmed.at(-1)?.identityId !== chat.identityId;
            return <article key={message.id} className={`chat-message chat-message--self ${!first ? 'chat-message--continuation' : ''}`}><div className="chat-message__main">{first && <div className="chat-message__meta"><strong>{t('You')}</strong></div>}<p dir="auto" className="chat-message__bubble">{message.text}</p><div className={`chat-delivery ${message.state === 'failed' ? 'chat-delivery--failed' : ''}`}>{message.state === 'failed' ? <><span>{t('Not sent')}</span><button onClick={() => void send(message)}>{t('Retry')}</button><button onClick={() => setPending(current => current.filter(m => m.id !== message.id))}>{t('Discard')}</button></> : t('Sending…')}</div>{message.error && <p className="chat-message__error" role="alert">{message.error}</p>}</div></article>;
          })}
      </div>{!atBottom && (confirmed.length > 0 || unsent.length > 0) && <button className="chat-latest" onClick={() => { setAtBottom(true); setUnread(0); }}><ArrowDown size={16} aria-hidden="true" />{t('Latest messages')}{unread > 0 ? ` · ${unread}` : ''}</button>}</div>
      {historyError && <div className="chat-history-error" role="alert"><p>{historyError}</p><Button variant="text" disabled={!connected || loadingMore} onClick={() => void history(!chat.history)}>{t('Retry')}</Button></div>}
      <form className="chat-composer" onSubmit={event => { event.preventDefault(); void send(); }}>
        {emojiOpen && <div className="chat-emoji" role="group" aria-label={t('Choose an emoji')}>{['🍿', '😂', '❤️', '✨', '😮'].map(emoji => <button key={emoji} type="button" aria-label={t('Add {emoji}', { emoji })} onClick={() => { setDraft(current => current.length + emoji.length <= 500 ? current + emoji : current); setEmojiOpen(false); composer.current?.focus(); }}>{emoji}</button>)}</div>}
        <div className="chat-composer__field"><label className="chat-sr-only" htmlFor="party-chat-draft">{t('Message the party')}</label><textarea ref={composer} id="party-chat-draft" rows={2} maxLength={500} dir="auto" placeholder={t('Message the party…')} value={draft} aria-describedby="party-chat-hint" onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && event.ctrlKey && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(); } }} />
          <div className="chat-composer__actions"><button className="md-icon-button" type="button" aria-label={t('Add emoji')} aria-expanded={emojiOpen} onClick={() => setEmojiOpen(!emojiOpen)}>☺</button><span>{draft.length > 400 ? `${draft.length}/500` : ''}</span><IconButton type="submit" icon={Send} label={t('Send message')} variant="filled" disabled={!normalize(draft) || pending.length >= 20} /></div></div>
        <span className="chat-composer__hint" id="party-chat-hint">{pending.length >= 20 ? t('Retry or discard pending messages to send more.') : t('Ctrl + Enter to send')}</span>
      </form>
    </div><span className="chat-sr-only" role="status">{notice}</span>
  </section>;
}
