#!/bin/sh
set -eu
test -s /tls/fullchain.pem
test -s /tls/privkey.pem
# Drain the filter before exiting, including when relay startup fails.
log_dir=$(mktemp -d)
mkfifo "$log_dir/output"
awk -W interactive -f /turn-log.awk < "$log_dir/output" &
filter_pid=$!
exec 3>"$log_dir/output"
rm "$log_dir/output"
rmdir "$log_dir"
turnserver --no-cli --fingerprint --use-auth-secret \
  --static-auth-secret="$TURN_SHARED_SECRET" --realm="$TURN_DOMAIN" \
  --external-ip="$PUBLIC_IP" --relay-ip="$PUBLIC_IP" --listening-ip=0.0.0.0 --listening-port=3478 \
  --tls-listening-port=5349 --cert=/tls/fullchain.pem --pkey=/tls/privkey.pem \
  --min-port="${TURN_MIN_PORT:-49160}" --max-port="${TURN_MAX_PORT:-65535}" --no-multicast-peers --no-tlsv1 --no-tlsv1_1 \
  --user-quota="${TURN_USER_QUOTA:-128}" --total-quota="${TURN_TOTAL_QUOTA:-16000}" \
  --max-bps="${TURN_MAX_BPS:-256000}" --bps-capacity="${TURN_BPS_CAPACITY:-512000000}" \
  --denied-peer-ip=0.0.0.0-0.255.255.255 \
  --denied-peer-ip=10.0.0.0-10.255.255.255 \
  --denied-peer-ip=100.64.0.0-100.127.255.255 \
  --denied-peer-ip=127.0.0.0-127.255.255.255 \
  --denied-peer-ip=169.254.0.0-169.254.255.255 \
  --denied-peer-ip=172.16.0.0-172.31.255.255 \
  --denied-peer-ip=192.168.0.0-192.168.255.255 \
  --denied-peer-ip=224.0.0.0-255.255.255.255 \
  --denied-peer-ip=::1 --denied-peer-ip=fc00::-fdff:ffff:ffff:ffff:ffff:ffff:ffff:ffff \
  --denied-peer-ip=fe80::-febf:ffff:ffff:ffff:ffff:ffff:ffff:ffff \
  --log-file=stdout --simple-log >&3 2>&1 3>&- &
relay_pid=$!
exec 3>&-
trap 'kill -TERM "$relay_pid" 2>/dev/null || true' TERM INT
status=0
while :; do
  wait "$relay_pid" && status=0 || status=$?
  kill -0 "$relay_pid" 2>/dev/null || break
done
wait "$filter_pid"
exit "$status"
