# Owner-led synchronization

Accepted UX: DD-059/DD-060 and subsequent stakeholder refinements. This is a fresh-deployment contract; old clients and old sync behavior are not supported. Room and voice transport remains Socket.IO/Engine.IO v4, authenticated with existing room tickets. No database migration is required: attempts are transient within the single API runtime, bounded to one attempt per room. Restart/reconnect snapshots explicitly clear unavailable attempts.

## Commands and state

All commands use Socket.IO acknowledgements, return `{ok:true, serverTimeMs, state}` or `{code,message}`, and require an authenticated, active room connection for the matching active stream. Every mutation carries `requestId` and `streamSessionId`. The server serializes attempt mutations synchronously after authorization; the commit boundary is authoritative.

- `sync.invite`: owner only; `{requestId,streamSessionId,positionMs}`. Client first pauses and samples the actual position. Creates an INVITING attempt. A retry with the same id returns existing state; a different concurrent invitation is rejected.
- `sync.respond`: non-owner; `{requestId,streamSessionId,response:ACCEPTED|DECLINED|WITHDRAWN}`. Only INVITING accepts responses. Acceptance pauses locally without seeking; withdrawal closes the dialog and resumes from the saved acceptance position. Declined/unanswered users are unaffected.
- `sync.commit`: owner only. Locks currently ACCEPTED members plus owner, enters PREPARING with a 15-second deadline. Late responses fail with SYNC_COMMITTED. No manual cancellation after commitment.
- `sync.cancel`: owner only, INVITING only. Release paused clients to their preceding playback state and position. No seek to target.
- `sync.ready`: included participant; `{requestId,streamSessionId,ready:boolean,reason?:string}`. True means the player has sought to the target, is paused, can decode and has at least 2 seconds buffered (or the remaining duration near end). False during preparation means still buffering; false after scheduling invalidates readiness and excludes that participant (owner failure fails attempt).
- `sync.failed`: included participant; reports unsupported/live/nonseekable media, playback denial, player failure, or background suspension. Excludes viewer; owner failure ends the attempt. No simulated readiness.
- `sync.state`: server push `{serverTimeMs,state:SyncAttempt|null}` immediately after room snapshot and on each change. Attempt fields: `requestId`, `streamSessionId`, `streamRevision`, `ownerMembershipId`, `targetPositionMs`, `createdAtMs`, `revision`, `phase` (INVITING/PREPARING/SCHEDULED/COMPLETED/CANCELLED/FAILED), `participants` (`membershipId`, `response`, `ready`, optional `reason`), optional `deadlineMs`, `startAtMs`, `reason`. Each revision is a complete replacement. Clients ignore older revisions and stale stream sessions. Newer attempts supersede old terminal ones.
- `sync.clock`: `{}` acknowledgement `{serverTimeMs}` for RTT clock calibration. Sample several times and retain the lowest RTT estimate; use a monotonic local clock between calibrations.
- `sync.request`: private owner catch-up only; `{requestId,streamSessionId,positionMs}`. Returns/emits `sync.result` `{requestId,status:APPLIED|UNAVAILABLE,targetPositionMs,serverTimeMs,playing}`. Uses fresh owner telemetry only, may rewind, projects elapsed playback time. Owner absent/stale telemetry is unavailable. No group disturbance.

## Automatic entry points

Starting an active stream creates one server-owned PREPARING attempt at position 0, with every currently connected room member ACCEPTED, including the owner. There is no INVITING phase or explicit commit command. The stream event precedes the sync state; stream/session revision and a server-generated source request ID fence retries and stale events. An owner-only room creates no source sync attempt: URLs use normal playback without group preparation/countdown, and local files show no readiness dialog. Later viewers use private newcomer catch-up after their player/copy is ready (DD-076). Existing deadlines, readiness and failure rules apply.

On entry to an already active stream, browser and native viewers wait for player readiness and automatically use the existing private `sync.request` command. Retry fresh telemetry for up to 30 seconds, then retain manual Sync recovery. An included committed group attempt takes precedence and consumes automatic catch-up; a late arrival waits until the active group start ends before catching up privately. Catch-up carries the current stream session and request ID and preserves the owner’s playing/paused state. Browser admission checks the completed seek against projected owner time and retries within the same bound if decoding delayed it; correction stops once caught up. Private catch-up is subject to telemetry and decoder scheduling jitter. Repeated presence snapshots must not repeatedly seek an established viewer.

## Timing and recovery

Owner is mandatory. Preparation ends when every remaining included player is ready; server then announces a start at least 3.5 seconds ahead. Each included client schedules against that shared epoch, displays 3/2/1/Action over playback and starts locally at `startAtMs`. The countdown does not depend on message arrival. Late delivery/clock failure fails that player's participation rather than starting a fresh local countdown. Excluded clients do not receive playback commands.

At the 15-second deadline, exclude unready viewers and proceed if the owner and remaining members are ready; unready/failed owner fails the attempt. Owner disconnect cancels invitations or fails committed attempts; disconnected viewers are withdrawn/excluded. Stream replacement/abort and room closure invalidate attempts. During countdown a loss of readiness excludes the viewer or fails the attempt if it is the owner. A committed failure releases controls and preserves a recoverable local playback state. Clients have a bounded watchdog for transport loss and missing terminal updates, and never remain locked indefinitely. Terminal states are retained briefly for reconnect recovery, then pruned; no persisted replay across runtime restarts.

Group sync supports a seekable shared media timeline. Live streams without a stable seekable timeline report unsupported rather than falsely preparing. Local playback freedom resumes after one coordinated restart; continuous drift correction is outside this flow.

## Presentation

Use selected focused dialog/mobile sheet. Owner draft: Sync together, live Meet at card, Ask everyone to sync; no roster and no pause before Ask. Viewer invitation: owner name beside sync icon, request heading, accept-and-pause and decline. Acceptance is revocable before commit. Loading replaces roster during preparation. Countdown has only 3/2/1/Action. Response text uses the latest approved casual English/Persian copy, with check/color for accepted and X/color for declined. Brief recovery completion is an owner-only snackbar; no persistent recovery card. Essential failures keep a short recovery action.

## Platform implementation and validation

Browser uses the existing player bridge, actual buffered ranges and decoder state. Android uses Media3 telemetry. Desktop uses vlcj 4.12.1 and VLC 3.x installed on the host; its cache readiness is reported explicitly when a buffered-end timestamp is unavailable. Desktop enables [Compose Swing interop blending](https://kotlinlang.org/docs/multiplatform/compose-desktop-swing-interoperability.html) so controls and countdown render above the callback video surface.

All clients share consent, participant locking, automatic failure recovery and concise bilingual copy. Timing coordinates playback commands; hardware decoding, audio output, browser timer throttling and network asymmetry still limit perfect frame alignment. A suspended or late player is excluded rather than given a separate countdown.

## Local file exception and recovery (2026-11-13)

URL sources retain DD-074 automatic preparation/countdown at zero and admission catch-up. A LOCAL_FILE start uses INVITING at zero with `localFile: true`, owner accepted and viewers pending. File selection becomes acceptance only after playable metadata is available; no uploaded media or equality checks. Owner commitment includes only accepted participants. A local committed seek, readiness, timeout or disconnect failure ends the attempt for everyone and restores each included player's saved position/play-pause state, with one brief snackbar for all roles. Cancellation of the initial source request also aborts the source; later manual-sync cancellation preserves it. Late file selectors may catch up privately, with finite-duration bounds before seeking. Already included participants never get a second catch-up after their countdown completes. See [local media contract](local-file-contract.md).
