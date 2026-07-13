#!/usr/bin/env bash
set -Eeuo pipefail

readonly SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_DIR="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
readonly SERVICE_NAME="watch"

SUDO=""
if [[ "${EUID}" -ne 0 ]]; then
  SUDO="sudo"
fi

log() {
  printf '\n[Watch] %s\n' "$1"
}

fail() {
  printf '\n[Watch] ERROR: %s\n' "$1" >&2
  exit 1
}

prompt_value() {
  local variable_name="$1"
  local prompt="$2"
  local default_value="$3"
  local value
  read -r -p "${prompt} [${default_value}]: " value
  printf -v "${variable_name}" '%s' "${value:-${default_value}}"
}

prompt_secret() {
  local variable_name="$1"
  local prompt="$2"
  local value
  read -r -s -p "${prompt} (optional): " value
  printf '\n'
  printf -v "${variable_name}" '%s' "${value}"
}

install_packages() {
  log "Installing required Ubuntu packages."
  ${SUDO} apt-get update
  ${SUDO} apt-get install -y ca-certificates curl git
}

install_docker() {
  if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
    return
  fi

  if ! ${SUDO} apt-get install -y docker.io docker-compose-v2; then
    ${SUDO} apt-get install -y docker.io docker-compose-plugin
  fi
  ${SUDO} systemctl enable --now docker
}

quote_env_value() {
  local value="$1"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  printf '"%s"' "${value}"
}

write_env_value() {
  printf '%s=%s\n' "$1" "$(quote_env_value "$2")"
}

write_env() {
  umask 077
  {
    printf 'APP_PORT=%s\n' "${APP_PORT}"
    printf 'PORT=8080\n'
    printf 'HOST=0.0.0.0\n'
    printf 'NODE_ENV=production\n'
    write_env_value "VITE_SERVER_HOST" "${VITE_SERVER_HOST}"
    write_env_value "VITE_OAUTH_REDIRECT_HOSTNAME" "${VITE_OAUTH_REDIRECT_HOSTNAME}"
    write_env_value "VITE_FIREBASE_CONFIG" "${VITE_FIREBASE_CONFIG}"
    write_env_value "VITE_STRIPE_PUBLIC_KEY" "${VITE_STRIPE_PUBLIC_KEY}"
    write_env_value "VITE_TURN_SERVERS" "${VITE_TURN_SERVERS}"
    write_env_value "VITE_TURN_USERNAME" "${VITE_TURN_USERNAME}"
    write_env_value "VITE_TURN_CREDENTIAL" "${VITE_TURN_CREDENTIAL}"
    write_env_value "YOUTUBE_API_KEY" "${YOUTUBE_API_KEY}"
    write_env_value "FIREBASE_ADMIN_SDK_CONFIG" "${FIREBASE_ADMIN_SDK_CONFIG}"
    write_env_value "DATABASE_URL" "${DATABASE_URL}"
    write_env_value "REDIS_URL" "${REDIS_URL}"
  } > "${INSTALL_DIR}/.env"
  chmod 600 "${INSTALL_DIR}/.env"
}

update_source() {
  if [[ ! -f "${INSTALL_DIR}/package.json" ]]; then
    mkdir -p "$(dirname -- "${INSTALL_DIR}")"
    git clone "${REPO_URL}" "${INSTALL_DIR}"
  elif [[ -d "${INSTALL_DIR}/.git" && "${UPDATE_ONLY}" == "1" ]]; then
    git -C "${INSTALL_DIR}" pull --ff-only
  fi
}

install_docker_mode() {
  install_docker
  log "Building and starting Watch with Docker Compose."
  (
    cd "${INSTALL_DIR}"
    docker compose up -d --build
    docker compose ps
  )
}

install_native_mode() {
  log "Installing Node.js and npm for the native systemd path."
  ${SUDO} apt-get install -y nodejs npm
  command -v node >/dev/null 2>&1 || fail "Node.js was not installed."
  local node_major
  node_major="$(node --version | tr -d 'v' | cut -d. -f1)"
  [[ "${node_major}" -ge 24 ]] || fail "Node.js 24 or newer is required. Use Docker mode on older Ubuntu images."

  log "Building Watch."
  (
    cd "${INSTALL_DIR}"
    npm ci
    npm run build
  )

  log "Creating the systemd service."
  ${SUDO} tee "/etc/systemd/system/${SERVICE_NAME}.service" >/dev/null <<EOF
[Unit]
Description=Watch synchronized watch-together server
After=network.target

[Service]
Type=simple
WorkingDirectory=${INSTALL_DIR}
EnvironmentFile=${INSTALL_DIR}/.env
ExecStart=$(command -v node) server/server.ts
Restart=always
RestartSec=5
User=$(id -un)

[Install]
WantedBy=multi-user.target
EOF
  ${SUDO} systemctl daemon-reload
  ${SUDO} systemctl enable --now "${SERVICE_NAME}.service"
  ${SUDO} systemctl --no-pager --full status "${SERVICE_NAME}.service" || true
}

UPDATE_ONLY="0"
if [[ "${1:-}" == "--update" ]]; then
  UPDATE_ONLY="1"
fi

command -v apt-get >/dev/null 2>&1 || fail "This installer targets Ubuntu/Debian systems."
install_packages

DEFAULT_REPO="$(git -C "${REPO_DIR}" config --get remote.origin.url 2>/dev/null || true)"
DEFAULT_REPO="${DEFAULT_REPO:-https://github.com/your-account/watch.git}"
DEFAULT_INSTALL_DIR="${REPO_DIR}"
DEFAULT_HOST="$(hostname -I 2>/dev/null | awk '{print $1}')"
DEFAULT_HOST="${DEFAULT_HOST:-localhost}"

if [[ "${UPDATE_ONLY}" == "1" && -f "${REPO_DIR}/.env" ]]; then
  INSTALL_DIR="${REPO_DIR}"
  REPO_URL="${DEFAULT_REPO}"
  APP_PORT="$(grep -E '^APP_PORT=' "${INSTALL_DIR}/.env" | cut -d= -f2- || true)"
  APP_PORT="${APP_PORT:-8080}"
  PUBLIC_HOST="${DEFAULT_HOST}"
  DEPLOY_MODE="docker"
else
  prompt_value REPO_URL "Repository URL" "${DEFAULT_REPO}"
  prompt_value INSTALL_DIR "Install directory" "${DEFAULT_INSTALL_DIR}"
  prompt_value APP_PORT "Public port" "8080"
  prompt_value PUBLIC_HOST "Public hostname or IP" "${DEFAULT_HOST}"
  prompt_value DEPLOY_MODE "Deployment mode (docker/native)" "docker"

  prompt_value VITE_SERVER_HOST "API origin (blank for same origin)" ""
  prompt_value VITE_OAUTH_REDIRECT_HOSTNAME "OAuth redirect origin" "http://${PUBLIC_HOST}:${APP_PORT}"
  prompt_secret VITE_FIREBASE_CONFIG "Firebase web config JSON"
  prompt_secret VITE_STRIPE_PUBLIC_KEY "Stripe public key"
  prompt_value VITE_TURN_SERVERS "TURN server URLs (comma-separated or JSON)" ""
  prompt_secret VITE_TURN_USERNAME "TURN username"
  prompt_secret VITE_TURN_CREDENTIAL "TURN credential"
  prompt_secret YOUTUBE_API_KEY "YouTube API key"
  prompt_secret FIREBASE_ADMIN_SDK_CONFIG "Firebase Admin SDK JSON"
  prompt_secret DATABASE_URL "Postgres connection URL"
  prompt_secret REDIS_URL "Redis connection URL"
fi

[[ "${DEPLOY_MODE}" == "docker" || "${DEPLOY_MODE}" == "native" ]] || fail "Choose docker or native deployment mode."
mkdir -p "${INSTALL_DIR}"
update_source
if [[ "${UPDATE_ONLY}" != "1" ]]; then
  write_env
fi

if [[ "${DEPLOY_MODE}" == "docker" ]]; then
  install_docker_mode
else
  install_native_mode
fi

log "Installation complete."
printf 'URL: http://%s:%s\n' "${PUBLIC_HOST:-localhost}" "${APP_PORT}"
if [[ "${DEPLOY_MODE}" == "docker" ]]; then
  printf 'Status: docker compose -f %s/docker-compose.yml ps\n' "${INSTALL_DIR}"
  printf 'Logs:   docker compose -f %s/docker-compose.yml logs -f --tail=100\n' "${INSTALL_DIR}"
else
  printf 'Status: sudo systemctl status %s.service\n' "${SERVICE_NAME}"
  printf 'Logs:   sudo journalctl -u %s.service -f\n' "${SERVICE_NAME}"
fi
