# Migrated VPS deployment

The active stack is Node/PostgreSQL/Caddy/Coturn with backend-owned automatic
guest sessions (DD-028). The manual deployment script `scripts/deploy.sh` builds, packages, deploys, and checks this stack.
`backend/docker-compose.yml` and `backend/deploy-aws.md` describe the retired
Go/LiveKit stack and must not be used for this deployment. The unused stock WatchParty server/UI is retired too.

Production site/API: `https://watchparty.top`.
The current SSH address and password are stored only in Git-ignored local files
`clients/native/.local-server/ip` and `clients/native/.local-server/password`.
Caddy serves the browser build and proxies `/v1/*`, `/socket.io/*`, `/healthz`,
and `/readyz` to the internal API. `www.watchparty.top` redirects to the primary
site. `relay.watchparty.top` provides authenticated TURN on UDP/TCP 3478, TLS TCP
5349, TLS TCP 443 through HAProxy SNI routing, and configurable UDP relay ports
(default 49160–65535). DNS records are DNS-only. Allow those ports
plus TCP 80/443 and administrative SSH. PostgreSQL/API have no public ports.

## Protected files and release layout

- `/opt/watchparty/releases/<release>/`: API source subset, static assets in `web/`,
  Compose, Caddyfile, TURN launcher, and `release.json` with exact file checksums,
  Git SHAs, and an explicit indication of uncommitted source changes.
- `/opt/watchparty/current`: symlink to the active release.
- `/opt/watchparty/.env`: server-only database/TURN configuration, mode 0600. Each
  release links `.env` here. Set `SITE_DOMAIN=watchparty.top`,
  `TURN_DOMAIN=relay.watchparty.top`, and `PUBLIC_IP` to the server public IPv4 address.
- `/opt/watchparty/turn-tls/`: exported Caddy certificate and private key.
- No backup directory, database dumps, or scheduled snapshots are maintained (stakeholder decision, November 11, 2026).

The API requires `DATABASE_URL` and `AUTH_ALLOWED_ORIGINS`; Compose sets the latter
to exactly `https://${SITE_DOMAIN}`. Browser session mutations require that Origin
and `X-Roomio-Client: browser`. Production uses the host-only
`__Host-roomio-refresh` HttpOnly/Secure/SameSite=Strict cookie. Native requests use
JSON refresh credentials. No Firebase configuration, Admin credential mount,
Google authentication egress, or client API key is required. An old protected
Admin credential may remain only with retained rollback material; never package
or mount it in the new release. Do not delete the external cloud project here.

New installations use the Compose project name `watchparty`. Before updating an existing host:

1. Make its existing release tree accessible at `/opt/watchparty` and keep its active release, protected environment, downloads, certificate files and renewal timer in place.
2. Record the existing Compose project name as `COMPOSE_PROJECT_NAME` in the protected environment so all commands reuse its network and volumes. Set `POSTGRES_USER` and `POSTGRES_DB` to the existing role and database.
3. While the previous API is stopped, rename its migration ledger to `watchparty_migrations` with PostgreSQL's `ALTER TABLE ... RENAME TO`. Preserve all rows and checksums. Apply the same ledger rename to existing local development databases before starting the new API.
4. Set `SOCKET_NAMESPACE_PREFIX` to the deployed namespace's first path segment to support installed clients. Updated clients accept the server-issued prefix. Fresh deployments default to `watchparty`. Services restart
automatically. The daily `watchparty-turn-tls.timer` synchronizes TURN certificates.
Backup automation and stored snapshots are removed by `./scripts/deploy.sh remove-backups`
and by release activation. This does not remove the live PostgreSQL volume.

## Build and coordinated cutover

Use Node 24.18.1/npm 11.16.0. Run `npm test` and `npm run build` in `clients/web`; no
Firebase environment variables are needed. Production uses relative API and
Socket.IO URLs (`VITE_BACKEND_URL` empty). Native clients use
`https://watchparty.top`. Copy only `clients/web/dist/` into the release's `web/`.

Public signed Android APKs live in `web/downloads/`, using versioned filenames
such as `roomio-1.1.0-6.apk` and matching `.sha256` files. Verify the release
signature, package/version, and uploaded checksum before linking a new APK.
Preserve this directory when replacing the browser build or staging a full
release: it is independent of Vite's generated assets. Published versioned APK
URLs must retain the same bytes. Never upload signing keys or signing properties.

After building a signed Android release, run `bash scripts/deploy.sh publish-apk` from
the repository root (or pass the APK path as the second argument). The command
uses `apksigner`, `aapt`, and the deployment SSH settings. It verifies the
uploaded bytes, keeps the versioned APK and checksum, then atomically switches
the relative `web/downloads/latest.apk` symlink used by the browser button.
Run this after any simultaneous web deployment finishes so the alias is updated
in the active release. Later Android releases require only this publish step.

Stage `package.json`, `package-lock.json`, `server/`, and `sql/` from
`backend/watchparty` into `api/`. Rename `Dockerfile.api` to `api/Dockerfile`;
copy Compose, Caddyfile, haproxy.cfg, and TURN scripts alongside it. Exclude credentials,
`.env`, node_modules, build caches, and repository metadata. Record checksums of
every staged file and the exact dirty-source status. Validate those checksums
after transfer. Build the API image before stopping the existing API.

For routine deployments to the existing host:

```sh
export DEPLOY_RELEASE_ID=20261111-launch  # choose a new unique ID for each release
./scripts/deploy.sh build
./scripts/deploy.sh deploy
./scripts/deploy.sh status
```

Build runs browser unit tests/build and backend unit tests/typecheck, packages
only the API source and browser output, and records file checksums and source
status. It includes current working-tree changes without committing or pushing.
Real-service integration and Android builds remain separate acceptance checks.
Node 24.18.1/npm 11.16.0 and Python 3 are required locally; Docker Compose and
Python 3 are required remotely. SSH uses the known-hosts file, optional
`DEPLOY_SSH_KEY`, and agent/password authentication. Host defaults to the local
ignored IP file; user defaults to root. The old `.tools/deploy.conf` is ignored.

Deploy verifies archive and payload checksums, reuses the existing
existing Compose project’s default bridge, preserves published downloads and old hashed assets,
builds the API before changing running services, validates HAProxy, and updates
API/Caddy/router/Coturn without recreating PostgreSQL. It switches `current`
after local readiness, then checks public readiness including the voice flag.
It creates no database or file snapshots. Existing old release directories are
application artifacts, not database recovery points. Runtime environment remains
in the protected server-only `.env`.

This command requires an already provisioned host, network, certificates, and
TURN renewal timer. It does not bootstrap a new VPS. API migrations apply on
startup: inspect schema compatibility before deploying. A failure can leave
updated containers running before the symlink switches; inspect `docker compose
ps` in the attempted release. No automatic schema rollback is attempted.
Publish compatible Android binaries separately when room/voice protocols change.

Verify readiness and real browser create/restore/reload, room create/preview/join,
owner return, local playback, private sync, and mesh voice. Block Google/Firebase
authentication destinations during browser acceptance and confirm no requests to
them. Compile/test Android and provide the release APK; the stakeholder performs
physical-device acceptance.

## Operations and recovery

```sh
./scripts/deploy.sh status
./scripts/deploy.sh remove-backups
```

The removal command disables/stops the backup timer/service, removes their unit
files and `/opt/watchparty/backup.sh`, and deletes the legacy backup directory. It preserves
TURN renewal, live data, and deployment secrets. Historical deployment documents
record earlier backup behavior; they are not current operating instructions.

No database snapshots or automatic database recovery are provided. Retained
application releases can only be reactivated if compatible with the current
schema and installed clients. Never reactivate the retired Go/LiveKit stack or a
pre-DD-028 schema against the current database. Readiness does not establish
physical audio or sustained load acceptance.

## Voice v4 and shared TCP 443

The coordinated voice release uses voice Socket.IO protocol **4**; room protocol
remains **3**. Deploy matching backend, browser assets, and Android binaries.
`join`, `resume`, and `refresh` are distinct `/voice/config` operations. Refresh
never consumes or rotates a connection ticket. No legacy-data migration is needed.
See [voice stability acceptance](../../docs/voice-stability-acceptance.md).

HAProxy owns host TCP 443 and inspects TLS ClientHello SNI without decrypting
traffic. The exact TURN hostname routes to host Coturn 5349; other TLS routes to
Caddy at `127.0.0.1:8443`. Caddy still owns public TCP 80 and UDP 443 (HTTP/3).
Coturn listens on all host interfaces so the loopback proxy can reach it;
`PUBLIC_IP` remains the advertised relay address. HAProxy does not inject HTTP
headers. For website TLS it sends PROXY protocol v2 before the TLS handshake;
Caddy's core `proxy_protocol` listener restores the original client address
before HTTP handling and sets the API's forwarded client address normally.
Without this, all HTTP/1.1 and HTTP/2 guests would share the proxy's IP rate bucket.
The listener trusts only host loopback and the fixed Docker bridge gateway
`172.30.55.1`; unknown PROXY-header sources are rejected. The private host
`127.0.0.1:8443` mapping must stay private, and a subnet change requires updating
this allowlist alongside Compose. API trust remains limited to Caddy's fixed
`172.30.55.254` address. Client-supplied `X-Forwarded-For` is not trusted by
Caddy. Public UDP 443/HTTP/3 reaches Caddy directly and retains its source address.
See [Caddy's PROXY listener documentation](https://caddyserver.com/docs/caddyfile/options#proxy-protocol).

Keep HTTP 80 reachable for certificate issuance. The TURN hostname disables the
TLS-ALPN ACME challenge because its SNI on TCP 443 routes to Coturn; its ACME
HTTP challenge still reaches Caddy on port 80. Bootstrap Caddy and export its
TURN certificate with `sync-turn-tls.sh` before starting Coturn. On renewal the
existing timer exports changed certificate/key files and restarts only Coturn.
That restart interrupts relayed calls: schedule the timer appropriately and
measure reconnection; zero-interruption certificate reload is not claimed.

Before activation, stop the old Caddy container that publishes TCP 443, recreate
Caddy with the loopback-only 8443 mapping, then start `tls-router` and Coturn.
A retained old Compose release can roll back both public listeners together.
Never start two services binding host TCP 443.

Firewall: allow TCP 80/443/3478/5349, UDP 3478/443, and UDP
`TURN_MIN_PORT`–`TURN_MAX_PORT`. Keep TCP 8443 and PostgreSQL/API private.
Firewall configuration must match the protected environment before advertising
these transports. Restrictive networks must permit TLS SNI for the relay name;
an HTTPS-only application proxy may still reject TURN TLS.

Quota defaults are configurable ceilings, not measured capacity. A forced-relay
100-room/eight-person mesh can require up to 5,600 simultaneously live peer
allocations (800 members × seven links), plus allocations during candidate
collection, retries, and overlapping credentials. Defaults reserve 16,376 relay
ports and 16,000 allocations with 128 per credential; test actual allocation
counts and file descriptors before rollout. `TURN_MAX_BPS` and
`TURN_BPS_CAPACITY` use Coturn's bytes-per-second units; the example aggregate
ceiling is 512 MB/s and may far exceed the host/NIC budget. Set a measured safe
budget and reject capacity claims until load evidence exists. The former
400-allocation ceiling is removed.

Validate staged configuration (use placeholder secrets locally, never print the
production rendered Compose environment):

```sh
docker compose config --quiet
docker compose run --rm --no-deps tls-router haproxy -c -f /usr/local/etc/haproxy/haproxy.cfg
sh -n turn-entrypoint.sh sync-turn-tls.sh
```

Verify client-address preservation on a disposable local Docker host after
building the matching API image:

```sh
python3 backend/deploy/verify-ingress-client-ip.py --api-image watchparty-api:20261105-voice-v4-rc2
```

Run this from the repository root with the pinned Caddy/HAProxy images and a
local `postgres:17-alpine` image available. It creates a separate PostgreSQL/API
fixture and a self-signed local certificate; it never uses the deployed database
or protected environment. It refuses an existing network overlapping the
production subnet. Local ports 18080/18443/19443 must be free. The fixture
checks distinct actual TCP source addresses survive as API forwarded addresses,
one exhausted guest rate bucket does not block another client, forged forwarded
headers do not bypass that bucket, and untrusted PROXY headers are rejected.
It also checks public HTTPS redirects and HTTP/3 advertisements retain port
443. Owned test containers/network are removed afterward; no issued guest
credentials are written to the result JSON.

Before advertising each transport, run authenticated WebRTC allocations with
`iceTransportPolicy: 'relay'`, one ICE URL at a time: UDP 3478, TCP 3478, TLS
5349, TLS 443. Check the selected pair is `relay`, then verify bidirectional RTP
and identifiable received audio. A TCP connect or successful TLS handshake alone
does not establish TURN allocation or media health. Preserve evidence with no
credentials, SDP, or raw audio. The complete acceptance matrix is linked above.

The per-credential default of 128 allows the observed 28 candidate allocations per
member plus three retry generations (up to 112) during delayed cleanup. This is
recovery headroom, not a 100-room capacity claim: the measured eight-member TLS
fixture gathered 224 allocations, so 100 rooms plus overlap require measured
global quota and port sizing. Defaults of 16,000 allocations and 16,376 ports do
not establish that target.
