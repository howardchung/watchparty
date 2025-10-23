# common-media-library
A common library for media playback in JavaScript

Looking at open source players like [hls.js](https://github.com/video-dev/hls.js/), [dash.js](https://github.com/Dash-Industry-Forum/dash.js/), and [shaka-player](https://github.com/shaka-project/shaka-player) there are common pieces of functionality that have been implemented independently across the libraries. This is particularly true when looking at standards based features, like ID3 parsing, 608 parsing and CMCD. Since the functionality is shared in spirit but not implementation, they can fall out of sync where certain bugs are fixed in one player but not the others. The goal of this library is to create a single place where these utilities can be maintained and distributed.

## Project structure
This project is a mono-repo with the following workspaces: `lib`, `docs`. The `lib` package contains the compiled code for the library which is published to npm. The `docs` package contains the documentation for the library and is published to GitHub pages.

## Installation
```bash
npm install @svta/common-media-library
```

## Usage
Too ensure the smallest bundle sizes possible, it is best practice to import all members and type definitions
individually from the library.
```typescript
import { appendCmcdQuery } from '@svta/common-media-library/cmcd/appendCmcdQuery';
import { CmcdObjectType } from '@svta/common-media-library/cmcd/CmcdObjectType';

const cmcd = {
	sid: '4f2867f2-b0fd-4db7-a3e0-cea7dff44cfb',
	cid: 'cc002fc3-d9e1-418d-9a5f-3d0eac601882',
	d: 324.69,
	ot: CmcdObjectType.MANIFEST,
	['com.example-hello']: 'world',
};

const cmcdUrl = appendCmcdQuery('https://example.com/playlist.m3u8', cmcd);
console.log(cmcdUrl);
// https://example.com/playlist.m3u8?CMCD=cid%3D%22cc002fc3-d9e1-418d-9a5f-3d0eac601882%22%2Ccom.example-hello%3D%22world%22%2Cd%3D325%2Cot%3Dm%2Csid%3D%224f2867f2-b0fd-4db7-a3e0-cea7dff44cfb%22
```

If bundle size isn't a concern, all members and type definitions can also be imported from the root of the library, or from the feature namespace.
```typescript
import { appendCmcdQuery, CmcdObjectType } from '@svta/common-media-library';
```
```typescript
import { appendCmcdQuery, CmcdObjectType } from '@svta/common-media-library/cmcd';
```

## Documentation
API docs can be found [here](https://streaming-video-technology-alliance.github.io/common-media-library/).

## Thanks
This project builds upon the work of the open source community. Special thanks to the maintainers of [hls.js](https://github.com/video-dev/hls.js/), [dash.js](https://github.com/dash-industry-forum/dash.js/), [shaka-player](https://github.com/shaka-project/shaka-player), and [structured-field-values](https://github.com/Jxck/structured-field-values) as well as organizations like the [Streaming Video Technology Alliance](https://www.svta.org/), [DASH Industry Forum](https://dashif.org/), and the [CTA WAVE Project](https://www.cta.tech/Resources/Standards/WAVE-Project).
