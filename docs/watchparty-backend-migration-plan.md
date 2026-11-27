# Migration to the WatchParty fork

Historical proposal. For the current stack and release process see [local development](../backend/local/README.md) and [CI releases](../.github/RELEASING.md).

> Historical implementation plan for DD-022. Its Firebase authentication instructions are superseded by DD-028. Use the [current behavior/interface contract](watchparty-migration-compatibility.md) and [active deployment instructions](../backend/deploy/README.md) for backend-owned guest sessions.

**Status:** Historical original implementation plan. The Node/mesh migration was subsequently implemented and deployed; phase evidence is retained separately. DD-028 now replaces its Firebase authentication design.

**Working branch:** `docs/watchparty-backend-migration`.


## 1. Goal and non-negotiable outcome

Replace the Go application backend with a maintained extension of the original project fork, use Firebase Anonymous Authentication for guest credentials, and replace LiveKit voice with audio-only WebRTC peer-to-peer mesh plus a private TURN relay. Client internals, dependencies, transports, DTOs, and repository implementations may change. User-visible functionality, permissions, screens, terminology, and recovery paths must remain available.

This is a backend **and client** migration. Preserve the useful existing REST room/profile operations because they already model the product well; replace plain room WebSockets with Socket.IO and LiveKit with mesh voice behind client data/domain boundaries. The project is not live; existing rooms, profiles, settings, and credentials are disposable, and testers may uninstall/reinstall. Implement one final stack with a fresh database and clean app installs, without legacy-client adapters, old-data import, preference migration, or a public rollout/drainage period. Preserve functionality, not historical test data.

Success means an Android user can do everything possible today: configure a profile, create/preview/join/share a party, return to the same party and ownership, control their own video, explicitly catch up without rewind, hear all opted-in participants, mute/unmute, see speaking indicators, continue a room and voice in the background, use notification actions, and leave cleanly. Local subtitles and audio-track selection remain local. Existing desktop room operations and their current player/voice placeholder states remain buildable and usable; implementing previously missing platform media engines is not part of this migration.

`clients/web` remains the existing product/design prototype with its fixture states and directional-sync variations. Add replaceable transport boundaries where needed, but do not replace its UI with the fork's React application or silently promote DD-017 into production. The backend contract is browser-compatible and verified with a small real browser harness. Production networking for the prototype remains a separate scope decision.

No virtual browser, video proxy, server-hosted movie, text chat, camera chat, screen sharing, registration, subscription, or paid-room feature is added to watchparty. Movie bytes continue to flow directly from the source to each device. The migration must not create an account-registration requirement.

## 2. Features available before changing fork backend source

This inventory comes first deliberately. “Supported unchanged” means the existing fork can demonstrate the capability using its current protocol. It does **not** mean that an existing watchparty client can connect unchanged or that the full watchparty product rule is already enforced.

| Capability | Existing fork entry point | Reuse without backend source changes | Remaining client/product work |
| --- | --- | --- | --- |
| Node/TypeScript HTTP hosting | `server/server.ts`, Express and HTTP/HTTPS bootstrap | Yes; run the pinned application and its `/ping` check. | Reproducible dependencies, production entry point and real readiness are later changes. |
| Room creation and room-scoped connections | `POST /createRoom`, Socket.IO namespaces, `roster` | Yes for an isolated demonstration. | watchparty party codes, preview, guest ownership, grace, tombstones, and reserved owner seat are not provided by these APIs. |
| Name/avatar propagation | `CMD:name`, `CMD:picture`, `REC:nameMap`, `REC:pictureMap` | Yes for ephemeral room labels. | Durable identity/profile settings and authoritative member metadata need the compatibility services. |
| Direct video URL distribution | `CMD:host`, `REC:host` | Yes; clients receive a shared URL and play it themselves. | Guest-owner authorization, explicit abort/session/revision semantics, and independent local playback need changes. |
| Per-peer signaling | `signal` with `{to,msg}`; server delivers `{from,msg}` | Yes; the server relays SDP/ICE without carrying audio. | Native WebRTC engines are client work; production authentication, signaling validation, and admission are later backend work. |
| Voice mesh capability | `CMD:joinVideo`, `CMD:leaveVideo`, `CMD:userMute`, `signal` | Existing signaling can carry audio-only WebRTC even though the command names say “Video.” | watchparty clients capture microphone only. Opt-in/muted state, speaker detection, background operation, and private ICE configuration must be implemented/tested. |
| Optional Firebase token verification | `server/utils/firebase.ts`, `validateUserToken`, `CMD:uid` | Yes when configured, including tokens obtained through anonymous authentication. | Existing optional verification is not mandatory watchparty authorization; Phase 2 adds fail-closed middleware and a UID-to-UUID mapping. |
| Connection identity replacement | `clientId`, `socketIdMap`, reconnect handlers | Yes for the fork's UUID client identity. | watchparty needs durable identity plus stable membership IDs and one authoritative socket per role. |
| Optional persistence | `DATABASE_URL`, `Room.serialize`, `Room.saveRoom`, `sql/schema.sql` | Yes for stock WatchParty room snapshots. | The JSON snapshot is not a replacement for watchparty's identity/membership/stream schema or transactional events. Do not import watchparty data into it. |
| Manual process sharding and operations patterns | `server/ecosystem.config.js`, `resolveShard`, stats/cleanup scripts | Yes in a stock deployment. | Do not apply the current first-character sharding function directly to UUID room IDs; watchparty routing remains single-node until an explicit scaling phase. |

### Phase 1 proof with an unmodified backend

1. Run the pinned fork on an isolated test host with `NODE_ENV=production` to avoid its development-only VM-worker import, without VM-provider/Stripe credentials or real data. For the optional Firebase proof, use a separate development Firebase project with Anonymous Auth enabled and verify valid/invalid tokens through the existing handlers; this does not prove watchparty ownership or mandatory authentication. Use test-only TURN credentials on a private test relay; do not copy the fork's bundled public TURN endpoints or credentials into watchparty.
2. Build a throwaway browser/native transport harness. Exercise room creation, namespace connect, roster, name/avatar updates, direct URL receipt, and `signal` offer/answer/ICE exchange. Use microphone-only capture and local player controls; never emit `CMD:play`, `CMD:pause`, or `CMD:seek` from the independent-playback harness.
3. Demonstrate two peers, then eight peers, with direct ICE and forced relay. Log counts, setup time, and selected ICE candidate type without logging SDP, credentials, or private addresses.
4. Explicitly demonstrate the gaps: any unlocked member can host/control the stream; namespace connection is not durable watchparty membership; disconnection removes the stock roster entry immediately; the stock timestamp map is visible and broadcast. These results prevent a premature public cutover.

**References:** [Fork room handlers](https://github.com/howardchung/watchparty/blob/master/server/room.ts), [browser WebRTC pattern](https://github.com/howardchung/watchparty/blob/master/src/components/VideoChat/VideoChat.tsx), [fork bootstrap](https://github.com/howardchung/watchparty/blob/master/server/server.ts).

**Exit gate:** evidence of every reusable capability and gap, with the fork working tree unchanged. This phase is a feasibility exercise; no public client is redirected to it.

## 3. Discovery and architecture decisions

### Phase 0: documentation discovery and frozen behavior baseline

Read [requirements](requirements.md), [accepted decisions](design-decisions.md), [open questions](open-questions.md), [backend architecture](../backend/backend-architecture.md), [OpenAPI](../backend/openapi/openapi.yaml), [AsyncAPI](../backend/asyncapi/asyncapi.yaml), and [watchparty guidance](../clients/native/AGENTS.md). Review actual consumers as well as the schemas. Discovery for this plan also covered native DTOs, repositories, realtime parser/transport, voice implementation, background service, shared player boundaries, browser fixtures, the fork's configuration, room handlers, persistence, deployment scripts, and MIT license.

The accepted decisions take precedence over stale analysis text. DD-014 approved the existing Go backend despite older “backend empty” guidance. The user now authorizes the WatchParty/P2P replacement and client implementation changes; DD-022 records that direction. DD-017 remains an unaccepted browser-only exploration. DD-013 permits HTTP(S) at the Android player boundary, while the current production backend accepts HTTPS only: preserve the current production rule and debug-player HTTP behavior rather than introducing a new format policy during migration.

Create executable behavior fixtures for the acceptance matrix in [the compatibility specification](watchparty-migration-compatibility.md). Capture stable response fields, errors, event ordering, member identity, and player/session transitions. Do not bless existing security flaws, concurrency races, leaked memory, or fake readiness as compatibility requirements.

### Final deployment and code ownership

- Implement fork changes in a dedicated migration branch of the original project fork. Keep the fork's upstream history and MIT notices. Add a pinned Git submodule at `backend/watchparty/` in the future implementation branch; record the exact fork SHA for every deployment. This documentation branch does not add the submodule or push changes to either remote.
- Add a focused `server/watchparty/` module inside the fork: bootstrap/config, guest identity, room/membership policy, streams, Socket.IO adapters, voice signaling/ICE credentials, PostgreSQL repositories, outbox, and health/metrics. Keep services independent of Express and Socket.IO so policy can be tested directly.
- Extract reusable bootstrap/signaling patterns from the fork. watchparty mode has its own registered room runtime and handlers backed by one authoritative PostgreSQL model. Do not instantiate the legacy `Room` as a second independently mutable copy of the same party.
- Select `WATCHPARTY_MODE=true` in production. Mount only watchparty routes and namespaces; legacy `/createRoom`, payment and legacy Firebase database/user-management endpoints, proxies, subtitle upload/fetch, chat/video/screen/playlist/VM commands, and stock room timers are unavailable in this mode. A room-mode branch must be explicit rather than relying on absent credentials to disable handlers.
- Use Node 24 LTS, strict TypeScript, existing Express 5 and Socket.IO 4 dependencies, and `pg.Pool` for watchparty persistence. Configure internal PostgreSQL TLS deliberately; do not inherit `rejectUnauthorized:false` for public/managed connections.
- PostgreSQL remains authoritative. Keep the existing plural room/membership/stream tables and UUID identifiers, add a unique Firebase UID mapping to `identities`, and omit the old `refresh_sessions` table; stock WatchParty's singular `room` table belongs only to legacy WatchParty mode. No shared source dependencies between clients and no backend code inside `clients/native` or `clients/web`.
- Host the final Compose services on a conventional VPS: Caddy, the fork application, PostgreSQL, and private Coturn. Firebase is used only for Authentication; do not add App Hosting, Cloud Run, Cloud Functions, Firestore, Realtime Database, or Firebase Storage to this migration. Redis is optional for later multi-node operation. Go and LiveKit are removed from the active development deployment when the complete replacement passes parity tests.

### Client transport choice

Keep Ktor HTTP repositories for the existing `/v1` room/profile/stream operations. Replace raw-room-WebSocket internals with a JSON-only Socket.IO adapter in `clients/native/data/commonMain`, using the existing Ktor WebSocket engines. Implement the documented Engine.IO v4 WebSocket-only transport and Socket.IO protocol v5 subset used by this application: namespace connect/disconnect, JSON events/acks, errors, heartbeat, and reconnect. Binary packets, polling, upgrades, and alternate parsers are not used by the server contract.

This deliberately keeps room networking available on Android and desktop without adding a Java-only dependency to common code. It is a protocol implementation task, not an assumption that a plain WebSocket already speaks Socket.IO. Before adopting it, pass conformance tests against the actual fork server and the official JavaScript client, including two namespaces on one connection, acknowledgement IDs, server ping/pong, auth failure, timeout, and reconnect. Use [Engine.IO documentation](https://socket.io/docs/v4/engine-io-protocol/) and [Socket.IO packet documentation](https://socket.io/docs/v4/socket-io-protocol/); do not invent framing.

The real browser harness uses the fork's pinned `socket.io-client` dependency. Production `clients/web` networking is not enabled by this plan; its repositories can be given a transport seam without removing fixture/preview behavior.

## 4. Backend changes required for product parity

These phases add behavior missing from the unmodified fork. The implementation is a real replacement of the Go services, not a permanent Node-to-Go proxy.

### Phase 2: reproducible fork runtime and Firebase guest identity

**Implement:**

1. Add the watchparty-mode bootstrap, pool, migrations, graceful shutdown, structured errors, and liveness/readiness. Start serving only after migrations, DB connectivity, and required Firebase project/credential configuration checks succeed. Readiness checks DB access and event-dispatch health; distinguish authentication-provider degradation from DB failure and optional voice failure.
2. Repair the fork lockfile under the pinned Node/npm toolchain and commit it in the fork. The prior audit found `npm ci` fails under npm 11.16.0. Require clean `npm ci`, `npm run typecheckServer`, and backend tests in CI; do not use `--package-lock=false` as the production workaround.
3. Create separate development and production Firebase projects, enable Anonymous Authentication, and leave automatic anonymous-account cleanup disabled from the outset. Automatic cleanup can delete accounts older than thirty days and break returning ownership. No email/password, phone, registration screen, or account-linking flow is added. Load Admin credentials through a deployment secret outside Git/images and explicitly pin the expected project ID; client project ID/API key are configuration, not Admin credentials.
4. Replace custom JWT issuance/refresh hashing with Firebase ID-token verification through `firebase-admin`. Use `verifyIdToken(token, true)` for authenticated HTTP operations, including namespace-ticket issuance, so disabled users and revoked sessions are rejected as well as malformed, expired, wrong-project, wrong-issuer, and invalid-signature tokens. Never accept a client-supplied UID as authority. The fork's optional helper is a starting point only: absent configuration or verification failure must not silently allow a request. Provider/network failure is a recoverable 503 `AUTH_UNAVAILABLE`, not invalid credentials or permission to create a replacement identity.
5. Add `identities.firebase_uid` with a uniqueness constraint. `POST /v1/identities/bootstrap` verifies the bearer token, atomically creates/returns the same internal UUID/profile for that UID, and returns 200 `{identity}`. Concurrent bootstrap cannot create two identities. Firebase UIDs are not assumed to be UUIDs; internal identity and membership UUIDs remain authoritative for ownership, APIs, and mesh peers. Preserve name/avatar/language in PostgreSQL and theme/local preferences in client storage; Firebase display names are not product profile storage.
6. Remove application guest-session creation/refresh endpoints and the custom refresh-session table/secrets from the final stack. Keep authenticated `POST /v1/guest-sessions/revoke` as an explicit revocation operation: revoke Firebase refresh tokens, release the identity's active membership through the normal leave transaction, invalidate outstanding tickets, and disconnect both roles. Do not invoke it for ordinary leave, backgrounding, or network errors. Strict HTTP verification rejects old credentials; connected roles also validate session status at least every sixty seconds and cannot outlive the presented ID token without reauthentication. Ticket records retain the verified token/session context, and namespace admission rechecks it. Established peer media may continue through transient authentication/signaling outages; unauthorized roles cannot issue new commands or signaling. On permanent revocation, close peers through the existing recoverable session-failure path. Do not claim central TURN revocation instantly stops already-established direct audio.
7. Add authenticated capabilities as specified in the companion contract. The final service advertises only Socket.IO and mesh; do not implement a `LIVEKIT` room mode. Add trusted-proxy-aware limits and separate budgets for bootstrap/profile, room commands, signaling, telemetry, and health checks. Prune limiter/idempotency/ticket stores; validate bodies without arbitrary upstream requests.

**References:** existing identity/profile validation and client session boundaries; fork `server/utils/firebase.ts`; [Firebase anonymous authentication and cleanup](https://firebase.google.com/docs/auth/android/anonymous-auth), [Admin ID-token verification](https://firebase.google.com/docs/auth/admin/verify-id-tokens), [session revocation](https://firebase.google.com/docs/auth/admin/manage-sessions), and [Auth REST API](https://firebase.google.com/docs/reference/rest/auth). Port product profile/ownership behavior, not custom token issuance or non-atomic refresh code.

**Verify:** Auth Emulator integration plus a real development-project smoke test; concurrent bootstrap; stable UID/internal UUID after token refresh, client restart and server restart; wrong-project/expired/forged/revoked/disabled token rejection; namespace admission after revocation; live-role expiry and reauthentication; provider-outage recovery without identity replacement; profile Unicode limits; cleanup disabled; DB-down readiness; clean install/typecheck; stock routes unavailable.

**Guard:** no tokens/Admin secrets in logs/images, emulator authentication in production, automatic anonymous-user deletion, process-local-only identity mapping, public arbitrary-host proxy, or VM-worker imports as configuration side effects. Firebase outage must not erase the stored session or create a new anonymous user.

### Phase 3: authoritative rooms, streams, and durable events

**Implement:**

1. Port create, authenticated preview, join, snapshot, and explicit leave. Preserve eight-character Crockford codes and normalization, optional title/default title, original owner UUID, eight-identity cap, seven-guest maximum with the owner absent, and one active membership per identity. Rejoin reuses the original membership identity.
2. Lock the identity row and target room row in a consistent order when admission changes. Serialize create/join/leave/rejoin across processes in PostgreSQL, not only the Node event loop. Create the fresh schema with the required foreign keys/uniqueness constraints; do not rely on application pre-checks alone for admission invariants.
3. Keep `EMPTY`, `ACTIVE`, `ABORTED`, stable room/session identifiers, and monotonic revisions. Only a present original owner can start/abort; active replacement requires abort first. Execute authorization, transition, revision increment, and outbox insertion in one locked transaction.
4. Implement genuine idempotency for create/join/start/abort: persist operation/body fingerprint and successful response with the mutation transaction, serialize duplicate keys, replay identical retries, reject mismatched reuse, and expire records after ten minutes. Clients generate and retain a key for each logical operation across transport retries.
5. Implement room and voice connection leases, grace, owner absence/return, explicit leave, immediate final-member closure, and 24-hour preview tombstones. Preserve WS-or-voice presence using the new role-specific signaling leases. Never trust persisted boolean flags as evidence of a live process after a restart.
6. Keep the transactional outbox and adapt its sink to Socket.IO room namespaces. Retry transient DB errors with bounded backoff; publish failures remain pending. Publish/mark recovery and deduplication tolerate crashes without permanently stopping dispatch.
7. Bootstrap each connection with a consistent snapshot, buffer newer events while loading it, then deliver them in order. Add internal per-room event sequence to remove the snapshot/registration race; client deduplication uses event ID and stream revision. Reconnecting to the same stream must not restart playback or reset local track selections.
8. Store playback reports only in bounded memory. Report on connect/local changes and every three seconds; expire after fifteen seconds, delete on membership/stream/room cleanup, and verify current membership/session. Project playing samples from server receipt time; paused samples remain eligible. Explicit sync chooses the greatest fresh position, replies only to the requester, echoes its correlation ID, and never rewinds or reveals drift/leader identity.
9. Disable stock room-wide play/pause/seek/rate/loop broadcasts and `REC:tsMap` for watchparty rooms. Local controls are never interpreted as shared commands. Preserve stream-abort voice continuity and ownerless-room continuity.

**References:** existing `room`/`stream` services and tests, PostgreSQL migration `0001_init.sql`, `events/events.go`, realtime sync tests, fork `Room` lifecycle/connection/signaling patterns, and the companion API/acceptance matrix.

**Verify:** concurrent final-seat admission; original-owner return; same identity racing two rooms; two starts and start-versus-abort; idempotent lost-response retry; recovery after DB/process failure; no phantom members; fifteen-second telemetry expiration; final-member cleanup; snapshot/event ordering; requester-only/no-rewind sync.

**Guard:** no owner transfer, no stock permanent-room/subscriber semantics, no one-second whole-room JSON persistence for watchparty rooms, no mirror of durable state in a second legacy `Room`, no automatic pause/seek events for other users.

### Phase 4: client adapters and unchanged presentation behavior

**Implement:**

1. Introduce Socket.IO transport and map the new events onto the existing native `RealtimeEvent` and repository contracts. Keep ViewModels/presentation independent of transport types and follow Metro bindings plus the existing `app -> data/domain` dependency direction.
2. Bind the new adapters through Metro and development backend configuration. Capability discovery confirms Socket.IO/mesh support; there is no user-facing transport selector or automatic fallback to Go/LiveKit. Testers uninstall/reinstall for the replacement. Do not implement cached-credential or preference migration; a fresh install follows the existing initial profile/settings flow and silently creates a Firebase anonymous session. Implement a `FirebaseAuthSessionProvider` in `clients/native/data/commonMain` using Ktor and the official Auth REST API so Android and JVM share one supported HTTP contract: anonymous `accounts:signUp` with `returnSecureToken:true`, then Secure Token refresh with `grant_type=refresh_token`. The browser harness uses the official Firebase web Auth SDK. No Firebase types enter domain/presentation or prototype fixtures.
3. Persist Firebase UID, ID token, expiry, and refresh token through the platform token-store boundary. Serialize refresh, proactively refresh before expiry, atomically store returned credentials, confirm the refreshed UID/project, and retry an expired-token HTTP operation only once. Bootstrap the internal profile after authentication. Network failures retain credentials and map to existing offline recovery; permanent expiry/revocation uses the existing session-recovery path without silently replacing an owner. A new UID is allowed only for a clean install or explicit identity reset. Reauthenticate both active namespaces before ID-token expiry without resetting stream, membership, microphone intent, or player preferences. Bind the provider through Metro; configure public Firebase settings per environment, and keep emulator endpoints debug-only.
4. Add bounded exponential reconnect with jitter and fresh namespace tickets. Reconnect reseeds the room without reloading a still-active local player, altering mute intent, or duplicating membership. Normalize transport failures to existing `NETWORK`/snackbar behavior and keep current inline business errors.
5. Move the in-process voice/network lifetime into an app-scoped room session coordinated with `SessionKeeper`, so screen recomposition does not recreate peer connections. Preserve notification return/mute/leave, room back confirmation, fullscreen back, task-removal leave, and existing Android microphone/notification permission handling.
6. Keep Media3 URL playback, source errors/retry, live-stream control restrictions, local play/pause/seek/volume, subtitles/document picker, and audio-track selection independent of the network adapter. Preserve profile, theme, language, invite formats, and return-to-room state.
7. Keep native JVM compile targets and their current unavailable/placeholder media states. Keep every browser mock preview, sync variation, selected/disabled/loading/empty/error state, theme, large-text, RTL layout, and keyboard behavior. Use the real browser harness for cross-client protocol/voice verification without replacing prototype screens.

**References:** `KtorRoomRepository`, `KtorRealtimeClient`, DTOs/mappers/parser and tests in `clients/native/data`; domain realtime/voice/session contracts; `RoomViewModel`; `RoomSessionService`; `clients/web/src/App.tsx`; DD-016 and DD-018 through DD-021.

**Verify:** all native room workflows over Socket.IO; Android/desktop builds and common tests; fixture browser build and representative visual/state checks; no Socket.IO/WebRTC imports in `domain` or `sharedUI`.

**Guard:** no redesign, no WatchParty React UI transplant, no backend call for local media preferences, no removal of DD-017 fixtures, no client-generated identity taking over ownership.

### Phase 5: audio-only peer-to-peer voice and private TURN

**Implement backend:**

1. Add authenticated, room-bound voice configuration and role-specific Socket.IO voice namespace. Issue one-use namespace tickets and short-lived Coturn REST credentials only for active members. Derive signaling sender identity from authentication; membership UUID remains the peer identity used by avatars/speaker indicators.
2. Reuse the fork's per-target `signal` routing pattern, with schema/size/rate validation, same-room opted-in recipient checks, and server-issued voice-session generations. Reject stale negotiations, cross-room routing, impersonation, and camera/screen/data-publishing commands outside the defined control channel.
3. Maintain separate control/voice socket authority per membership. An old replaced connection cannot mark the replacement absent. Heartbeat/lease expiry replaces LiveKit webhooks; voice failure does not close the room or stop video.
4. Deploy private Coturn with UDP/TCP 3478 and TLS 5349, an explicit relay port range, authenticated quotas, private certificate/secrets, and denied loopback/private destination ranges. Browser/native peers use backend-supplied ICE configuration. Refresh credentials before expiry; test relay-only mode. A dedicated TURN TLS 443 address can be added for networks that block the baseline ports without changing product APIs.

**Implement client:**

1. Implement Android `PeerMeshVoiceClient` behind the current `VoiceClient`/`VoiceSession` boundary, replacing the LiveKit-specific join-token input with a transport-neutral configuration/session descriptor. Preserve `Connected`, `Disconnected`, `Failed`, and `SpeakersChanged` semantics. Remove the LiveKit client binding/dependency when the new implementation passes parity tests; no dual engine is required.
2. Use `io.getstream:stream-webrtc-android:1.3.9`, pinned in the version catalog, as the initial verified native WebRTC dependency. Use its `org.webrtc` APIs (`PeerConnectionFactory`, `PeerConnection`, audio source/track, SDP observer, ICE, stats); do not add Stream's hosted calling service or UI toolkit. Verify packaged ABI/native libraries and minSdk compatibility on devices before adopting it as the production artifact.
3. Create one microphone source and share its audio track across at most seven peer connections. Never create video capture/renderers. Start with microphone disabled, receive all opted-in speakers, and preserve the user's mute choice across automatic reconnect; a new voluntary voice session starts muted.
4. Deterministically assign the lower membership UUID as offerer for each pair. Queue ICE until the remote description exists, reject old generations, negotiate audio/Opus only, and handle a peer arriving/leaving without restarting unrelated peers. Higher UUID requests restart; lower UUID performs ICE restart. Handle Wi-Fi/cellular changes with refreshed TURN credentials and bounded reconnect.
5. Configure mono Opus, approximately 24 kbps target and DTX, echo cancellation/noise suppression, and existing audio-route behavior. Preserve movie audio and local volume/track controls while voice is active. Restore audio focus/device mode on leave; test wired/Bluetooth/speaker routes and interruptions.
6. Replace LiveKit active-speaker events with local/remote WebRTC audio statistics. Sample at 100 ms, normalize `audioLevel` or energy/duration deltas, use initial threshold 0.02, two-sample attack and 500 ms release; clear immediately on mute/disconnect. Deduplicate the local source across outbound peer streams. Thresholds are internal tuning, not new UI controls.
7. Keep voice signaling and peers alive through the existing Android foreground-session mechanism when UI is backgrounded. Maintain the voice namespace even if the room-control namespace is suspended. Task removal/explicit leave closes all peers, microphone, signaling, and notification; a signaling reconnect revalidates roster and drops departed peers. Do not claim automatic call restoration after process death, which is not available today.

**References:** fork `sendSignal`/`joinVideo`/`setUserMute` patterns and `VideoChat.tsx` SDP/ICE flow; [WebRTC Android APIs](https://github.com/GetStream/webrtc-android); [WebRTC stats](https://www.w3.org/TR/webrtc-stats/); [Coturn configuration](https://github.com/coturn/coturn/blob/master/README.turnserver); current `LiveKitVoiceClient`, domain voice contracts and DD-018/019.

**Verify:** two/four/eight Android peers, Android-to-browser harness, everyone receiving every speaker, speaking indicators with real and prerecorded speech, muted-state correctness, blocked UDP/TURN TCP/TLS, expired credentials, peer replacement, leave/rejoin, brief signaling outage, network change, background/notification actions, stream abort during voice, and CPU/battery/upload measurements.


**Guard:** no camera permission, public hardcoded relay credentials, server audio recording, user-facing Firebase login/registration, voice-induced local video pause, microphone enabled before opt-in, or hidden SFU fallback masquerading as mesh.

**Exit gate:** real-device eight-person voice passes parity and recovery tests. A room with one failed peer must show the existing recoverable voice state and retry; do not call the whole room connected while silently omitting a participant.

### Phase 6: reliability, cost controls, and deployment readiness

- Port regression probes from the backend audit into meaningful tests: over-capacity admission, duplicate stream revisions, failed outbox DB polls, crash-stale presence, unbounded telemetry, proxy-collapsed rate limits, non-atomic idempotency, and Firebase bootstrap/refresh/revocation races. The final mesh runtime has no LiveKit token, webhook, or admin API; test that the old endpoints cannot be used as an authorization bypass.
- Add bounded room/voice outbound queues, signaling limits, expired-state cleanup, event-loop lag, pool saturation, Firebase verification/refresh latency and failure rates, room counts, outbox lag/retries, reconnect counts, voice connection failure rate, and aggregate relay-usage metrics. Keep IDs/SDP/ICE addresses out of metric labels and logs.
- Use immutable image tags/digests, non-root images, graceful drain and pinned Compose configuration. Do not copy the fork's `pm2 delete all` deployment command. Shutdown refuses new admissions, finishes committed work, flushes pending events, and lets clients reconnect from a snapshot.
- Load-test 1/10/100 rooms with eight clients, actual three-second reports and speaker/silence profiles; use 1,000 rooms as an exploratory capacity test, not an acceptance promise. Run a 24-hour 100-room churn/soak test after functional tests pass.
- Initial room-control targets: REST p95 <= 200 ms, committed event-to-client p95 <= 500 ms, >= 99% successful operations excluding intentional validation errors, and no monotonic memory growth after idle expiry. Initial healthy-network voice targets: setup p95 <= 5 s, conversational latency median <= 300 ms, speaking indicator response <= 500 ms, and no missing subscriptions in eight-person calls. These are proposed release gates to measure, not existing benchmarks.
- Budget the full Node/PostgreSQL/Coturn deployment and client upload, not only the Node process. Eight-person mesh can require seven outbound audio copies per speaker. Relay traffic still costs money; track measured average room-hours and TURN fraction. For 100 concurrent eight-person rooms, use a starting VPS budget of $24–48/month plus daily backups at 30% ($31.20–62.40/month), with Node/PostgreSQL/Coturn initially colocated and 4,000–5,000 GiB included transfer. This is a planning baseline, not measured capacity, high availability, or guaranteed relayed-voice coverage. Firebase Auth cost follows provider usage/MAUs, not concurrent rooms; Identity Platform currently includes 50,000 MAUs before paid tiers. Keep anonymous cleanup disabled even if enabling it could reduce billing. Verify prices and region at deployment, and record MAUs, relay fraction, outbound traffic, CPU/memory, backups, domain/tax, and operational effort. See [VPS pricing](https://www.digitalocean.com/products/droplets), [backup pricing](https://www.digitalocean.com/pricing/backups), and [Firebase pricing](https://firebase.google.com/pricing).
- Stay single application node initially. Future sharding must route REST, room namespace, and voice namespace to the same owner; ticket admission, membership locking, snapshots, outbox delivery, and failover must be coordinated. Do not enable the fork's two-shard PM2 configuration as a shortcut.

**Verify:** CI conformance/integration tests; fault injection for DB/API/TURN restart; backup restoration; graceful deployment under active rooms; resource/traffic report with assumptions; security checks against malformed commands and cross-room signaling.

**Guard:** no capacity claim based on language choice, no dropping events to save memory, no media proxy to work around client playback failures, no disabling TURN to obtain a cheaper estimate.

## 5. Direct development cutover and cleanup

### Phase 7: switch the pre-launch stack

1. Add the fork as the pinned submodule and build the final VPS Node/PostgreSQL/Coturn/Caddy stack with Firebase Auth project/secret configuration. Verify production cannot select Auth Emulator endpoints, and anonymous cleanup is disabled before creating users. Use a fresh development database/volume, create the authoritative schema, and seed fresh rooms for acceptance tests. No old identity, profile, room, membership, stream, credential, or outbox data is imported. Old volumes may be discarded through an explicit documented reset command, not as an incidental setup side effect.
2. Tell testers to uninstall the previous app and install the replacement. Profile/settings/credentials start from the normal fresh-install state; no continuity is required. Verify that newly configured profiles/preferences persist and new guest identity/ownership survives refresh/restart in the replacement.
3. Configure updated clients to the new backend together. No old-client/raw-WebSocket/LiveKit compatibility endpoints are implemented. Keep hostname and invite URL patterns for newly created parties; old development room invitations may become unavailable because those rooms are intentionally not migrated.
4. Run the complete real-device and contract acceptance suite, including newly created room persistence across service restart, same-owner rejoin, voice/background behavior, and local media preferences. Perform the 24-hour soak and verify backup restoration of the new database.
5. Stop the old Go/LiveKit development services and select the new Compose stack as the default. Only the final application owns the new database. Record the fork/client/image revisions and test evidence; the application is not ready for launch until every parity gate passes.

### Development fallback

Git retains the original implementation. If migration verification fails, return the development environment and a clean test client install to the baseline branch/stack while fixing the new implementation. Development data is disposable, so there is no cross-runtime data rescue or production rollback protocol.

Once launched, rollback is to a previous healthy Node/mesh image with compatible database migrations; do not point mesh clients at Go/LiveKit. The new deployment documentation must include backups and a Node-only rollback rehearsal before launch.

### Phase 8: remove obsolete runtime and documentation

After the final parity suite passes, remove Go runtime/build targets, raw-WebSocket client implementation, LiveKit client/dependencies, token/webhook/admin endpoints, custom guest JWT/refresh issuance and storage, Compose service, keys/hostnames/firewall references, and obsolete monitors from the active project. Existing Git history remains the reference baseline; do not add a permanent legacy adapter layer.

Update root/backend guidance, architecture, deployment docs, OpenAPI/AsyncAPI, client dependency catalogs, and accepted decisions to match the final architecture. Preserve functional requirements, test evidence, migration schema history, and MIT notices. No seven-day drainage window or legacy-client adoption gate is needed for this pre-launch project.

## 6. Verification and completion checklist

| Gate | Required evidence |
| --- | --- |
| Unmodified-fork reuse | Phase 1 harness results and unchanged fork source; supported features separated from product gaps. |
| API/identity parity | Companion route matrix, schema/DTO tests, Firebase anonymous UID-to-UUID bootstrap/refresh/revocation and provider-outage behavior, new profile/preference persistence, PostgreSQL concurrency tests. |
| Room/stream/sync parity | Every scenario in the companion acceptance matrix, with no stock shared-playback command leaking into local controls. |
| Client parity | Native common tests plus Android/JVM compile coverage; real Android player/background tests; browser fixture states retained. |
| Voice parity | Real two/four/eight-peer calls, every participant heard, mute/speaker/route/background/leave tests, forced TURN and network-change tests. |
| Failure/cost readiness | DB/API/Firebase Auth/TURN failure injection, 24-hour 100-room soak, measured relay ratio/resource budget, restored backup and rollback rehearsal. |
| Development switch | Clean client installs and new stack pass together; fresh DB/room fixtures; any old-data reset is explicit; final stack is the documented default. |
| Final removal | Node mesh rollback artifact, updated docs/config without active LiveKit/Go dependencies; no unnecessary compatibility infrastructure. |

Each implementation phase ends with its references read, changes reviewed, meaningful tests run, and a short evidence record containing commit/image SHAs, exact commands, results, and remaining blockers. A phase cannot substitute a typecheck for cross-device voice, or a fake repository test for PostgreSQL concurrency.

## 7. Source and feasibility notes

- Existing Go tests, `go test -race ./...`, and `go vet ./...` passed in the earlier audit; that did not cover the reproduced concurrency/recovery failures. Port requirements and add the missing tests rather than copying the failures.
- The pinned fork's backend TypeScript check passed after dependency installation, but its clean lockfile install failed. Phase 2 resolves reproducibility.
- Native WebRTC artifact availability was verified from its published Maven POM. Packaging, audio statistics behavior, and eight-device battery/route behavior still require Phase 5 device evidence.
- This document is a plan, not a claim of completed migration, production capacity, zero relay cost, or voice support on currently unimplemented platforms.
