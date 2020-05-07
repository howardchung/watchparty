# WatchParty

An website for watching videos together.

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

## Configuration

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
