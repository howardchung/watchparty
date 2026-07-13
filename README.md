# Watch

Watch is a private watch-together app for synchronized video playback, room chat, subtitles, and mobile-friendly rooms.

This repository is a rebranded and redesigned fork of the open-source WatchParty project. The upstream project and its contributors remain credited in the repository history and [LICENSE](./LICENSE). This fork keeps the original MIT license obligations.

## What changed

- Rebranded the product UI to **Watch**.
- Rebuilt the landing page and room workspace with a maintainable dark cinema design system.
- Added Persian-first RTL behavior for navigation, room controls, chat, forms, menus, and responsive mobile layouts.
- Removed profile photos and avatar rendering from visible room and account flows.
- Removed visible GitHub and Discord credit links from the product UI.
- Preserved synchronized rooms, direct MP4/HLS playback, chat, playlists, subtitles, screen sharing, file sharing, and optional virtual-browser support.
- Removed upstream client credential defaults and hard-coded TURN credentials. Configure those values through `.env`.
- Added an Ubuntu installer with Docker Compose by default and an optional native systemd path.

## Quick start on Ubuntu

The recommended deployment path uses Docker Compose and restarts automatically after reboot.

```bash
chmod +x scripts/install-ubuntu.sh
./scripts/install-ubuntu.sh
```

The installer:

1. Installs required Ubuntu packages.
2. Prompts for the repository path, public port, optional Firebase/Stripe/TURN/server configuration, and deployment mode.
3. Writes a permission-restricted `.env` file.
4. Builds and starts the service with Docker Compose (`restart: unless-stopped`) or creates a systemd service.
5. Prints the final URL, status command, and log command.

To update an existing Docker installation:

```bash
./scripts/install-ubuntu.sh --update
```

The updater pulls the current branch and rebuilds the Compose service without rewriting the existing `.env`.

## Manual Docker deployment

```bash
cp .env.example .env
# Edit .env locally. Do not commit it.
docker compose up -d --build
docker compose ps
```

The application listens inside the container on port `8080`. Set `APP_PORT` in `.env` to choose the host port.

## Local development

Requires Node.js 24 or newer.

```bash
npm ci
npm run ui
```

In another terminal:

```bash
npm start
```

The Vite UI runs on its development port and the Node server defaults to port `8080`.

## Configuration

All configuration is optional unless you need authentication, permanent rooms, subscriptions, external media search, Redis, Postgres, TURN, or virtual-browser management.

- Client-side build variables are documented in `.env.example`.
- Server-side variables and defaults are documented in `server/config.ts`.
- Never commit `.env`, Firebase Admin JSON, Stripe secret keys, database URLs, Redis URLs, or TURN credentials.

For browser-compatible direct media playback, use MP4 files with H.264/AAC or HLS streams that support HTTP range requests. MKV compatibility depends on the browser and codecs inside the container.

## License

Watch remains distributed under the MIT License. See [LICENSE](./LICENSE) for the full notice.
