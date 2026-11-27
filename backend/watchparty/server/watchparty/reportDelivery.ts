import { sanitizeReportDescription, safeClientInfo, safeReportLog } from './reportPrivacy.ts';
import { logHandledException } from './diagnostics.ts';
import type { ReportScreenshot } from './bugReports.ts';
import type { Pool } from 'pg';
interface ReportRow {
  report_id: string; description: string; client_info: Record<string, string>;
  app_log: string; screenshots?: ReportScreenshot[]; sentry_attempts: number;
}
/** Explicit transport acknowledges HTTP acceptance rather than SDK enqueue. */
export function feedbackEnvelope(report: ReportRow, dsn: string, environment: string): Buffer {
  const eventId = report.report_id.replaceAll('-', '');
  const feedback = JSON.stringify({
    event_id: eventId, type: 'feedback', environment,
    contexts: { feedback: { message: sanitizeReportDescription(report.description), source: 'custom' },
      client: safeClientInfo(report.client_info) },
    tags: { report_id: report.report_id, source: 'manual-report' },
  });
  const log = Buffer.from(safeReportLog(report.app_log), 'utf8');
  return Buffer.concat([
    Buffer.from(JSON.stringify({ event_id: eventId, dsn }) + '\n' + JSON.stringify({ type: 'feedback', length: Buffer.byteLength(feedback) }) + '\n' + feedback + '\n'),
    Buffer.from(JSON.stringify({ type: 'attachment', length: log.length, filename: 'session.log', content_type: 'text/plain', attachment_type: 'event.attachment' }) + '\n'),
    log, Buffer.from('\n'),
    ...(report.screenshots ?? []).flatMap((screenshot, index) => {
      const data = Buffer.from(screenshot.data, 'base64');
      const extension = screenshot.contentType === 'image/png' ? 'png' : screenshot.contentType === 'image/jpeg' ? 'jpg' : 'webp';
      return [Buffer.from(JSON.stringify({type: 'attachment', length: data.length, filename: `screenshot-${index + 1}.${extension}`, content_type: screenshot.contentType, attachment_type: 'event.attachment'}) + '\n'), data, Buffer.from('\n')];
    }),
  ]);
}
export class ReportDelivery {
  private timer?: ReturnType<typeof setInterval>;
  private flight?: Promise<void>;
  private stopped = false;
  private pausedUntil = 0;
  private db: Pool;
  private dsn?: string;
  private send: typeof fetch;
  constructor(db: Pool, dsn = process.env.SENTRY_DSN, send: typeof fetch = fetch) {
    this.db = db; this.dsn = dsn; this.send = send;
  }
  start() {
    if (!this.dsn) return;
    this.timer = setInterval(() => this.tick(), 5000);
    this.timer.unref(); this.tick();
  }
  private tick() {
    if (!this.stopped && !this.flight) {
      this.flight = this.deliverDue().catch((handledError) => {
        logHandledException("reportDelivery.tick.1", handledError);
        console.error(JSON.stringify({event:'report_delivery_failed'}));
      }).finally(() => { this.flight = undefined; });
    }
  }
  async stop() { this.stopped = true; clearInterval(this.timer); await this.flight; }
  async deliverDue() {
    if (!this.dsn || Date.now() < this.pausedUntil) return;
    const dsn = new URL(this.dsn);
    const project = dsn.pathname.split('/').pop();
    if (!project || dsn.protocol !== 'https:') throw new Error('Invalid Sentry DSN');
    const endpoint = new URL(`/api/${project}/envelope/`, dsn.origin);
    const rows = await this.db.query<ReportRow>(`SELECT report_id,description,client_info,app_log,screenshots,sentry_attempts
      FROM bug_reports WHERE sentry_delivered_at IS NULL AND sentry_next_attempt_at <= now()
      AND created_at > now()-interval '30 days' ORDER BY sentry_next_attempt_at LIMIT 5`);
    for (const row of rows.rows) {
      if (this.stopped) break;
      let retryAfter = 0;
      try {
        const response = await this.send(endpoint, { method: 'POST',
          headers: {'Content-Type':'application/x-sentry-envelope',
            'X-Sentry-Auth': `Sentry sentry_version=7,sentry_key=${dsn.username},sentry_client=watchparty-report-delivery/1.0`},
          body: new Uint8Array(feedbackEnvelope(row, this.dsn, process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development')),
          signal: AbortSignal.timeout(10000),
        });
        const retry = response.headers.get('retry-after');
        if (retry) retryAfter = Number.isFinite(Number(retry)) ? Number(retry) : Math.max(0, (Date.parse(retry) - Date.now()) / 1000);
        for (const limit of (response.headers.get('x-sentry-rate-limits') || '').split(',')) {
          const seconds = Number(limit.split(':')[0]);
          if (Number.isFinite(seconds)) retryAfter = Math.max(retryAfter, seconds);
        }
        await response.arrayBuffer();
        if (!response.ok) throw new Error('Sentry rejected report');
        await this.db.query('UPDATE bug_reports SET sentry_delivered_at=now(),sentry_attempts=sentry_attempts+1 WHERE report_id=$1', [row.report_id]);
      } catch (handledError) {
        logHandledException("reportDelivery.deliverDue.2", handledError);
        const delay = Math.max(Math.min(86400, retryAfter || 0), Math.min(3600, 15 * 2 ** Math.min(row.sentry_attempts, 8)));
        await this.db.query("UPDATE bug_reports SET sentry_attempts=sentry_attempts+1,sentry_next_attempt_at=now()+$2*interval '1 second' WHERE report_id=$1", [row.report_id, delay]);
        if (retryAfter > 0) { this.pausedUntil = Date.now() + delay * 1000; break; }
      }
    }
  }
}
