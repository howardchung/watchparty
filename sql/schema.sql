CREATE TABLE room(
  roomId text,
  creationTime timestamp with time zone,
  password text,
  owner text,
  vanity text,
  PRIMARY KEY (roomId)
);

CREATE UNIQUE INDEX on room(vanity) WHERE vanity IS NOT NULL;
CREATE INDEX on room(owner) WHERE owner IS NOT NULL;