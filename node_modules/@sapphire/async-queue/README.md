<div align="center">

![Sapphire Logo](https://raw.githubusercontent.com/sapphiredev/assets/main/banners/SapphireCommunity.png)

# @sapphire/async-queue

**Sequential asynchronous lock-based queue for promises.**

[![GitHub](https://img.shields.io/github/license/sapphiredev/utilities)](https://github.com/sapphiredev/utilities/blob/main/LICENSE.md)
[![npm bundle size](https://img.shields.io/bundlephobia/min/@sapphire/async-queue?logo=webpack&style=flat-square)](https://bundlephobia.com/result?p=@sapphire/async-queue)
[![npm](https://img.shields.io/npm/v/@sapphire/async-queue?color=crimson&logo=npm&style=flat-square)](https://www.npmjs.com/package/@sapphire/async-queue)

</div>

**Table of Contents**

-   [Features](#features)
-   [Installation](#installation)
-   [Usage](#usage)
-   [Buy us some doughnuts](#buy-us-some-doughnuts)
-   [Contributors](#contributors)

## Features

-   Written in TypeScript
-   Bundled with esbuild so it can be used in NodeJS and browsers
-   Offers CommonJS, ESM, and UMD bundles
-   Fully tested

## Installation

You can use the following command to install this package, or replace `npm install` with your package manager of choice.

```sh
npm install @sapphire/async-queue
```

## Usage

**Note**: While this section uses `require`, the imports match 1:1 with ESM imports. For example `const { AsyncQueue } = require('@sapphire/async-queue')` equals `import { AsyncQueue } from '@sapphire/async-queue'`.

```typescript
// Require the AsyncQueue class
const { AsyncQueue } = require('@sapphire/async-queue');

const queue = new AsyncQueue();

async function request(url, options) {
	// Wait and lock the queue
	await queue.wait();

	try {
		// Perform the operation sequentially
		return await fetch(url, options);
	} finally {
		// Unlock the next promise in the queue
		queue.shift();
	}
}

request(someUrl1, someOptions1);
// Will call fetch() immediately

request(someUrl2, someOptions2);
// Will call fetch() after the first finished

request(someUrl3, someOptions3);
// Will call fetch() after the second finished
```

---

## Buy us some doughnuts

Sapphire Community is and always will be open source, even if we don't get donations. That being said, we know there are amazing people who may still want to donate just to show their appreciation. Thank you very much in advance!

We accept donations through Open Collective, Ko-fi, PayPal, Patreon, and GitHub Sponsorships. You can use the buttons below to donate through your method of choice.

|   Donate With   |                       Address                       |
| :-------------: | :-------------------------------------------------: |
| Open Collective | [Click Here](https://sapphirejs.dev/opencollective) |
|      Ko-fi      |      [Click Here](https://sapphirejs.dev/kofi)      |
|     Patreon     |    [Click Here](https://sapphirejs.dev/patreon)     |
|     PayPal      |     [Click Here](https://sapphirejs.dev/paypal)     |

## Contributors

Please make sure to read the [Contributing Guide][contributing] before making a pull request.

Thank you to all the people who already contributed to Sapphire!

<a href="https://github.com/sapphiredev/utilities/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=sapphiredev/utilities" />
</a>

[contributing]: https://github.com/sapphiredev/.github/blob/main/.github/CONTRIBUTING.md
