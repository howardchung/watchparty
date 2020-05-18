# Jeopardy

An website for playing Jeopardy! together

## Description

- Implements the game show Jeopardy!, including the Jeopardy, Double Jeopardy, and Final Jeopardy rounds. Daily Doubles are also included.
- Any archived episode of Jeopardy! can be loaded, with options for loading specific event games (e.g. College Championship)
- Load games by episode number
- Supports creating multiple rooms for private/simultaneous games.
- Text chat included

Reading:
* Uses text-to-speech to read clues

Judging:
* Players judge answer correctness themselves.
* Auto-judging is quite a difficult problem to solve, due to the number of ways answers can be represented, and spelling errors.
* Rule-based approaches will not scale sufficiently, and probably something ML/AI-powered is required for a usable/non-frustrating experience.

Data:
* Game data is from http://j-archive.com/
* Games might be incomplete if some clues weren't revealed on the show.

## Configuration

- `REDIS_URL`: Provide to allow persisting rooms to Redis so they survive server reboots

## Tech

- React
- TypeScript
- Node.js
