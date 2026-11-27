-- Existing product rows remain; credentials and ownership are intentionally not imported.
ALTER TABLE identities DROP COLUMN firebase_uid;
CREATE TABLE guest_sessions (
 id uuid PRIMARY KEY,
 identity_id uuid NOT NULL REFERENCES identities(id),
 refresh_hash text NOT NULL UNIQUE,
 created_at timestamptz NOT NULL DEFAULT now(),
 refresh_expires_at timestamptz NOT NULL,
 revoked_at timestamptz
);
CREATE INDEX guest_sessions_identity ON guest_sessions(identity_id);
CREATE TABLE access_credentials (
 token_hash text PRIMARY KEY,
 session_id uuid NOT NULL REFERENCES guest_sessions(id) ON DELETE CASCADE,
 expires_at timestamptz NOT NULL
);
CREATE INDEX access_credentials_session ON access_credentials(session_id);
CREATE INDEX access_credentials_expiry ON access_credentials(expires_at);
