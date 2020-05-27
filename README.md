# WatchParty

An website for watching videos together.

## Quick Start

1. Clone this repo via `git clone git@github.com:howardchung/watchparty.git`
2. Install npm dependencies for the project via `npm install`
3. Start the server via `npm run dev` (Notice: The default port for the server will be 8080 but can be changed by setting the REACT_APP_SERVER_HOST env variable to some other port)
4. Start the react application in a separate shell via `npm run start`
5. Duplicate the `.env.example` file
6. Rename it to `.env`
7. Add environment keys as described in the advanced setup below

## Description

- Synchronizes the video being watched with the current room
- Plays, pauses, and seeks are synced to all watchers
- Supports:
  - YouTube videos
  - Screen sharing (Chrome tab or application)
  - Stream-your-own-file
  - Video files on the Internet (anything accessible via HTTP)
  - Launch a shared virtual browser in the cloud (similar to rabb.it)
- Create separate rooms for users on demand
- Text chat
- Video chat

## Advanced Setup

### YouTube API (Optional for YouTube Search)

This project is using the YouTube API which means you will need to setup an API key. You can get one from Google [here](https://console.developers.google.com).

Without an API key you won't be able to search for videos via the searchbox.

After creating a **YouTube Data API V3** access, you can create an API key which you can add to your environment variables by copying the `.env.example`, renaming it to `.env` and adding the key to the YOUTUBE_API_KEY variable.

After that restart your server to enable the YouTube API access on your server.

### Virtual Browser Setup

_This section is not added yet_

## Environment Variables

- `REACT_APP_MEDIA_PATH`: Optional, URL of a server with media files on it.
  - The client will query this for a listing of available files.
  - Currently supported: Nginx, S3 bucket, GitLab repo. Possibly Plex media servers in the future
  - For optimal performance, the server should support requests for 206 Partial Content and have CORS enabled.
- `REACT_APP_STREAM_PATH`: Optional, URL of a PeerStream server for searching streams
- `YOUTUBE_API_KEY`: Provide one to enable searching YouTube
- `REDIS_URL`: Provide to allow persisting rooms to Redis so they survive server reboots

## Tech

- React
- TypeScript
- Node.js
- Redis
