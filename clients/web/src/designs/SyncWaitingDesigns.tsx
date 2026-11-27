import { useLayoutEffect, useState } from 'react';
import { Button } from '../components/Material';
import { GroupSyncDialog } from '../components/GroupSyncDialog';
import { PartyScreen } from '../screens/PartyScreen';
import { defaultIdentity, makePreviewParty } from '../previewStates';
import { setLanguage, useLanguage } from '../i18n';
import { useThemePalette } from '../theme';
import type { GroupSyncState } from '../data/groupSync';
import './sync-designs.css';
import './sync-waiting-designs.css';

export default function SyncWaitingDesigns() {
  const q = new URLSearchParams(location.search);
  const fa = useLanguage() === 'fa';
  const [theme, setTheme] = useState<'light' | 'dark'>(q.get('theme') === 'light' ? 'light' : 'dark');
  const [large, setLarge] = useState(q.get('scale') === 'large');
  const [variant, setVariant] = useState(q.get('variant') === 'pill' ? 'pill' : q.get('variant') === 'line' ? 'line' : 'inline');
  const [open, setOpen] = useState(true);
  const [accepted, setAccepted] = useState(true);
  useThemePalette(theme === 'dark');
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.textScale = large ? 'large' : 'standard';
    return () => { delete document.documentElement.dataset.textScale; };
  }, [theme, large]);
  const party = makePreviewParty('participant', defaultIdentity);
  const selfId = party.participants.find(p => p.isSelf)!.id;
  const ownerId = party.participants.find(p => p.isOwner)!.id;
  const state: GroupSyncState = {
    requestId: 'preview', streamSessionId: 'preview', streamRevision: 1,
    ownerMembershipId: ownerId, targetPositionMs: 1122000, createdAtMs: 0, revision: 1, phase: 'INVITING',
    participants: party.participants.map(p => ({ membershipId: p.id, response: p.isOwner || p.isSelf && accepted ? 'ACCEPTED' : 'PENDING', ready: false })),
  };
  return <div className="sync-designs">
    <div className="sync-preview-bar"><strong>{fa ? 'watchparty / انتظار هماهنگی' : 'watchparty / Waiting for sync'}</strong><div>
      <Button variant="text" onClick={() => setLanguage(fa ? 'English' : 'فارسی')}>{fa ? 'English' : 'فارسی'}</Button>
      <Button variant="text" aria-pressed={large} onClick={() => setLarge(!large)}>Aa+</Button>
      <Button onClick={() => { setAccepted(true); setOpen(true); }}>{fa ? 'نمایش دیالوگ' : 'Open dialog'}</Button>
    </div></div>
    <PartyScreen party={party} streamStatus={accepted ? 'paused' : 'playing'} theme={theme} aborting={false}
      onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      onStartStream={() => {}} onSetStreamStatus={() => {}} onAbort={async () => {}} onLeave={() => {}} onNotify={() => {}}
      syncPreview={{ locked: accepted, position: 1094, onPositionChange: () => {}, band: <div className="sync-entry"><Button variant="tonal" onClick={() => setOpen(true)}>{fa ? 'نمایش هماهنگی' : 'View sync'}</Button></div> }} />
    <GroupSyncDialog
      previewControls={<div className="wait-preview-controls"><label>{fa ? 'طرح' : 'Design'}<select aria-label={fa ? 'طرح انتظار' : 'Waiting design'} value={variant} onChange={event => { setVariant(event.target.value); const url = new URL(location.href); url.searchParams.set('variant', event.target.value); history.replaceState(null, '', url); }}>
        <option value="inline">{fa ? '۱ · ساده' : '1 · Inline'}</option><option value="pill">{fa ? '۲ · کپسولی' : '2 · Soft pill'}</option><option value="line">{fa ? '۳ · خطی' : '3 · Slim line'}</option>
      </select></label></div>}
      waitingIndicator={variant === 'inline' ? undefined : <div className={`wait-dialog-status wait-dialog-status--${variant}`} role="status">
        {variant === 'line' ? <span className="wait-dialog-line" aria-hidden="true"><i /></span> : <span className="group-sync-waiting__spinner" aria-hidden="true" />}
        <span>{variant === 'inline' ? (fa ? 'منتظر تصمیم میزبان…' : 'Waiting for the owner…') : variant === 'pill' ? (fa ? 'منتظریم میزبان شروع کنه' : 'Waiting for the owner to start') : (fa ? 'هر وقت میزبان شروع کنه، آماده‌ای' : 'Ready when the owner starts')}</span>
      </div>}
      open={open} owner={false} ownerName={party.ownerName} selfId={selfId} state={state} positionMs={1094000}
      members={party.participants.map(p => ({ membershipId: p.id, identityId: p.id, displayName: p.name, avatar: p.avatarId, isOwner: !!p.isOwner, present: true }))}
      busy={false} connected={true} close={() => setOpen(false)} ask={() => {}} commit={() => {}} cancel={() => {}}
      respond={value => { setAccepted(value === 'ACCEPTED'); if (value !== 'ACCEPTED') setOpen(false); }} />
  </div>;
}
