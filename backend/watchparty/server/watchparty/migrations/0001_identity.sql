CREATE TABLE identities (
  id uuid PRIMARY KEY,
  firebase_uid text NOT NULL UNIQUE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 48),
  avatar text NOT NULL CHECK (octet_length(avatar) BETWEEN 1 AND 32),
  language text NOT NULL CHECK (octet_length(language) BETWEEN 1 AND 16),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
