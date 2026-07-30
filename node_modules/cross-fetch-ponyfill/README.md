# cross-fetch-ponyfill

A fetch ponyfill which only polyfills fetch on node.

```js
import fetch from 'cross-fetch-ponyfill'

const res = await fetch(url)
const text = await res.text()
``` 