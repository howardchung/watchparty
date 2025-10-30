# cpus [![travis][travis-image]][travis-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url] [![javascript style guide][standard-image]][standard-url]

[travis-image]: https://img.shields.io/travis/feross/cpus/master.svg
[travis-url]: https://travis-ci.org/feross/cpus
[npm-image]: https://img.shields.io/npm/v/cpus.svg
[npm-url]: https://npmjs.org/package/cpus
[downloads-image]: https://img.shields.io/npm/dm/cpus.svg
[downloads-url]: https://npmjs.org/package/cpus
[standard-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard-url]: https://standardjs.com

#### `os.cpus()` for node and the browser

[![saucelabs][saucelabs-image]][saucelabs-url]

[saucelabs-image]: https://saucelabs.com/browser-matrix/cpus.svg
[saucelabs-url]: https://saucelabs.com/u/cpus

Returns an array of objects containing information about each CPU/core installed:
model, speed (in MHz), and times (an object containing the number of milliseconds the
CPU/core spent in: user, nice, sys, idle, and irq).

See the [node.js documentation](https://nodejs.org/api/os.html#os_os_cpus) for
`os.cpus()`.

In the browser, the `navigator.hardwareConcurrency` API is used, when available.

## install

```bash
npm install cpus
```

## usage

```js
var cpus = require('cpus')
console.log(cpus().length) // 4
```

## license

MIT. Copyright (C) [Feross Aboukhadijeh](http://feross.org).
