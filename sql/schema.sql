CREATE TABLE room(
  roomId text,
  creationTime timestamp with time zone,
  password text,
  owner text,
  vanity text,
  is_chat_enabled boolean DEFAULT true,
  PRIMARY KEY (roomId)
);

CREATE UNIQUE INDEX on room (LOWER(vanity)) WHERE vanity IS NOT NULL;
CREATE INDEX on room(owner) WHERE owner IS NOT NULL;