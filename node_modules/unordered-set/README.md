# unordered-set

A couple of functions that make it easy to maintain an unordered set as an array in an efficient way

```
npm install unordered-set
```

[![build status](https://travis-ci.org/mafintosh/unordered-set.svg?branch=master)](https://travis-ci.org/mafintosh/unordered-set)

## Usage

``` js
var set = require('unordered-set')
var list = []

var a = {hello: 'world'}
var b = {hej: 'verden'}

set.add(list, a)
set.add(list, b)

console.log(list) // prints a and b

set.remove(list, a)

console.log(list) // prints b
```

Items are removed and added using the same technique as in [unordered-array-remove](https://github.com/mafintosh/unordered-array-remove)
making the removal/additions run in O(1).

## API

#### `set.add(list, item)`

Add an item. Notes that this sets the property `._index` to a number. If you control the items you insert and this is performance critical it might be benefitial to set `item._index = 0` in the item constructor as v8 tends to like that.

#### `set.remove(list, item)`

Remove an item from the set. Might change the order of the list as well.

#### `bool = set.has(list, item)`

Returns `true` if the item is in the list and `false` otherwise

#### `set.swap(list, a, b)`

Swap the positions of two elements in the set

## License

MIT
