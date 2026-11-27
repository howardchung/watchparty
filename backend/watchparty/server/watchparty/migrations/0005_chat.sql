CREATE TABLE chat_messages (
 room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
 id uuid NOT NULL, identity_id uuid NOT NULL REFERENCES identities(id),
 membership_id uuid NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
 display_name text NOT NULL, avatar text NOT NULL,
 text text NOT NULL CHECK(char_length(text) BETWEEN 1 AND 500),
 sequence bigint NOT NULL CHECK(sequence > 0),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 PRIMARY KEY(room_id,id), UNIQUE(room_id,sequence)
);
CREATE INDEX chat_messages_rate ON chat_messages(room_id,identity_id,created_at);
