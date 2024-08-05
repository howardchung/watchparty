# fake-mediastreamtrack

Fake W3C [MediaStreamTrack](https://www.w3.org/TR/mediacapture-streams/#mediastreamtrack) implementation. Suitable for for Node.js or testing.

This library is intended for Node.js applications or libraries that depend on the `MediaStreamTrack` class. The exposed `FakeMediaStreamTrack` class does not internally manage any audio/video source.

This library provides TypeScript definitions and the `FakeMediaStreamTrack` extendes the `MediaStreamTrack` interface, so it can be safely used in any code requiring a `MediaStreamTrack` object.


## Install

```bash
$ npm install fake-mediastreamtrack
```


## Usage

```js
const { FakeMediaStreamTrack } = require('fake-mediastreamtrack');
// or
import { FakeMediaStreamTrack } from 'fake-mediastreamtrack';

const track = new FakeMediaStreamTrack({ kind: 'audio' });

track.enabled = false;

console.log(
  'track.readyState: %s, track.enabled: %s', track.readyState, track.enabled
);
// => 'track.readyState: live, track.enabled: false'

const clonedTrack = track.clone();

track.stop();

console.log('track.readyState: %s', track.readyState);
// => 'track.readyState: ended'

console.log('clonedTrack.readyState: %s', clonedTrack.readyState);
// => 'clonedTrack.readyState: live'

clonedTrack.applyConstraints({ frameRate: { max: 30, ideal: 20 } });

console.log('clonedTrack.getConstraints(): %o', clonedTrack.getConstraints());
// => clonedTrack.getConstraints(): { frameRate: { max: 30, ideal: 20 } }
```


## API additions

### Constructor

The `FakeMediaStreamTrack` class constructor accepts an object with the following fields.

```js
const track = new FakeMediaStreamTrack({ kind, id, label, isolated, muted, data })
```

* `kind` (string, mandatory): "audio" or "video".
* `id` (string, optional): Track unique identificator. If not given, a random one is generated.
* `label` (string, optional): Track label. Defaults to empty string.
* `isolated` (boolean, optional): See the [spec](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack). Defaults to `false`.
* `muted` (boolean, optional): Whether this track belongs to a muted source. Defaults to `false`.
* `data` (object, options): An object with custom application data.

### Custom setters and getters

* `track.data` getter returns custom application `data` object. The app can write into it at any time.
* `track.enabled = flag` setter fires a proprietary "@enabledchange" event if the `enabled` property changed.

### Custom methods and additions

* `track.stop()` will fire a proprietary "@stop" event if not already stopped.
* `track.remoteStop()` emulates a stop generated remotely. It will fired a proprietary "@stop" event and "ended" event if not already stopped.
* `track.remoteMute()` emulates a mute generated remotely. It will fired "mute" event if not already muted.
* `track.remoteUnmute()` emulates a unmute generated remotely. It will fired "unmute" event if not already unmuted.

```js
const { FakeMediaStreamTrack } = require('fake-mediastreamtrack');
const track = new FakeMediaStreamTrack({ kind: 'video' });

track.onended = () => console.log('track ended (1)');
track.addEventListener('ended', () => console.log('track ended (2)'));

track.addEventListener('@enabledchange', () => {
  console.log('track enabled changed:', track.enabled);
});

track.enabled = false;
track.enabled = false;
track.enabled = true;
track.remoteStop();

// => track enabled changed: false
// => track enabled changed: true
// => track ended (1)
// => track ended (2)
```


## Limitations

Some W3C [MediaStreamTrack](https://www.w3.org/TR/mediacapture-streams/#mediastreamtrack) properties and methods are not implemented:

* `track.getCapabilities()`
* `track.getSettings()`
* `track.onisolationchange`
* `track.onoverconstrained`


## Author

* Iñaki Baz Castillo [[website](https://inakibaz.me)|[github](https://github.com/ibc/)]


## License

ISC
