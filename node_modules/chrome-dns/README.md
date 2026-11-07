# chrome-dns [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url] [![javascript style guide][standard-image]][standard-url]

[npm-image]: https://img.shields.io/npm/v/chrome-dns.svg
[npm-url]: https://npmjs.org/package/chrome-dns
[downloads-image]: https://img.shields.io/npm/dm/chrome-dns.svg
[downloads-url]: https://npmjs.org/package/chrome-dns
[standard-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard-url]: https://standardjs.com

### Use the Node `dns` API in Chrome Apps

This module lets you use the Node.js [dns](https://nodejs.org/api/dns.html) API in [Chrome Packaged Apps](https://developer.chrome.com/apps/about_apps.html).

The chrome.dns API for Chrome Apps is not documented, but it still available. You need the "dns" permission in your manifest.

As of August 2019, it appears that the API is only available if you use Chrome Dev channel or Canary channel.

Instead of learning the quirks of Chrome's `chrome.dns` API for networking in Chrome Apps just **use the higher-level node API you're familiar with**. Then, compile your code with [browserify](https://github.com/substack/node-browserify) and you're all set!

This module is used by the Chrome App build of [webtorrent](https://github.com/feross/webtorrent), which is used in [Brave Browser](https://brave.com).

## install

```
npm install chrome-dns
```

## methods

Use node's `dns` API. Example:

```js
var dns = require('chrome-dns')

dns.lookup('feross.org', (err, address, family) => {
  if (err) {
    console.error(err)
    return
  }

  console.org(`feross.org has the IPv${family} address of ${address}`)
})
```

See nodejs.org for full API documentation: [dns](https://nodejs.org/api/dns.html)

## contribute

To run tests, use `npm test && npm run test-browser`. The tests will run TCP and
UDP servers and launch a few different Chrome Packaged Apps with browserified
client code. The tests currently require Chrome Canary.

## license

MIT. Copyright (c) [Feross Aboukhadijeh](https://feross.org)
