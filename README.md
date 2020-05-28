# Jeopardy

An website for playing Jeopardy! together

## Description

- Implements the game show Jeopardy!, including the Jeopardy, Double Jeopardy, and Final Jeopardy rounds. Daily Doubles are also included.
- Any archived episode of Jeopardy! can be loaded, with options for loading specific event games (e.g. College Championship)
- Load games by episode number
- Supports creating multiple rooms for private/simultaneous games.
- Text chat included

### Reading:

- Uses text-to-speech to read clues

### Buzzing:

- After a set time (based on number of syllables in the clue text), buzzing is unlocked
- Buzzing in enables a user to submit an answer
- Answers will be judged in buzz order

### Judging:

- Players judge answer correctness themselves.
- Auto-judging is quite a difficult problem to solve, due to the number of ways answers can be represented, and spelling errors.
- Rule-based approaches will not scale sufficiently, and probably something ML/AI-powered is required for a usable/non-frustrating experience.

### Data:

- Game data is from http://j-archive.com/
- Games might be incomplete if some clues weren't revealed on the show.

## Quick Start

1. Clone this repo via `git clone git@github.com:howardchung/watchparty.git`
2. Install npm dependencies for the project via `npm install`
3. Start the server via `npm run dev` (Notice: The default port for the server will be 8080 but can be changed by setting the REACT_APP_SERVER_HOST env variable to some other port)
4. Start the react application in a separate shell via `npm run start`
5. Duplicate the `.env.example` file
6. Rename it to `.env`
7. Add environment keys as described in the advanced setup below

## Advanced Setup

### YouTube API (Optional for YouTube Search)

This project is using the YouTube API which means you will need to setup an API key. You can get one from Google [here](https://console.developers.google.com).

Without an API key you won't be able to search for videos via the searchbox.

After creating a **YouTube Data API V3** access, you can create an API key which you can add to your environment variables by copying the `.env.example`, renaming it to `.env` and adding the key to the YOUTUBE_API_KEY variable.

After that restart your server to enable the YouTube API access on your server.

### Virtual Browser Setup

_This section is not added yet_

## Environment Variables

- `REDIS_URL`: Provide to allow persisting rooms to Redis so they survive server reboots

## Tech

- React
- TypeScript
- Node.js
- Redis
