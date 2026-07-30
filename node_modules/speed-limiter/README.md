# speed-limiter

[![NPM Version](https://img.shields.io/npm/v/speed-limiter.svg)](https://www.npmjs.com/package/speed-limiter)
[![Build Status](https://img.shields.io/github/workflow/status/alxhotel/speed-limiter/ci/main)](https://github.com/alxhotel/speed-limiter/actions)

Throttle the speed of streams in NodeJS

## Installation

```sh
npm install speed-limiter
```

## Usage

```js
const { ThrottleGroup } = require('speed-limiter')

const rate = 200 * 1000 // 200 KB/s
const throttleGroup = new ThrottleGroup({ rate })

// Create a new throttle
const throttle = throttleGroup.throttle()

// Use it throttle as any other Transform
let dataReceived = ''
const dataToSend = 'hello'
throttle.on('data', (data) => {
  dataReceived += data.toString()
})
throttle.on('end', () => {
  console.log('Ended')
})
throttle.write(dataToSend)
throttle.end()
```

## API

#### `const throttleGroup = new ThrottleGroup(opts)`

Initialize the throttle group.

The param `opts` can have these parameters:

```js
{
  enabled: Boolean,  // Enables/disables the throttling (defaul=true)
  rate: Number,      // Sets the max. rate (in bytes/sec)
  chunksize: Number, // Sets the chunk size used (deault=rate/10)
}
```

Note: the `rate` parameter is required

#### `throttleGroup.getEnabled()`

Returns a `boolean`.

If true, the throttling is enabled for the whole `throttleGroup`, otherwise not.

However, if a specific `throttle` in the group has the throttling disabled, then only
that throttle will block the data.

#### `throttleGroup.getRate()`

Returns a `number`.

Gets the bytes/sec rate at which the throttle group rate is set.

#### `throttleGroup.getChunksize()`

Returns a `number`.

Gets the chunk size used in the rate limiter.

#### `throttleGroup.setEnabled(enabled)` 

Used to disable or enabling the throttling of all the throttles of `throttleGroup`.

#### `throttleGroup.setRate(rate)`

Sets the maxium rate (in bytes/sec) at which the whole group of throttles can pass data.

#### `throttleGroup.setChunksize(chunksize)`

Sets the chunk size used in the rate limiter.

#### `const throttle = new Throttle(opts)`

Initialize the throttle instance.

The param `opts` can have these parameters:

```js
{
  enabled: Boolean,     // Enables/disables the throttling for that throttle (default=true)
  rate: Number,         // Sets the max. rate (in bytes/sec)
  chunksize: Number,    // Sets the chunk size used (default=rate/10)
  group: ThrottleGroup, // Sets the throttle group for that throttle (default=null)
}
```

If the `group` parameter is null, then a new `ThrottleGroup` will be created.

Note: the `rate` parameter is required

#### `throttle.getEnabled()`

Returns a `boolean`.

If true, the throttling is enabled for `throttle`, otherwise not.

#### `throttle.getGroup()`

Returns the `ThrottleGroup` of `throttle`.

#### `throttle.setEnabled(enabled)`

Used to disable or enabling the throttling of `throttle`.

## License

MIT. Copyright (c) [Alex](https://github.com/alxhotel)
