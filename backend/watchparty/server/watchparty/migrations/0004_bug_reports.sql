CREATE TABLE bug_reports (
 report_id uuid PRIMARY KEY, identity_id uuid NOT NULL, room_id uuid NOT NULL,
 description text NOT NULL, client_info jsonb NOT NULL, session_started_at timestamptz NOT NULL,
 app_log text NOT NULL, payload_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX bug_reports_identity_created ON bug_reports(identity_id, created_at);
CREATE INDEX bug_reports_created ON bug_reports(created_at);
