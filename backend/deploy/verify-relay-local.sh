#!/bin/sh
# Local fixture only. Loopback relay permissions and self-signed TLS must never
# be copied to production. Requires Docker, OpenSSL, Node and installed web deps.
set -eu
repo=$(CDPATH='' cd -- "$(dirname -- "$0")/../.." && pwd)
fixture=$(mktemp -d /tmp/watchparty-relay-acceptance.XXXXXX)
relay="watchparty-relay-acceptance-$$"
router="watchparty-sni-acceptance-$$"
cleanup() {
  docker stop "$router" "$relay" >/dev/null 2>&1 || true
  docker rm "$router" "$relay" >/dev/null 2>&1 || true
  rm -rf -- "$fixture"
}
trap cleanup EXIT HUP INT TERM
# These credentials and key are ephemeral local fixture data, never production.
chmod 755 "$fixture"
openssl req -x509 -newkey rsa:2048 -nodes -keyout "$fixture/key.pem" -out "$fixture/cert.pem" -days 1 -subj /CN=localhost -addext subjectAltName=DNS:localhost,IP:127.0.0.1 >/dev/null 2>&1
chmod 644 "$fixture/key.pem"
cat > "$fixture/haproxy.cfg" <<'CONFIG'
global
    user haproxy
    group haproxy
defaults
    mode tcp
    timeout connect 5s
    timeout client 5m
    timeout server 5m
frontend shared_tls
    bind 127.0.0.1:443
    tcp-request inspect-delay 5s
    tcp-request content accept if { req.ssl_hello_type 1 }
    use_backend relay if { req.ssl_sni -i localhost }
    default_backend website
backend relay
    server coturn 127.0.0.1:5349
backend website
    server website 127.0.0.1:8443
CONFIG
docker run -d --name "$relay" --network host -v "$fixture:/tls:ro" \
  coturn/coturn@sha256:71c3c990283385567f11794ee692e3a47b66fd9b0bb39e42afbe776e331dd888 \
  -n --no-cli --fingerprint --use-auth-secret \
  --static-auth-secret=local-test-turn-shared-secret-32-bytes-minimum \
  --realm=localhost --listening-ip=127.0.0.1 --relay-ip=127.0.0.1 \
  --listening-port=3478 --tls-listening-port=5349 \
  --cert=/tls/cert.pem --pkey=/tls/key.pem --min-port=52000 --max-port=53999 \
  --user-quota=128 --total-quota=16000 \
  --allow-loopback-peers --no-multicast-peers --no-dtls --log-file=stdout --simple-log >/dev/null
docker run -d --name "$router" --user 0:0 --network host \
  -v "$fixture/haproxy.cfg:/usr/local/etc/haproxy/haproxy.cfg:ro" \
  haproxy@sha256:5893840576071e6217cd52ebdcc14f454c6f7a631056fa6f4e0f40d3cac4215b >/dev/null
cd "$repo/clients/web"
transport_index=0
for ice in 'turn:localhost:3478?transport=udp' 'turn:localhost:3478?transport=tcp' 'turns:localhost:5349?transport=tcp' 'turns:localhost:443?transport=tcp'; do
  transport_index=$((transport_index + 1))
  printf 'Testing %s\n' "$ice"
  MESH_TLS_INSECURE=1 RUN_MESH_ACCEPTANCE=1 MESH_ICE_URL="$ice" \
    CHROME_PATH="${CHROME_PATH:-/usr/bin/google-chrome}" \
    npm run test:e2e -- e2e/mesh-acceptance.spec.ts --output="${MESH_OUTPUT_ROOT:-/tmp/watchparty-relay-results}/$transport_index"
done
