# WatchParty

File changes
export const serverPath = `${window.location.origin}`.replace('3000', '8080');

![screenshot](https://github.com/howardchung/watchparty/raw/master/public/screenshot_full.png)

An website for watching videos together.

## Description

- Synchronizes the video being watched with the current room
- Plays, pauses, and seeks are synced to all watchers
- Supports:
  - Screen sharing (full screen, browser tab or application)
  - Launch a shared virtual browser in the cloud (similar to rabb.it)
  - Stream-your-own-file
  - Video files on the Internet (anything accessible via HTTP)
  - YouTube videos
- Create separate rooms for users on demand
- Text chat
- Video chat

## Quick Start

- Clone this repo via `git clone git@github.com:howardchung/watchparty.git`
- Install npm dependencies for the project via `npm install`
- Start the server via `PORT=8080 npm run dev`
  - Defaults to port 8080, customize with `PORT` env var
  - Run using self-signed HTTPS cert with `HTTPS=true`. This is needed for some WebRTC features (camera, etc.)
- Start the React application in a separate shell and port via `PORT=3000 npm run start`
  - Point to server using `REACT_APP_SERVER_HOST` env var if you customized it above
  - Run using self-signed HTTPS cert with `HTTPS=true`. This is needed for some WebRTC features (camera, etc.)
- Duplicate the `.env.example` file
- Rename it to `.env`
- Add config for the features you want as described in the advanced setup

## Advanced Setup (optional)

All of these are optional and the application should work without them. Some functionality may be missing.

### YouTube API (video search)

This project uses the YouTube API for video search, which requires an API key. You can get one from Google [here](https://console.developers.google.com).

Without an API key you won't be able to search for videos via the searchbox.

After creating a **YouTube Data API V3** access, you can create an API key which you can add to your environment variables by copying the `.env.example`, renaming it to `.env` and adding the key to the YOUTUBE_API_KEY variable.

After that restart your server to enable the YouTube API access on your server.

### Firebase Config (user authentication)

This project uses Firebase for authentication. This is used for user login, account management, subscriptions, and handling some features like room locking/permanence.

To set up, create a new Firebase app (or reuse an old one) from [here](https://console.firebase.google.com/). After creating an application, click on the settings cog icon in the left menu next to "Project overview" and click on project settings. From there, scroll down, create a web application and copy the Firebase SDK configuration snippet JSON data.

Next, you have to stringify it: `JSON.stringify(PASTE_CONFIG_HERE)` in your browser console, then add it to `REACT_APP_FIREBASE_CONFIG` in your .env file.

For server verification of accounts you'll also need `FIREBASE_ADMIN_SDK_CONFIG`, which you should do the same steps for.

### Virtual Browser Setup

This project supports creating virtual browsers (using https://github.com/m1k1o/neko) either on a cloud provider, or by spawning Docker containers on the development server. For local development, the Docker on local approach is preferred.

- Install Docker: `curl -fsSL https://get.docker.com | sh`
- Make sure you have an SSH key pair set up on the server (`id_rsa` in `~/.ssh` directory)
- Add `DOCKER_VM_HOST=localhost` to your .env file (can substitute localhost for a public hostname)
- Add `NODE_ENV=development` to .env to enable create-on-demand behavior for VMs
- Configure Redis by adding `REDIS_URL` to your .env file (Redis is required for virtual browser management)

### Room Persistence

- Configure Postgres by adding DATABASE_URL to your .env file and then setting up the database schema
- This allows rooms to persist between server restarts

## Tech

- React
- TypeScript
- Node.js
- Redis
- Docker
