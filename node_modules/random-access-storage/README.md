# random-access-storage

Easily make random-access-storage instances

```
npm install random-access-storage
```

A random-access-storage instance is a common interface for a storage abstraction, that provides the following core api.

* `read(offset, size)` - Read a buffer at a custom offset.
* `write(offset, data)` - Write a buffer to a custom offset.
* `del(offset, size)` - Delete data at a custom offset.

This module exposes a base class that implements most of the plumbing and flow you'd usually want to implement when making one.

## Usage

``` js
const RandomAccessStorage = require('random-access-storage')
const fs = require('fs')

const file = fileReader('index.js')

file.read(0, 10, (err, buf) => console.log('0-10: ' + buf.toString()))
file.read(40, 15, (err, buf) => console.log('40-55: ' + buf.toString()))
file.close()

function fileReader (name) {
  let fd = 0
  return new RandomAccessStorage({
    open: function (req) {
      // called once automatically before the first read call
      fs.open(name, 'r', function (err, res) {
        if (err) return req.callback(err)
        fd = res
        req.callback(null)
      })
    },
    read: function (req) {
      const buf = Buffer.allocUnsafe(req.size)
      fs.read(fd, buf, 0, buf.length, req.offset, function (err, read) {
        if (err) return req.callback(err)
        if (read < buf.length) return req.callback(new Error('Could not read'))
        req.callback(null, buf)
      })
    },
    close: function (req) {
      if (!fd) return req.callback(null)
      fs.close(fd, err => req.callback(err))
    }
  })
}
```

## API

#### `const storage = new RandomAccessStorage([options])`

Make a new instance. Options include:

``` js
{
  createAlways: false, // always create storage on first open
  open: fn, // sets ._open
  read: fn, // sets ._read
  write: fn, // sets ._write
  del: fn, // sets ._del
  truncate: fn, // sets ._truncate
  stat: fn, // sets ._stat
  suspend: fn, // sets ._suspend
  close: fn, // sets ._close
  unlink: fn // sets ._unlink
}
```

#### `storage.readable`

True if the storage implements `._read`.

#### `storage.writable`

True if the storage implements `._write`.

#### `storage.deletable`

True if the storage implements `._del`.

#### `storage.truncatable`

True if the storage implements `._truncate`.

#### `storage.statable`

True if the storage implements `._stat`.

#### `storage.opened`

True if the storage has been fully opened.

#### `storage.closed`

True if the storage has been fully closed.

#### `storage.unlinked`

True if the storage has been fully unlinked.

#### `storage.writing`

True if the storage is currently being written to.

#### `storage.on('open')`

Emitted when the storage is fully open.

#### `storage.on('close')`

Emitted when the storage is fully closed.

#### `storage.on('unlink')`

Emitted when the storage is fully unlinked.

#### `storage.on('suspend')`

Emitted when the storage is fully suspended

#### `storage.on('unsuspend')`

Emitted when the storage comes out of suspension.

#### `storage.open(cb)`

Explicitly open the storage. If you do not call this yourself,
it will automatically called before any read/write/del/stat operation.

It is safe to call this more than once.

Triggers *one* call to `_open` if you implement that.

#### `storage._open(req)`

Implement storage open.

* `req.create` is `true` if the storage should be created.

Call `req.callback` when it is fully opened.

#### `storage.read(offset, size, callback)`

Read the specified bytes from the storage at the specified byte offset.
Calls the callback with a `(err, buffer)`.

#### `storage._read(req)`

Implement storage read.

* `req.offset` contains the byte offset you should read at.
* `req.size` contains the amount of bytes you should read.

Call `req.callback(err, buffer)` when the read is completed.

Note that this is guaranteed to run after the storage has been opened and not after it has been closed.

#### `storage.write(offset, buffer, [callback])`

Write the specified buffer to the specified byte offset. Optionally pass a callback that is called with `(err)` when the write has completed.

#### `storage._write(req)`

Implement storage write.

* `req.offset` contains the byte offset you should write at.
* `req.data` contains the buffer you should write.

Call `req.callback(err)` when the write is completed.

Note that this is guaranteed to run after the storage has been opened and not after it has been closed.

#### `storage.del(offset, size, [callback])`

Delete the specified amount of bytes at the specified offset. Optionally pass a callback that is called with `(err)` when the delete has completed.

#### `storage._del(req)`

Implement storage delete.

* `req.offset` contains the byte offset to delete at.
* `req.size` contains the amount of bytes to delete.

Call `req.callback(err)` when the delete has completed.

Note that this is guaranteed to run after the storage has been opened and not after it has been closed.

#### `storage.truncate(offset, [callback])`

Truncate the storage at the specified offset. Optionally pass a callback that is called with `(err)` when the truncate has completed.

#### `storage._truncate(req)`

Implement storage truncate. Defaults to `storage._del(req)`.

* `req.offset` contains the byte offset to truncate at.

Call `req.callback(err)` when the truncate has completed.

Note that this is guaranteed to run after the storage has been opened and not after it has been closed.

#### `storage.stat(callback)`

Stat the storage. Should return an object with useful information about the underlying storage, including:

```
{
  size: number // how many bytes of data is stored?
}
```

#### `storage._stat(req)`

Implement storage stat.

Call `req.callback(err, statObject)` when the stat has completed.

Note that this is guaranteed to run after the storage has been opened and not after it has been closed.

#### `storage.suspend([callback])`

Suspend (temporarily close) the storage instance.

#### `storage._suspend(req)`

Implement storage suspend. Defaults to calling `_close`.

Optionally implement this to add a way for your storage instance to temporarily free resources.

Call `req.callback(err)` when the storage has been fully suspended.

#### `storage.close([callback])`

Close the storage instance.

#### `storage._close(req)`

Implement storage close.

Call `req.callback(err)` when the storage is fully closed.

Note this is guaranteed to run after all pending read/write/stat/del operations has finished and no methods will run after.

#### `storage.unlink([callback])`

Unlink the storage instance, removing all underlying data.

#### `storage._unlink(req)`

Implement storage unlink.

Call `req.callback(err)` when the storage has been fully unlinked.

Note this is guaranteed to run after `.close()` has been called and no methods will be run after.

## License

MIT
