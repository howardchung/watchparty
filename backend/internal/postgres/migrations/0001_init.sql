-- 0001_init.sql

CREATE TABLE IF NOT EXISTS identities (
    id text PRIMARY KEY,
    name text NOT NULL,
    avatar text NOT NULL,
    language text NOT NULL,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS refresh_sessions (
    id text PRIMARY KEY,
    identity_id text NOT NULL REFERENCES identities (id) ON DELETE CASCADE,
    token_hash text NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    revoked_at timestamptz,
    created_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS refresh_sessions_identity_idx ON refresh_sessions (identity_id);

CREATE TABLE IF NOT EXISTS rooms (
    id text PRIMARY KEY,
    code text NOT NULL UNIQUE,
    title text NOT NULL,
    owner_identity_id text NOT NULL REFERENCES identities (id),
    created_at timestamptz NOT NULL,
    ended_at timestamptz,
    tombstone_until timestamptz
);

CREATE INDEX IF NOT EXISTS rooms_owner_idx ON rooms (owner_identity_id);

CREATE TABLE IF NOT EXISTS memberships (
    id text PRIMARY KEY,
    room_id text NOT NULL REFERENCES rooms (id) ON DELETE CASCADE,
    identity_id text NOT NULL REFERENCES identities (id),
    display_name text NOT NULL,
    avatar text NOT NULL,
    is_owner boolean NOT NULL DEFAULT false,
    joined_at timestamptz NOT NULL,
    left_at timestamptz,
    grace_expires_at timestamptz,
    ws_connected boolean NOT NULL DEFAULT false,
    livekit_connected boolean NOT NULL DEFAULT false,
    UNIQUE (room_id, identity_id)
);

CREATE INDEX IF NOT EXISTS memberships_identity_idx ON memberships (identity_id);

CREATE TABLE IF NOT EXISTS streams (
    room_id text PRIMARY KEY REFERENCES rooms (id) ON DELETE CASCADE,
    id text NOT NULL,
    session_id text NOT NULL,
    revision bigint NOT NULL,
    state text NOT NULL,
    url text NOT NULL,
    started_at timestamptz,
    aborted_at timestamptz,
    updated_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS outbox_events (
    id text PRIMARY KEY,
    room_id text NOT NULL REFERENCES rooms (id) ON DELETE CASCADE,
    topic text NOT NULL,
    payload jsonb NOT NULL,
    created_at timestamptz NOT NULL,
    published_at timestamptz
);

CREATE INDEX IF NOT EXISTS outbox_unpublished_idx
    ON outbox_events (created_at)
    WHERE published_at IS NULL;

CREATE TABLE IF NOT EXISTS idempotency_records (
    identity_id text NOT NULL,
    key text NOT NULL,
    status int NOT NULL,
    response bytea NOT NULL,
    created_at timestamptz NOT NULL,
    PRIMARY KEY (identity_id, key)
);
