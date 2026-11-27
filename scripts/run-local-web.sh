#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

api_pid=''
cleanup() {
  if [[ -n "$api_pid" ]]; then
    kill "$api_pid" 2>/dev/null || true
    wait "$api_pid" 2>/dev/null || true
  fi
}
trap cleanup EXIT
ready() { curl -fsS --max-time 2 http://127.0.0.1:8081/readyz >/dev/null 2>&1; }

if ! ready; then
  docker compose -p watchparty-local -f backend/compose.watchparty-local.yml up -d --wait postgres
  [[ -d backend/watchparty/node_modules ]] || npm ci --prefix backend/watchparty
  (
    cd backend/watchparty
    export NODE_ENV=development HOST=127.0.0.1 PORT=8081
    export DATABASE_URL="${DATABASE_URL:-postgresql://watchparty:local-development-only@127.0.0.1:15432/watchparty}"
    exec node server/server.ts
  ) &
  api_pid=$!
  for ((i=0; i<60; i++)); do
    kill -0 "$api_pid" 2>/dev/null || { echo 'Local API exited during startup.' >&2; exit 1; }
    ready && break
    sleep 1
  done
  ready || { echo 'Local API did not become ready on port 8081.' >&2; exit 1; }
fi

cd clients/web
[[ -d node_modules ]] || npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort --open
