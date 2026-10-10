# Deprecated

`DOMException` have been implemented for quite some time now. (require Node 18+)

Use your platform's native DOMException instead
Update the `engines` field in `package.json` to Node.js 18 or above: "node": ">=18".
```json
{
  "engine": {
    "node": ">=18"
  }
}
```


# DOMException
An implementation of the DOMException class from NodeJS

NodeJS has DOMException built in (from v10.5), but it is not easily available... you can't require or import it from somewhere (unless you use node v17 - at which point it got added to global scope)

This package exposes the [`DOMException`](https://developer.mozilla.org/en-US/docs/Web/API/DOMException) class that comes from NodeJS itself. (including all of the legacy codes)

## Install

```bash
# makes use of atob | require NodeJS 16+
npm install node-domexception

# makes use of worker_thread | require NodeJS 10+
npm install node-domexception@1.x
```

v2.x now depend on global `atob` to obtain `DOMException` from a error.
which also binds it to NodeJS v16+ (at which point `atob` become globally available).
This NodeJS dependency/export free solution is better for cross env platform solutions.
it no longer have any cjs or esm exports and it's attached to globalThis.DOMException only if needed.

v1.x used a older [tech](https://github.com/jimmywarting/node-domexception/blob/c2024740c6502f80ad2f62c8ad58d6cec61b05f3/index.js) which depended on `node:worker_threads` to obtain
`DOMException` which works all the way down to NodeJS v10.5+

If you are not supporting older NodeJS versions (before v17) then you won't need this package at all.
My personal recommendation is that you update to a newer NodeJS version.
This pkg will likely be deprecated once v18 becomes LTS

```js
import 'node-domexception'

// You could also do conditional import.
globalThis.DOMException || await import('node-domexception')

/********************************************************************/

import { MessageChannel } from 'worker_threads'

try {
  const port = new MessageChannel().port1
  const ab = new ArrayBuffer()
  port.postMessage(ab, [ab, ab])
} catch (err) {
  console.assert(err.name === 'DataCloneError')
  console.assert(err.code === 25)
  console.assert(err.constructor === DOMException)
}

const e1 = new DOMException('Something went wrong', 'BadThingsError')
console.assert(e1.name === 'BadThingsError')
console.assert(e1.code === 0)

const e2 = new DOMException('Another exciting error message', 'NoModificationAllowedError')
console.assert(e2.name === 'NoModificationAllowedError')
console.assert(e2.code === 7)

console.assert(DOMException.INUSE_ATTRIBUTE_ERR === 10)
```

# Background

The only possible way is to use some web-ish tools that have been introduced into NodeJS that throws a DOMException and catch the constructor. This is exactly what this package does for you and exposes it.<br>
This way you will have the same class that NodeJS has and you can check if the error is a instance of DOMException.<br>
The instanceof check would not have worked with a custom class such as the DOMException provided by domenic which also is much larger in size since it has to re-construct the whole class from the ground up.

The DOMException is used in many places such as the Fetch API, File & Blobs, PostMessaging and more. <br>
Why they decided to call it **DOM**, I don't know

Please consider sponsoring if you find this helpful
