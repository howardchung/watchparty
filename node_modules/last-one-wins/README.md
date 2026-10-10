# last-one-wins

Make sure the last sync call to an async function is executed after all previous ones have finished

```
npm install last-one-wins
```

[![build status](http://img.shields.io/travis/mafintosh/last-one-wins.svg?style=flat)](http://travis-ci.org/mafintosh/last-one-wins)

## Usage

``` js
var low = require('last-one-wins')

var pick = low(function (num, cb) {
  setTimeout(function () {
    console.log('picked', num)
    cb()
  }, Math.floor(Math.random() * 100))
})

pick(1)
pick(2)
pick(3)
pick(4)
pick(5) // this one will always win since its called the last
```

Calling the above will print out

```
picked 1
picked 5
```

## API

#### `var fn = low(asyncWorker)`

Wrap a async function to make sure that the last sync call to that
function is executed after any previous calls. Note that not all calls
are executed - only the last one is guaranteed to be executed.

`fn` and `asyncWorker` should have the signature `(value, cb)`

## Use with leveldb

This module is useful if you want sync a value to a leveldb and want to
make sure the latest version of that value is the one written. For example

``` js
var update = low(function (val, cb) {
  db.put('my-key', val, cb)
})

update('a')
update('b')
update('c')
```

Is guaranteed to always write `c` to the key `my-key`.

## License

MIT
