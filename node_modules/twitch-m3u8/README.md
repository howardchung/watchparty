# twitch-m3u8
> Get the stream URL of a Twitch livestream or past broadcast (VOD)

## Features
* Supports both livestreams and past broadcasts (VODs)    
* 0 dependencies   
* Promise-based    
* Can return raw .m3u8 data    

## Installation
[Node.js](https://nodejs.org/en/) required
```bash
npm install twitch-m3u8
```

## Usage
Doesn't require a Client-ID (from version 1.1.0).

Functions getStream and getVod have an optional second boolean parameter which defaults to false (can be omitted). Setting it to:  
true - function returns raw .m3u8 data  
false - function returns an array of JSON objects containing the quality, resolution and URL of the stream  
```js
const twitch = require("twitch-m3u8");

// returns a JSON object containing available streams of a livestream
twitch.getStream("chess")
.then(data => console.log(data))
.catch(err => console.error(err));

// returns a JSON object containing available streams of a VOD
twitch.getVod("877379571")
.then(data => console.log(data))
.catch(err => console.error(err));

// returns raw .m3u8 data containing available streams of a livestream
twitch.getStream("chess", true)
.then(data => console.log(data))
.catch(err => console.error(err));

// returns raw .m3u8 data containing available streams of a VOD
twitch.getVod("877379571", true)
.then(data => console.log(data))
.catch(err => console.error(err));
```
Example output:
```js
[
    {
        quality: '1080p60 (source)',
        resolution: '1920x1080',
        url: 'https://...'
    },
    {
        quality: '720p60',
        resolution: '1280x720',
        url: 'https://...'
    },
    ...
]
```

## Credits
All reverse engineering of the GraphQL API was taken from the [streamlink](https://github.com/streamlink/streamlink) project. I just rewrote it for Node.js.

## Contribute
Did you find a bug? Do you have an idea or a feature request? [Open an issue!](https://github.com/dudik/twitch-m3u8/issues)

## License
[MIT](https://github.com/dudik/twitch-m3u8/blob/master/LICENSE) © Samuel Dudik
