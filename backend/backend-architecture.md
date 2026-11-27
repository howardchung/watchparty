
  # Cost-Conscious watchparty Backend Architecture

  ## Summary

  Build a portable Go modular monolith for room management, presence, playback synchronization, guest identity, and LiveKit authorization.

  - Runtime: current stable Go, net/http, coder/websocket, pgx, sqlc, PostgreSQL.
  - Deployment: Docker Compose on any Linux VM; no Kubernetes or Redis initially.
  - Media: self-hosted LiveKit and Coturn as separate containers.
  - Initial clients: watchparty Android; APIs remain client-neutral. clients/web stays mock-only.
  - Capacity: eight identities per room, reserving one place for an absent owner.
  - Rooms close immediately when the final member leaves; retain a minimal 24-hour tombstone for “room ended” previews.
  - Voice is opt-in, starts muted, subscribes to every speaker, and remains connected while the app is backgrounded.
  - Owner abort stops the shared stream but does not affect voice or room membership.

  The dominant bottlenecks are LiveKit packet fan-out, media egress, and TURN relay usage. Go API compute and PostgreSQL remain comparatively small through 1,000 concurrent rooms.

  ## Architecture and Contracts

  ### Service boundaries

  Keep one deployable Go process with internal modules for:

  - Guest identity and token rotation.
  - Room lifecycle, membership, ownership, invitations, and previews.
  - Shared stream authorization and durable state.
  - Realtime presence and playback telemetry.
  - Explicit sync-to-leader calculation.
  - LiveKit token issuance and signed webhook handling.
  - Transactional outbox delivery for durable room events.

  PostgreSQL stores identities, refresh sessions, rooms, memberships, stream state, idempotency records, tombstones, and the event outbox. Playback positions and one-time realtime tickets remain bounded in memory and are never
  persisted.

  ### Identity and authorization

  - POST /v1/guest-sessions creates a durable anonymous identity with name, avatar, and language.
  - Return a 15-minute signed access token and rotating 90-day opaque refresh token; store only refresh-token hashes.
  - Ownership is tied to the guest identity UUID, not display name, device connection, or LiveKit identity.
  - A lost guest credential cannot reclaim ownership in v1; account registration and recovery remain deferred.
  - Allow one active room membership per identity and one authoritative realtime connection per room.
  - Require authentication for room preview, joining, stream operations, realtime tickets, and voice tokens.

  ### Room lifecycle

  - Generate eight-character Crockford Base32 party codes, excluding ambiguous characters.
  - Room creation joins the creator as owner and accepts an optional title; default to "<name>'s party".
  - Enforce eight identities maximum. When the owner is absent, admit at most seven guests so the original owner can always return.
  - Preview does not create membership. It returns title, owner name/presence, participant count, availability, and stream state.
  - Explicit leave is immediate. Unexpected disconnection receives a 30-second grace period.
  - A member remains present if either their room WebSocket or authenticated LiveKit participant is connected, supporting background voice.
  - When the final member is gone, mark the room ended immediately, remove its LiveKit room, and retain only preview-safe tombstone data for 24 hours before purging it.
  - Ownership never transfers. Rejoining with the original identity restores owner permissions.

  ### Stream lifecycle

  Use authoritative states EMPTY, ACTIVE, and ABORTED, plus a unique streamSessionId and monotonic revision.

  - Only the present owner may start a stream.
  - Accept HTTPS direct-video URLs only; validate syntax and length but never fetch, inspect, proxy, or store video bytes.
  - Starting creates a new stream session and broadcasts stream.started.
  - Require abort before replacing an active stream.
  - Aborting broadcasts stream.aborted, retains the last URL as metadata, and stops all client players.
  - Abort leaves membership, presence, invitations, and LiveKit voice untouched.
  - Clients retain complete local control over pause, seek, and volume; these actions never mutate durable stream state.

  ### Realtime and playback synchronization

  Use versioned JSON over one authenticated room WebSocket. Create a single-use, 30-second realtime ticket through REST instead of placing access tokens in URLs.

  Client messages:

  - Playback report on connect, seek, play, pause, and every three seconds while active.
  - Explicit sync request containing stream session, current local position, and a client-generated correlation id.
  - Ping/pong and client acknowledgement messages.

  Server messages:

  - Full room snapshot on connection or recovery.
  - Member joined, absent, returned, and left.
  - Owner presence changed.
  - Stream started or aborted.
  - Sync target/result.
  - Room closed and stable error codes.

  For synchronization:

  - Retain reports for 15 seconds.
  - Project playing positions from server receipt time; paused positions remain eligible.
  - Select the greatest fresh position from the current stream session.
  - Return only the target position and APPLIED, ALREADY_LEADING, or UNAVAILABLE; never reveal participant drift or leader identity.
  - Echo the request correlation id on the result so clients can discard stale replies.
  - Never rewind the requester and never broadcast the sync action to others.
  - A connection whose send buffer overflows is closed so it reconnects and reseeds from a full snapshot instead of silently missing durable events.
  - Losing the API process discards telemetry only. Durable room/stream state survives, and reconnecting clients reseed positions.

  ### HTTP API

  Publish OpenAPI 3.1 and an AsyncAPI/WebSocket schema for:

  - Guest session creation, refresh, revocation, and profile update.
  - Room creation, preview by code, join, snapshot, and leave.
  - Owner stream start and abort.
  - Realtime ticket issuance.
  - POST /v1/rooms/{roomId}/voice/session-token.
  - Internal signed LiveKit webhook ingestion.

  Use Idempotency-Key for room creation, joining, start, and abort. Return stable machine-readable errors such as ROOM_NOT_FOUND, ROOM_ENDED, ROOM_FULL, OWNER_ABSENT, FORBIDDEN, STALE_STREAM_REVISION, and RATE_LIMITED.

  ## Voice, Cost Controls, and Deployment

  ### LiveKit integration

  - Preserve the existing self-hosted LiveKit plus Coturn decision.
  - Issue five-minute room-scoped LiveKit JWTs only to active backend members.
  - Grants allow joining one room, publishing microphone audio, and subscribing to audio; deny video, data publishing, recording, and administration.
  - Use stable membership IDs as LiveKit identities and include display name/avatar as metadata.
  - Join voice only after user action and start muted.
  - Use mono Opus around 24 kbps with discontinuous transmission and normal WebRTC transport encryption.
  - Subscribe to every published speaker.
  - Active-speaker indicators come directly from LiveKit SDK events.
  - Signed LiveKit webhooks maintain voice presence when the room WebSocket is suspended in the background.
  - Explicit leave or room closure uses the LiveKit server API to remove the participant immediately.
  - LiveKit failure remains non-blocking for rooms and playback.

  ### Cost controls

  - Never proxy video or record/transcribe voice.
  - Keep playback reports in memory and exclude participant IDs from metric labels.
  - Aggregate logs and metrics; retain operational logs for seven days by default.
  - Close empty rooms immediately and purge transient records quickly.
  - Run one API node and one LiveKit node without Redis initially.
  - Add Redis only when multiple LiveKit or API nodes are required.
  - Expose optional Prometheus/Grafana tooling through a disabled-by-default Compose profile.

  Illustrative monthly cost remains approximately:

   Concurrent rooms    Go API VM    Complete platform estimate
  ━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  1          ~$6                          ~$24
  ──────────────────  ───────────  ────────────────────────────
                 10          ~$6                       ~$48–65
  ──────────────────  ───────────  ────────────────────────────
                100         ~$12                     ~$360–900
  ──────────────────  ───────────  ────────────────────────────
              1,000      ~$24–48                 ~$3,400–9,300

  These ranges assume eight users per room and vary primarily with speech activity and egress. LiveKit’s benchmark models intermittent audio around 3 kbps, while the conservative design estimate assumes continuous 32 kbps publishing.
  LiveKit benchmark (https://docs.livekit.io/transport/self-hosting/benchmark), reference VM pricing (https://www.digitalocean.com/pricing/droplets)

  ### Portable deployment

  Provide pinned multi-architecture OCI images and Docker Compose services for:

  - TLS ingress.
  - Go API.
  - PostgreSQL.
  - LiveKit.
  - Coturn.
  - Optional observability.

  Require a Linux VM with a static address, persistent volumes, TLS DNS names, and the necessary TCP/UDP port ranges. Mount secrets rather than baking them into images.

  Scaling stages:

  1. 1–10 rooms: all services on one VM.
  2. Up to ~100 rooms: move LiveKit/Coturn to a dedicated media VM; keep API and PostgreSQL together.
  3. Toward 1,000 rooms: shard LiveKit across media VMs, introduce Redis for LiveKit routing, scale Coturn by relay usage, and separate PostgreSQL.
  4. Add Kubernetes only if operating several nodes makes Compose-based deployment materially harder; it is not a v1 requirement.

  ## Documentation, Roadmap, and Validation

  ### Documentation changes

  - Add a shared backend technical design covering the architecture, schemas, protocols, deployment, costs, and threat model.
  - Revise the voice technical design to use the unified membership service and room-scoped token endpoint.
  - Record accepted requirements: eight-person cap, owner slot reservation, 30-second reconnect grace, immediate empty-room closure, guest identity ownership, opt-in muted voice, background voice continuity, and voice surviving stream
    abort.

  - Update requirements analysis, design decisions, assumptions, and open questions so backend implementation is no longer described as globally out of scope.

  ### Implementation phases

  1. Scaffold the Go service, OpenAPI/AsyncAPI contracts, migrations, Docker Compose, health checks, and guest identity.
  2. Implement room creation, preview, join/leave, owner restoration, capacity enforcement, tombstones, and idempotency.
  3. Add WebSockets, snapshots, outbox events, presence reconciliation, and playback synchronization.
  4. Integrate LiveKit token issuance, webhooks, participant removal, Coturn, and voice failure isolation.
  5. Replace watchparty fixtures with domain/data repositories and keep ViewModels dependent only on domain contracts.
  6. Add load testing, failure injection, backups, metrics, alerts, security hardening, and staged feature flags.

  ### Test and acceptance plan

  - Unit-test ownership, owner reservation, immediate closure, disconnect grace, stream transitions, and sync projection/tie/no-op behavior.
  - Integration-test PostgreSQL transactions, outbox recovery, token rotation, idempotency, and signed LiveKit webhooks.
  - Contract-test generated Kotlin clients against OpenAPI and every WebSocket message variant.
  - Test API restart recovery: durable stream state returns, telemetry is reseeded, and voice remains independent.
  - Test explicit owner leave with remaining members, owner return, owner abort while voice continues, and final-member cleanup.
  - Run 1/10/100/1,000-room load profiles with eight sockets per room and five-second telemetry.
  - Target the Go API to remain within 2 vCPU and 4 GiB at 1,000 rooms, with REST p95 below 100 ms and room-event delivery below 250 ms.
  - Validate two-, four-, and eight-person LiveKit calls, TURN-only connectivity, background voice, reconnection, packet loss, and median healthy-network conversational latency below 300 ms.
  - Roll out rooms first, synchronization second, and voice last behind independently disableable feature flags.

  ## Assumptions

  - Native Android integration is first; desktop voice and real clients/web networking remain deferred.
  - No registered accounts, moderation, recording, text chat, server-hosted video, or multi-region deployment in v1.
  - Background voice intentionally remains connected and therefore is not available as a cost-saving mechanism.
  - PostgreSQL is authoritative; Redis and Kubernetes are scaling tools, not baseline dependencies.
  - Final VM/provider selection follows measured LiveKit network and CPU load rather than changing application contracts.
