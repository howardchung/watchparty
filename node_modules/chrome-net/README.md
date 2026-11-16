# chrome-net [![travis][travis-image]][travis-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url] [![javascript style guide][standard-image]][standard-url]

[travis-image]: https://img.shields.io/travis/feross/chrome-net/master.svg
[travis-url]: https://travis-ci.org/feross/chrome-net
[npm-image]: https://img.shields.io/npm/v/chrome-net.svg
[npm-url]: https://npmjs.org/package/chrome-net
[downloads-image]: https://img.shields.io/npm/dm/chrome-net.svg
[downloads-url]: https://npmjs.org/package/chrome-net
[standard-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard-url]: https://standardjs.com

### Use the Node `net` API in Chrome Apps

This module lets you use the Node.js [net](https://nodejs.org/api/net.html) (TCP) API in [Chrome Packaged Apps](https://developer.chrome.com/apps/about_apps).

Instead of learning the quirks of Chrome's `chrome.sockets` API for networking in Chrome Apps just **use the higher-level node API you're familiar with**. Then, compile your code with [browserify](https://github.com/substack/node-browserify) and you're all set!

## install

```
npm install chrome-net
```

## methods

Use node's `net` API, including all parameter list shorthands and variations.

Example TCP client:

```js
var net = require('chrome-net')

var client = net.createConnection({
  port: 1337,
  host: '127.0.0.1'
})

client.write('beep')

client.on('data', function (data) {
  console.log(data)
})

// .pipe() streaming API works too!

```

Example TCP server:

```js
var net = require('chrome-net')

var server = net.createServer()

server.on('listening', function () {
  console.log('listening')
})

server.on('connection', function (sock) {
  console.log('Connection from ' + sock.remoteAddress + ':' + sock.remotePort)
  sock.on('data', function (data) {
    console.log(data)
  })
})

server.listen(1337)

```

See nodejs.org for full API documentation: [net](https://nodejs.org/api/net.html)

## contribute

To run tests, use `npm test`. The tests will run TCP and UDP servers and launch a few different Chrome Packaged Apps with browserified client code. The tests currently require Chrome on Windows or Chrome Canary on Mac. If you're on Linux, feel free to send a pull request to fix this limitation.

## license

MIT. Copyright (c) [Feross Aboukhadijeh](http://feross.org), John Hiesey & Jan Schär.
