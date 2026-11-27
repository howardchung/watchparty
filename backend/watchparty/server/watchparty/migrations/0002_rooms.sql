CREATE TABLE rooms (
 id uuid PRIMARY KEY, code text NOT NULL UNIQUE CHECK(code ~ '^[0-9A-HJKMNP-TV-Z]{8}$'), title text NOT NULL,
 owner_identity_id uuid NOT NULL REFERENCES identities(id), created_at timestamptz NOT NULL DEFAULT now(),
 ended_at timestamptz, tombstone_until timestamptz, event_sequence bigint NOT NULL DEFAULT 0
);
CREATE TABLE memberships (
 id uuid PRIMARY KEY, room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
 identity_id uuid NOT NULL REFERENCES identities(id), display_name text NOT NULL, avatar text NOT NULL,
 is_owner boolean NOT NULL, joined_at timestamptz NOT NULL DEFAULT now(), left_at timestamptz,
 grace_expires_at timestamptz, UNIQUE(room_id,identity_id)
);
CREATE UNIQUE INDEX memberships_one_active_identity ON memberships(identity_id) WHERE left_at IS NULL;
CREATE INDEX memberships_grace ON memberships(grace_expires_at) WHERE left_at IS NULL;
CREATE TABLE role_leases (
 membership_id uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
 role text NOT NULL CHECK(role IN ('room','voice')), generation uuid NOT NULL, instance_id uuid NOT NULL,
 expires_at timestamptz NOT NULL, PRIMARY KEY(membership_id,role)
);
CREATE TABLE streams (
 room_id uuid PRIMARY KEY REFERENCES rooms(id) ON DELETE CASCADE, id uuid NOT NULL, session_id uuid NOT NULL,
 revision bigint NOT NULL CHECK(revision>0), state text NOT NULL CHECK(state IN ('ACTIVE','ABORTED')),
 url text NOT NULL, started_at timestamptz NOT NULL, aborted_at timestamptz, updated_at timestamptz NOT NULL
);
CREATE TABLE outbox_events (
 id uuid PRIMARY KEY, room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
 sequence bigint NOT NULL, topic text NOT NULL, payload jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), published_at timestamptz, UNIQUE(room_id,sequence)
);
CREATE INDEX outbox_pending ON outbox_events(created_at,room_id,sequence) WHERE published_at IS NULL;
CREATE TABLE idempotency_records (
 identity_id uuid NOT NULL REFERENCES identities(id), key text NOT NULL, fingerprint text NOT NULL,
 status integer NOT NULL, response jsonb NOT NULL, expires_at timestamptz NOT NULL,
 PRIMARY KEY(identity_id,key)
);
CREATE INDEX idempotency_expiration ON idempotency_records(expires_at);
