# record-cache

Cache optimised for record like things like `host:port` or `domain.names`.

```
npm install record-cache
```

[![build status](https://travis-ci.org/mafintosh/record-cache.svg?branch=master)](https://travis-ci.org/mafintosh/record-cache)

## Usage

``` js
var recordCache = require('record-cache')

var cache = recordCache({
  maxSize: 1000 // store ~1000 values at max
  maxAge: 1000 // gc values older than ~1000ms
})

cache.add('hello', '127.0.0.1')
cache.add('hello', '127.0.1.1')
cache.add('hello', '127.0.0.2')

console.log(cache.get('hello', 2)) // prints two of the above

// wait 2s
setTimeout(function () {
  console.log(cache.get('hello', 2)) // prints []
}, 2000)
```

## API

#### `var cache = recordCache([options])`

Create a new record cache.

Options include:

``` js
{
  maxSize: 1000, // approximate max size
  maxAge: 1000, // approximate max age in ms
  onStale: false // function called when evicting stale records
}
```

In the worst case the cache will be `2 * maxSize` large, and
if `maxAge` is used old values are gc'ed every `0.66 * maxAge - 1.33 * maxAge` with an optional callback to the `onStale` function upon record eviction.

This is to greatly simplify the data structures and also gives us a pretty decent
perf boost compared to other cache modules out there.

#### `cache.add(recordName, value)`

Push a new value to the record set. `value` should be serialisable.

#### `cache.remove(recordName, value)`

Remove a value from the record set. `value` should be a previously added value.

#### `var list = cache.get(recordName, [maxCount])`

Get a list of values from the record set. The list will be randomised.
Specify `maxCount` to only get this many values at max.

#### `cache.size`

Get the actual size of the cache.

#### `cache.clear()`

Clear all values from the cache.

#### `cache.destroy()`

Completely destroy the cache. Needed if you are using the `maxAge` option to
cancel the gc timer.

## License

MIT
