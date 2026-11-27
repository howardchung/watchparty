# WatchParty migration: behavior and interface specification

This is the acceptance companion to [the migration plan](watchparty-backend-migration-plan.md). It preserves user-facing behavior while allowing client transport and voice implementation changes. DD-028 replaces the original Firebase authentication choice with backend-owned guest sessions. The authentication cutover uses fresh guest identities without importing old ownership; non-secret local preferences survive. Existing Go source, actual client DTOs, OpenAPI/AsyncAPI, and accepted decisions define the functional baseline; known implementation bugs are not required behavior.

## 1. Behavior coverage

| Area | Behavior that must survive | Unmodified fork status | Required migration work/test |
| --- | --- | --- | --- |
| Settings | Name, illustrated avatar, language and theme; persisted local settings and durable guest profile | Ephemeral name/picture commands only | Guest/profile API plus unchanged preferences/UI; restart/profile round trip. |
| Guest ownership | Stable identity survives refresh/restart; display name is not ownership | Browser UUID/Firebase identities have different semantics | Backend credentials resolve directly to the internal UUID; the same saved identity regains owner permissions. |
| Create party | Optional title, default title, creator becomes owner; no registration | `/createRoom` lacks watchparty owner semantics | Atomic room + owner membership + outbox; preserved default title. |
| Preview/cancel | Title, owner status, participant count, stream status, available/full/ended states before joining | No matching guest preview contract | Authenticated read-only preview; cancel must not consume a seat. |
| Join/invite | Code normalization, copy/share feedback and existing links | Stock moniker/namespace names differ | Keep existing eight-character codes and parsing; invitation addresses remain usable. |
| Capacity | Eight identities; reserve owner's place when absent | Configurable roster size, no reserved owner seat | DB-serialized cap/rejoin; race tests. |
| Membership | One active party per identity; original membership UUID on rejoin | Socket/client roster only | Durable memberships and safe identity admission locking. |
| Owner absence | Party/video/voice remain; controls return to the same owner; never transfer ownership | Stock lock/owner behavior differs | Guest-owner presence/permissions and explicit return events. |
| Presence | Unexpected disconnect has 30-second grace; room OR voice keeps user present | Immediate roster removal | Role leases and reconnect grace; no crash-stale flags. |
| Ended party | Final member leaving closes immediately; preview-safe tombstone for 24 hours | Empty-room persistence/unloading differs | Durable ended state, resource cleanup and purge. |
| Shared stream | Present owner starts/aborts; abort before replacement; unique session and monotonic revision | URL hosting exists; permissions/state differ | Atomic stream lifecycle and equivalent empty/active/aborted UI states. |
| Direct playback | Video stays device-local; progressive/HLS, loading/error/retry and live limitations | URL distribution exists | Preserve player engines and errors; backend never fetches/proxies video. |
| Local controls | Play/pause/seek/volume affect only the current viewer | Stock commands broadcast | Client-local player controls; shared commands unavailable for watchparty. |
| Explicit Sync | Only requester advances to furthest fresh position; no rewind or visible drift/leader | Timestamp map broadcast; different sync policy | Private fifteen-second telemetry, server projection and correlated reply. |
| Voice admission | Optional, microphone only, starts muted, no camera/login prerequisite | Signaling/media capability available | Native engine, authenticated voice role, private ICE configuration. |
| Group voice | All opted-in peers hear one another, including ownerless rooms | Peer mesh signaling available | Seven links per device at eight peers; no silent omission. |
| Speaking/mute | Indicators correspond to stable membership IDs; mute/unmute and clear-on-leave | Mute signaling exists; no LiveKit speaker events | Audio-level statistics and stable identity mapping. |
| Voice independence | Video abort/start/local controls do not end or mute voice | Separate signaling/media possible | Separate session lifetime; simultaneous video/voice test. |
| Android background | Existing foreground session, notification return/mute/leave; background is not leave | No native lifecycle implementation | App-scoped peers/signaling integrated with SessionKeeper. |
| Android close/leave | Explicit leave on task removal and in-room confirmation; fullscreen back exits fullscreen first | Socket drop differs | Preserve navigation and leave sequence; close microphone/peers/service. |
| Connectivity errors | Offline snackbar for transport failures, stable inline business errors, recoverable player/voice states | Fork error strings differ | Map into existing domain/UI outcomes; cancellation is not an error. |
| Subtitles/audio tracks | Android embedded/HLS/local subtitles, subtitles off, local audio selection/automatic | Stock subtitles are shared | Keep Media3/document picker behavior; emit no server track-selection command. |
| Existing platform/prototype states | JVM placeholders and room operations; isolated web fixture previews (directional-sync variations archived under DD-023); light/dark/large text/RTL/a11y | Fork UI differs | Retain existing screens and seams; compile/build/state regression checks. |

## 2. HTTP surface to retain and extend

Keep useful existing `/v1` room/profile operations. Client changes are allowed and old binaries need not work against the new service. Copy their product JSON fields/nullability from [OpenAPI](../backend/openapi/openapi.yaml), native `data/party/dto/Dtos.kt`, and current HTTP handlers. Replace the raw-WebSocket and LiveKit-only operations explicitly below. Errors retain `{code,message}`.

| Method/path | Success response / semantics |
| --- | --- |
| `POST /v1/guest-sessions` | 201 guest session and identity from `{name,avatar,language}`; automatic anonymous creation, no login UI. |
| `POST /v1/guest-sessions/refresh` | 200 session for the same identity; native `{refreshToken}`, browser cookie and empty JSON body. |
| `POST /v1/guest-sessions/revoke` | 204; authenticated identity-wide credential revocation, membership release and ticket/role cleanup; never invoked on ordinary leave. |
| `POST /v1/guest-sessions/reset` | 204; guarded browser-only explicit recovery, revoke known cookie identity and clear the cookie. Does not create a new guest. |
| `POST /v1/identities/bootstrap` | 200 `{identity}` for the authenticated internal UUID; never creates or overwrites the profile. New clients initialize directly from the session response. |
| `PATCH /v1/guest-sessions/profile` | 200 `{identity}`; preserve profile validation. |
| `POST /v1/rooms` | 201 `{room,membership}`; optional title; owner joins. |
| `GET /v1/rooms/{code}/preview` | 200 code/title/ownerName/ownerPresent/participantCount/availability/streamState. |
| `POST /v1/rooms/{code}/join` | 200 `{room,membership}`; rejoin restores original role. |
| `GET /v1/rooms/{roomId}/snapshot` | 200 `{room,members,stream}`; active membership authorization. |
| `POST /v1/rooms/{roomId}/leave` | 200 `{roomClosed}`; immediate membership release. |
| `POST /v1/rooms/{roomId}/stream/start` | 201 `{stream}`; HTTPS URL, present owner, no active replacement. |
| `POST /v1/rooms/{roomId}/stream/abort` | 200 `{stream}`; no membership/voice effects. |
| `POST /v1/rooms/{roomId}/realtime-ticket` | `{ticket,namespace,expiresAt}` for the Socket.IO room role; namespace is `/watchparty/rooms/{roomId}`. |
| `GET /v1/rooms/{roomId}/realtime?ticket=...` **removed** | No plain-WebSocket endpoint in the final service; clients use Socket.IO. |
| `POST /v1/rooms/{roomId}/voice/session-token` **removed** | No LiveKit token; clients use mesh configuration. |
| `POST /internal/livekit/webhook` **removed** | No LiveKit webhook; authenticated voice signaling leases replace it. |
| `GET /healthz` | 200 liveness; not a dependency assertion. |
| `GET /readyz` | 200 ready or 503 not ready based on DB/dispatcher; voice readiness separate. |
| `GET /v1/capabilities` **new** | Authenticated `{protocolVersion:3,realtime:["socket.io"],voice:["MESH"]}` when voice is available; advertise actual implementations. |
| `POST /v1/rooms/{roomId}/voice/config` **new** | Active member only; mesh response specified below. |

Authentication uses `Authorization: Bearer <opaque access token>` on protected HTTP requests. Backend-owned PostgreSQL sessions resolve directly to the product identity UUID. Credential creation returns `{identity,accessToken,accessExpiresAt,refreshExpiresAt}` and native responses also include `refreshToken`; timestamps are ISO-8601. Access credentials last fifteen minutes. Stable refresh credentials have a sliding 180-day inactivity lifetime; only SHA-256 hashes of independent 32-byte random credentials are stored server-side. Profile validation remains unchanged.

Browser create/refresh/reset sends `X-Roomio-Client: browser`, an exact allowed Origin, and cookies. The production refresh cookie is `__Host-roomio-refresh` with `Secure; HttpOnly; SameSite=Strict; Path=/`, no Domain, and no refresh secret in JSON. Development uses `roomio-refresh` on localhost HTTP. Native create/refresh sends no browser Origin/header and uses JSON credentials and the secure token-store boundary. Session exchange responses are `Cache-Control: no-store`; cookie credentials are never accepted as product API authorization.

Clients serialize refresh and save native credentials atomically; browser access credentials stay in memory. Cookie restoration precedes browser creation. A non-secret established marker prevents a failed restore or lost issuance response from silently producing another guest. Transient network/database/storage failures retain credentials and offer retry; permanent failures require confirmed reset. The accepted one-time cutover clears recognizable Firebase credentials and old room-resumption state while retaining local non-secret preferences. No registration screen or old-data importer is added.

Access verification checks session expiry/revocation in PostgreSQL. Recheck ticket session on namespace admission, reauthenticate established roles before access expiry, and retain the existing at-most-sixty-second revocation revalidation window. Refresh must not duplicate membership, reset playback, or change mute intent. Explicit revocation disconnects roles and invalidates tickets. Database failure yields 503 `AUTH_UNAVAILABLE`, retains identity, and blocks protected operations; established media may continue through transient outages. No Firebase database, Auth, Functions, or hosting endpoint is required.

All rooms in the replacement use mesh voice. No media-mode column, legacy backfill, or topology selector is required. Existing development rooms are not imported. New invitations retain the current code/URL format and durable owner behavior.

Idempotency keys apply to create/join/start/abort. Preserve existing machine codes/statuses: 400 `INVALID_PROFILE`, `INVALID_PARTY_CODE`, `INVALID_STREAM_URL`; 401 `INVALID_TOKEN`, `SESSION_EXPIRED`, `SESSION_REVOKED`, `INVALID_TICKET`; 403 `NOT_A_MEMBER`, `FORBIDDEN`; 404 `ROOM_NOT_FOUND`, `IDENTITY_NOT_FOUND`; 409 `ROOM_ENDED`, `ROOM_FULL`, `ALREADY_IN_ROOM`, `STALE_STREAM_REVISION`, `NO_ACTIVE_STREAM`; 429 `RATE_LIMITED`; 500 `INTERNAL_ERROR`; 503 `VOICE_DISABLED`, `AUTH_UNAVAILABLE`. Map credential expiry to `SESSION_EXPIRED`, revoked sessions to `SESSION_REVOKED`, and malformed or unknown credentials to `INVALID_TOKEN`; a missing refresh cookie is `UNAUTHENTICATED`. Browser creation with an existing cookie returns 409 `SESSION_EXISTS`. Preserve authentication middleware behavior for missing bearer credentials. New idempotency mismatch errors map to the existing recoverable generic operation failure; no new UI flow is required.

Validation must match the current profile limits (48 Unicode code points for name, current avatar/language byte limits), code normalization, and title/URL rules. Measure Unicode in the same units; JavaScript UTF-16 length is not Go rune count or UTF-8 byte count.

## 3. Socket.IO room contract

Use `/socket.io/`, Engine.IO v4, WebSocket-only transport, default JSON parser. Room namespace: `/watchparty/rooms/{roomId}`. Voice namespace: `/watchparty/voice/{roomId}`. Namespace connect auth: `{ticket,protocolVersion:3}`. Tickets are random, one-use, expire after 30 seconds, and bind identity, membership, room, role, and generation. Do not put access tokens in URLs or accept a client-supplied authoritative sender ID.

Each active namespace accepts `auth.refresh` with `{accessToken}` and an acknowledgement `{expiresAt}`. Verify the new opaque access credential with revocation checks, require the same internal identity, and replace only the authentication expiry/context; membership, role generation, peers, stream, and mute state remain intact. Never log the payload. Failure acknowledges the existing authentication/connectivity error code; pause protected commands/signaling once authentication is expired or cannot be revalidated, and retry reauthentication after transient service recovery. A permanently revoked identity disconnects through the existing session-failure path.

One member may hold one room role and one voice role. Both can share one Engine.IO connection; the Android foreground session maintains it. Replacement is tracked per role so a voice connection does not kick out the room connection as the stock `socketIdMap` would.

Room event names and product payloads:

| Direction/event | Payload and handling |
| --- | --- |
| Server `snapshot` | Existing snapshot payload `{room,members,stream}`, plus last event sequence. Authoritative state; do not restart the same stream. |
| Server `event` | `{topic,eventId,sequence,payload}`; existing durable topics and payloads retained. Deduplicate event IDs; apply stream revisions monotonically. |
| Client `playback.report` | `{streamSessionId,positionMs,playing}`; server attaches room/member/receipt time; no room-wide timestamp broadcast. |
| Client `sync.request` | `{requestId,streamSessionId,positionMs}`; fresh current-session/member validation. |
| Server `sync.result` | `{requestId,status,targetPositionMs}`; `APPLIED`, `ALREADY_LEADING`, or `UNAVAILABLE`; private to requester. |
| Client `ack` | `{eventId}`; event acknowledgement does not imply durable per-client replay; snapshot is the recovery mechanism. |
| Server `error` | `{code,message}`; map to current domain failure/recovery state. |

Topics remain `room.created`, `member.joined`, `member.left`, `member.absent`, `member.returned`, `owner.presence`, `stream.started`, `stream.aborted`, `room.closed`. Map them to current native `RealtimeEvent` classes. Existing stream event payloads use `streamSessionId`; stream DTOs use `sessionId`. Preserve that distinction or update both DTO and parser tests together.

Use Engine.IO heartbeat for Socket.IO; remove application JSON ping/pong when replacing the raw transport. Never feed Engine.IO ping frames into the product event parser. Request/result correlation survives retries; stale sync replies must not move a player after a new stream starts or a newer sync request exists.

## 4. Mesh voice contract and lifecycle

Mesh configuration response:

```json
{
  "mode": "MESH",
  "roomId": "existing-room-uuid",
  "membershipId": "existing-membership-uuid",
  "voiceSessionId": "new-generation-uuid",
  "namespace": "/watchparty/voice/existing-room-uuid",
  "ticket": "single-use-secret",
  "iceServers": [
    { "urls": ["stun:turn.example.com:3478"] },
    {
      "urls": ["turn:turn.example.com:3478?transport=udp", "turn:turn.example.com:3478?transport=tcp", "turns:turn.example.com:5349?transport=tcp"],
      "username": "expiry:opaque-member-reference",
      "credential": "temporary-turn-secret"
    }
  ],
  "iceExpiresAt": "ISO-8601 timestamp"
}
```

Use ten-minute TURN credentials and refresh with the configuration endpoint at five minutes while the voice session is active, supplying `{voiceSessionId}`. Credential refresh returns that same authorized active generation; issuing fresh credentials does not invalidate live peer negotiations. A first request allocates a generation/ticket; reconnect without an active session allocates a new generation. The REST call itself does not opt the user into voice or mark them connected.

On successful voice namespace connect, server sends `voice.roster` containing only opted-in voice members with membership ID, voice-session generation, and muted state. Initial state is muted. `voice.mute` updates the caller's own muted state and roster; muting does not leave the room or the mesh. Disconnecting just the voice role leaves room membership active when the room role remains connected.

Reuse `signal` naming and targeted delivery. Client envelope: `{to,msg}` where `msg` is a JSON string containing `{generation,targetGeneration,peerGeneration,targetPeerGeneration,sdp:{type,sdp}}`, `{generation,targetGeneration,peerGeneration,targetPeerGeneration,ice:{candidate,sdpMid,sdpMLineIndex}}`, or `{generation,targetGeneration,peerGeneration,targetPeerGeneration,restart:true}`. Server emits `{from,msg}` after membership/role/generation checks and derives `from` itself. Each local peer replacement increments its positive safe-integer `peerGeneration`. Initial offers use `targetPeerGeneration: 0`; answers bind the received offer epoch, and ICE/restart packets must match the current pair epochs. Restarts require both known epochs. The lower membership UUID is offerer; stale generation messages and unauthorized targets are rejected. Use at most 64 KiB per signaling message, 20 messages/second with burst 60 per member, at most 64 queued ICE candidates per peer, and a ten-second negotiation deadline followed by bounded retry. These are initial engineering limits, tested with actual gathered candidates, not user-visible settings.

Room command/report frames remain at most 8 KiB. Voice SDP needs its own larger budget rather than inheriting the old raw-room limit blindly. Never allow SDP text to become an upstream URL fetch or log its contents.

Mesh audio is independent of video. Peers close on explicit leave, authoritative roster removal, ICE failure/retry replacement, or generation replacement. During a brief signaling outage established media can continue; reconnect fetches the authoritative roster before new negotiations. The implemented audio-only protocol rejects application/data-channel media sections. Mute uses authoritative voice roster updates; local capture stops immediately on mute/leave. No control data channel is negotiated.

Presence is based on authenticated room/voice role leases, not client self-reported “LiveKit connected” booleans. Track heartbeat/expiry and server instance ownership; expiry gives the same 30-second unexpected-disconnect grace. Resume/rejoin restores the same membership and owner permissions. Process restart discards peer routing/telemetry/tickets; durable room/stream state survives.

Define a transport-neutral native `VoiceConfiguration` carrying the mesh connection descriptor. Keep `VoiceSession` microphone/disconnect/events operations. Speaking events identify membership UUIDs, not Socket.IO IDs or peer connection indexes. Unsupported JVM voice factories retain their current unavailable behavior and are not accidentally bound to Android SDK types.

## 5. Acceptance scenarios

Execute these against both the legacy baseline where applicable and the completed fork/client combination. Compare visible state and outcomes, not incidental timestamps or random IDs.

1. Clean reinstall/fresh database; initial profile/settings flow, newly saved profile/session, settings updates, backend guest issuance/restoration, serialized and concurrent refresh, forged/expired/revoked credentials, browser Origin/cookie protections, concurrent bootstrap, live namespace reauthentication, revoke/restart and database outages; the same internal UUID restores the same ownership, and no transient failure creates a replacement account; no new registration screen or old-data importer.
2. Create default/custom title; preview/cancel/join from typed and copied codes/invite links; unknown/malformed/full/ended rooms; expected loading/error recovery.
3. Seven guests with absent owner; reject an eighth guest; original owner returns; concurrent last-seat joins; same identity races joins/creation; no owner transfer.
4. Explicit owner leave while guests remain: video/voice continue, owner controls disable, owner-away banner appears; same owner rejoin restores controls.
5. Ordinary disconnect, role replacement, 30-second grace and return; room role suspended while voice continues; process restart without phantom seats; final-member leave and tombstone expiry.
6. Only present owner starts/aborts; HTTPS validation; abort before replacement; simultaneous starts/abort; lost-response retry; unique session/monotonic revision; stale/duplicate event handling.
7. One viewer pauses, seeks backwards/forwards, changes volume/subtitles/audio track while others continue unaffected. Reconnect and background transitions do not reset local selections.
8. Sync with fresh playing/paused samples, ties, requester already ahead, stale/other-session reports, no reports, late replies, local seek during request, and server restart. Requester never rewinds; no other player moves; no timeline/drift UI appears.
9. Progressive/HLS/unsupported URL, live-edge controls, buffering/error/retry, local subtitle formats/off, audio automatic/manual selection; backend never transfers video bytes.
10. Voice opt-in/permission denied, initial mute, notification/in-room mute, self/remote speaking indicators, simultaneous speakers, muted source silence, peer churn, two/four/eight-device calls.
11. Forced TURN UDP/TCP/TLS, expired credentials, blocked UDP, Wi-Fi/cellular handover, stale ICE/SDP, offer collision, missing peer, TURN restart, brief signaling/API outage, and recovery without room/video loss.
12. Android background voice, notification return to owning room, notification leave, fullscreen/system-back precedence, task-removal explicit leave, headphone/Bluetooth/phone interruption and restored audio route.
13. Forged sender/room/generation, old ticket reuse, arbitrary proxy access, forbidden camera/chat/VM commands, signaling flooding, stale membership reporting and malformed packets.
14. Updated client build and contract tests; existing JVM room workflows and placeholder states; isolated web preview fixtures; light/dark/RTL/large-text/keyboard/focus/contrast checks.
15. Fresh replacement DB/fixtures and clean app install, new profile/preference persistence, new-party ownership/invitation persistence, development environment switch, new-stack backup restore/rollback, and complete removal of Go/LiveKit runtime references. No old development data continuity is required.

The plan is complete only when the evidence matrix accounts for every row above. A missing platform feature stays explicitly at its current baseline; a feature that works today cannot be renamed “out of scope” to simplify migration.


### Voice v4 manual recovery (DD-031)

Explicit failed-link retry is distinct from automatic restart. The higher membership creates a fresh peer epoch and sends `requestOffer: true` to the lower membership with the ordinary voice-generation envelope and a stable negotiation ID. Target peer epoch zero permits recovery before any answer was received. The offerer rejects stale requester epochs using a high-water mark scoped to both voice generations. A fresh requester epoch repairs only that pair, including asymmetric failure where local ICE still appears connected; other healthy pairs remain. The matching OpenAPI/AsyncAPI contracts are authoritative.

### Active-party error recovery (browser)

An authenticated create/join rejection with HTTP 409 `ALREADY_IN_ROOM` includes optional `activePartyCode` for the requesting identity’s existing membership. The browser offers a persistent, dismissible “Return to party” snackbar action that calls the normal join endpoint for that code. Normal membership, expiry, and room-ended checks still apply. Other errors omit this field; older clients may ignore it.
