CREATE EXTENSION pg_trgm;

CREATE TABLE room(
  "roomId" text,
  "creationTime" timestamp with time zone,
  password text,
  owner text,
  vanity text,
  "isChatDisabled" boolean,
  "isSubRoom" boolean,
  data jsonb,
  "lastUpdateTime" timestamp with time zone,
  "roomTitle" text,
  "roomDescription" text,
  "roomTitleColor" text,
  "mediaPath" text,
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
CREATE INDEX on room("creationTime");
CREATE INDEX on room USING GIN("roomId" gin_trgm_ops);