#!/usr/bin/env bash
set -euo pipefail
umask 077
dir=$(mktemp -d)
trap 'rm -rf -- "$dir"' EXIT
printf '%s\n' "$DEPLOY_SSH_KEY" > "$dir/key"
printf '%s\n' "$DEPLOY_KNOWN_HOSTS" > "$dir/known_hosts"
ssh -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes \
  -o "UserKnownHostsFile=$dir/known_hosts" -o ConnectTimeout=20 \
  -i "$dir/key" "watchparty-ci@$DEPLOY_HOST" "$1" "$GITHUB_SHA"
