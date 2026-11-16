# http-node
This module is a standalone package of [http](https://nodejs.org/api/http.html) from Node.js v6.3.0.
Unlike [http-browserify](https://github.com/substack/http-browserify), this is not a shim but the original code of Node.js, so it requires the `net` module.
This is useful for having the Node.js core APIs on JavaScript platforms other than Node.js, where TCP sockets are available (which can be wrapped in a `net` module).
One example of this is [Chrome Apps](https://developer.chrome.com/apps/sockets_tcp) with [chrome-net](https://github.com/feross/chrome-net).

## install / usage with browserify

```bash
npm install http-node
```

To use it with browserify, you have to use the JS API of browserify;
the command line API does not support changing builtins.

Example:

```js
const browserify = require('browserify');

const builtins = require('browserify/lib/builtins.js');
var customBuiltins = Object.assign({}, builtins);
customBuiltins.http = require.resolve('http-node');

var b = browserify({builtins: customBuiltins});

b.add(...
```

## differences to original Node.js code

- `require` calls of `_http_*` modules prefixed with `./`
- `require('internal/util').deprecate` replaced by `require('util').deprecate`
- uses [http-parser-js](https://github.com/creationix/http-parser-js)
- commented out calls to `DTRACE_HTTP_*`, `LTTNG_HTTP_*` and `COUNTER_HTTP_*`
- does not presume that sockets have a `_handle`

## credit

The code is taken from the [Node.js](https://nodejs.org) project:

Copyright Node.js contributors. All rights reserved.

## license

MIT
