<h2 align="left"> Convert and generate URL of WebVTT from .srt subtitle file on the fly over Browser/HTML5 environment</h2>

HTMLMediaElement/Video doesn't support `.srt` (SubRip Track) format subtitle as its `<track>` source - in order to show captions of your video track either you have to convert the SRT file to WebVTT or write it on your own. Because `<track src="VALID URL SCHEME">` requires a valid URL of `.vtt` (Web Video Text Track) formated subtitle track.
This library will let you do this on the fly and will give you an URL to set the source of caption track.

<p align="center">
  <a href="https://www.npmjs.org/package/srt-webvtt"><img src="https://img.shields.io/npm/v/srt-webvtt.svg?style=flat-square" /></a>
  <a href="https://github.com/imshaikot/srt-webvtt/actions/workflows/node.js.yml"><img src="https://github.com/imshaikot/srt-webvtt/actions/workflows/node.js.yml/badge.svg" /></a>
  <a href="https://github.com/imshaikot/srt-webvtt/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/imshaikot/srt-webvtt.svg">
  </a>

  <a href="http://standardjs.com">
    <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg" />
  </a>
</p>

## Example

<a href="https://imshaikot.github.io/srt-webvtt/">https://imshaikot.github.io/srt-webvtt/</a>

## Installation

```bash
$ npm install srt-webvtt --save
```

## Getting Started

Using it very easy but a little tricky indeed.
To getting started:

```js
// Using ES6 es-module
import toWebVTT from "srt-webvtt"; // This is a default export, so you don't have to worry about the import name

// Not using ES6??
var toWebVTT = require("srt-webvtt");
```

## Example and API

When you're using `HTMLMediaElement` (example: `<video>`) and you want to show caption on your video player - there's a native HTML Element that will allow us to do that.
See the official MDN article and tutorial of this `<track>` feature

<a href="https://developer.mozilla.org/en-US/Apps/Fundamentals/Audio_and_video_delivery/Adding_captions_and_subtitles_to_HTML5_video"> Adding captions and subtitles to HTML5 video</a>

But this feature is limited to WebVTT format and won't allow you to use SRT (very commonly used subtitle)

So, this tiny library will take your `.srt` subtitle file or a `Blob` object and will give you converted `.vtt` file's valid Object URL that you can set as `<track>`'s source.

<h4>See the Example below:</h4>

```js
import { default as toWebVTT } from "srt-webvtt";

try {
  const textTrackUrl = await toWebVTT(input.files[0]); // this function accepts a parameer of SRT subtitle blob/file object
  // It is a valid url that can be used as text track URL
  var track = document.getElementById("my-sub-track"); // Track element (which is child of a video element)
  var video = document.getElementById("my-video"); // Main video element
  track.src = textTrackUrl; // Set the converted URL to track's source
  video.textTracks[0].mode = "show"; // Start showing subtitle to your track
} catch (e) {
  console.error(e.message);
}
```

<br />

`toWebVTT(file: Blob): Promise<string>` and this is it :)

## LICENSE

MIT
