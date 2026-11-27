-- Insertion and enqueue happen in the same transaction.
ALTER TABLE bug_reports ADD COLUMN sentry_delivered_at timestamptz;
ALTER TABLE bug_reports ADD COLUMN sentry_attempts integer NOT NULL DEFAULT 0;
ALTER TABLE bug_reports ADD COLUMN sentry_next_attempt_at timestamptz;
-- Leave historical reports unqueued; only newly submitted reports are forwarded.
ALTER TABLE bug_reports ALTER COLUMN sentry_next_attempt_at SET DEFAULT now();
CREATE INDEX bug_reports_pending_delivery ON bug_reports(sentry_next_attempt_at)
 WHERE sentry_delivered_at IS NULL;
