import './bug-report.css';
import { logHandledException } from '../data/sessionLog';
import { t } from '../i18n';
import { useEffect, useRef, useState } from 'react';
import { Button, Dialog, StatusCard } from './Material';
import { readScreenshots, type ReportScreenshot } from '../data/reportScreenshots';
import { errorMessage, request } from '../data/api';
import { diagnosticEvent, diagnosticError, browserInfo, sessionLog, sessionStartedAt } from '../data/sessionLog';

export function BugReportDialog({ open, roomId, onClose, onSent, enabled }: {open: boolean; roomId?: string; onClose: () => void; onSent: () => void; enabled: boolean}) {
  const [screenshots, setScreenshots] = useState<ReportScreenshot[]>([]);
  const [reading, setReading] = useState(false);
  const [attachmentError, setAttachmentError] = useState('');
  const selecting = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [online, setOnline] = useState(navigator.onLine);
  const pending = useRef<{description: string; payload: Record<string, unknown>} | null>(null);
  const inFlight = useRef(false);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update); window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);
  const selectScreenshots = async (files: File[]) => {
    if (inFlight.current || selecting.current || !files.length) return;
    selecting.current = true; setReading(true); setAttachmentError('');
    try { setScreenshots(await readScreenshots(files, screenshots)); pending.current = null; }
    catch (failure) { logHandledException('BugReportDialog.selectScreenshots', failure); setAttachmentError(t(failure instanceof Error ? failure.message : 'Couldn’t read the screenshot. Try selecting it again.')); }
    finally { selecting.current = false; setReading(false); }
  };
  const pasteScreenshot = async () => {
    if (inFlight.current || selecting.current) return;
    selecting.current = true; setReading(true); setAttachmentError('');
    let files: File[] = [];
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find(type => ['image/png', 'image/jpeg', 'image/webp'].includes(type));
        if (type) files.push(new File([await item.getType(type)], 'clipboard', {type}));
      }
      if (!files.length) setAttachmentError(t('No image on the clipboard. Copy an image, then try again.'));
    } catch (failure) { logHandledException('BugReportDialog.pasteScreenshot', failure); setAttachmentError(t('Clipboard access failed. Use Ctrl/Cmd+V or attach an image file.')); }
    finally { selecting.current = false; setReading(false); }
    if (files.length) await selectScreenshots(files);
  };
  const send = async () => {
    const text = description.trim();
    if (!text || !online || selecting.current || inFlight.current || !enabled) return;
    diagnosticEvent('report.send', { retry: pending.current?.description === text });
    inFlight.current = true; setSending(true); setError('');
    try {
      if (pending.current?.description !== text) pending.current = {description: text, payload: {reportId: crypto.randomUUID(), description: text, clientInfo: browserInfo(), sessionStartedAt, log: sessionLog(), ...(screenshots.length ? {screenshots} : {})}};
      await request(roomId ? `/v1/rooms/${encodeURIComponent(roomId)}/bug-reports` : "/v1/bug-reports", pending.current.payload);
      diagnosticEvent('report.accepted');
      pending.current = null; setDescription(''); setScreenshots([]); setAttachmentError(''); onClose(); onSent();
    } catch (failure) { logHandledException("BugReportDialog.BugReportDialog.send.1", failure);  diagnosticEvent('report.failure', { code: diagnosticError(failure) }); setError(errorMessage(failure)); }
    finally { inFlight.current = false; setSending(false); }
  };
  return <Dialog className="bug-report-dialog" open={open} title={t("Report a bug")} onClose={() => { if (!inFlight.current && !selecting.current) onClose(); }} actions={<>
    <Button variant="text" disabled={sending || reading} onClick={onClose}>{t("Cancel")}</Button>
    <Button disabled={!enabled || !description.trim() || sending || reading || !online} onClick={() => void send()}>{sending ? t("Sending…") : t("Send")}</Button>
  </>}>
    <div className="bug-report-editor" onPaste={event => {
      const files = Array.from(event.clipboardData.items).filter(item => item.kind === 'file' && item.type.startsWith('image/')).map(item => item.getAsFile()).filter((file): file is File => file !== null);
      if (files.length) { event.preventDefault(); void selectScreenshots(files); }
    }}>
    <label className="bug-report-field"><span>{t("What went wrong?")}</span><textarea dir="auto" autoFocus rows={7} maxLength={8000} value={description} disabled={sending || reading} onChange={event => { setDescription(event.target.value); setError(''); }} placeholder={t("Describe the bug and what you were doing…")} /></label>
    <div className="bug-report-screenshots">
      <input ref={fileInput} hidden type="file" accept="image/png,image/jpeg,image/webp" multiple disabled={sending || reading} onChange={event => { const files = Array.from(event.target.files ?? []); event.target.value = ''; void selectScreenshots(files); }} />
      <Button variant="outlined" disabled={sending || reading || screenshots.length >= 3} onClick={() => fileInput.current?.click()}>{t("Attach screenshots")}</Button>
      <Button variant="outlined" disabled={sending || reading || screenshots.length >= 3} onClick={() => void pasteScreenshot()}>{t("Paste screenshot")}</Button>
      <p>{t("Optional · PNG, JPEG, or WebP · Up to 3 images, 5 MiB total")}</p>
      {reading && <p role="status">{t("Reading screenshots…")}</p>}
      {screenshots.map((image, index) => <figure key={index}>
        <img src={`data:${image.contentType};base64,${image.data}`} alt={t("Screenshot {number}", {number: index + 1})} />
        <figcaption><span>{t("Screenshot {number}", {number: index + 1})}</span><Button variant="text" disabled={sending || reading} onClick={() => { setScreenshots(screenshots.filter((_, i) => i !== index)); pending.current = null; setAttachmentError(''); }}>{t("Remove screenshot {number}", {number: index + 1})}</Button></figcaption>
      </figure>)}
      {attachmentError && <p role="alert">{attachmentError}</p>}
    </div>
    </div>
    {!online && <p role="status">{t("You’re offline. Your draft is kept. Reconnect to send.")}</p>}
    {error && <StatusCard title={t("Report wasn’t sent")} tone="error">{error} {t("Your draft is kept; try Send again.")}</StatusCard>}
  </Dialog>;
}
