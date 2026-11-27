# watchparty backend

This is the watchparty-specific Node/PostgreSQL/Socket.IO service, derived from
[howardchung/watchparty](https://github.com/howardchung/watchparty). The original
MIT license remains in [LICENSE](LICENSE). The unused stock browser UI, virtual
browser, payment/account features and legacy server entry point have been retired.
The active browser client lives in the parent repository's `clients/web/` directory.

This directory is regular source in the watchparty repository, not a Git submodule.
Backend changes are committed together with the clients and shared contracts.

Guest identities and credentials are owned by PostgreSQL. No external identity
provider, cloud authentication SDK, service-account key or emulator is needed.
The service preserves private local playback, owner-only shared stream controls,
requester-only forward sync, durable rooms, and opt-in audio-only WebRTC mesh voice.

Use Node 24.18.x and npm 11.16.x:

```sh
npm ci
export DATABASE_URL=postgresql://watchparty:local-development-only@127.0.0.1:15432/watchparty
export NODE_ENV=development
export HOST=127.0.0.1
export PORT=8081
npm start
```

Copy `.env.example` values into the process environment through your launcher;
this service does not implicitly load local environment files. Migrations run at
startup under a database lock. One runtime may own a database at a time.

```sh
npm run typecheckServer
npm run test:backend
npm run test:integration
```

Integration tests require the actual local PostgreSQL database and create real
backend guest sessions. Use a dedicated development database: tests intentionally
exercise expiry, revocation, dispatcher and database-connection faults.

`AUTH_ALLOWED_ORIGINS` contains comma-separated exact origins. Production defaults
to `https://watchparty.top`; development additionally supports the documented local
Vite origins. Browser create/refresh/reset requires a matching Origin and
`X-Roomio-Client: browser`; its durable credential uses a protected cookie. Native
clients exchange refresh credentials in JSON and keep them in platform secure
storage. Session responses must never be logged or cached.

For full local-stack, native-device and TURN instructions see `../local/README.md`.
Hosted operation is documented in `../deploy/README.md`. Historical migration SQL
and evidence are retained for provenance and are not runtime dependencies.

### Room bug reports

`POST /v1/rooms/:roomId/bug-reports` stores authenticated room-member reports in
PostgreSQL through migration `0004_bug_reports.sql`. Reports include description,
available device/browser metadata and the captured application session log. The
shared schema is in `../../docs/bug-report-contract.md` and OpenAPI. Successful
responses follow commit; unchanged retries use a stable report UUID.

Operators can inspect `bug_reports` through existing privileged database access:

```sql
SELECT report_id, created_at, room_id, description, client_info,
       session_started_at, app_log
FROM bug_reports
ORDER BY created_at DESC
LIMIT 20;
```

Reports have no public read API or notification integration. Expired reports are
removed at service startup, hourly, and before submission (30-day retention).
Deployment must include the new backend migration and updated clients together.
