# Design Decisions

## DD-001: Approved Primary Visual Direction

- **Status:** Approved
- **Decision:** Use **Immersive Cinema** for the prototype's primary screen.
- **Rationale:** The direct-video player and custom local controls are the strongest visual focus, while Sync, participant presence, voice activity, URL inspection, leave, and owner-only abort remain clearly available. Supported by REQ-013, REQ-017, REQ-020, REQ-023, REQ-025, REQ-032, REQ-035, and REQ-039.
- **Implementation consequence:** On compact screens, the player leads a vertical composition. On wider screens, the player remains dominant and participant/room information moves into a supporting pane. Supported by REQ-001 and REQ-030.
- **Tradeoff accepted:** Participant presence is visually secondary to the player, so avatars and speaking indicators must remain persistent and high contrast. Supported by REQ-023 and REQ-025.

## DD-002: Prototype Platform

- **Status:** Approved for prototype only
- **Decision:** Implement the experience as a React, TypeScript, and Vite browser client under `clients/web/`; use it as the interactive product prototype while the clients evolve.
- **Rationale:** This follows repository guidance while preserving a cross-platform mobile-focused design direction. Supported by REQ-001, REQ-031, and ASM-001.
- **Constraint:** Use local state and fake repositories only. Do not add backend, authentication, production media, or real-time synchronization architecture. Supported by REQ-031.

## DD-003: Material 3 Expressive on Web

- **Status:** Approved for prototype only
- **Decision:** Use semantic CSS custom properties, tonal surfaces, emphasized typography, expressive shape tokens, responsive canonical layouts, and reduced-motion-aware CSS transitions.
- **Rationale:** Material Web is maintenance-only and does not provide full M3 Expressive parity or an official React component library. The prototype therefore uses accessible, spec-aligned React wrappers rather than claiming Compose-level feature parity. Supported by REQ-029, REQ-030, and REQ-039.

## DD-004: Invite and Pre-join Confirmation

- **Status:** Approved for documentation; prototype implementation deferred
- **Decision:** Any current party member can copy the party code or a mock invite link. Invite recipients review the party title, owner status, participant count, and stream status before confirming entry.
- **Rationale:** Sharing completes the path from room creation to participation, while the preview prevents users from entering an unexpected or unavailable room. Supported by REQ-042 and REQ-043.
- **Implementation consequence:** The future prototype needs a party-level invite/share surface plus a pre-join preview with loading, available, owner-absent, full, ended/unavailable, confirmation, and cancellation states. Use semantic Material 3 tonal containers and accessible status text rather than color alone.

## DD-005: Ownerless Room Continuity

- **Status:** Approved for documentation; prototype implementation deferred
- **Decision:** When the owner leaves, the room remains active without an owner. No participant is promoted, and no one can start, replace, or abort the shared stream until the same owner rejoins and regains owner controls.
- **Rationale:** Remaining participants keep their shared context and local playback freedom without weakening the established owner-only permission boundary. Supported by REQ-015, REQ-016, REQ-017, REQ-018, REQ-037, and REQ-044.
- **Implementation consequence:** The future prototype must show a persistent owner-absent status, preserve local playback, Sync, voice, URL inspection, and invite actions, and restore owner-only controls only for the returning original owner.

## DD-006: Compact Room Header and Expressive Participant Presence

- **Status:** Approved for the Compose implementation
- **Decision:** At compact widths below 600dp, use a 64dp small top app bar with a single-line room title, compact brand mark, and unchanged 48dp action targets. Increase party-screen participant avatars from 56dp to 72dp; use a large-increased avatar shape and high-contrast ring for active speakers.
- **Rationale:** The room header must preserve more vertical space for the player on small screens, while participant identity and speaking activity need stronger visual presence within the approved Immersive Cinema direction.
- **Accessibility consequence:** Compacting the header must not reduce action touch targets. Speaking remains communicated through status text, shape, and a high-contrast border rather than color alone.

## DD-007: Invite Friends Share Dialog

- **Status:** Approved for the Compose implementation
- **Decision:** The room invite action opens a responsive Material dialog with a selectable party code and mock invite link. Each option has its own copy action, visible copied feedback, snackbar confirmation, and a manual-selection recovery message when clipboard access fails.
- **Android update (2026-11-11):** Replace the invite-link Copy link action with Share and a share icon. Open the Android Sharesheet with the public invite URL as plain text; retain Copy code and selectable fields. Dismissing the sheet leaves the dialog available, without claiming the invite was sent. If launch fails, show retry/manual-selection recovery. Other clients retain their current link action.
- **Rationale:** Showing both options preserves the prototype flow and lets users share the most convenient identifier without bypassing the required pre-join room preview.
- **Responsive consequence:** Share fields and actions sit side by side when the dialog has at least 400dp of content width and stack at narrower widths or under equivalent layout pressure. All actions retain at least 48dp touch targets.

## DD-008: Home Entry and Room Continuity

- **Status:** Approved for the Compose implementation
- **Decision:** The Home screen opens with the local Nika identity and an ownerless “Friday night screening” room that can be resumed. The primary Create and Join actions remain equally prominent, while the returnable room is a supporting card rather than a competing primary action.
- **Responsive consequence:** At 840dp and wider, the identity and primary actions occupy the leading pane and the returnable room occupies a narrower supporting pane. Below 840dp the card stacks after the primary actions; the two primary actions share a row from 600dp upward and stack on compact widths.
- **Material consequence:** The implementation uses semantic color roles, expressive large-increased containers, 48dp minimum action targets, mirrored directional icons for RTL, and layouts that reflow under large text instead of scaling fixed coordinates.
- **Prototype behavior:** Create, Join, and room-resume actions navigate locally to the existing room experience. Settings edits the mock display name in memory, and the theme action switches the local Material theme.

## DD-009: Party Manager Create and Join Modes

- **Status:** Approved for the Compose implementation
- **Decision:** Use one Party Manager destination with a two-option segmented control. Create is the default mode when entered from “Create a party”; Join is the default when entered from “Join with code.”
- **Create consequence:** The create mode explains ownership before showing one full-width Create action and an abstract cinema illustration. Creating enters the existing empty owner room using local fixture state.
- **Join consequence:** The join action remains disabled until a party code is present. Loading and invalid-code states are represented by the screen API and previews so local repository behavior can be connected without redesigning the surface.
- **Accessibility consequence:** Both mode targets expose tab semantics, directional navigation mirrors in RTL, every icon action retains a 48dp target, and scrolling preserves the complete flow at large font scales.

## DD-010: Full-Screen Profile Editing

- **Status:** Approved for the Compose implementation
- **Decision:** Replace the temporary settings dialog with a dedicated profile destination containing a live identity preview, display-name field, twelve local avatar choices, a disabled language field, and a persistent Save action.
- **Responsive consequence:** Profile content is capped at 712dp inside the 760dp prototype page width. The avatar grid uses three columns from 460dp and two columns below it; the page scrolls behind a safe-area-aware bottom action at compact heights and large font scales.
- **State consequence:** Name and avatar changes remain draft values until Save. Saving trims the display name and updates the Home identity in memory; Back discards the draft. Save remains disabled while the trimmed name is empty.
- **Expressive consequence:** Avatar choices are containerless so their grid width belongs to the portraits rather than card chrome. Selection morphs the portrait into a larger asymmetric shape that overlaps a contrasting tonal frame, adds slight rotation and elevation, and animates between states while retaining a check mark and emphasized label.
- **Accessibility consequence:** Avatar choices expose radio-button selection semantics and visible selected borders/check marks. The live preview and picker have explicit labels, directional navigation mirrors in RTL, and interactive controls retain 48dp minimum targets.

## DD-011: Type-Safe Navigation 3 Back Stack

- **Status:** Approved for the Compose implementation
- **Decision:** Replace the sample-level destination enum with a Navigation 3 `NavDisplay`, a saveable back stack, serializable route keys, and the type-safe entry-provider DSL.
- **Route model:** Home is the root route. Profile and Room are object routes. Party Manager carries its initial Create or Join mode as a serializable route argument rather than mutable navigation state.
- **Back behavior:** App-bar Up actions and system/predictive Back remove the same top entry and never remove the root Home entry. Repeated requests for the current route are ignored to prevent accidental duplicate destinations.
- **Leave behavior:** Confirming Leave in a room clears every entry above Home, so rooms entered through Party Manager cannot reveal that setup flow after departure. Dismissing the confirmation keeps the current Room entry.
- **State consequence:** The local profile identity remains app state outside destination entries and is saveable independently of the navigation stack. Draft profile edits still belong to the Profile entry and are committed only on Save.
- **Motion consequence:** Forward navigation uses a short emphasized horizontal/fade transition; pop and predictive-pop use the matching reverse transition.

## DD-012: Pre-Join Room Preview

- **Status:** Approved for the Compose implementation
- **Decision:** A valid party code opens a dedicated Room Preview route before the user can enter the room. The serializable route carries only the normalized party code; preview details come from local fixtures.
- **Navigation consequence:** “Not now” and app-bar Up pop back to Party Manager with its entered code intact. “Join party” pushes a guest Room route only when availability is Open. Confirmed room departure still clears the entire flow back to Home.
- **State coverage:** Local fixtures represent open/playing, open/owner-away, full, and ended/waiting states. Invalid codes remain in Party Manager with inline error feedback; unavailable previews explain the reason and disable Join.
- **Responsive consequence:** The preview card is capped at 672dp. Its three facts share a row at 560dp and wider and stack below that width; the full screen remains scrollable for compact heights and large text.

## DD-013: Direct Video URL Playback in the Native Client

- **Status:** Approved for the watchparty Compose client (Android first)
- **Decision:** The Android client plays user-supplied direct video URLs through Media3 ExoPlayer within the room screen. The playback engine is owned by an Android-only composable and surfaced to the shared UI through a thin common player API; the ViewModel stays platform-neutral.
- **Scope:** Progressive HTTP(S) files and HLS live streams are supported. Desktop renders the existing canvas placeholder until a platform engine is approved; the shared player interface remains the integration point for desktop.
- **Validation consequence:** Any well-formed HTTP(S) URL is accepted; playback failures surface through the player error path instead of URL pre-validation. Cleartext HTTP is permitted for this feature through a debug network security configuration.
- **Live consequence:** Live HLS streams (short or unset duration) show a Live indicator and hide scrubber and skip controls. The Sync control remains a local placeholder (targets the room position constant) until a synchronization contract exists.
- **State consequence:** Player state reports IDLE, BUFFERING, READY, PLAYING, PAUSED, ENDED, and ERROR plus position, duration, buffered position, and live flag. The room screen's Loading/Buffering/Playing/Paused/Error states derive from those reports, preserving the required experience states.
- **Platform consequence:** The engine is created lazily only when a player surface is needed (not in previews or the guest waiting states), released with the composable, and paused automatically when the app stops.

## DD-014: Cost-Conscious Go Backend Implementation

- **Status:** Approved for the backend implementation
- **Decision:** Implement the backend defined in `backend/backend-architecture.md` as a portable Go modular monolith. PostgreSQL is authoritative; room events flow through a transactional outbox to authenticated room WebSockets; playback telemetry and single-use realtime tickets stay in memory; LiveKit voice is optional and failure-isolated.
- **Scope:** Guest identity with rotating refresh tokens, room lifecycle with owner-seat reservation and 24-hour tombstones, shared stream start/abort with revisions, explicit sync-to-leader, signed LiveKit webhooks, an OpenAPI 3.1 HTTP contract, an AsyncAPI 3.0 WebSocket contract, and Docker Compose services for TLS ingress, the API, PostgreSQL, LiveKit, and Coturn. Registered accounts, moderation, recording, text chat, server-hosted video, multi-region deployment, Redis, and Kubernetes remain out of scope for v1.
- **Constraint superseded:** The earlier "backend out of scope" constraints in DD-002 and the design-phase restraint guidance continue to apply to `clients/web/`; the backend boundary is now implemented under `backend/`.
- **Consequence:** KMP clients can replace fixtures with repositories backed by this contract; the shared player seam in `clients/native/` remains the integration point. Contract tests against the generated Kotlin client and a 1/10/100/1,000-room load profile remain follow-up work.

## DD-015: Single-VM Deployment with LiveKit Built-in TURN

- **Status:** Approved for the backend deployment
- **Decision:** Deploy the Docker Compose stack on one Linux VM (AWS EC2) with Caddy (TLS ingress), the API, PostgreSQL, and LiveKit. Voice media relays through LiveKit's built-in TURN server. This supersedes the Coturn service described in DD-014 for the v1 deployment.
- **Rationale:** LiveKit's built-in TURN advertises itself to clients and issues short-lived relay credentials automatically, removing a container, a shared static-auth-secret, and TLS certificate coordination between two products. A single VM matches the 1-10 concurrent room stage in `backend-architecture.md`.
- **Security consequence:** Only Caddy (80/443) and the TURN endpoint (3478/udp+tcp, 50000-50100/udp) are publicly reachable; the API (8080), LiveKit signaling (7880), and PostgreSQL (5432) stay on the internal network. Secrets live in a `0600` `.env`; the API image runs non-root; Caddy terminates TLS with HSTS and content-type hardening.
- **Tradeoff accepted:** TURN-over-TLS on 5349 and offsite backups/monitoring are deferred. Relay traffic remains DTLS-SRTP encrypted; only TURN-as-TLS-fallback for restrictive networks is unavailable. A dedicated Coturn (or multi-node TURN) returns at the ~100-room scaling stage.
- **Setup guidance:** `backend/deploy-aws.md` documents the AWS console steps (EC2, Elastic IP, security group, Route 53) and how to bring the stack up.

## DD-016: Offline Network Requests Show a Snackbar

- **Status:** Approved for the watchparty native client
- **Decision:** When a network-backed request fails before reaching the backend (DNS, connection, or timeout, e.g. while offline), the native client shows a short snackbar ("You're offline. Check your connection and try again.") instead of crashing or silently doing nothing. Non-connectivity failures facing user input keep their existing inline errors, such as the invalid party code hint.
- **Scope:** Party creation, party code preview, joining, room snapshot on open, and stream start. Backend contract errors continue to map to their stable machine codes; only transport-level failures map to the shared connectivity code.
- **Consequence:** Repository transport failures normalize to a stable `PARTY_CODE_NETWORK` (`NETWORK`) `PartyException`, allowing presentation to detect offline states uniformly. Coroutine cancellation is always rethrown. Voice and token refresh failures for non-party actions remain out of scope for this pass.

## DD-017: Directional Sync with Consent (clients/web prototype exploration)

- **Status:** Archived/deferred by stakeholder request on 2026-10-15
- **Decision:** Replace the single "Sync to room" action with a directional sync flow. Tapping sync offers two intents:
  - **Bring everyone to me:** sends a consent request to the other participants showing who is asking and the target time ("Mira wants to move to 25:42 — do you agree?"), with a "turn off sync requests from others" option that is also configurable as a room setting.
  - **Take me to others:** opens a chooser where the requester sees each participant's current playback time (and how far ahead or behind they are) and picks one person to follow, then moves to that person's time.
- **Rationale:** The previous single action always forwarded the user to the leading participant and gave the rest of the room no say. Directional sync keeps the two legitimate goals explicit (gather the room, or catch up to someone) and makes cross-device position changes consent-based instead of silent.
- **Interaction consequence:** The sync surface must represent a direction chooser, an outgoing request composer with pending feedback, an incoming request with agree/decline, a participant-with-time picker, and a room-level "allow sync requests" setting. These are required states beyond the existing idle/sync states.
- **Accessibility consequence:** Direction, target time, requester identity, and pending/agreed/declined status must be conveyed with text and shape, not color alone. Time comparisons use tabular numerals. Every new control keeps a 48dp target, and request surfaces use live-region/alert semantics.
- **Prototype variations:** Three coherent directions are implemented behind the `sync` preview states and an in-room variation switcher:
  - **A · Sheet:** modal bottom sheet with two expressive action cards, then a composer or participant list.
  - **B · Inline:** the sync band itself splits into the two intents and expands in place, with an inline incoming-request banner instead of a dialog.
  - **C · Center:** a "Sync center" bottom sheet built around a horizontal participant timeline; users pick a target marker or follow a person's marker.
- **Conflict:** This supersedes the resolved answer to Open Question Important 7 ("do not design visible ahead/behind indicators, participant timelines, or drift badges") and refines Important 4 (the old single sync target was the leading participant). The conflict and the unresolved request semantics are tracked in `open-questions.md`.
- **Scope:** Prototype-only, local state and fixtures. No real-time synchronization, backend contract, or persistence is implied. The native client (`clients/native/`) keeps its existing local sync placeholder until this direction is accepted and a shared contract is defined.



## DD-018: Background Room Session Foreground Service (watchparty Android)

- **Status:** Approved for the watchparty native client (Android first)
- **Decision:** While a user is inside a room, the Android client runs a foreground service that keeps the room session, realtime connection, and voice call alive off-screen. The service shows a persistent notification whose content intent deep-links back into the owning room and whose actions are **Unmute/Mute voice** and **Leave**.
- **Tap consequence:** The notification carries the room id and owner flag as intent extras. The Android host reads and consumes those extras (including on `onNewIntent`) and the shared navigation pushes the matching room route, so tapping the notification returns the user to the room page rather than an arbitrary screen.
- **Action consequence:** Notification actions are delivered to the service and forwarded to the in-process room session over a process-wide channel. **Unmute/Mute voice** flips the local microphone through the same path as the in-room mic control; **Leave** runs the same leave flow as the in-room confirmation, disconnecting voice, stopping the service, and returning the app home.
- **Permission consequence:** The service uses the `microphone|dataSync` foreground service types and requests `POST_NOTIFICATIONS` at runtime on Android 13+ so the notification stays visible. If the platform refuses a microphone foreground start from the background, the service degrades to a data-sync session that still keeps the room connected.
- **Back consequence:** In-room system back opens the leave confirmation instead of dropping straight to Home; when the video is fullscreen, back exits fullscreen first.
- **Limitation:** Voice is owned by the in-process room session, so the service keeps an existing process alive but cannot restore voice after the process is killed; the notification only exists while the session does. Ownership of the voice call inside the service remains follow-up work.

## DD-019: Closing the Android App Leaves the Room

- **Status:** Approved for the watchparty native client (Android first)
- **Decision:** Backgrounding a room keeps the session alive through the DD-018 foreground service, but closing the app is a leave. When the room screen is destroyed or the task is removed from recents, the client sends the same `POST /v1/rooms/{roomId}/leave` request as the in-room Leave action before stopping the foreground service, so the membership is released for every other participant.
- **Rationale:** A user who swipes the app away has left the party. Without an explicit leave the backend only saw a dropped socket, marked the member *absent* during the reconnect grace period, and kept them in the participant list as "away" even though they were gone.
- **Consequence:** The service exposes a task-removal hook that ends the session (`SessionKeeper.stopAndLeave`). The in-process session releases the membership first and only then stops the service, so the process stays alive long enough to deliver the request. When the owner closes the app, the backend emits `member.left` plus `owner.presence: false`; guests and the owner are removed from the voice party list and the owner-away banner remains until the same owner rejoins, consistent with DD-005.
- **Scope:** Android. Other platforms have no background session to keep alive, so process exit continues to release the socket without an explicit leave.

## DD-020: Local Subtitle Selection in the Android Player

- **Status:** Approved for the watchparty Android client
- **Decision:** The Android player supports soft subtitle tracks exposed by the video URL, including supported embedded/container tracks and HLS subtitle renditions, plus user-selected local subtitle files. Hardcoded subtitles are already part of the video image and need no separate track.
- **Interaction consequence:** A subtitles control is available in the room player controls. It lists available tracks, allows subtitles to be turned off, and opens Android's document picker for a local subtitle file.
- **Scope consequence:** Subtitle choices apply only to the current device, consistent with independent local playback. The Android document picker and Media3 track selection remain behind the shared player/platform boundaries; other targets retain their existing placeholder player behavior.
- **Supported local formats:** SubRip (`.srt`), WebVTT (`.vtt`), SSA/ASS (`.ssa`/`.ass`), and TTML (`.ttml`, `.dfxp`, `.xml`) as supported by Media3.

## DD-021: Local Audio Track Selection in the Android Player

- **Status:** Approved for the watchparty Android client
- **Decision:** Android viewers can choose among supported audio tracks exposed by the direct video URL or restore Media3's automatic audio-track selection.
- **Interaction consequence:** When a URL provides supported audio, an audio-track icon appears alongside the room player's other media controls. It opens a Material 3 selection dialog with the automatic option; available source labels are listed when there are multiple tracks, while a single-track URL presents Automatic as the sole option.
- **Scope consequence:** Audio-track selection applies only to the current device and does not affect other participants. The player reports available tracks through the shared player boundary; non-Android targets continue using their existing placeholder implementation until platform playback is approved.

## DD-022: WatchParty Fork Migration with Peer-to-Peer Voice

- **Status:** Migration direction approved; implementation plan recorded, not yet implemented.
- **Decision:** Replace the existing application backend with an extension of [upstream WatchParty](https://github.com/howardchung/watchparty), use Firebase Anonymous Authentication for guest credentials, and replace LiveKit voice with audio-only peer-to-peer WebRTC plus private TURN. Deploy the fork, PostgreSQL, Caddy, and private Coturn on a conventional VPS; Firebase databases, Functions, and App Hosting are not selected. Client implementation, transport, dependency, and interface changes are allowed; all existing user-visible functionality must remain available.
- **Authentication consequence:** Anonymous sign-in is automatic with no new registration/login UI. Firebase UID maps uniquely to an internal UUID; PostgreSQL retains profile/ownership data. Replace custom JWT/refresh issuance with Firebase token verification and direct client refresh, disable anonymous-account automatic cleanup, and preserve identity during provider outages. Client changes include bootstrap and credential/namespace reauthentication; domain/presentation stay provider-neutral.
- **Experience constraint:** Preserve guest identity/ownership, party codes/invitations, preview/confirmation, ownerless continuity, local player controls, requester-only explicit sync without rewind, opt-in muted voice, speaking indicators, background/notification behavior, clean leave, and local subtitles/audio tracks. Do not adopt the fork's shared play/pause/seek behavior or add camera/text/virtual-browser features.
- **Migration consequence:** Reuse unchanged fork capabilities first in an isolated harness, then implement product gaps and client adapters. The project is not live; old rooms, profiles, settings, and credentials are disposable, and testers may uninstall/reinstall. Switch directly to a fresh database/new app after parity tests; no legacy adapters, old-data/preference import, mixed voice modes, or drainage period is required. New profile/settings and identity functionality still work normally. Retire Go/LiveKit from the active project once the replacement passes verification.
- **Prior decisions:** This supersedes the final Go/LiveKit technology choice in DD-014/DD-015 once migration completes, while retaining their accepted product behavior. DD-016 and DD-018 through DD-021 remain in force. DD-017 remains an unaccepted archived exploration. DD-023 subsequently authorizes local browser/backend integration.
- **Plan:** [Migration phases and rollout](watchparty-backend-migration-plan.md) and [behavior/interface acceptance specification](watchparty-migration-compatibility.md).


## DD-023: Browser Integration with the Migrated Backend

- **Status:** Approved by the stakeholder on 2026-10-15; local implementation.
- **Decision:** Archive the browser-only directional sync exploration and restore the single requester-only Sync action. Connect the browser client to the migrated Firebase/WatchParty backend, including profiles, room lifecycle, real local playback, forward-only sync, and audio-only peer mesh voice. This supersedes earlier clients/web-only restrictions against networking and the requirement to retain active DD-017 variations.
- **Boundary:** Use the existing shared `/v1`, ticketed Socket.IO, and voice contracts. Normal entry uses live services; explicit fixture preview routes remain isolated with no backend/Auth activity. Browser dependencies remain within `clients/web`.
- **Platform adaptation:** Browser codecs, microphone/autoplay permissions, HTTPS, cross-origin media policies, and WebVTT/HLS track support apply. Android foreground services and platform-specific track formats are not browser requirements. Established video stays local across room reconnects; unexpected tab closure uses lease expiry rather than a guaranteed background leave request.


## DD-024: Same-Origin Hosted Browser and API

- **Status:** Approved by the stakeholder on 2026-10-15.
- **Decision:** Deploy the integrated browser build and migrated Node API together on the deployment host. Caddy serves the frontend and routes `/v1` and `/socket.io` to the internal API on the same origin. Use temporary hostnames for the site and authenticated voice relay; keep both DNS-only. This supersedes the earlier temporary `watchparty.me`/`watchparty.top` hostname proposals and the local-only deployment scope.
- **Configuration:** Domain names belong in protected deployment configuration. A later switch to `watchparty.top` changes ingress and TURN configuration. Because browser storage is origin-scoped, moving domains does not automatically preserve the browser's anonymous identity; retain the old origin or plan an explicit transition.
- **Boundary:** Deploy the existing browser integration and pinned WatchParty fork; no production Auth Emulator, legacy Go/LiveKit cutover, Git publication, or capacity claim is implied. Admin credentials stay outside Git and images. See [deployment operations](../backend/deploy/README.md).


## DD-025: Watchparty.top as Primary Hosted Domain

- **Status:** Approved by the stakeholder on 2026-10-16.
- **Decision:** Use `watchparty.top` as the primary website and same-origin API, and `turn.watchparty.top` for authenticated TURN. Keep the original site hostname as a Caddy-served legacy alias so existing browser identities remain usable on the origin where their anonymous credentials are stored.
- **Configuration:** Point both site hostnames and the TURN hostname to the deployment host; configure `SITE_DOMAIN=watchparty.top` and `TURN_DOMAIN=turn.watchparty.top`. Native clients use `https://watchparty.top` as their backend base URL. Firebase's `firebaseapp.com` auth domain remains unchanged; add `watchparty.top` to authorized domains if required by project policy.
- **Consequence:** Browser identity storage is origin-scoped and is not copied to the new hostname. The legacy site alias must remain reachable while users depend on credentials stored there. See [deployment operations](../backend/deploy/README.md).


## DD-026: Fresh Deployment on the Replacement VPS

- **Status:** Approved by the stakeholder on 2026-10-23.
- **Decision:** Deploy a fresh browser/API/PostgreSQL/Coturn stack on the replacement host, using `watchparty.top` for the site/API and `relay.watchparty.top` for TURN. Start with an empty application database and fresh database/TURN secrets; do not migrate old server data.
- **Configuration:** Retain the existing Firebase project and its authentication configuration. The application database is fresh; Firebase accounts and browser-local credentials are not deleted by this deployment. Redirect `www.watchparty.top` to the primary origin.
- **Prior decisions:** Supersedes DD-024/DD-025 host and TURN hostname settings and the requirement to serve a legacy origin on the replacement VPS. Leave the old server untouched.

## DD-027: Request Browser Playback Before Metadata Completes

- **Date:** 2026-10-23
- **Status:** Authorized by the request to investigate, fix, and deploy slow direct-video startup.
- **Decision:** After a shared URL reaches the player, request native playback immediately with automatic preloading. For hls.js, request playback when the manifest is parsed. Handle autoplay denial with a local Play action without waiting for metadata.
- **Slow sources:** After 15 seconds of loading/buffering, offer guidance and an explicit local retry while preserving the in-progress download. For initial MKV loading on Firefox before 158, explain the known full-file AAC metadata scan and suggest an updated browser or a different source format. Do not automatically restart or fail a slow source.
- **Boundary:** Each browser fetches movie bytes directly from the supplied source. No video proxy, server download, storage, transcoding, or new service contract is introduced. Native Android playback remains unchanged.
- **Evidence and limits:** Removing the metadata-only startup cycle does not fix a browser demuxer bug or guarantee a startup time for external sources.


## DD-028: Backend-Owned Automatic Guest Authentication

- **Status:** Approved by the stakeholder on 2026-10-23; implementation and deployment authorized.
- **Decision:** Remove Firebase from both clients, the active Node backend, dependencies, development tooling, and deployment configuration. Keep automatic guests with no registration/login UI; PostgreSQL owns identity and sessions as well as existing product data. Retire the unused fork server/UI that depends on Firebase. Node, PostgreSQL, Caddy, and private Coturn remain the selected stack.
- **Credentials:** Use independent opaque 32-byte random access/refresh credentials and persist only SHA-256 credential hashes server-side. Access expires after fifteen minutes; stable refresh credentials have a sliding 180-day inactivity lifetime and are invalidated by revocation. Successful refresh retains identity and existing room/voice state. Stable refresh credentials make concurrent refresh and lost-response retries safe.
- **Client storage:** Browser access tokens stay in memory and refresh credentials use a host-only `Secure; HttpOnly; SameSite=Strict; Path=/` cookie. Browser session mutations require an exact allowed Origin and `X-Roomio-Client: browser`. Native credentials remain behind the existing platform secure-storage boundary. Transient network, storage, or database failures never authorize automatic guest replacement. Confirmed identity reset is the recovery path for permanently unusable credentials.
- **Cutover:** Start with fresh backend guest identities; no Firebase identity/profile/room-ownership importer or mixed-client period. Remove saved old room-resumption state while preserving non-secret local preferences. Existing database product rows need not be erased. Applied migration checksums remain unchanged; the new schema migration removes provider-specific identity mapping and adds credential tables. Rolling back to the Firebase-backed release requires restoring the pre-cutover database and matching release/configuration.
- **Interfaces:** Shared HTTP contracts define guest-session create/refresh/revoke and browser reset. Socket.IO protocol 3 uses `auth.refresh {accessToken}` and one-use room/voice tickets; authentication refresh must preserve membership, playback, voice peers, and mute intent. No Google authentication request is required for guest creation, restoration, or room use.
- **Prior decisions:** Supersedes the Firebase portions of DD-022, DD-023, DD-025, and DD-026. Other accepted product behavior and the current `watchparty.top` / `relay.watchparty.top` deployment remain unchanged. Historical evidence is retained as history, not active setup instructions.

## DD-029: Browser Media Controls Match Android

- **Status:** Approved by the stakeholder on 2026-10-30.
- **Decision:** Align the browser player with Android's media control order, Material 3 styling, selection dialogs, and compact/expanded layout. Include local play/pause, fifteen-second backward/forward seeking, timeline/time, Sync to room, subtitles, audio tracks, microphone mute/unmute, video mute/volume, and fullscreen. Fullscreen retains these actions, reveals controls on interaction, and hides idle controls after three seconds without hiding keyboard-focused controls. Live sources show a Live indicator and omit ordinary timeline/skip controls.
- **Track selection:** Use subtitle and audio radio-selection dialogs with selected-state feedback. Subtitles offer Off, available tracks, Choose subtitle file, and Done. Audio offers Automatic; list specific tracks when multiple supported tracks are exposed. Each viewer's playback, subtitle, audio, and volume choices stay local; explicit Sync remains requester-only and forward-only.
- **Local subtitle adaptation:** Extend the browser's VTT import to SRT, SSA/ASS, and TTML/DFXP/XML. Convert supported timing and textual content to browser WebVTT locally. Preserve Unicode text and line breaks; advanced font/layout, animation, drawing, and positioning behavior are not guaranteed to match Media3. Reject malformed or unsupported timed content with an actionable error.
- **Platform boundary:** Available source tracks come from HLS or the browser's exposed media-track APIs. Browsers do not expose every MP4/MKV embedded track or support every Android codec. This decision expands DD-023's local subtitle-format scope but does not promise universal container/codec parity. Preserve DD-027 direct-client playback, autoplay recovery, and slow-loading guidance; no server media proxy, download, storage, or transcoding is introduced.

## DD-030: Android Room Invite App Links

- **Status:** Approved by the stakeholder on 2026-10-30.
- **Decision:** Native copy-link actions produce the browser-compatible `https://watchparty.top/?invite=CODE`. Android accepts this HTTPS origin on fresh launches and while running, opens the pre-join preview, establishes the automatic guest session when necessary, and requires explicit Join confirmation. Preview failures provide retry and cancellation; full and ended parties cannot be joined.
- **Boundary:** Validate the incoming action, exact origin, root path, and a single bounded invite parameter. The backend validates room codes, availability, identity, and membership. Incoming links do not grant owner privileges or automatically leave an existing room. Existing notification room-return requests remain separate from invite previews.
- **Deployment:** The website must serve `/.well-known/assetlinks.json` for the Android package and release signing certificate. Debug certificates are excluded. Until website association is published and verified, the handler can be tested explicitly or selected in Android's supported-link settings; automatic browser-to-app routing is not yet guaranteed. This supersedes mock-link wording in DD-004 and DD-007 for production invites.

## DD-031: Retain Mesh Voice with Independent Peer Recovery

- **Status:** Approved by the stakeholder on 2026-11-05; implementation authorized; release acceptance pending.
- **Decision:** Retain Node/PostgreSQL/private Coturn and audio-only eight-person peer mesh. Authenticated roster completion enables the session. Report degraded calls and reconnecting/unavailable peer links explicitly; preserve healthy audio while another link retries. Retry failed links only after three bounded automatic attempts.
- **Lifecycle:** Explicit opt-in starts muted; authorize unmute before capture. Android confirms its microphone foreground service before capture. Task removal leaves; process death never automatically restores the microphone. Movie audio and local playback remain independent.
- **Contract:** Voice protocol 4 separates join, 30-second generation-preserving resume, and ticket-independent ICE credential refresh. Socket leases fence replacement races; stable negotiation IDs make acknowledgement retries idempotent. Room protocol remains 3. Ship coordinated clients/backend without legacy-data migration.
- **Relay:** Add TURN TLS 443 through TCP SNI routing alongside UDP/TCP 3478 and TLS 5349, with configurable capacity ceilings. Capacity and reliable audio require the [physical, relay, recovery, soak, and load acceptance gates](voice-stability-acceptance.md); signaling tests alone do not establish them.

- **DD-031 explicit peer repair:** A user retry by the non-offerer first creates a new local peer epoch, then sends authenticated `requestOffer: true` to the designated offerer. A missing remote epoch uses target epoch zero. Both voice generations and a requester-epoch high-water mark fence stale or duplicate requests. A newer requester epoch proves that remote peer disposal occurred and repairs that addressed pair even if its local ICE state still appears connected; other healthy links stay intact. Automatic restart keeps its strict negotiated-epoch fence.

## DD-032: Browser Active-party Recovery

- **Status:** Approved for browser implementation
- **Decision:** When create or join is blocked by an existing active membership, show a dismissible snackbar with a “Return to party” action. Keep the action visible until used, dismissed, or superseded.
- **Contract:** The authenticated 409 `ALREADY_IN_ROOM` response supplies optional `activePartyCode`. Return uses normal join validation; a failed return shows the relevant recovery error.
- **Boundary:** Preserve one active party per identity. Returning resumes the existing membership; it does not leave the party or create a new one. Native recovery UI is outside this browser change.

## DD-033: Compressed Local Avatar Artwork

- **Status:** Approved by the stakeholder on 2026-11-06.
- **Decision:** Both browser and native clients ship the twelve existing avatars as 512 × 512 WebP images, encoded at quality 80. Preserve avatar identities, artwork, and selection behavior.
- **Assets:** Browser imports reference WebP derivatives; its original PNGs remain unreferenced source artwork and are excluded from the Vite output. Native Compose drawable resources use WebP in place of PNG, retaining the same generated resource names. Native originals remain available in Git history.

## DD-034: Browser Status Feedback Components

- **Status:** Approved for browser implementation by the stakeholder on 2026-11-06.
- **Decision:** Use shared Material 3 styled tonal cards for persistent connection and error feedback, circular progress indicators for ongoing work, and inverse-surface snackbars for brief confirmations. Field validation stays attached to its text field. Recovery actions belong alongside the message.
- **Room continuity:** Per the stakeholder’s follow-up on 2026-11-06, room reconnection runs silently with no reconnecting message, progress card, or delayed notice. Preserve automatic recovery and connection-dependent control availability. Voice feedback lives in the voice pane with readable per-person connection labels and existing retry/resume actions.
- **Accessibility and states:** Status text uses polite live announcements; errors use alerts. Cards reflow for large text, compact screens, and RTL, use light/dark semantic color pairs, and respect reduced motion. Healthy connections add no notice. Persistent failures retain recovery controls; brief confirmations remain dismissible. Selected/pressed/disabled states belong to their existing action components; empty status is represented by absence. Room connection loss adds no notice; media offline errors retain Retry video. This changes browser presentation only.

## DD-035: Browser Voice Controls Match Android

- **Status:** Approved by the stakeholder on 2026-11-06.
- **Decision:** Use Android's voice interaction in the browser: “Talk with the room” with a visible “Join voice” button, “Joining voice…” with an inline spinner, then a secondary-container mic icon button with the same appearance in both mute states and “Mute”/“Unmute” labels. Explicit joining starts muted. Use Android's connected, degraded, reconnecting, and failed-join wording; failed joins offer “Join voice” again.
- **Recovery:** Show a full-width outlined “Retry voice connections” action when degraded or any peer is unavailable. Put peer recovery labels in participant rows. Remove the browser's separate voice status cards and “Disconnect voice” action. Retain “Resume voice audio” for browser autoplay restrictions. This supersedes DD-034's voice-pane presentation where it differs.
- **Interaction:** Voice controls remain available independently of room realtime connectivity. The player's mic control only toggles an existing voice session; joining requires the voice pane's explicit action, including when the player is fullscreen. Leaving the room still releases voice.

## DD-036: Browser Extraction of Embedded MKV Text Subtitles

- **Status:** Superseded by DD-037 after stakeholder review of duplicate media traffic on 2026-11-06. Retained as investigation history.
- **Decision:** When a viewer opens Subtitles for an MKV URL without browser-exposed subtitle tracks, inspect its metadata directly in that browser. Offer supported embedded UTF-8/SubRip text tracks alongside Off and the existing local-file picker. Selecting a track reads nearby indexed clusters and displays timed cues through the browser's text-track renderer. Choices remain local to the viewer.
- **Boundary:** Extend DD-029's browser-track limitation with a bounded client extraction fallback. Preserve DD-027: no media proxy, backend download, storage, or transcoding. Do not scan or download the entire file up front. Discovery reads bounded metadata; media-cluster reads start only after selecting an embedded track. Off, changing tracks, replacing/retrying the source, and leaving the player cancel pending extraction. Extraction failures do not stop video playback.
- **Limits:** Require CORS-readable HTTP byte ranges, usable seek metadata, and supported finite-size clusters. Initially support `S_TEXT/UTF8` with ordinary timed, unlaced BlockGroups; compressed/encrypted tracks, embedded ASS/SSA, and bitmap subtitles retain local-file recovery where applicable. Bound metadata to 2 MiB per element, cluster reads to 8 MiB, and uncached media to 16 MiB per playback window. Keep at most 128 parsed clusters / 2 MiB of estimated cue data. A window looks back 10 seconds and ahead 10 seconds, starting at the preceding indexed cluster; exceptionally long cues beginning before that lookback can be missed after a seek. Native video and extractor reads may duplicate much of the media traffic during continued viewing.
- **Feedback:** Show checking/loading states and recoverable extraction errors with Retry subtitles and local-file selection. Explain additional data use before selection. Unsupported tracks are acknowledged without offering a nonfunctional selection. Preserve light/dark themes, large text, RTL, keyboard access, native/HLS selection, and local imports.


## DD-037: Hybrid Browser Playback with Integrated MKV Tracks

- **Status:** Approved by the stakeholder on 2026-11-06; implementation and exact-source testing authorized. Deployment is separate.
- **Decision:** Use libmedia AVPlayer 1.3.1 for URLs whose pathname ends in `.mkv`, in MediaSource mode with browser decoding. Preserve ordinary native playback for other files and existing native/hls.js HLS handling. Keep watchparty's existing controls, local selections, local subtitle imports, and requester-only forward synchronization.
- **Media boundary:** The integrated engine demuxes/remuxes media and renders supported embedded text subtitles from the same media reads. Remove DD-036's separate extractor and duplicate cluster downloads. Sources still require browser-readable CORS and useful range support; supported codecs depend on the browser. No server media proxy, storage, transcoding, or codec-WASM fallback is introduced. DD-080 subsequently adds on-device software decoding for local HEVC playback.
- **Experience:** Subtitles start Off. Offer embedded text tracks and audio choices, preserve Unicode, normalize common SubRip markup, and retain local subtitle-file recovery. Retry failed media/assets and offer explicit browser playback when enhanced playback fails. Browser playback may lose embedded track access. For MKV links, a viewer can download and open their own copy from the subtitle dialog to regain embedded tracks in the enhanced player while keeping the room’s shared source. Source changes dispose the old engine; autoplay denial offers Play. Seeks preserve paused state and align to the requested timestamp within available samples; reports exclude seeks.
- **Distribution:** Load versioned, self-hosted assets only on MKV use. Distribute upstream licenses, the pinned source reference, and watchparty's version-checked subtitle seek-order patch. The patch resets old cues before seeking so newly fetched cues survive.
- **Evidence and limits:** Bitmap subtitles, advanced subtitle layout parity, universal codec support, physical-device acceptance, and full-movie soak remain unverified or unsupported.

## DD-038: Minimal Android Download Row

- **Status:** Design selected and signed Android release hosting/browser integration authorized by the stakeholder on 2026-11-11.
- **Decision:** Use the outlined download row below the browser home page's Create/Join actions: a phone icon, “Native Android app”, “Background voice party”, and a download icon action with the accessible name “Download native Android app”. Preserve the existing Material 3 tokens and responsive light/dark, large-text, and RTL behavior.
- **Scope:** Selects the download-row concept in [Android download designs](android-download-designs.md). No promotional illustration, slogan, or additional paragraph. Use a versioned HTTPS URL on the existing host; keep the row visible to all visitors with explicit Android labeling.

- **Packaging:** Distribute a signed universal APK with all four CPU architectures and release shrinking enabled.

## DD-040A: Last-room Home Card for Every Viewer

- **Status:** Approved by the stakeholder on 2026-11-11 for browser and native clients.
- **Decision:** Replace the browser's owner-only return behavior and native hidden fixture card with a Last room card containing the actual title and code of the most recently successfully created or joined room. Owners and guests receive the same shortcut. This supersedes DD-008's fixture identity/room continuity behavior.
- **Persistence:** Save only room metadata locally, scoped to the durable guest identity (and service origin in native preferences). It survives restart and explicit departure from an open room. Failed admissions and previews never replace the last successful room. There is no room-history list or cross-device synchronization; an identity reset cannot expose another identity's saved room.
- **Return:** Open the existing fresh room preview before normal join confirmation, preserving DD-004/DD-012. The server remains authoritative for room capacity, membership, and ownership. Native preview admission restores owner mode when the admitted room belongs to the current identity, matching browser behavior. Returning does not automatically join voice or restore local media position/track selections.
- **States:** No saved room means no card. A saved room shows its title/code and a directional return action using the existing adaptive card. Preview loading disables the browser action; the native preview destination owns its loading state. Temporary network/service failures retain cached metadata and allow retry. Full rooms show the current unavailable preview and remain saved. Confirmed ended/not-found rooms remove the shortcut; leaving the final seat also clears it when confirmed by the backend. A lost membership alone does not imply the room has closed. No separate selected state applies; existing buttons supply focus, pressed, and disabled states.
- **Boundary:** Uses existing preview/join APIs and client-local preferences; no backend contract or service changes. Availability displayed by a previous preview is advisory until the server admits the user. Existing same-tab browser active-room restoration and Android notification return behavior remain available.


## DD-039: Marvel and DC Default Guest Names

- **Date:** 2026-11-11
- **Decision:** New browser and native guests receive a random name from the same curated list of 120 Marvel and DC characters (60 from each), such as “Spider-Man,” “Batman,” or “Harley Quinn.” Keep every name digit-free; use “Laura Kinney” rather than the numeric alias. Do not append numbers or enforce uniqueness.
- **Continuity:** Generate the default for initial profile creation and keep it through retries and restarts. Backend profiles remain authoritative; preserve existing names, including previous defaults, and allow editing in Settings. No identity reset or migration is needed.


## Deployment backup policy (2026-11-11)

The stakeholder requested removal of backups entirely. Remove the scheduled
backup service/timer, backup script, and stored backup directory.
Deployments do not create database dumps or file snapshots. Preserve live
PostgreSQL data, protected runtime configuration, public APKs, and TURN renewal.
Retained application releases do not provide database recovery. Historical
deployment evidence remains historical.

## DD-040: Stable Android Voice Output

- **Date:** 2026-11-11
- **Decision:** Android voice defaults to the loudspeaker as soon as voice is joined, including before a movie starts. Prefer wired/USB headphones or an available Bluetooth communication device over the loudspeaker. Retain the current Bluetooth choice when several are available. Starting, pausing, or stopping the movie does not select the voice route.
- **Lifecycle:** Manage communication routing for the voice session, respond to connected/disconnected audio devices, and release the route and restore the preceding audio mode when voice ends or joining fails. Let Android pair the input with the communication output.
- **Audio:** Keep voice and movie playback concurrent, with separate call and media volume categories. Do not request exclusive audio focus or change microphone opt-in/mute behavior. Bluetooth uses communication-capable routes; headset capabilities and Android policy determine the available routes and media quality.

## DD-041: Room Bug Reports with Session Diagnostics

- **Date:** 2026-11-11
- **Decision:** Stakeholder selected a bug icon next to Share/Invite in the room top app bar, one large description field and Send for browser/native. This supersedes the entry-point alternatives in `bug-report-designs.md`.
- **Delivery:** Send description, device/browser metadata and the current application session log to authenticated private PostgreSQL report storage. Disclose the automatic diagnostic attachment in the dialog, redact credentials/URLs in retained logs, retain drafts on failure, and acknowledge only durable server acceptance.
- **Implementation defaults:** See [shared contract](bug-report-contract.md) for schema, retry/idempotency, limits, 30-day retention and operational access. Captured application logs reset at page/process restart. Logs above the upload limit fail explicitly without silent truncation.


## DD-042: AVPlayer by Default with Browser Recovery

- **Date:** 2026-11-11
- **Status:** Approved by the stakeholder's request to make AVPlayer the default with browser fallback. Implementation is local; publication is separate.
- **Decision:** Route all HTTP(S) browser media sources through the existing pinned libmedia AVPlayer in MSE mode. This supersedes DD-037's MKV-only routing and asset-loading restriction. Retain existing controls and direct-client media access; native clients keep their platform players.
- **Recovery:** On an integrated-engine failure while online, or initial startup still lacking playable data after 30 seconds, dispose that engine and switch once to browser playback. Use native HLS when available and hls.js otherwise. Show “Switched to browser playback.” Autoplay denial offers Play; offline failures offer Retry. Ordinary buffering after readiness does not trigger a switch. This narrowly supersedes DD-027's no-automatic-restart rule for initial integrated-engine startup; native slow-source guidance remains unchanged.
- **Local state:** Preserve the current position, pause/play intent, volume, mute, and imported local subtitle across an automatic switch. Match embedded track selections by labels exposed by the fallback engine; otherwise use Automatic/Off. Browser failure offers Retry in that engine. An explicit Try enhanced player starts a new attempt; replacing the source/session resets the lifecycle. No automatic engine loop is allowed.
- **Manifest compatibility:** AVPlayer handles simple manifests; the pinned MSE engine stalls or recreates SourceBuffers during alternate rendition switching in acceptance tests. Manifests exposing multiple audio renditions or external subtitles automatically use browser/HLS recovery before playback to retain working track controls.
- **Limits:** Container support does not guarantee browser codec support or identical track exposure. Native MKV recovery can encounter Firefox's original metadata stall. Cross-browser/mobile Safari acceptance and full-movie soak remain release checks; no server proxy or transcoding is introduced.


## DD-043: Named Material Color Palettes

- **Status:** Approved for browser and native clients (2026-11-11).
- **Decision:** Settings offers the 24 named seed colors in [theme palettes](theme-palettes.md), each with a visible seed swatch and name. Selecting one immediately applies a full Material Tonal Spot palette at standard contrast, with light and dark variants. Keep watchparty default as the initial choice and reset option.
- **Persistence:** Store the color choice locally, independently of profile Save, navigation, guest identity, and backend connectivity. Unknown stored values fall back to watchparty default. A failed local write shows a retry message; browser selection remains applied for the session, while native retains its last successful choice.
- **Implementation:** Browser uses Google's Material Color Utilities; native uses the installed MaterialKolor. Both use Material 2021 Tonal Spot at contrast 0. Generate semantic accent, container, surface, outline, and foreground roles from the seed. The picker shows the original seed, which may differ from the generated primary. Cinema/player and illustration colors keep their dedicated semantic roles.
- **States:** The local catalog is always populated and works offline; network loading/empty states do not apply. Names, visible selection marks, keyboard interaction, focus/pressed states and touch targets support accessible choice. Light/dark mode remains independent of the selected color.

## DD-044: Local Microphone Speaking Indicators

- **Date:** 2026-11-11
- **Decision:** Browser and Android self-avatar speaking highlights indicate recent local microphone activity after explicit voice opt-in and authorized unmute. They work when alone in voice. They do not confirm delivery, remote playback, or that another person heard the speaker; the stakeholder explicitly retained microphone activity semantics.
- **Lifecycle:** Silence releases the highlight after a short hold; mute, capture suspension, and leaving clear it immediately. Keep initial/muted/loading/failed states inactive. Preserve existing remote-speaker indicators and voice recovery controls. This is a detection change with existing visual/accessibility presentation; themes, large text, RTL and layout remain applicable through the existing components.
- **Implementation:** Browser meters its existing capture stream without audible monitoring. Android observes WebRTC PCM while peers exist and uses a session-owned local AudioRecord meter while no peers exist, releasing that recorder synchronously before peer creation. Local sampling runs independently of remote statistics. Keep only bounded transient sample buffers and scalar levels; do not persist or upload microphone samples. Capture failure leaves the optional indicator inactive and does not break voice transport.
- **Scope:** No backend, signaling protocol, or remote delivery receipt changes. Physical microphone, speaker/headset routing transitions and alone-to-peer handoff remain device acceptance checks; build/unit checks do not establish hardware behavior.


## DD-045: Shared Screen Android Launcher Icon Foundation

- **Date:** 2026-11-11
- **Decision:** Stakeholder selected the Shared Screen concept, with bundled variants for all 24 named theme seed colors. Use the exact seed as each background and a contrasting cream or charcoal mark. Basil is the initial icon matching the selected green concept.
- **Scope:** Provide adaptive/legacy vector resources, stable launcher aliases, and a graph-owned selection API. Leave the theme picker, theme persistence and automatic theme/icon association to the separate integration. Keep app invite links on the always-enabled activity.
- **Behavior:** Android persists the enabled alias; updates are atomic on API 33+, replacement-first on older versions, idempotent, and expose recoverable failures. Android themed icons may override palette colors. Other native platforms explicitly report unsupported.


## DD-046: Android Launcher Icon Follows Theme Color

- **Date:** 2026-11-12
- **Decision:** Connect the Shared Screen launcher icon to the saved named theme choice on Android. Each of the 24 named themes selects the matching exact-seed icon; watchparty default selects Basil. This completes the deferred theme integration in DD-045. Light/dark mode does not select another alias.
- **Lifecycle:** Apply the saved choice at app startup and subsequent successful theme changes independently of profile Save, navigation and connectivity. Keep the observer above navigation and use the application graph's controller. No separate icon preference is introduced.
- **Recovery:** Preserve the saved theme if launcher switching fails and show a Retry/dismiss snackbar. A new theme cancels an obsolete pending retry; reopening the app reconciles the saved color again. Failed theme storage leaves the preceding theme/icon selected. Unsupported platforms skip synchronization.
- **Limits:** Launcher refresh timing, OEM behavior and themed-icon overrides retain the limits documented in [Android launcher icons](android-launcher-icons.md).


## DD-047: Simplified Browser Home

- **Date:** 2026-11-12
- **Scope:** Browser client only, as requested by the stakeholder.
- **Decision:** Remove decorative app icons throughout the web UI, including design previews. Home has no app bar, app name, or tagline; place the theme and Settings icon buttons in the page content above the main headline. Remove “Ready when everyone is” and “Your next watch party is one room away.” Use “Stream and chill” as the home headline. Retain the profile, party actions, download link, and last-room shortcut.
- **States:** Existing theme switching, keyboard focus, pressed states, and settings navigation remain available. The controls require no network or loading/empty state. Native presentation remains governed by its existing decisions.


## DD-048: Simplified Native Home

- **Date:** 2026-11-12
- **Decision:** Extend DD-047's simplified home to Android through the shared native Compose screen, also used by desktop. Remove the home app bar, decorative brand mark, name, tagline, eyebrow and supporting copy. Use “Stream and chill” as the headline. Place theme and Settings controls in the scrollable content above it, aligned to the logical end.
- **Layout and states:** Retain safe drawing insets, 48dp icon targets, semantic themes, compact/expanded layouts and scrolling for smaller windows or large text. Retain the profile, Create/Join actions and Last room shortcut, including their existing offline behavior. The local header has no loading, empty or error state.
- **Scope:** This removes the native home’s decorative app branding; no other native in-app brand mark was found. Android launcher icons and saved-theme icon switching remain unchanged.



## DD-049: Persian Language in Browser and Android

- **Date:** 2026-11-12
- **Decision:** Enable English and فارسی in Settings for both clients. Save applies the choice with the profile; Back discards an unsaved language choice. Existing and unsupported preferences use English. This supersedes DD-007's disabled language field and the earlier English-only design scope.
- **Persistence:** Browser maps the profile choice to the existing backend `en`/`fa` language field and caches the saved language for startup and recovery messages. Native stores the language in its local profile, observes it above navigation, and sends its tag when creating/joining/restoring the guest session. No service contract change is required.
- **Presentation:** Translate application copy, recovery messages, player/voice actions, labels, and named color/avatar choices. Persian uses RTL layout with mirrored navigation arrows. Keep URLs, room codes, playback timelines, and media content in their appropriate original direction. Do not translate other users’ saved names, room titles, track metadata or subtitle cues. Fixed avatar-derived names follow their owner’s saved language (DD-061). Android foreground-service notification strings follow the selected process language.
- **States:** The bundled language choices are available offline with radio/select selection, keyboard/focus and pressed feedback. Native local Save failures retain the preceding applied language and show the existing retry error. Browser profile Save uses its existing loading, failure/draft retention and retry behavior; language applies only after server acceptance. Loading/empty states do not apply to the fixed language catalog.
- **Platform boundary:** Use Compose resource qualifiers with a small platform locale environment; shared native resources also become available to desktop. Android and JVM compilation/tests are checked locally.

## DD-050: Web Party Chat Design Previews

- **Date:** 2026-11-12
- **Scope:** The stakeholder requested three interactive text-chat interface variations integrated into the web party screen for comparison. This authorizes a local design exploration; the existing voice-only production scope is not superseded by a selected chat implementation.
- **Preview:** `/?preview=chat&variant=side`, `variant=dock`, and `variant=floating` render the existing party screen with a side panel, an expandable panel below the player, or a floating conversation. A shared switcher changes designs while retaining the in-memory conversation and draft. Direct variant links restore the chosen design; preview messages do not persist after reload.
- **Interaction:** Local mock messages, Enter/Shift+Enter composition, emoji insertion, sending feedback, failed-send retry, draft retention while offline, collapse/open, incoming-message simulation, unread count, latest-message navigation, and Escape dismissal with focus restoration. Messages are plain text and never sent to the backend.
- **States:** Populated is the initial state; preview controls expose empty, loading, send failure and offline states. Blank/offline/loading sends are disabled, selected designs and active preview controls have visible feedback, and loading/offline have local recovery actions. Light/dark, large text, RTL and Persian application copy are available; guest messages keep their original content and direction. Voice and movie controls retain existing behavior.

## DD-051: Product name

- **Status:** Updated 2026-11-26.
- **Decision:** Display the official name **watchparty** in every locale, including browser metadata, previews and native launcher labels. The Persian home headline is «با هم ببینید». The English headline is “Stream and chill”.
- **Compatibility:** Keep published app and bundle IDs, storage keys and download URLs stable. Coordinate the realtime namespace change across the backend and clients.

## DD-052: Cross-platform Side-by-side Party Chat

- **Date:** 2026-11-12
- **Decision:** The stakeholder selected DD-050's side-by-side variation and requested production implementation in all clients and the backend. This supersedes the voice-only text-chat exclusion in DD-014 and the earlier voice-only clarification; voice remains supported alongside text.
- **Layout:** Match the selected web panel's avatars, sender labels, local message bubbles, composer and collapse/unread behavior. Expanded screens put chat beside the movie; compact screens put it beneath player/sync controls, before the remaining party details. Use shared Compose for Android and desktop with safe-area/IME and hardware keyboard adaptations.
- **Service:** Reuse backend-owned guest authentication, active room membership, PostgreSQL transactions and ordered Socket.IO room events. Send over authenticated HTTP with a durable client-generated message ID; bootstrap/recover history with authoritative snapshots and cursor pagination. See [chat contract](chat-contract.md) for limits, retention, errors and delivery semantics.
- **Scope:** Plain text/emoji, room history, explicit retries, collapse/unread and localized accessible states. No attachments, reactions, typing/read receipts or OS notifications are introduced. Preserve preview alternatives for comparison without using their mocks in production.


## DD-053: Bundled Pofak Application Typography

- **Date:** 2026-11-12
- **Decision:** Use Pofak for both the brand and plain application typeface in the browser and Android clients, in English and Persian. Bundle the font files with each client so installation of a system font or access to an external font service is unnecessary.
- **Assets:** The stakeholder supplied eight static TTF weights: 100, 200, 300, 400, 500, 600, 800 and 900. Keep those files independently in each owning client; use normal platform font-weight matching for intermediate or unavailable weights.
- **Licensed Pro update (2026-11-13):** The stakeholder purchased Pofak Pro and registered project license `94QXL3U1`. Replace browser static TTFs with the supplied weight-variable WOFF2 (100–900; 84,120 bytes versus 665,901 bytes for the previous eight files). Use the supplied static TTFs in shared native resources, including the previously missing Bold 700, to preserve Compose platform compatibility. Keep existing typography sizes, weights, language behavior and themes. The bundled guide’s `ss02` equal-width feature affects Persian digits only (confirmed in Chrome); leave existing English timestamp digits unchanged rather than force Persian digits. Existing static fonts already include the numeral and decorative alternates, so these are not Pro-only additions. Serve `FontLicense.txt` beside the browser font and bundle it beside the native fonts; retain the project license notice above browser font declarations in production CSS. Purchase receipts and the personalized usage PDF remain private. Native variable-font integration is unnecessary for this change. Validation: web production build and two Persian compact/expanded layout checks passed; production Chrome loaded the single same-origin variable font across weights 100–900 (including 650 and 700), and English light/Persian dark screenshots were reviewed. Production CSS retains the license code and the license text is publicly served. Android debug assembly and JVM app compilation passed; APK inspection confirmed Bold and the adjacent license file. Physical-device runtime validation was unavailable.
- **Implementation:** The browser ships Pofak through local CSS font-face assets and its semantic typeface tokens. Native uses shared Compose font resources for all standard and emphasized Material typography roles, making the same assets available to desktop as well. Preserve the existing type sizes, line heights, RTL behavior, text scaling, and theme colors. The local font comparison tool remains optional development tooling.
- **States:** Bundled fonts require no download or installation action from app users. Native resources remain available offline; browser font assets are served with the app, with a system fallback while loading. System fallback covers glyphs outside the bundled fonts, such as emoji.


## DD-054: Picture-based Avatar Names

- **Date:** 2026-11-12
- **Decision:** Each of the twelve existing avatar pictures has a fixed character name matching its artwork. Choosing an avatar sets the user's display name; remove custom name entry in browser and native Settings. This supersedes DD-007's display-name field and DD-039's random/editable character names. See [avatar name catalog and contract](avatar-names.md).
- **Language (superseded by DD-061):** Originally kept canonical English names identical for everyone and translated only picker labels into Persian. Save applies avatar and language, and Back discards drafts.
- **Identity:** Duplicate names are allowed. Stable guest/membership UUIDs control authentication, ownership, chat and voice. Repeated avatars can be visually ambiguous; no unique-name constraint or numeric suffix is introduced.
- **Continuity:** Normalize existing profile/membership names without resetting identities or ownership. Preserve historical chat snapshots. Backend derives names and ignores the legacy name input.


## DD-055: Product Analytics and Error Reporting

- **Date:** 2026-11-12
- **Decision:** Use PostHog EU for aggregate usage and product events and Sentry for automatic web/native/backend errors plus manual feedback. Retain the existing backend-owned bug-report dialog, validation, idempotency and 30-day private PostgreSQL retention.
- **Delivery:** New manual reports enqueue in their original database transaction. A single-runtime worker forwards description, allowlisted client context and the redacted session log, using the report UUID as the stable Sentry event ID. Temporary network failures and quota limits retry independently of user acknowledgement. Historical reports are not automatically forwarded.
- **Privacy and scope:** No session replay, screenshots, microphone recording, automatic click capture or chat/media payload collection. Explicit events cover app opens and successful room creation/join, playback start and report submission. Analytics uses a random browser/installation identifier, separate from authentication; user counts represent installations rather than deduplicated people. Automatic errors omit request/user/extra data and exception text while preserving stack locations. Per stakeholder direction on 2026-11-12, remove the diagnostic storage and Sentry delivery notice from the browser and native report dialogs in both English and Persian; report submission and delivery behavior remain unchanged.
- **Operations:** Keep ingestion configuration in ignored local environment/property files or deployment environment variables. Keep source-map/mapping upload authentication only in build-time environment/CI secrets. Separate development and production with environment properties. See `docs/observability.md` for operation and verification details.


## DD-056: Persian Gathering Copy and Chat Shortcut

- **Date:** 2026-11-12
- **Decision:** Use «دورهمی» for room and «گپ» for conversation throughout Persian browser and native UI. The create panel uses «بیا یه دورهمی جدید بسازیم.»، «ورود به عنوان میزبان.» and «یه دورهمی با سینمای خالی، بعدش میتونی دوستاتو اضافه کنی.». Persian playback status is one sentence: «فیلمت داره اجرا میشه» or «فیلمت وایستاده», without the separate local playback label.
- **Both languages:** Remove the members-only chat subtitle and the party-only composer qualifier. Keep the shortcut hint and use Ctrl + Enter to send on hardware keyboards; Enter inserts a newline. Touch send controls remain available. English copy otherwise stays unchanged.

- **Terminology refinement:** The stakeholder also requested «فیلم» throughout Persian playback/stream UI. Use natural verb phrases such as «فیلمت داره اجرا میشه» and «اجرای فیلم»; voice audio remains explicitly about sound. English media terminology is unchanged.

- **Host wording:** Use «میزبان» for the Persian owner role everywhere, including formerly «صاحب اتاق»/«صاحب دورهمی» and absence/rejoin messages.

- **Compact layout:** Stack native playback status above the sync action when space is narrow, so the longer Persian gathering label and large text do not squeeze the status into individual letters.


## DD-057: Consecutive Chat Message Groups

- **Date:** 2026-11-12
- **Decision:** In browser and native chat, consecutive messages from one person share a single sender/“You” and time header above the first bubble. Show “Sent” after the last bubble only. Keep bubbles close together and show the avatar only at the start of a group.
- **Identity and delivery:** Group by stable sender identity, regardless of matching names/avatars or elapsed time. Preserve per-message sending/failure feedback and recovery controls. Recompute boundaries when messages arrive, history loads, or pending messages reconcile.


## DD-058: Bug Report Dialog Notice

- **Date:** 2026-11-12
- **Decision:** Omit the diagnostic storage and Sentry delivery notice from browser and native bug-report dialogs in English and Persian, per stakeholder direction. Keep report submission and delivery behavior unchanged.


## DD-059: Owner-led Synchronization with Revocable Acceptance

- **Date:** 2026-11-12
- **Status:** Accepted product behavior; implemented in the fresh-deployment service contract and browser/shared native clients. Local verification and platform limits are recorded in `synchronization-contract.md`.
- **Supersedes:** The leading-participant, forward-only synchronization rule in REQ-021/REQ-022 and the requester-only restrictions in DD-023/DD-029/DD-036. DD-017 remains an archived exploration; this decision does not adopt its direction chooser, participant timeline, or visual variations.
- **Private sync:** A non-owner's Sync action moves only that viewer to the owner's position, including backward when needed. It does not initiate a group request or interrupt anyone else.
- **Invitation:** Owner Sync pauses only the owner and freezes the invitation target at the owner's current media position. Show who is asking and the timestamp. Pending, declined, and withdrawn viewers retain normal local playback; the room is not globally paused.
- **Revocable acceptance:** Accepting pauses that viewer. Before the owner starts, an accepter can cancel their participation and resume local playback; acceptance never obliges them to remain waiting. The owner sees current response states in real time and can cancel the whole invitation. On owner cancellation, release accepted viewers from the waiting state. Restoring each viewer's preceding playing/paused state is the recovery working assumption.
- **Commit boundary:** The owner can start without unanimous acceptance once at least one other viewer has accepted. The Start button shows the number of accepted viewers excluding the owner, begins at zero, and is disabled at zero (including after all acceptances are withdrawn). Starting locks a snapshot of the currently accepted viewers plus the owner. The server must serialize acceptance/withdrawal against this boundary so the owner starts with an authoritative set. Late accepts cannot enlarge it. After commitment, neither owner cancellation nor participant withdrawal is available for that attempt; ordinary room departure and automatic failure recovery must still work.
- **Preparation and start:** Included players seek to the frozen target, prepare playable buffered data, and report readiness for this attempt. Once all remaining included players are ready, show 3, 2, 1, Action over their playback screens in the app's theme and font and start together. Excluded viewers receive no seek, pause, countdown, or playback command. A shared scheduled start and clock coordination are the proposed technical direction; independent timers triggered by message arrival are insufficient.
- **Automatic recovery:** Bound committed preparation with a deadline. Remove disconnected or failed players with an explanation and proceed with ready participants if coordination remains viable; otherwise automatically end the attempt, explain the failure, and provide recovery. A non-cancellable committed operation must never trap players indefinitely. The fresh-deployment implementation uses the deadlines and owner-loss rules in `synchronization-contract.md`.
- **Required states:** Idle/private catch-up, invitation pending, accepted/paused, declined, withdrawn, owner cancellation, committing, preparing/buffering, ready, countdown, completed, excluded/disconnected, and automatic failure with recovery. Use accessible text for status, with English/Persian, RTL, large-text, light/dark, and compact/expanded support.
- **Scope:** The shared protocol is defined in `synchronization-contract.md` and `backend/asyncapi/asyncapi.yaml`. Continuous drift correction and invitation muting remain outside this change.


## DD-060: Three Owner-led Sync UI Explorations

- **Date:** 2026-11-12
- **Status:** The stakeholder selected variation 03 (focused dialog/mobile sheet); the other variations remain comparison previews.
- **Scope:** Explore DD-059 inside the existing browser party screen at `?preview=sync`. All three share the owner/viewer role selector, existing theme and font, English/Persian, RTL, large text, local mock responses, and on-player countdown. The prototype remains a comparison surface; the selected focused sheet is now integrated into production browser and shared native presentation.
- **01 · Together, right here (`variant=inline`):** An expanding panel below playback; the owner sees response cards and start/cancel actions, while viewers accept or withdraw in context.
- **02 · A place for everyone (`variant=side`):** A dedicated panel beside the movie on expanded screens and below it on compact screens, with a prominent fixed target and stacked live response rows.
- **03 · One shared moment (`variant=sheet`):** A focused dialog on desktop and a bottom sheet on compact screens. Dismissing the surface does not withdraw acceptance or cancel the attempt; View sync reopens it. Committed operations have no manual cancellation action.
- **Selected owner entry refinement:** Before any request exists, opening Sync together shows a live Meet at card and the primary Ask for sync action, with no participant list. Opening or dismissing this draft does not pause playback or send a request. The timestamp follows local playback. Pressing Ask for sync pauses the owner, freezes that exact moment as the invitation target, sends the request, and reveals the live response list. Keep the initial heading Sync together (not Sync everyone). This draft precedes DD-059's invitation phase; the request/acceptance/commit rules remain as documented.
- **Interaction coverage:** Initial/private catch-up; owner request; pending/accepted/declined/withdrawn responses; owner cancellation; locked preparation; readiness; 3/2/1/Action overlay; completion; disconnected-player exclusion; owner-player failure and recovery. The preview simulator provides remote invitation/start/cancel and response controls outside the product components.
- **Working assumptions:** Preparation recovery uses an illustrative eight-second deadline; owner-player failure ends the attempt, and a disconnected viewer is excluded. These demonstrate the unresolved recovery policies rather than accepting production timeout values. The mock cinema is illustrative, not a measurement of real multi-device synchronization.


## DD-061 — Avatar names follow the user’s saved language

- **Date:** 2026-11-12
- **Decision:** Persian-language users use the Persian avatar character name as their display name; English-language users use the English name. The draft preview follows the draft language, and Save commits avatar, name and language together. Switching back to English restores the English avatar name.
- **Identity:** Everyone sees the user’s saved name, independent of the viewer’s language. Keep guest and membership IDs, credentials, ownership and historical chat snapshots unchanged. Normalize existing Persian profiles and membership labels through a backend migration.
- **Terminology:** Use «آواتار» in Persian UI copy wherever «نمایه» was used, including avatar/profile actions and status messages.
- **Supersedes:** DD-054’s English-only naming rule; DD-050’s prohibition on translating guest names now excludes these fixed avatar-derived names.

## DD-062: Spotlight avatar picker and expandable Settings chooser studies

- **Date:** 2026-11-12
- **Accepted avatar direction:** The stakeholder selected “In the spotlight.” Use larger 96px/dp character art with a 176px/dp selected character in an expanded, two-column tonal tile. Compact pickers use two columns and expanded pickers use three. Selected state also has a check, accessible radio state and emphasized name; preserve keyboard access, large text, RTL and light/dark support. Browser and shared native Settings implement the accepted direction.
- **Profile behavior:** Avatar and language still apply together on Save; Back discards drafts. Fixed character identity and localized names follow the existing avatar naming decision. A layout change must not change IDs or backend contracts.
- **Language growth:** The stakeholder expects at least ten additional languages. The chooser must scale beyond two options. Review searchable list, language-library grid and focused picker concepts with twelve total entries. The ten additional catalog entries are design fixtures; English/Persian remain the only implemented app translations, and future launch-language selection is unresolved.
- **Color studies:** The stakeholder requested three Material 3 Expressive theme-color picker variations. Review swatches, palette postcards and grouped color families using the existing twenty-five choices. Color selection continues to apply immediately and persist locally, independent of profile Save. The stakeholder subsequently selected Color garden and the focused language picker for a combined final confirmation preview with Spotlight (`settingsReview=final`). Live color/language promotion remains pending that confirmation.
- **Preview boundary:** Additional-language selections remain local and clearly marked; block profile Save for such selections rather than sending unsupported languages into the existing service or silently applying English. Native language/color choosers retain existing behavior until a visual direction is selected.
- **Details:** See [Settings chooser studies](settings-chooser-designs.md) for routes, states and verification.
- **Settings copy refinement:** Remove the profile subtitle and color helper sentences. Keep only “Pick the character friends will see.” for avatar guidance and “Applies after saving.” under Language; remove the repeated language instruction below its picker. Apply the same wording in Persian and native Settings.

## DD-063: Friendly, Casual English Copy

- **Date:** 2026-11-12
- **Decision:** The stakeholder approved the proposed friendly English replacements across Home, create/join, Settings, room status and sync. Use short conversational language and contractions, while keeping playback consequences and destructive actions explicit. The browser's `src/en.json` records the approved replacements using existing translation keys; matching native English resources use the same wording. Persian revisions remain proposals pending confirmation.
- **Examples:** Start a party; Got a code?; Your last hangout; Jump back in; Movie night; You’re hosting; Let’s start movie night; Got an invite?; Invite code; Take a look; Make yourself at home; Pick your movie-night face.; Your colors; Save to switch languages.; Save changes; Host; You’re watching; You’re paused; Hang out on voice; Ask everyone to sync; Let’s meet at; Getting everyone set…; Back to the movie.
- **Clarity:** Keep Join voice distinct from room text chat. Preserve Sync together, Who’s joining?, Accept & pause, Keep watching, and standard playback controls. Do not add previously removed helper sentences. Keep existing Persian translations and stable translation/protocol keys until Persian copy is accepted.
- **Presence constraint:** Your friends are waiting is approved only when participant presence is known. The code-entry form cannot establish this, so it retains Step into their room. Do not imply that people are waiting merely because the join form is open.
- **Scope:** Wording changes do not change room permissions, synchronization contracts or behavior. Group sync remains a browser design preview until implementation is separately completed.

## DD-064: Stakeholder-selected Persian Copy

- **Date:** 2026-11-12
- **Decision:** Apply the stakeholder’s Persian wording across Home, create/join, Settings, playback/voice labels and sync previews. This resolves DD-063’s pending Persian copy review and supersedes earlier wording examples where they differ. Keep the approved English copy unchanged.
- **Home and entry:** ساخت دورهمی؛ کد داری؟؛ دورهمی قبلیت؛ بازگشت به آخرین دورهمی؛ مدیریت دورهمی؛ میزبان تویی؛ یه دورهمی جدید بساز؛ ساخت دورهمی؛ دعوت شدی؟؛ برو پیش دوستات؛ کد دعوت؛ یه نگاه بنداز؛ داریم دورهمی رو پیدا میکنیم؛ نتونستیم دورهمی رو راه بندازیم.
- **Settings and playback:** به سلیقه خودت؛ یه شخصیت انتخاب کن که دوستات ببینن؛ رنگ دلخواهت؛ ذخیره کن تا زبان عوض شه؛ ذخیره تغییرات؛ فیلمت داره اجرا میشه؛ وارد صحبت بشید؛ ورود به گپ صوتی.
- **Sync:** درخواست هماهنگی؛ قرار ما در؛ هنوز جواب نداده · داره میبینه؛ نمیاد · داره میبینه؛ بیخیال، فیلممو ادامه میدم؛ داریم اماده میشیم؛ برگردیم به فیلم.
- **Acceptance clarification:** The stakeholder explicitly chose just پایه است for accepted viewers after clarifying that acceptance pauses playback. Do not append داره میبینه to accepted viewers. This is a text change only; consent, pause, withdrawal, commitment and recovery rules remain unchanged.
- **Implementation boundary:** Keep stable translation keys, identities and protocol values. Shared native Persian resources match browser wording where those controls exist; group sync remains a browser prototype.

## DD-065: Integrate the approved Settings chooser combination

- **Date:** 2026-11-12
- **Decision:** The stakeholder confirmed Spotlight avatars, Color garden and the focused language picker for main browser/shared native Settings. This supersedes DD-062’s final-review boundary. Settings no longer depends on design-preview query parameters or variation controls.
- **Languages:** Include only English and فارسی. The ten additional study entries remain historical layout fixtures; do not show them as selectable production languages. Keep the picker extensible for future translations.
- **Interaction:** Color changes apply and persist immediately. Language selection is staged within the focused picker; explicit Use transfers it to the Settings draft. Dismissal discards only the picker’s staged choice. Save applies the profile and app language; Back from Settings discards profile drafts. Preserve the existing network/persistence retry behavior and fixed localized avatar names.
- **Presentation:** Keep the accepted enlarged Spotlight tile, named swatch grid with a current-color summary, and compact bottom sheet / expanded dialog language surface. Support search/no-results recovery, English/Persian, light/dark themes, large text, RTL and keyboard/focus semantics. Retain DD-063/DD-064 wording and the stakeholder’s requested helper-text removals.
- **Implementation:** Reusable browser components own the accepted patterns; native presentation stays in sharedUI. Service contracts and backend behavior are unchanged. See [integrated Settings choosers](settings-chooser-designs.md).

- **Withdrawal refinement (2026-11-12):** In the sync invitation, selecting “Change my mind & keep watching” / «بیخیال، فیلممو ادامه میدم» withdraws acceptance, dismisses the dialog and starts local playback at the viewer’s saved acceptance position. It starts playback even if the viewer had been paused before accepting. The viewer does not seek to the owner’s target and is excluded from subsequent commitment unless they accept again.

## DD-067: Concise, Casual Product Voice Across Clients

- **Date:** 2026-11-12
- **Decision:** The stakeholder approved the additional thirty Persian sentence replacements and explicitly established their repeated removal of overly informative sentences as a project-wide design fact. All current and future English/Persian copy should be friendly, casual and concise across web and native clients.
- **Information budget:** Remove redundant helper paragraphs, repeated status explanations and informational cards when existing controls and context already communicate the point. Do not restore removed copy elsewhere. Keep only the action consequences or recovery steps needed for an informed decision, preferably in a clear action label or one short message.
- **Examples:** «از دورهمی میری؟»؛ «لینک فیلم رو چک کن و دوباره امتحان کن.»؛ «یه مشکلی پیش اومد. دوباره امتحان کن.»؛ «کنترل فیلم دوباره دست خودته.» Preserve the stakeholder's selected spelling and product terminology rather than reverting to formal Persian.
- **Feedback:** The group-recovery completion remains an owner-only snackbar, with «با اونایی که آماده بودن شروع کردیم. کسی که قطع شد میتونه بعدا هماهنگ بشه.» It must not reappear as a persistent card or be shown to every viewer.
- **Implementation:** Apply approved wording through existing browser translation keys, inline sync copy and matching shared native resources. This changes presentation only; identity, permissions, playback, consent, recovery timing and backend contracts are unchanged. Detailed authoring rules are in `design-principles.md`.

## DD-066: Persist random first-time personalization

- **Date:** 2026-11-12
- **Decision:** New users receive a random character avatar and one of the twenty-four named theme colors. Persist those initial choices once, before their first session is issued. Reloads, restarts, retries, theme-mode toggles and Settings visits must not reroll them. Explicit profile/color choices always take precedence.
- **Existing users:** Preserve stored avatar/color choices, including Ice Queen and the original brand palette. Existing sessions without an explicit color retain the original palette. Recover existing guest sessions before choosing any registration avatar; never replace an established identity to randomize appearance.
- **Boundary:** Clients send the chosen avatar through the existing guest-session/profile fields; the backend retains its authoritative localized-name derivation. Theme color stays a device preference. No HTTP/realtime schema change, new identity reset or randomization of historical chat is required.
- **Names:** Rename the stable cloud, ember and orbit characters to TV Boy, Alien Employee and Wolf Barista. Matching Persian names are پسر تلویزیونی، کارمند فضایی، گرگ باریستا. Update current profile/membership display names while retaining avatar IDs, identity/room ownership and historical message snapshots.

## DD-068: Persian Party Titles and Concise Chat Entry

- **Date:** 2026-11-12
- **Decision:** Automatic Persian party titles use «دورهمی {name}», for example «دورهمی فرانکی». English automatic titles keep “{name}'s party”; explicit user-entered titles retain their content.
- **Chat empty state:** Use a chat icon and the existing empty-state heading. Remove “Say hi, share a thought, or start with 🍿.” and its Persian counterpart from browser, previews and shared native presentation.
- **Invitation:** Keep the invitation/share icon in the party top bar. Remove the duplicate full-width invitation button below voice chat across clients.


## DD-069: Native Party Header and Compact Profile Parity

- **Date:** 2026-11-12
- **Decision:** Remove the decorative brand icon beside the native party title. Retain the title and existing invitation, report, video-link and leave actions.
- **Profile:** Match the compact browser Settings layout in native presentation: compact header margins, 76dp preview avatar, two-column avatar choices with 8dp gaps and compact tile padding, a full-row selected character, and denser named color cards. Let profile and section text wrap within its available width, including Persian and large text. Keep expanded layouts adaptive.
- **Behavior:** Preserve avatar/language drafts, Save and Back behavior, immediate color persistence, and existing recovery states. These are shared Compose presentation changes, including Android; backend contracts are unchanged.

## DD-070 — Optional bug-report screenshots (2026-11-12)

- **Decision:** Per stakeholder request, Android and web allow selecting or pasting from the clipboard up to three PNG/JPEG/WebP screenshots (5 MiB total), previewing and removing them before Send. Screenshots persist with a failed or dismissed draft, are frozen during upload, and clear after durable success.
- **Delivery:** Extend the shared [report contract](bug-report-contract.md) and private PostgreSQL storage; deliver images as Sentry attachments with the existing feedback and log. Content changes use a new report ID; unchanged retries reuse the payload.
- **Scope:** This supersedes the earlier exclusion of manual screenshot attachments. Automatic screenshots, replay, and usage-analytics image capture remain disabled. Android uses the system document picker without storage permissions; other native platforms retain text reports.

## DD-071 — Inline waiting-for-owner indicator (2026-11-12)

- **Status:** Inline selected by stakeholder; integrated in browser and shared native dialog.
- **Intent:** An accepted viewer sees a loading indicator while waiting for the owner to start synchronization. Preserve paused playback, pre-commit withdrawal and the separate preparation/countdown phases in DD-059.
- **Presentation:** A small spinner and “Waiting for the owner…” / «منتظر تصمیم میزبان…» alongside the existing withdrawal button. Allow wrapping under compact/large-text layout pressure. Show only to accepted non-owners during INVITING; withdrawal remains available until commitment. See [waiting indicator preview](sync-waiting-designs.md).

## DD-072 — Web component baseline with native interaction (2026-11-12)

- **Decision:** The stakeholder selected web as the visual and component reference for Android. Align shared presentation to its outline icons, persistent form labels, modal hierarchy and destructive emphasis, participant density, chat composer and Settings chooser shapes. Retain semantic theme tokens, English/Persian, RTL, wrapping and large-text adaptations.
- **Chat:** Touch platforms do not show desktop keyboard-shortcut instructions. Keep the visible Send action and native IME Send; ordinary hardware Enter inserts a newline. Desktop retains Ctrl + Enter. Offline/empty/queue-limit checks apply to both button and IME submission. Emoji selection uses an anchored native popup and inserts at the cursor without clearing the draft.
- **Sync entry:** Owners see “Ask everyone to sync” / «درخواست هماهنگی»; viewers retain “Sync to room”; active attempts show “View sync” / «نمایش هماهنگی». Apply the same role/state label to the normal and fullscreen native player actions. Opening the owner draft still sends nothing and does not pause playback; Ask inside the dialog retains the existing consent/commit protocol.
- **Native adaptations retained:** Native sliders/progress, ripple/touch feedback and accessible touch targets, Android Back and system insets/IME handling, system sharing and screenshot/subtitle pickers, and native text selection. Compact sync remains a native bottom sheet. Participant grids collapse to rows for narrow windows or large text. Do not imitate browser hover/tooltips, CSS backdrop blur or desktop shortcut copy on phones.
- **State parity:** The video-source copy action copies immediately; the separate top-bar link action opens details. Android bug reports observe device network availability, retain drafts offline and disable Send until reconnected. Connectivity is independent of room WebSocket health, so a failed room connection can still be reported over HTTP.
- **Profile persistence:** Native Settings saves preferences synchronously on the device; preserve its existing Save/Back/error behavior rather than adding an artificial network-loading state. Existing avatar artwork resize animation remains; artwork framing and unselected borders follow web.
- **Ownership:** Vendored Lucide 1.24.0 vector paths are local native assets with bundled ISC/MIT notices, with no runtime/source dependency on the web client or new UI library. Shared service contracts are unchanged.

## DD-073 — Local video file design preview (2026-11-13)

- **Status:** Side-by-side tiles and revised flow approved; production implementation across clients authorized on 2026-11-13.
- **Confirmed intent:** Owner chooses a file, shares its name in a room request, and sees member readiness. Members choose their own local file or decline and remain without video. No media upload or same-file enforcement. Use the existing mutual-sync dialog, participant rows, inline waiting indicator, explicit Start, preparation and countdown patterns.
- **Preview:** [Local-file study](local-file-designs.md), integrated into the browser PartyScreen at `/?preview=local-file`. Reuse production Material buttons/dialogs/avatars, sync styles and the room/player shell. Fake state and source slots stay preview-only; production behavior and service contracts are unchanged.
- **Proposed defaults:** Start counts ready non-owners and permits a subset, matching DD-059; pending/declined viewers have no video. For sync failure, restore the previous local playback state/position and show a brief snackbar to everyone; preserve the file and ordinary controls. These defaults remain reviewable, not accepted policy.

- **Owner entry refinement (2026-11-13):** Stakeholder requested retaining the existing cinema scene/background and URL input. Add Choose file inside that panel beside Start stream, with equal button styling and space for both source options. Supersedes the study’s flat file-first empty owner panel. File media is still never uploaded.

- **Picker refinement (2026-11-13):** Stakeholder removed the intermediate local-video dialog. Choose file opens the system picker directly; selection shows loading, then readiness. Owner Change opens a Local file / Stream URL choice first; cancellation retains the current source. Viewer file changes remain local and use the system picker directly.

- **Failure feedback refinement (2026-11-13):** Stakeholder removed the local-file failure card and dedicated recovery actions. End failed preparation/countdown automatically, restore prior play/pause state and position, and show a brief snackbar to everyone, without owner-only filtering. This local-file design refinement does not change existing production URL-sync contracts.
- **Choose video study (2026-11-13):** Stakeholder requested three alternatives for the source-choice dialog: compact tonal list, equal icon tiles, and source selection with Continue. Keep direct system picking, URL entry, cancellation and equal source prominence in all three. The stakeholder subsequently selected side-by-side tiles. Use equal tonal icon tiles with one-click Local file / Stream URL actions; remove the variation switcher from the preview. See [selected design](local-file-designs.md).

## DD-074 — Automatic stream start and joining catch-up (2026-11-13)

- **Decision:** Starting a new shared stream automatically commits the owner and all connected room viewers to synchronization at 0:00. Skip invitation, acceptance and explicit Start; retain actual player preparation, the shared 3/2/1/Action countdown, deadlines and failure recovery. Superseded for solo rooms by DD-076: an owner alone uses normal playback without a group start.
- **Joining:** Automatically catch up a joining viewer to fresh owner telemetry, including backward seeks and the owner’s playing/paused state. Wait for a usable player and retry unavailable telemetry for a bounded period. A group start that includes the viewer takes precedence; late arrivals catch up privately after an active committed start. Never restart or pause the existing party for a new arrival.
- **Scope:** Supersedes DD-059’s explicit acceptance/Start requirement only for newly started streams. Manual group invitations retain consent and withdrawal. Existing local-file selection studies remain previews; this change covers the production shared stream boundary. Browser and shared native clients use the same service behavior.

## DD-075 — Local media implementation and URL automatic-sync continuity (2026-11-13)

- **Source flow:** Preserve DD-074 automatic preparation/countdown and private newcomer catch-up for URLs. Local sources create a selection invitation at zero: accept after a copy opens, decline/withdraw leaves no video, and the owner explicitly starts accepted viewers. The accepted preview's Start-with-subset rule remains. Late selectors catch up privately after commitment; already accepted participants never receive a second automatic catch-up after completion.
- **Privacy/identity:** Share only a bounded basename, never media bytes, device paths, object URLs, hashes or matching checks. Keep file access in the owning client and release handles when replaced/leaving. Refresh requires reselecting a copy; attaching a missing owner copy preserves the existing room source.
- **Recovery:** Any committed local-file preparation/disconnection/seek failure ends that attempt for everyone; restore each included player's prior position and play/pause state and show a brief snackbar, with no dedicated failure card. Unsupported private catch-up targets leave the requesting player's previous state intact.
- **Replacement:** The selected equal icon tiles offer Local file or Stream URL. Replacements are atomic, owner-only and revision-checked. Cancelling an initial file request aborts that source; cancelling a later manual sync preserves the selected file. Failed replacements retain the previous source.
- **Contract:** [Local media contract](local-file-contract.md), OpenAPI/AsyncAPI and the synchronization contract define the shared boundary.


## DD-076 — Skip source coordination for a solo owner (2026-11-13)

- **Decision:** When the owner is the only connected room member, choosing a local file does not show “Who’s ready to watch?” and selecting a URL does not begin group preparation or the countdown. Keep normal player controls available.
- **Boundary:** The service creates no source synchronization attempt in this case, shared by browser, Android and desktop. Source selection/replacement and normal media loading still run. With other connected viewers, preserve local-file consent and explicit Start, and URL automatic coordination.
- **Later joins:** Preserve private newcomer catch-up to the owner; joining must not restart or interrupt the owner's playback. A local newcomer still chooses their own copy.

## DD-077: Bounded Automatic Chat Delivery Recovery

- **Date:** 2026-11-13
- **Decision:** Per stakeholder request, remove the repeated offline/draft banner in browser and shared native chat. Allow sends while disconnected, show Sending per message, and retry automatically after connectivity returns. This supersedes DD-052/chat-contract's explicit-retry-only behavior.
- **Deadline:** Use a 30-second total deadline per deliberate send or manual Retry, including connection wait and HTTP work. Retry transport failures at least one second apart; fail terminal responses immediately. Expired messages offer Retry/Discard and never resume automatically. Preserve message UUID/text for backend idempotency and reconcile authoritative events/snapshots; preserve new drafts.
- **Lifetime:** Keep the existing 20-pending-message bound and room-screen-only in-memory lifetime. No background persistence or backend schema change.


## DD-078: Bug Reporting from Home

- **Date:** 2026-11-13
- **Decision:** Add the existing bug icon beside the home theme/settings controls in browser and native clients. Open the same reporting dialog with existing diagnostics, attachments, offline handling and recoverable drafts.
- **Contract:** Home submissions use authenticated `POST /v1/bug-reports` and store no room association. Cached last-room information is not used. Room reports retain membership checks; both routes share limits, durable storage and Sentry delivery.


## DD-079 — Consolidate watchparty in the WatchParty fork (2026-11-13)

- **Backend:** Replace the `backend/watchparty` submodule with its complete tracked source. Backend, clients and shared contracts now change in one repository. This supersedes the submodule/publication arrangement in the historical migration plan and release evidence.
- **Provenance:** Retain upstream MIT licensing and attribution. Future upstream changes require deliberate adaptation to watchparty's layout and contracts.
- **Automation:** Run the existing backend workflow from the repository root with `backend/watchparty` as its working directory; scope backend dependency updates to that directory. Deployment source paths and runtime behavior remain the same.

## DD-080 — Local HEVC playback in the web client (2026-11-26)

For local movies opened in the integrated player, prefer the browser’s supported HEVC playback path. When that path cannot handle the stream, serve the pinned libmedia HEVC decoder and audio support modules on demand from the app’s origin. The video stays on the device. The initial compatibility target is a local Main 10 MKV with AAC audio.

A participant using the canvas renderer reports the libmedia clock. For group preparation, it must render a fresh frame near the target, pause, and confirm both selected audio and video packet queues reach the existing buffer threshold or the demuxer reached end of file. This extends the browser playback decision to software decoding while retaining the shared sync contract.

## DD-081 — Privacy boundaries for diagnostics (2026-11-26)

Automatic failures retain normalized application frames, safe failure classes and recent application state. Browser and native clients attach up to twelve application records from the last two minutes and omit SDK interaction, navigation and network breadcrumbs. Backend errors use request-local technical context. Raw exception text, console arguments, media positions, resource names, guest IDs and room IDs are excluded from generated diagnostic records.

Manual reports retain the ordered safe session history, minimal technical metadata, the user's authored description (including pasted HTTP and HTTPS links) and any images they selected. The service projects incoming logs and client metadata before storage and again before external delivery. Authenticated report ownership, retry fingerprints, expiry and stable delivery IDs retain their existing semantics. This supersedes earlier requirements to retain arbitrary console/Kermit messages or full device profiles.

Usage analytics send only explicit product events, a random installation identifier and release/platform context. Operator diagnostics retain fixed event labels, safe source frames and counters.
