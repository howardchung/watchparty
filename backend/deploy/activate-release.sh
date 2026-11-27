#!/usr/bin/env bash
set -euo pipefail
release_id="${1:?release ID required}"
[[ "$release_id" =~ ^[a-zA-Z0-9][a-zA-Z0-9._-]*$ ]] || exit 1
release="/opt/watchparty/releases/$release_id"
exec 9>/opt/watchparty/deploy.lock
flock -n 9 || { echo 'Another deployment is active' >&2; exit 1; }
cd "$release"
test -f /opt/watchparty/.env
test -d /opt/watchparty/current/web
# Verify transfer before adapting the host-specific network declaration.
python3 - <<'PY'
import hashlib,json,pathlib
manifest=json.loads(pathlib.Path('release.json').read_text())
for name,expected in manifest['files'].items():
    path=pathlib.Path(name)
    if path.is_absolute() or '..' in path.parts: raise SystemExit('Invalid manifest path')
    if hashlib.sha256(path.read_bytes()).hexdigest()!=expected: raise SystemExit('Checksum mismatch: '+name)
PY
# Reuse the production bridge; never recreate the live PostgreSQL network.
project=$(cd /opt/watchparty/current && docker compose config --format json | python3 -c 'import json,sys; print(json.load(sys.stdin)["name"])')
export COMPOSE_PROJECT_NAME="$project"
docker network inspect "${project}_default" | python3 -c 'import json,sys; n=json.load(sys.stdin)[0]; sys.exit(0 if any(c.get("Subnet")=="172.30.55.0/24" and c.get("Gateway")=="172.30.55.1" for c in n["IPAM"]["Config"]) else "Unexpected production network subnet/gateway")'
python3 - <<'PY'
from pathlib import Path
p=Path('compose.yml')
s=p.read_text()
start=s.index('\nnetworks:\n')
end=s.index('\nvolumes:\n',start)
s=s[:start]+'\nnetworks:\n  default:\n    external: true\n    name: ${COMPOSE_PROJECT_NAME}_default\n'+s[end:]
p.write_text(s)
PY
if [[ -d /opt/watchparty/current/web/downloads ]]; then
  cp -a /opt/watchparty/current/web/downloads web/
fi
# Already-open tabs can still request older chunks and lazy-loaded player versions.
for directory in assets vendor; do
  if [[ -d "/opt/watchparty/current/web/$directory" ]]; then
    mkdir -p "web/$directory"
    cp -an "/opt/watchparty/current/web/$directory/." "web/$directory/"
  fi
done
# Keep protected environment external to release artifacts.
ln -s /opt/watchparty/.env .env
export RELEASE_ID="$release_id"
docker compose config --quiet
docker compose build api
docker compose run --rm --no-deps tls-router haproxy -c -f /usr/local/etc/haproxy/haproxy.cfg
# Preserve PostgreSQL and its volume. This is an existing-host update, not bootstrap.
docker compose up -d --no-deps --wait --wait-timeout 120 api caddy tls-router coturn
# Readiness must include voice; HTTP 200 alone does not establish that.
docker compose exec -T api node -e "fetch('http://127.0.0.1:8080/readyz').then(async r=>{const b=await r.json();process.exit(r.ok&&['ready','database','dispatcher','voice'].every(k=>b[k]===true)?0:1)}).catch(()=>process.exit(1))"
# Persist the tag only after successful startup, keeping environment permissions.
python3 - "$release_id" <<'PY'
import os,pathlib,sys
p=pathlib.Path('/opt/watchparty/.env')
lines=p.read_text().splitlines()
lines=[line for line in lines if not line.startswith('RELEASE_ID=')]
tmp=p.with_name('.env.deploy-tmp')
fd=os.open(tmp,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
with os.fdopen(fd,'w') as f: f.write('\n'.join(lines)+'\nRELEASE_ID='+sys.argv[1]+'\n')
os.replace(tmp,p)
PY
ln -s "$release" /opt/watchparty/current-next
mv -Tf /opt/watchparty/current-next /opt/watchparty/current
install -m 700 sync-turn-tls.sh /opt/watchparty/sync-turn-tls.sh
bash remove-backups.sh
docker compose ps
echo "Activated $release_id. No database or file snapshots created."
