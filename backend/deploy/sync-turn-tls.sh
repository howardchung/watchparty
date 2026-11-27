#!/bin/sh
set -eu
cd /opt/watchparty/current
set -a
. /opt/watchparty/.env
set +a
container=$(docker compose ps -q caddy)
test -n "$container"
cert=$(docker exec "$container" find /data/caddy/certificates -type f -name "$TURN_DOMAIN.crt" | head -n 1)
test -n "$cert"
tmp=$(mktemp -d /opt/watchparty/turn-tls/update.XXXXXX)
trap 'rmdir "$tmp" 2>/dev/null || true' EXIT
docker cp "$container:$cert" "$tmp/fullchain.pem"
docker cp "$container:${cert%.crt}.key" "$tmp/privkey.pem"
chmod 644 "$tmp/fullchain.pem"
chown 65534:65534 "$tmp/privkey.pem"
chmod 400 "$tmp/privkey.pem"
if cmp -s "$tmp/fullchain.pem" /opt/watchparty/turn-tls/fullchain.pem && cmp -s "$tmp/privkey.pem" /opt/watchparty/turn-tls/privkey.pem; then
    unlink "$tmp/fullchain.pem"
    unlink "$tmp/privkey.pem"
else
    mv "$tmp/fullchain.pem" /opt/watchparty/turn-tls/fullchain.pem
    mv "$tmp/privkey.pem" /opt/watchparty/turn-tls/privkey.pem
    docker compose up -d coturn
    docker compose restart coturn
fi
