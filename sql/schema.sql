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
CREATE UNIQUE INDEX on room(LOWER(vanity)) WHERE vanity IS NOT NULL;
CREATE INDEX on room(owner) WHERE owner IS NOT NULL;
CREATE INDEX on room("creationTime");
CREATE INDEX on room USING GIN("roomId" gin_trgm_ops);

CREATE TABLE subscriber(
  "customerId" text,
  email text,
  status text,
  uid text,
  PRIMARY KEY(uid)
);

CREATE TABLE link_account(
  uid text,
  kind text,
  accountid text,
  accountname text,
  discriminator text,
  PRIMARY KEY(uid, kind)
);

CREATE TABLE active_user(
  uid text,
  "lastActiveTime" timestamp with time zone,
  PRIMARY KEY(uid)
);

CREATE TABLE vbrowser(
  id bigserial PRIMARY KEY, -- numeric sequence ID
  pool text NOT NULL, -- name of the pool this VM is in, e.g. HetznerLargeUS
  vmid text NOT NULL, -- identifier for the VM, only unique across a provider
  state text NOT NULL, -- available, staging, used
  "creationTime" timestamp with time zone NOT NULL, -- time the VM was created
  "heartbeatTime" timestamp with time zone, -- last time a room reported this VM was in use
  "assignTime" timestamp with time zone, -- last time the room was assigned
  "roomId" text, -- room VM assigned to
  uid text, -- user requesting the VM
  data json, -- metadata for the VM
  retries int DEFAULT 0, -- how many times we checked if VM is up
  pass text, -- password to access vbrowser
  image text -- ID of the last image applied to this VM
);
CREATE UNIQUE INDEX on vbrowser(pool, vmid);
CREATE INDEX on vbrowser(pool, state);
CREATE INDEX on vbrowser("roomId");
CREATE INDEX on vbrowser(uid);
