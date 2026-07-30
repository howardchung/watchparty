# bare-addon-resolve

Low-level addon resolution algorithm for Bare. The algorithm is implemented as a generator function that yields either package manifests to be read or resolution candidates to be tested by the caller. As a convenience, the main export is a synchronous and asynchronous iterable that relies on package manifests being read by a callback. For asynchronous iteration, the callback may return promises which will be awaited before being passed to the generator.

```
npm i bare-addon-resolve
```

## Usage

For synchronous resolution:

```js
const resolve = require('bare-addon-resolve')

function readPackage(url) {
  // Read and parse `url` if it exists, otherwise `null`
}

for (const resolution of resolve(
  './addon',
  new URL('file:///directory/'),
  readPackage
)) {
  console.log(resolution)
}
```

For asynchronous resolution:

```js
const resolve = require('bare-addon-resolve')

async function readPackage(url) {
  // Read and parse `url` if it exists, otherwise `null`
}

for await (const resolution of resolve(
  './addon',
  new URL('file:///directory/'),
  readPackage
)) {
  console.log(resolution)
}
```

## API

#### `const resolver = resolve(specifier, parentURL[, options][, readPackage])`

Resolve `specifier` relative to `parentURL`, which must be a WHATWG `URL` instance. `readPackage` is called with a `URL` instance for every package manifest to be read and must either return the parsed JSON package manifest, if it exists, or `null`. If `readPackage` returns a promise, synchronous iteration is not supported.

Options include:

```js
options = {
  // A list of builtin addon specifiers. If matched, the protocol of the
  // resolved URL will be `builtinProtocol`.
  builtins: [],
  // The protocol to use for resolved builtin addon specifiers.
  builtinProtocol: 'builtin:',
  // Whether or not addons linked ahead-of-time should be resolved.
  linked: true,
  // The protocol to use for addons linked ahead-of-time.
  linkedProtocol: 'linked:',
  // The supported import conditions. "default" is always recognized.
  conditions: [],
  // An array reference which will contain the matched conditions when yielding
  // resolutions.
  matchedConditions: [],
  // The `<platform>-<arch>` combinations to look for when resolving dynamic
  // addons. If empty, only builtin specifiers can be resolved. In Bare,
  // pass `[Bare.Addon.host]`.
  hosts: [],
  // The file extensions to look for when resolving dynamic addons.
  extensions: [],
  // A map of preresolved imports with keys being serialized directory URLs and
  // values being "imports" maps.
  resolutions
}
```

#### `for (const resolution of resolver)`

Synchronously iterate the addon resolution candidates. The resolved addon is the first candidate that exists as a file on the file system.

#### `for await (const resolution of resolver)`

Asynchronously iterate the addon resolution candidates. If `readPackage` returns promises, these will be awaited. The same comments as `for (const resolution of resolver)` apply.

### Algorithm

The following generator functions implement the resolution algorithm. The yielded values have the following shape:

**Package manifest**

```js
next.value = {
  package: URL
}
```

If the package manifest identified by `next.value.package` exists, `generator.next()` must be passed the parsed JSON value of the manifest. If it does not exist, pass `null` instead.

**Resolution candidate**

```js
next.value = {
  resolution: URL
}
```

If the addon identified by `next.value.resolution` exists, `generator.next()` may be passed `true` to signal that the resolution for the current set of conditions has been identified. If it does not exist, pass `false` instead.

To drive the generator functions, a loop like the following can be used:

```js
const generator = resolve.addon(specifier, parentURL)

let next = generator.next()

while (next.done !== true) {
  const value = next.value

  if (value.package) {
    // Read and parse `value.package` if it exists, otherwise `null`
    let info

    next = generator.next(info)
  } else {
    const resolution = value.resolution

    // `true` if `resolution` was the correct candidate, otherwise `false`
    let resolved

    next = generator.next(resolved)
  }
}
```

Options are the same as `resolve()` for all functions.

> [!WARNING]
> These functions are currently subject to change between minor releases. If using them directly, make sure to specify a tilde range (`~1.2.3`) when declaring the module dependency.

#### `const generator = resolve.addon(specifier, parentURL[, options])`

#### `const generator = resolve.url(url, parentURL[, options])`

#### `const generator = resolve.package(packageSpecifier, packageVersion, parentURL[, options])`

#### `const generator = resolve.packageSelf(packageName, packageSubpath, packageVersion, parentURL[, options])`

#### `const generator = resolve.preresolved(directoryURL, resolutions[, options])`

#### `const generator = resolve.file(filename, parentURL[, options])`

#### `const generator = resolve.directory(dirname, version, parentURL[, options])`

#### `const generator = resolve.linked(name, version[, options])`

## License

Apache-2.0
