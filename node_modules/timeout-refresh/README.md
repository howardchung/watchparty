# timeout-refresh

Efficiently refresh a timer

```
npm install timeout-refresh
```

Uses `timeout.refresh` in Node 10 and `require('timers')` in older versions.
In the browser a basic `clearTimeout + setTimeout` is used since no other method exists

## Usage

``` js
const timeout = require('timeout-refresh')

const to = timeout(100, function () {
  console.log('Timed out!')
})

const i = setInterval(function () {
  // refresh every 50ms
  to.refresh()
}, 50)

setTimeout(function () {
  // cancel the refresh after 500ms
  clearInterval(i)
  setTimeout(function () {
    console.log('Should have timed out now')
  }, 200)
}, 500)
```

## API

#### `to = timeout(ms, ontimeout, [context])`

Make a new refreshable timeout.

If you pass `context`, it will be set as `this` when calling `ontimeout`.

#### `to.refresh()`

Refresh the timeout.

#### `to.destroy()`

Destroy the timeout. Not needed if `ontimeout` is triggered

## License

MIT
