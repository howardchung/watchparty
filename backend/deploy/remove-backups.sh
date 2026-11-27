#!/usr/bin/env bash
# Explicitly authorized removal of watchparty's backup automation and saved snapshots.
set -euo pipefail
[[ "$(id -u)" == 0 ]] || { echo 'Run as root on the deployment host' >&2; exit 1; }
if systemctl cat watchparty-backup.timer >/dev/null 2>&1; then systemctl disable --now watchparty-backup.timer; fi
if systemctl cat watchparty-backup.service >/dev/null 2>&1; then systemctl stop watchparty-backup.service; fi
rm -f /etc/systemd/system/watchparty-backup.timer /etc/systemd/system/watchparty-backup.service /opt/watchparty/backup.sh
systemctl daemon-reload
# Restrict deletion to the fixed application backup path; never follow a symlink.
if [[ -L /opt/watchparty/backups ]]; then
  unlink /opt/watchparty/backups
elif [[ -d /opt/watchparty/backups ]]; then
  rm -rf -- /opt/watchparty/backups
fi
systemctl reset-failed watchparty-backup.service watchparty-backup.timer 2>/dev/null || true
echo 'watchparty backup automation and /opt/watchparty/backups removed.'
