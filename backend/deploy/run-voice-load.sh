#!/bin/sh
# Invoke only against an isolated test API; defaults to a bounded two-room run.
set -eu
repo=$(CDPATH='' cd -- "$(dirname -- "$0")/../.." && pwd)
output=${MESH_OUTPUT_ROOT:-$(mktemp -d /tmp/watchparty-voice-load.XXXXXX)}
mkdir -p "$output"
set -- --output "$output/resources.jsonl" --seconds "${MESH_SAMPLE_SECONDS:-$((600 + ${MESH_SECONDS:-30} + ${MESH_ROOMS:-2} * 30))}"
if [ -n "${VOICE_API_PID:-}" ]; then set -- "$@" --api-pid "$VOICE_API_PID"; fi
if [ -n "${VOICE_API_LOG:-}" ]; then set -- "$@" --api-log "$VOICE_API_LOG"; fi
if [ -n "${VOICE_RELAY_CONTAINER:-}" ]; then set -- "$@" --relay-container "$VOICE_RELAY_CONTAINER"; fi
python3 "$repo/backend/deploy/sample-voice-resources.py" "$@" &
sampler=$!
trap 'kill "$sampler" 2>/dev/null || true; wait "$sampler" 2>/dev/null || true' EXIT HUP INT TERM
cd "$repo/clients/web"
MESH_TEST_MODE=1 RUN_MESH_ACCEPTANCE=1 MESH_ROOMS="${MESH_ROOMS:-2}" \
 MESH_MEMBERS="${MESH_MEMBERS:-8}" MESH_SECONDS="${MESH_SECONDS:-30}" \
 CHROME_PATH="${CHROME_PATH:-/usr/bin/google-chrome}" \
 npm run test:e2e -- e2e/mesh-acceptance.spec.ts --output="$output/browser"
# Keep one final sampler interval after browser cleanup to capture allocation/FD release.
sleep 3
printf 'Load evidence: %s\n' "$output"
