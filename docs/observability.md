# Observability

Accepted in DD-055: PostHog EU measures usage, Sentry receives automatic errors and manual feedback, and PostgreSQL remains authoritative for submitted reports. Session replay and automatic content capture are off. Tracing, log streaming, infrastructure metrics and profiling are outside this initial integration.

## Configuration

On the configured development machine, run `python3 scripts/configure-observability.py`. It reads owner-only account setup files under `~/.config/watchparty/` and merges ingestion settings into ignored files without printing their values:

- `clients/web/.env.local`: `VITE_SENTRY_DSN`, `VITE_POSTHOG_TOKEN`, `VITE_POSTHOG_HOST`.
- `backend/watchparty/.env.observability`: `SENTRY_DSN`, `SENTRY_ENVIRONMENT`.
- `clients/native/observability.properties`: `sentry.dsn`, `posthog.token`, `posthog.host`, `release`.

Ingestion identifiers are embedded in clients by design. Account/OAuth/upload tokens must never enter client code, Gradle-generated source, Git, or runtime containers. The Sentry CLI authenticates separately in the local user configuration.

Browser development is disabled by default. Set `VITE_OBSERVABILITY_ENABLED=true` and `VITE_OBSERVABILITY_ENVIRONMENT=development` when explicitly verifying it. Production builds enable configured monitoring unless `VITE_OBSERVABILITY_ENABLED=false`. Native Android debug and release builds use `development` and `production`; desktop defaults to development and supports `-Dwatchparty.environment=production`.

For a local backend, load the ignored file explicitly, for example `node --env-file=.env.observability server/server.ts`, alongside the existing database configuration. Production Compose reads `SENTRY_DSN` from the server-side environment file, sets the environment to production, and identifies the release with `RELEASE_ID`. A missing DSN disables capture/delivery without blocking the app.

## Usage events and privacy

The browser captures `app_opened`, a sanitized `$pageview` with route `/`, `room_created`, `room_joined`, `room_left`, `playback_started`, and `bug_report_submitted`. Native captures the same app/open/create/join/playback/report events, using the existing Ktor transport behind the data layer. Product mutations emit only after successful API acceptance. Native analytics uses a bounded queue, a five-second request budget and best-effort delivery; telemetry cannot block product actions.

PostHog identifiers are random per browser/installation and separate from backend authentication. Clearing storage or using another device creates another identifier. These counts therefore measure browser/installations, not precisely deduplicated people. Filter dashboards by environment and platform.

Browser and native analytics post explicit events to PostHog EU. Neither transport collects page addresses, referrers or exceptions. The browser migrates only the prior random installation UUID, respects Do Not Track, and omits credentials and the HTTP referrer. Both transports disable person and geographic processing in the event properties.

Automatic failures use bounded, application-defined context. Web preserves release-asset frames, safe cause types, root-handler and rejection classifications, and up to twelve diagnostic events from the last two minutes. Android, JVM and Cocoa retain normalized code locations and bounded app history. Android disables raw NDK capture, raw tombstone and ANR attachments, while allowing parsed tombstones where Android supports them. The Node entry point captures terminal failures, writes a structured operator record, flushes Sentry and exits unsuccessfully. HTTP errors use method, recognized route template and status, without any cross-request history. Sentry ingestion settings and network-layer processing are separate from the application payload.

Browser console warnings/errors contribute only their severity. Native logging accepts known events and typed data. Recovery logs use class, operation, recognized codes and available safe coordinates. Arbitrary text, raw error objects, request bodies, URL strings, absolute paths, playback positions and system-wide logs are excluded. The deployment relay entry point filters its output to operational counters and warning/error classes before container log rotation.

Run `node scripts/check-exception-logging.cjs` from the repository root after installing backend dev dependencies to audit active browser, native and Node backend catch/rejection boundaries. Native `runCatching` uses a logging adapter; the pure domain coordinator receives its logging callback from the production data binding. Historical backend sources and isolated design studies are outside the runtime audit.

## Manual reports

The existing report endpoint and acknowledgement semantics remain unchanged. New report insertion also initializes delivery state within the same transaction. Earlier reports remain unqueued. Every five seconds the single-runtime worker selects up to five due reports, forwards feedback plus `session.log` and any explicitly selected or pasted screenshots, and marks delivery only after Sentry's HTTP acceptance. The report UUID, without hyphens, is the stable Sentry event ID across retries.

Delivery retries after transient failures with exponential backoff, respecting Sentry's retry headers. Expired reports are never delivered. The original 30-day retention and durable retry/conflict rules still apply. Sentry has its own attachment/feedback retention and quotas; deleting a PostgreSQL row does not delete its Sentry copy. Per stakeholder direction on 2026-11-12, English/Persian report dialogs omit the diagnostic storage and Sentry delivery notice.

Operator status query (private database access only):

```sql
SELECT report_id, created_at, sentry_attempts, sentry_next_attempt_at,
       sentry_delivered_at
FROM bug_reports
ORDER BY created_at DESC
LIMIT 50;
```

Stable event IDs limit duplicates when delivery succeeds but the database acknowledgement is interrupted. This is at-least-once delivery; it is not a cross-service transaction. A Sentry account ingestion quota or attachment quota can still prevent data retention after HTTP acceptance, so monitor those quotas in Sentry.

## Readable releases

Set `VITE_APP_BUILD` to a unique release identifier. Browser source-map generation/upload is enabled when `SENTRY_AUTH_TOKEN` is supplied to the build environment. JavaScript uses esbuild minification: a live minified-build check confirmed that the application frame resolves to its TypeScript source and context (the default Oxc output mapped this test frame incorrectly). The Vite plugin uploads to `$SENTRY_ORG/watchparty-web`, and removes uploaded `.map` files from `dist`. The standard `scripts/deploy.sh build` uses existing Sentry CLI authentication when no upload token was explicitly supplied, and uses the deployment release ID in the browser build. Keep the upload token in CI secrets; it is never a `VITE_` variable.

The Android Sentry Gradle plugin creates a ProGuard mapping identifier for release builds. `SENTRY_AUTH_TOKEN` enables automatic mapping upload to `$SENTRY_ORG/watchparty-native`; without it the mapping remains local. Automatic bytecode tracing, logcat capture, source uploads and native-symbol uploads are disabled. The KMP plugin owns SDK installation.

Android palette selection also changes the launcher icon. Launcher aliases route through a short-lived `LauncherActivity` into the stable `AppActivity` task, so disabling the old alias does not remove the running app's task. An operating-system task removal is different from an unhandled exception and may produce no Sentry error event. When investigating an unexplained exit, check Android task/process exit logs as well as Sentry; absence of an event alone does not establish that capture is broken.
