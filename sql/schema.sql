CREATE TABLE room(
  "roomId" text,
  "creationTime" timestamp with time zone,
  password text,
  owner text,
  vanity text,
  "isChatDisabled" boolean,
  "isSubRoom" boolean,
  PRIMARY KEY ("roomId")
);

CREATE TABLE subscriber(
  "customerId" text,
  email text,
  status text,
  uid text,
  PRIMARY KEY(uid)
);

CREATE UNIQUE INDEX on room (LOWER(vanity)) WHERE vanity IS NOT NULL;
CREATE INDEX on room(owner) WHERE owner IS NOT NULL;