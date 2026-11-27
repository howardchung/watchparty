#!/usr/bin/env bash
# Existing-host deployments of the Node/PostgreSQL/Caddy/Coturn stack.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RELEASE_ID="${DEPLOY_RELEASE_ID:-$(date -u +%Y%m%dT%H%M%SZ)-$(git -C "$ROOT" rev-parse --short HEAD)}"
OUTPUT="${DEPLOY_OUTPUT:-$ROOT/.tools/deployment/$RELEASE_ID}"
SSH_USER="${DEPLOY_SSH_USER:-root}"
SSH_HOST="${DEPLOY_SSH_HOST:-}"
if [[ -z "$SSH_HOST" && -f "$ROOT/clients/native/.local-server/ip" ]]; then
  SSH_HOST="$(tr -d '\r\n' < "$ROOT/clients/native/.local-server/ip")"
fi
SSH_ARGS=(-o ConnectTimeout=15 -o ServerAliveInterval=15 -o StrictHostKeyChecking=yes)
if [[ -n "${DEPLOY_SSH_KEY:-}" ]]; then SSH_ARGS+=(-i "$DEPLOY_SSH_KEY" -o IdentitiesOnly=yes); fi
fail() { echo "$*" >&2; exit 1; }
[[ "$(basename "$OUTPUT")" == "$RELEASE_ID" ]] || fail 'DEPLOY_OUTPUT basename must equal DEPLOY_RELEASE_ID'
[[ "$RELEASE_ID" =~ ^[a-zA-Z0-9][a-zA-Z0-9._-]*$ ]] || fail 'Invalid DEPLOY_RELEASE_ID'
remote() {
  [[ "$SSH_HOST" =~ ^[a-zA-Z0-9._:-]+$ && "$SSH_USER" =~ ^[a-zA-Z0-9_-]+$ ]] || fail 'Set DEPLOY_SSH_HOST and DEPLOY_SSH_USER'
  ssh "${SSH_ARGS[@]}" "$SSH_USER@$SSH_HOST" "$@"
}
build() {
  [[ ! -e "$OUTPUT" ]] || fail "Output exists: $OUTPUT; choose a new DEPLOY_RELEASE_ID"
  (cd "$ROOT/backend/watchparty"; npm ci; npm run typecheckServer; npm run test:backend)
  (
    cd "$ROOT/clients/web"
    npm ci
    npm test
    # Use existing local CLI authentication for build-only source-map uploads.
    if [[ -z "${SENTRY_AUTH_TOKEN:-}" ]] && command -v sentry >/dev/null 2>&1; then
      SENTRY_AUTH_TOKEN="$(sentry auth token)"
      export SENTRY_AUTH_TOKEN
    fi
    VITE_APP_BUILD="$RELEASE_ID" VITE_BACKEND_URL='' npm run build
  )
  mkdir -p "$OUTPUT/api" "$OUTPUT/web"
  cp "$ROOT/backend/watchparty/package.json" "$ROOT/backend/watchparty/package-lock.json" "$OUTPUT/api/"
  cp -R "$ROOT/backend/watchparty/server" "$ROOT/backend/watchparty/sql" "$OUTPUT/api/"
  cp "$ROOT/backend/deploy/Dockerfile.api" "$OUTPUT/api/Dockerfile"
  cp -R "$ROOT/clients/web/dist/." "$OUTPUT/web/"
  for file in compose.yml Caddyfile haproxy.cfg turn-entrypoint.sh turn-log.awk sync-turn-tls.sh activate-release.sh remove-backups.sh; do
    cp "$ROOT/backend/deploy/$file" "$OUTPUT/"
  done
  python3 - "$ROOT" "$OUTPUT" "$RELEASE_ID" <<'PY'
import hashlib,json,pathlib,subprocess,sys
root,out,release=pathlib.Path(sys.argv[1]),pathlib.Path(sys.argv[2]),sys.argv[3]
files={str(p.relative_to(out)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(out.rglob('*')) if p.is_file()}
manifest={'releaseId':release,'commit':subprocess.check_output(['git','-C',str(root),'rev-parse','HEAD'],text=True).strip(),'sourceStatus':subprocess.check_output(['git','-C',str(root),'status','--porcelain'],text=True),'files':files}
(out/'release.json').write_text(json.dumps(manifest,indent=2)+'\n')
PY
  tar -czf "$OUTPUT.tar.gz" -C "$OUTPUT" .
  (cd "$(dirname "$OUTPUT")"; sha256sum "$(basename "$OUTPUT").tar.gz" > "$(basename "$OUTPUT").tar.gz.sha256")
  echo "Prepared $OUTPUT.tar.gz (includes current working-tree source; no automatic commit/push)"
}
deploy() {
  [[ -f "$OUTPUT.tar.gz" && -f "$OUTPUT.tar.gz.sha256" ]] || fail 'Run build with the same DEPLOY_RELEASE_ID first'
  remote "test -d /opt/watchparty/current && test -f /opt/watchparty/.env && test ! -e /opt/watchparty/releases/$RELEASE_ID && mkdir -p /opt/watchparty/incoming"
  scp "${SSH_ARGS[@]}" "$OUTPUT.tar.gz" "$OUTPUT.tar.gz.sha256" "$SSH_USER@$SSH_HOST:/opt/watchparty/incoming/"
  remote "cd /opt/watchparty/incoming && sha256sum -c $RELEASE_ID.tar.gz.sha256 && mkdir /opt/watchparty/releases/$RELEASE_ID && tar -xzf $RELEASE_ID.tar.gz -C /opt/watchparty/releases/$RELEASE_ID && bash /opt/watchparty/releases/$RELEASE_ID/activate-release.sh $RELEASE_ID"
  curl --fail --silent --show-error --max-time 30 "${DEPLOY_SITE_URL:-https://watchparty.top}/readyz" | python3 -c 'import json,sys; r=json.load(sys.stdin); print(r); sys.exit(0 if all(r.get(k) is True for k in ("ready","database","dispatcher","voice")) else 1)'
}
publish_apk() {
  local apk="${1:-$ROOT/clients/native/androidApp/build/outputs/apk/release/androidApp-release.apk}"
  local package name code digest filename certificates
  [[ -f "$apk" ]] || fail "APK not found: $apk"
  certificates="$(apksigner verify --print-certs "$apk")"
  # Public certificate fingerprint of the watchparty production signing key.
  grep -Fxq 'Signer #1 certificate SHA-256 digest: 195cb06fd908490a7217bebbd7fccdf0c1abe133acb300b2768b1b625c09e227' <<< "$certificates" || fail "Unexpected APK signing certificate"
  package="$(aapt dump badging "$apk" | sed -n '/^package: /p')"
  [[ "$package" == "package: name='top.watchparty.app' "* ]] || fail "Unexpected APK package"
  name="$(sed -n "s/.* versionName='\([^']*\)'.*/\1/p" <<< "$package")"
  code="$(sed -n "s/.* versionCode='\([0-9]*\)'.*/\1/p" <<< "$package")"
  [[ "$name" =~ ^[A-Za-z0-9._-]+$ && "$code" =~ ^[0-9]+$ ]] || fail "Invalid APK version"
  digest="$(sha256sum < "$apk")"
  digest="${digest%% *}"
  filename="watch-party-$name-$code-${digest:0:12}.apk"
  remote "set -eu
    cd /opt/watchparty/current/web/downloads
    stage=\$(mktemp -d --tmpdir=\"\$PWD\" .publish-XXXXXXXX)
    trap 'rm -rf -- \"\$stage\"' EXIT
    cat > \"\$stage/$filename\"
    cd \"\$stage\"
    echo '$digest  $filename' > '$filename.sha256'
    sha256sum -c '$filename.sha256'
    chmod 644 '$filename' '$filename.sha256'
    cd ..
    ln \"\$stage/$filename\" '$filename' 2>/dev/null || sha256sum -c \"\$stage/$filename.sha256\"
    mv -f \"\$stage/$filename.sha256\" '$filename.sha256'
    ln -s '$filename' \"\$stage/latest.apk\"
    mv -Tf \"\$stage/latest.apk\" latest.apk" < "$apk"
  echo "Published $filename at /downloads/latest.apk"
}
status() {
  remote 'cd /opt/watchparty/current && docker compose ps && free -h && df -h / && systemctl list-timers "watchparty-*" --no-pager'
  curl --fail --silent --show-error --max-time 30 "${DEPLOY_SITE_URL:-https://watchparty.top}/readyz"
}
case "${1:---help}" in
  build) build ;;
  deploy) deploy ;;
  publish-apk) publish_apk "${2:-}" ;;
  status) status ;;
  remove-backups) remote 'bash -s' < "$ROOT/backend/deploy/remove-backups.sh" ;;
  -h|--help) cat <<'HELP'
watchparty Node/PostgreSQL/Caddy/Coturn operations (existing /opt/watchparty host).
  ./scripts/deploy.sh build            test/build and package current source locally
  ./scripts/deploy.sh deploy           transfer/verify/build API and activate prepared release
  ./scripts/deploy.sh status           show active services, resources, timers and readiness
  bash scripts/deploy.sh publish-apk [APK]  verify and publish a signed APK at /downloads/latest.apk
  ./scripts/deploy.sh remove-backups   stop/delete backup automation and stored server backups

Use the SAME DEPLOY_RELEASE_ID for build and deploy, e.g.:
  export DEPLOY_RELEASE_ID=20261111-launch
  ./scripts/deploy.sh build
  ./scripts/deploy.sh deploy

DEPLOY_SSH_HOST defaults to clients/native/.local-server/ip; DEPLOY_SSH_USER defaults to root.
DEPLOY_SSH_KEY is optional (otherwise SSH agent/password); known host key required.
DEPLOY_OUTPUT optionally changes the staging directory (basename must equal release ID).
DEPLOY_SITE_URL defaults to https://watchparty.top (public verification).
The retired .tools/deploy.conf and backend/docker-compose.yml are never used.
No Git commit/push, database reset, dump, or automatic rollback is performed.
Android releases are built/published separately; existing downloads are preserved.
Existing TLS/router/network setup is required; see backend/deploy/README.md.
HELP
  ;;
  *) fail 'Unknown command; use --help' ;;
esac
