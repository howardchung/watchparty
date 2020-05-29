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

## Updating Clues:

- The j-archive-parser project needs to be in a peer directory
- Run that to extract CSV data, then run `node dev/parseJArchiveCSV.js` to generate the single `jeopardy.json` file.

## Environment Variables

- `REDIS_URL`: Provide to allow persisting rooms to Redis so they survive server reboots

## Tech

- React
- TypeScript
- Node.js
- Redis
