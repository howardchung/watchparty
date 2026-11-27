# Local backend stack

Use Node 24.18.1/npm 11.16.0 and the isolated PostgreSQL database. Guest authentication
runs inside the Node service; no external authentication process or SDK is needed.

From the repository root:

```sh
npm ci --prefix backend/watchparty
docker compose -p watchparty-local -f backend/compose.watchparty-local.yml up -d --wait postgres
cd backend/watchparty
export NODE_ENV=development
export DATABASE_URL=postgresql://watchparty:local-development-only@127.0.0.1:15432/watchparty
export HOST=127.0.0.1
export PORT=8081
npm start
```

In a terminal with the same environment, run `npm run typecheckServer`,
`npm run test:backend`, and `npm run test:integration`. Integration uses actual
PostgreSQL and local guest credentials, and intentionally changes test session
expiry, revocation and connections. Use a dedicated development database.

Browser development uses the Vite proxy to reach `/v1` and `/socket.io`; allowed
origins default to localhost/127.0.0.1 ports 5173 and 4173. Override
`AUTH_ALLOWED_ORIGINS` with exact comma-separated origins when needed. Only
`NODE_ENV=development` permits HTTP origins on localhost and a non-Secure refresh
cookie. Production requires HTTPS origins and uses a host-only Secure/HttpOnly
cookie. Native clients use JSON credentials stored in platform secure storage.

Android normally targets `https://watchparty.top`. For a local debug build, forward
`adb reverse tcp:8081 tcp:8081`, then launch with the debug-only
`roomio.backendUrl=http://127.0.0.1:8081` activity extra. An emulator may instead use
`http://10.0.2.2:8081`. No other authentication endpoint must be forwarded.

`/healthz` reports process liveness; `/readyz` checks the database and event
dispatcher. One runtime may own a database; losing its advisory-lock connection
drains the runtime. Restart the backend after ownership loss. Transient
database/outbox failures recover automatically.

For private TURN, set fresh local-only `TURN_SHARED_SECRET` (at least32bytes) and
`TURN_EXTERNAL_IP`, then run the optional voice profile:

```sh
export TURN_SHARED_SECRET="$(openssl rand -hex 32)"
export TURN_EXTERNAL_IP=127.0.0.1
export TURN_URLS='turn:127.0.0.1:3478?transport=udp,turn:127.0.0.1:3478?transport=tcp'
docker compose -p watchparty-local -f backend/compose.watchparty-local.yml --profile voice up -d
```

For physical devices use the host's trusted LAN address for TURN_BIND_ADDRESS,
TURN_EXTERNAL_IP and the URLs; allow TCP/UDP3478 and UDP49160–49200 from those
devices. TURN credentials returned by the API expire after ten minutes. Room and
voice namespaces use separate one-use tickets and realtime protocol3.

Stop with `docker compose -p watchparty-local -f backend/compose.watchparty-local.yml down`.
Add `--volumes` only to deliberately erase local data.
