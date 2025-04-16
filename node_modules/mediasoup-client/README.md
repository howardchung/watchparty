# mediasoup-client v3

[![][npm-shield-mediasoup-client]][npm-mediasoup-client]
[![][github-actions-shield-mediasoup-client]][github-actions-mediasoup-client]
[![][opencollective-shield-mediasoup]][opencollective-mediasoup]

TypeScript client side library for building [mediasoup][mediasoup-website] based applications.

## Website and Documentation

- [mediasoup.org][mediasoup-website]

## Support Forum

- [mediasoup.discourse.group][mediasoup-discourse]

## Usage Example

```ts
import { Device } from 'mediasoup-client';
import mySignaling from './my-signaling'; // Our own signaling stuff.

// Create a device (use browser auto-detection).
const device = new Device();

// Communicate with our server app to retrieve router RTP capabilities.
const routerRtpCapabilities = await mySignaling.request(
	'getRouterCapabilities',
);

// Load the device with the router RTP capabilities.
await device.load({ routerRtpCapabilities });

// Check whether we can produce video to the router.
if (!device.canProduce('video')) {
	console.warn('cannot produce video');

	// Abort next steps.
}

// Create a transport in the server for sending our media through it.
const { id, iceParameters, iceCandidates, dtlsParameters, sctpParameters } =
	await mySignaling.request('createTransport', {
		sctpCapabilities: device.sctpCapabilities,
	});

// Create the local representation of our server-side transport.
const sendTransport = device.createSendTransport({
	id,
	iceParameters,
	iceCandidates,
	dtlsParameters,
	sctpParameters,
});

// Set transport "connect" event handler.
sendTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
	// Here we must communicate our local parameters to our remote transport.
	try {
		await mySignaling.request('transport-connect', {
			transportId: sendTransport.id,
			dtlsParameters,
		});

		// Done in the server, tell our transport.
		callback();
	} catch (error) {
		// Something was wrong in server side.
		errback(error);
	}
});

// Set transport "produce" event handler.
sendTransport.on(
	'produce',
	async ({ kind, rtpParameters, appData }, callback, errback) => {
		// Here we must communicate our local parameters to our remote transport.
		try {
			const { id } = await mySignaling.request('produce', {
				transportId: sendTransport.id,
				kind,
				rtpParameters,
				appData,
			});

			// Done in the server, pass the response to our transport.
			callback({ id });
		} catch (error) {
			// Something was wrong in server side.
			errback(error);
		}
	},
);

// Set transport "producedata" event handler.
sendTransport.on(
	'producedata',
	async (
		{ sctpStreamParameters, label, protocol, appData },
		callback,
		errback,
	) => {
		// Here we must communicate our local parameters to our remote transport.
		try {
			const { id } = await mySignaling.request('produceData', {
				transportId: sendTransport.id,
				sctpStreamParameters,
				label,
				protocol,
				appData,
			});

			// Done in the server, pass the response to our transport.
			callback({ id });
		} catch (error) {
			// Something was wrong in server side.
			errback(error);
		}
	},
);

// Produce our webcam video.
const stream = await navigator.mediaDevices.getUserMedia({ video: true });
const webcamTrack = stream.getVideoTracks()[0];
const webcamProducer = await sendTransport.produce({ track: webcamTrack });

// Produce data (DataChannel).
const dataProducer = await sendTransport.produceData({
	ordered: true,
	label: 'foo',
});
```

## Authors

- Iñaki Baz Castillo [[website](https://inakibaz.me)|[github](https://github.com/ibc/)]
- José Luis Millán [[github](https://github.com/jmillan/)]

## Social

- Twitter: [@mediasoup_sfu](https://twitter.com/mediasoup_sfu)

## Sponsor

You can support mediasoup by [sponsoring][sponsor] it. Thanks!

## License

[ISC](./LICENSE)

[mediasoup-website]: https://mediasoup.org
[mediasoup-discourse]: https://mediasoup.discourse.group
[npm-shield-mediasoup-client]: https://img.shields.io/npm/v/mediasoup-client.svg
[npm-mediasoup-client]: https://npmjs.org/package/mediasoup-client
[github-actions-shield-mediasoup-client]: https://github.com/versatica/mediasoup-client/actions/workflows/mediasoup-client.yaml/badge.svg
[github-actions-mediasoup-client]: https://github.com/versatica/mediasoup-client/actions/workflows/mediasoup-client.yaml
[opencollective-shield-mediasoup]: https://img.shields.io/opencollective/all/mediasoup.svg
[opencollective-mediasoup]: https://opencollective.com/mediasoup/
[sponsor]: https://mediasoup.org/sponsor/
