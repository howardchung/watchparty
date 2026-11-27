# Mesh voice stability release and acceptance

The November 5, 2026 repair retains Node/PostgreSQL/private Coturn and audio-only
mesh with eight members. This document is a release gate, not a stability claim.
No production deployment follows from local compilation or signaling tests.

## Accepted behavior

Explicit voice opt-in creates a muted session. Authenticated roster completion
enables voice controls while each peer reports connected, reconnecting, or
unavailable. A failed peer must not tear down healthy links. Automatic retries
are bounded to three attempts per link with one offerer, a ten-second deadline,
and jitter. **Retry voice connections** retries failed links only. Signaling
reconnection retains working WebRTC peers during the 30-second resume grace.
An expired generation rejoins fresh and reconciles its peers.

Muting disables capture immediately. Unmuting requires a successful server
acknowledgement; stale or rejected acknowledgements cannot enable capture. The
latest intent is replayed after reconnect. Movie playback stays independent.
Local microphone activity indicates capture only, including while alone in voice;
inbound RTP/activity indicates received audio and does not prove every listener
received a speaker. Verify Android alone-to-peer capture handoff, silence release,
immediate mute/leave clearing, and speaker/headset transitions on a physical device.

## Coordinated release

Ship matching voice protocol 4 backend/browser/Android builds together. Room
protocol 3 is retained. `/voice/config` explicitly separates join, resume, and
credential refresh; only join/resume issue one-use tickets. Signal messages carry
stable per-message negotiation IDs across acknowledgement retries. Old clients
are incompatible with voice v4. Keep source manifests/checksums for all three
artifacts; preserve secrets and deployment environment outside the archive.
No legacy-data migration, automatic process-death microphone restoration, or
production rollout is authorized by a local test result.

## Evidence to collect before a stability claim

| Gate | Required evidence | Status at implementation start |
| --- | --- | --- |
| Deterministic recovery | EOF/heartbeat, lost/error ACKs, reordered ICE, duplicate SDP, simultaneous retries, disposed callbacks, socket replacement races, leave during join, mute races, expired credentials | Pending final automated results |
| Real integration | Explicit PostgreSQL/Socket.IO run: resume, restart, lease fencing, isolation, auth failures, playback unaffected | Pending final automated results |
| Builds | JVM data/UI checks, Metro graph, Android debug, browser tests/build, backend typecheck | Pending final automated results |
| Physical audio | Two/four/eight mixed Android/browser participants; identifiable audio from every sender verified at every other listener; simultaneous speech; initial mute/toggles | Unverified; only one Android available |
| Network recovery | Wi-Fi/mobile switch, VPN, UDP blocked, relay-only UDP/TCP/TLS5349/TLS443, loss, background/lock, notification controls, headset/Bluetooth, interrupted capture | Unverified |
| Soak | Two-hour eight-person call and 100 join/leave cycles; no leaked tracks, peers, sockets, services, allocations | Unverified |
| Capacity | 100 simultaneous eight-person rooms, direct and forced relay; CPU/RAM/traffic/allocation/resource series with ceilings and failure counts | Unverified |
| UI | Light/dark, RTL, large text, narrow/wide screens; per-peer status and recovery accessible | Pending visual review |
| Relay rollout | Published DNS, matching cert, firewall/listeners, authenticated allocation plus bidirectional RTP on every advertised ICE URL | Unverified; production unchanged |

Record exact commands, versions, counts, durations, and artifact checksums when
updating this table. Synthetic RTP and signaling simulations supplement physical
audio; they do not replace hearing and identifying every remote speaker.
Telemetry may include join duration, rejected acknowledgement code, retry count,
peer state, RTP packet progression/loss, selected candidate type, and device
errors. Never log credentials, SDP, or raw audio.


## Local verification recorded on November 5

Browser unit suite: **63/63 passed**, including stale auth/token completion fencing, reusable owner queues, bounded microphone startup, and mute authorization independent of remote autoplay. Production browser build passed. Chrome
executed actual WebRTC peer connections through the v4 backend and isolated
PostgreSQL: two-, four-, and eight-participant synthetic audio calls passed.
Every listener was checked for each other sender's distinct oscillator tone,
positive inbound RTP/energy, initial mute, acknowledged unmute, and retained
peer objects across a signaling transport disconnect/resume. The eight-member
run covered all 56 directed links and passed in 19.2 seconds. This is synthetic
browser evidence, not physical microphone/speaker acceptance.

The initial eight-browser fixture created 64 AudioContexts and produced silent
synthetic signals despite connected peers. Sharing one AudioContext per browser
page removed that fixture failure.
Intermediate Vite HMR reloads also invalidated fixtures; long acceptance runs
now use `MESH_TEST_MODE=1` to disable HMR and an isolated blank fixture page.
Direct profiles explicitly omit ICE servers; relay profiles force a single ICE
URL and require a selected relay pair. Earlier failed fixture runs are not
counted as successful acceptance.

Light/wide and dark/RTL/large-text/narrow Chrome recovery screens passed keyboard
activation, named per-peer status, and horizontal-overflow checks. Review found
an RTL tooltip overflow; tooltip anchoring now uses the logical inline edge.
HAProxy configuration and Compose validated; Caddy adapted/validated. An actual
container bind test found the image's unprivileged default could not bind host
443: Compose now starts the router privileged only for binding and HAProxy then
drops to its image user/group. Local TLS SNI routed website traffic to an
independent TLS fixture and TURN traffic through 443; forced-relay two-browser
bidirectional identifiable audio/RTP passed through TLS 443 with a local
self-signed certificate. Public certificate/DNS/firewall acceptance is separate.

## Reproducing browser media and load checks

Start a disposable PostgreSQL/backend matching the current source, then Vite
with the same API origin and a local test TURN secret. Do not point these tests
at production: they create guest identities and rooms. Start Vite explicitly
with `MESH_TEST_MODE=1 npm run dev -- --host 127.0.0.1` from `clients/web` to prevent
source reloads invalidating a long-running media test. Run from `clients/web`:

```sh
RUN_MESH_ACCEPTANCE=1 MESH_MEMBERS=8 CHROME_PATH=/usr/bin/google-chrome npm run test:e2e -- e2e/mesh-acceptance.spec.ts
RUN_MESH_ACCEPTANCE=1 MESH_MEMBERS=2 MESH_CYCLES=100 CHROME_PATH=/usr/bin/google-chrome npm run test:e2e -- e2e/mesh-acceptance.spec.ts
RUN_MESH_ACCEPTANCE=1 MESH_ROOMS=100 MESH_MEMBERS=8 MESH_SECONDS=7200 CHROME_PATH=/usr/bin/google-chrome npm run test:e2e -- e2e/mesh-acceptance.spec.ts
```

Set `MESH_ICE_URL` to exactly one advertised TURN URL to force its transport.
The opt-in harness attaches `mesh-metrics.json` with browser version, room/member
counts, runtime, received RTP/energy/loss, selected relay status, and detected
tone frequencies. Each repeat cycle checks capture tracks ended and every peer
closed before rejoining and verifying audio again. `backend/deploy/run-voice-load.sh` runs the browser harness with
`sample-voice-resources.py`, persisting host CPU/memory/interface byte counters,
aggregate Chrome RSS/process count, API RSS/threads/file descriptors, Docker
relay resource statistics, and a relay allocation count parsed from logs. An
unavailable counter stays null; raw TURN logs are never persisted. Docker
network totals can be zero with host networking, so host interface byte counters
are included. Aggregate Chrome RSS counts shared pages more than once and is
not proportional-set size; measure on a dedicated test host for capacity claims. The current workstation has 8 CPUs,
16 GiB RAM, and approximately 4 GiB available during concurrent Android builds;
800 full browser contexts need a dedicated/distributed load host.

`backend/deploy/verify-relay-local.sh` creates disposable pinned Coturn/HAProxy
containers and local self-signed TLS, then tests all four transports separately.
It requires available host ports 3478/5349/443 and an already-running test API
with `TURN_SHARED_SECRET=local-test-turn-shared-secret-32-bytes-minimum` and a
nonempty TURN_URLS setting. It temporarily permits loopback peers **only in the
local test fixture**. The `MESH_TLS_INSECURE=1` Chrome option is limited to these
self-signed local fixtures and is never part of application/release settings.


Final native verification: **47 data JVM tests, 51 shared-UI JVM tests passed;
one shared-UI test intentionally skipped**. Metro app-graph compilation and
Android debug APK assembly passed. The application-scoped coordinator owns
notification voice commands and the bound service confirms microphone foreground
capability before capture; startup does not fall back to claiming microphone
support through a data-sync service. These are automated/build results; physical
service/audio routing and mixed Android/browser audio remain acceptance gates.

Authenticated local forced-relay browser tests additionally passed UDP 3478
(16.0 s), TCP 3478 (15.9 s), and TLS 5349 (15.9 s), with selected relay pairs,
bidirectional identifiable synthetic audio, RTP, and signaling resume. Together
with TLS 443 this verifies all four transports in isolated local containers.
Production DNS/certificates/firewall/routing were not changed or validated.


A first 100-cycle media run exceeded its 635-second test-wide limit. That run
had no intermediate counter, so its timeout cause cannot be attributed solely
to a queue bug. Subsequent review fixed canceled queue reuse, stale async
callbacks, and an unbounded autoplay wait; the current harness budgets ten
additional seconds per requested cycle, bounds each join to thirty seconds,
verifies the loaded adapter contains its queue reset, and writes a timestamped
progress row after every successful media cycle. Only an explicit final
100/100 result counts as acceptance.

For measured bounded load, use an isolated API process and relay container:

```sh
VOICE_API_PID=<local-api-pid> VOICE_RELAY_CONTAINER=<local-turn-container> MESH_OUTPUT_ROOT=/tmp/mesh-direct sh backend/deploy/run-voice-load.sh
VOICE_API_PID=<local-api-pid> VOICE_RELAY_CONTAINER=<local-turn-container> MESH_OUTPUT_ROOT=/tmp/mesh-relay MESH_ICE_URL='turn:localhost:3478?transport=udp' sh backend/deploy/run-voice-load.sh
```

The wrapper defaults to two eight-person rooms for thirty seconds. Its
`resources.jsonl` and browser `mesh-metrics.json` are written to the selected
output directory. Set `MESH_ROOMS=100` and `MESH_SECONDS=7200` only on a dedicated
load environment with enough browser processes and relay capacity; a bounded
smaller test is not a 100-room or two-hour pass.
