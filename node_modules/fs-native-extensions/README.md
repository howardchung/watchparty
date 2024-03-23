# fs-native-extensions

Native file system extensions for advanced file operations

```
npm install fs-native-extensions
```

## Usage

Write to a file using an exclusive lock:

``` js
const { open } = require('fs/promises')
const { waitForLock, unlock } = require('fs-native-extensions')

const file = await open('file.txt', 'a+')

await waitForLock(file.fd)

try {
  await file.write('hello world')
} finally {
  unlock(file.fd)
}
```

## API

#### `const granted = tryLock(fd[, offset[, length]][, options])`

Request a lock on a file, returning `true` if the lock was granted or `false` if another file descriptor currently holds the lock.

To lock only a portion of the file, `offset` and `length` may be passed. A `length` of `0` will request a lock from `offset` to the end of the file.

On macOS, BSD locks are used and so only locks on the whole file are supported.

Note that the lock is only advisory and there is nothing stopping another process from accessing the file by simply ignoring the lock.

Options include:

```js
{
  // If `true`, request a shared lock, i.e. a read lock, on the file. By
  // default, an exclusive lock, i.e. a write lock, is requested.
  // Be aware that an exclusive lock can only be granted to files that are
  // writable!
  shared: false
}
```

#### `await waitForLock(fd[, offset[, length]][, options])`

Request a lock on a file, resolving when the lock is granted. If another file descriptor holds the lock, the lock will not be granted until the other file descriptor releases the lock.

Options are the same as `tryLock()`.

#### `const granted = tryDowngradeLock(fd[, offset[, length]])`

Request a downgrade from an already held exclusive lock to a shared lock, returning `true` if the lock was granted or `false` if another process currently holds the lock. If `false` is returned, the exclusive lock is lost and must be requested again.

On Windows, the downgrade will happen atomically and be immediately granted.

#### `await waitForDowngradeLock(fd[, offset[, length]])`

Request a downgrade from an already held exclusive lock to a shared lock.

On Windows, the downgrade will happen atomically and be immediately granted.

#### `const granted = tryUpgradeLock(fd[, offset[, length]])`

Request an upgrade from an already held shared lock to an exclusive lock, returning `true` if the lock was granted or `false` if another process currently holds the lock. If `false` is returned, the shared lock is lost and must be requested again.

#### `await waitForUpgradeLock(fd[, offset[, length]])`

Request an upgrade from an already held shared lock to an exclusive lock.

#### `unlock(fd[, offset[, length]])`

Release a lock on a file.

#### `await trim(fd, offset, length)`

Create a hole in a file at `offset` for `length` bytes. On file systems that support sparse files, file blocks wholly covered by a hole will take up no physical space.

On Windows, the file must first be marked sparse using `sparse(fd)`. Otherwise, zeros will be explicitly written to the hole.

#### `await sparse(fd)`

Mark a file as sparse. On Windows, this operation is required before holes can be created in the file. On other systems, this operation has no effect.

#### `await swap(from, to)`

Swap the paths `from` and `to`, making `from` assume the identity of `to` and `to` assume the identity of `from`.

On Windows, the swap is performed by first moving `to` to a temporary path, then moving `from` to `to`, and finally moving the temporary path to `from`.

On macOS and Linux, the swap is performed atomically.

## License

Apache-2.0
