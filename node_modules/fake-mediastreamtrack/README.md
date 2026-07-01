# fake-mediastreamtrack

Fake W3C [MediaStreamTrack](https://www.w3.org/TR/mediacapture-streams/#mediastreamtrack) implementation. Suitable for for Node.js or testing.

This library is intended for Node.js applications or libraries that depend on the `MediaStreamTrack` objects. The exposed `FakeMediaStreamTrack` class does not internally manage any audio/video source.

This library provides TypeScript definitions. The `FakeMediaStreamTrack` class extends the `MediaStreamTrack` interface so it can be safely used in any code requiring a `MediaStreamTrack` instance. In addition to that, `FakeMediaStreamTrack` also exposes custom methods (see below).

## Install

```bash
npm install fake-mediastreamtrack
```

## Usage

```ts
// Using EMS
import { FakeMediaStreamTrack } from 'fake-mediastreamtrack';

// Using CommonJS
const { FakeMediaStreamTrack } = require('fake-mediastreamtrack');

const track = new FakeMediaStreamTrack({ kind: 'audio' });

track.enabled = false;

console.log(
	'track.readyState: %o, track.enabled: %o',
	track.readyState,
	track.enabled
);
// => track.readyState: "live", track.enabled: false

const clonedTrack = track.clone();

track.stop();

console.log('track.readyState: %o', track.readyState);
// => track.readyState: "ended"

console.log('clonedTrack.readyState: %s', clonedTrack.readyState);
// => clonedTrack.readyState: "live"

await clonedTrack.applyConstraints({ frameRate: { max: 30, ideal: 20 } });

console.log('clonedTrack.getConstraints(): %o', clonedTrack.getConstraints());
// => clonedTrack.getConstraints(): { frameRate: { max: 30, ideal: 20 } }
```

## API additions

### Constructor

The `FakeMediaStreamTrack` class constructor requires an object with settings as follows:

```ts
type FakeMediaStreamTrackOptions<
	FakeMediaStreamTrackAppData extends AppData = AppData,
> = {
	kind: string;
	id?: string;
	label?: string;
	contentHint?: string;
	enabled?: boolean;
	muted?: boolean;
	readyState?: MediaStreamTrackState;
	capabilities?: MediaTrackCapabilities;
	constraints?: MediaTrackConstraints;
	settings?: MediaTrackSettings;
	data?: FakeMediaStreamTrackAppData;
};
```

- `kind` is typically "audio" or "video" and is the only mandatory parameter.
- `data` is an object with custom application data and it can be typed by setting a type argument when declaring a `FakeMediaStreamTrack` variable:
  ```ts
  const videoTrack: FakeMediaStreamTrack<{ foo: number }> =
  	new FakeMediaStreamTrack({
  		kind: 'video',
  		data: { foo: 123 },
  	});
  ```
- Other parameters such as `enabled`, `muted`, `readyState`, etc. affect the initial state of the track.
- `capabilities`, `constraints` and `settings` parameters provide the track with values that can be later retrieved by using the corresponding standard methods such as `getCapabilities()`, `getConstraints()` and `getSettings()`.

### Custom API

- `track.data` getter returns custom application data object. It can also be entirely replaced by using it as a setter (`track.data = { xxx }`).
- `track.enabled = flag` setter fires a custom "enabledchange" event (if the `enabled` value of the track effectively changed).
- `track.stop()` sets the track `readyState` to "ended" and fires a custom "stopped" event.
- `track.clone()` creates a cloned track with a random `id` (unless given in method parameters) and cloned state. `data` can also be given as a parameter in case we don't want to clone the `data` of the original track. The signature of the method also accepts a TypeScript argument defining the type of the `data` parameter:
  ```ts
  const clonedTrack = track.clone<{ lalala: string }>({
  	id: '4a552a2c-8568-4d01-906f-6800770846c3',
  	data: { lalala: 'foobar' },
  });
  ```
- `track.remoteStop()` simulates a remotely triggered stop. It fires a custom "stopped" event and the standard "ended" event (if the track was not already stopped).
- `track.remoteMute()` simulates a remotely triggered mute. It fires a "mute" event (if the track was not already muted).
- `track.remoteUnmute()` simulates a remotely triggered unmute. It fires an "unmute" event (if the track was muted).

```ts
import { FakeMediaStreamTrack } from 'fake-mediastreamtrack';

const track = new FakeMediaStreamTrack({ kind: 'video' });

track.onended = () => console.log('track ended');

track.addEventListener('stopped', () => {
	console.log('track stopped');
});

track.addEventListener('enabledchange', () => {
	console.log('track.enabled changed to %s', track.enabled);
});

track.enabled = false;
// => track.enabled changed to false

track.enabled = false;

track.enabled = true;
// => track.enabled changed to true

track.remoteStop();
// => track stopped
// => track ended
```

## Author

- Iñaki Baz Castillo [[website](https://inakibaz.me)|[github](https://github.com/ibc/)]

## License

ISC
