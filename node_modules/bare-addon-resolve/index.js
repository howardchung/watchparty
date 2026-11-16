const resolve = require('bare-module-resolve')
const { Version } = require('bare-semver')
const errors = require('./lib/errors')

module.exports = exports = function resolve(
  specifier,
  parentURL,
  opts,
  readPackage
) {
  if (typeof opts === 'function') {
    readPackage = opts
    opts = {}
  } else if (typeof readPackage !== 'function') {
    readPackage = defaultReadPackage
  }

  return {
    *[Symbol.iterator]() {
      const generator = exports.addon(specifier, parentURL, opts)

      let next = generator.next()

      while (next.done !== true) {
        const value = next.value

        if (value.package) {
          next = generator.next(readPackage(value.package))
        } else {
          next = generator.next(yield value.resolution)
        }
      }

      return next.value
    },

    async *[Symbol.asyncIterator]() {
      const generator = exports.addon(specifier, parentURL, opts)

      let next = generator.next()

      while (next.done !== true) {
        const value = next.value

        if (value.package) {
          next = generator.next(await readPackage(value.package))
        } else {
          next = generator.next(yield value.resolution)
        }
      }

      return next.value
    }
  }
}

function defaultReadPackage() {
  return null
}

const { UNRESOLVED, YIELDED, RESOLVED } = resolve.constants

exports.constants = {
  UNRESOLVED,
  YIELDED,
  RESOLVED
}

exports.addon = function* (specifier, parentURL, opts = {}) {
  const { resolutions = null } = opts

  if (exports.startsWithWindowsDriveLetter(specifier)) {
    specifier = '/' + specifier
  }

  let status

  if (resolutions) {
    status = yield* resolve.preresolved(specifier, resolutions, parentURL, opts)

    if (status) return status
  }

  status = yield* exports.url(specifier, parentURL, opts)

  if (status) return status

  let version = null

  const i = specifier.lastIndexOf('@')

  if (i > 0) {
    version = specifier.substring(i + 1)

    try {
      Version.parse(version)

      specifier = specifier.substring(0, i)
    } catch {
      version = null
    }
  }

  if (
    specifier === '.' ||
    specifier === '..' ||
    specifier[0] === '/' ||
    specifier[0] === '\\' ||
    specifier.startsWith('./') ||
    specifier.startsWith('.\\') ||
    specifier.startsWith('../') ||
    specifier.startsWith('..\\')
  ) {
    return yield* exports.directory(specifier, version, parentURL, opts)
  }

  return yield* exports.package(specifier, version, parentURL, opts)
}

exports.url = function* (url, parentURL, opts = {}) {
  let resolution
  try {
    resolution = new URL(url)
  } catch {
    return UNRESOLVED
  }

  const resolved = yield { resolution }

  return resolved ? RESOLVED : YIELDED
}

exports.package = function* (
  packageSpecifier,
  packageVersion,
  parentURL,
  opts = {}
) {
  if (packageSpecifier === '') {
    throw errors.INVALID_ADDON_SPECIFIER(
      `Addon specifier '${packageSpecifier}' is not a valid package name`
    )
  }

  let packageName

  if (packageSpecifier[0] !== '@') {
    packageName = packageSpecifier.split('/', 1).join()
  } else {
    if (!packageSpecifier.includes('/')) {
      throw errors.INVALID_ADDON_SPECIFIER(
        `Addon specifier '${packageSpecifier}' is not a valid package name`
      )
    }

    packageName = packageSpecifier.split('/', 2).join('/')
  }

  if (
    packageName[0] === '.' ||
    packageName.includes('\\') ||
    packageName.includes('%')
  ) {
    throw errors.INVALID_ADDON_SPECIFIER(
      `Addon specifier '${packageSpecifier}' is not a valid package name`
    )
  }

  const packageSubpath = '.' + packageSpecifier.substring(packageName.length)

  const status = yield* exports.packageSelf(
    packageName,
    packageSubpath,
    packageVersion,
    parentURL,
    opts
  )

  if (status) return status

  parentURL = new URL(parentURL.href)

  do {
    const packageURL = new URL('node_modules/' + packageName + '/', parentURL)

    parentURL.pathname = parentURL.pathname.substring(
      0,
      parentURL.pathname.lastIndexOf('/')
    )

    const info = yield { package: new URL('package.json', packageURL) }

    if (info) {
      return yield* exports.directory(
        packageSubpath,
        packageVersion,
        packageURL,
        opts
      )
    }
  } while (parentURL.pathname !== '' && parentURL.pathname !== '/')

  return UNRESOLVED
}

exports.packageSelf = function* (
  packageName,
  packageSubpath,
  packageVersion,
  parentURL,
  opts = {}
) {
  for (const packageURL of resolve.lookupPackageScope(parentURL, opts)) {
    const info = yield { package: packageURL }

    if (info) {
      if (info.name === packageName) {
        return yield* exports.directory(
          packageSubpath,
          packageVersion,
          packageURL,
          opts
        )
      }

      break
    }
  }

  return UNRESOLVED
}

exports.lookupPrebuildsScope = function* lookupPrebuildsScope(url, opts = {}) {
  const { resolutions = null } = opts

  if (resolutions) {
    for (const { resolution } of resolve.preresolved(
      '#prebuilds',
      resolutions,
      url,
      opts
    )) {
      if (resolution) return yield resolution
    }
  }

  const scopeURL = new URL(url.href)

  do {
    yield new URL('prebuilds/', scopeURL)

    scopeURL.pathname = scopeURL.pathname.substring(
      0,
      scopeURL.pathname.lastIndexOf('/')
    )

    if (
      scopeURL.pathname.length === 3 &&
      exports.isWindowsDriveLetter(scopeURL.pathname.substring(1))
    ) {
      break
    }
  } while (scopeURL.pathname !== '' && scopeURL.pathname !== '/')
}

exports.file = function* (filename, parentURL, opts = {}) {
  if (parentURL.protocol === 'file:' && /%2f|%5c/i.test(filename)) {
    throw errors.INVALID_ADDON_SPECIFIER(
      `Addon specifier '${filename}' is invalid`
    )
  }

  const { extensions = [] } = opts

  let status = UNRESOLVED

  for (const ext of extensions) {
    if (yield { resolution: new URL(filename + ext, parentURL) }) {
      return RESOLVED
    }

    status = YIELDED
  }

  return status
}

exports.directory = function* (dirname, version, parentURL, opts = {}) {
  const {
    resolutions = null,
    host = null, // Shorthand for single host resolution
    hosts = host !== null ? [host] : [],
    builtins = [],
    matchedConditions = []
  } = opts

  let directoryURL

  if (
    dirname[dirname.length - 1] === '/' ||
    dirname[dirname.length - 1] === '\\'
  ) {
    directoryURL = new URL(dirname, parentURL)
  } else {
    directoryURL = new URL(dirname + '/', parentURL)
  }

  // Internal preresolution path, do not depend on this! It will be removed without
  // warning.
  if (resolutions) {
    const status = yield* resolve.preresolved(
      'bare:addon',
      resolutions,
      directoryURL,
      opts
    )

    if (status) return status
  }

  const unversioned = version === null

  let name = null

  const info = yield { package: new URL('package.json', directoryURL) }

  if (info) {
    if (typeof info.name === 'string' && info.name !== '') {
      if (info.name.includes('__')) {
        throw errors.INVALID_PACKAGE_NAME(
          `Package name '${info.name}' is invalid`
        )
      }

      name = info.name.replace(/\//g, '__').replace(/^@/, '')
    } else {
      return UNRESOLVED
    }

    if (typeof info.version === 'string' && info.version !== '') {
      if (version !== null && info.version !== version) return UNRESOLVED

      version = info.version
    }
  } else {
    return UNRESOLVED
  }

  let status

  status = yield* resolve.builtinTarget(name, version, builtins, opts)

  if (status) return status

  for (const prebuildsURL of exports.lookupPrebuildsScope(directoryURL, opts)) {
    status = UNRESOLVED

    for (const host of hosts) {
      const conditions = host.split('-')

      matchedConditions.push(...conditions)

      if (version !== null) {
        status |= yield* exports.file(
          host + '/' + name + '@' + version,
          prebuildsURL,
          opts
        )
      }

      if (unversioned) {
        status |= yield* exports.file(host + '/' + name, prebuildsURL, opts)
      }

      for (const _ of conditions) matchedConditions.pop()
    }

    if (status === RESOLVED) return status
  }

  return yield* exports.linked(name, version, opts)
}

exports.linked = function* (name, version = null, opts = {}) {
  const {
    linked = true,
    host = null, // Shorthand for single host resolution
    hosts = host !== null ? [host] : [],
    matchedConditions = []
  } = opts

  if (linked === false || hosts.length === 0) return UNRESOLVED

  let status = UNRESOLVED

  for (const host of hosts) {
    const [platform = null] = host.split('-', 1)

    if (platform === null) continue

    matchedConditions.push(platform)

    status |= yield* platformArtefact(name, version, platform, opts)

    matchedConditions.pop()
  }

  return status
}

function* platformArtefact(name, version = null, platform, opts = {}) {
  const { linkedProtocol = 'linked:' } = opts

  if (platform === 'darwin' || platform === 'ios') {
    if (version !== null) {
      if (
        yield {
          resolution: new URL(
            `${linkedProtocol}${name}.${version}.framework/${name}.${version}`
          )
        }
      ) {
        return RESOLVED
      }

      if (platform === 'darwin') {
        if (
          yield {
            resolution: new URL(`${linkedProtocol}lib${name}.${version}.dylib`)
          }
        ) {
          return RESOLVED
        }
      }
    }

    if (
      yield {
        resolution: new URL(`${linkedProtocol}${name}.framework/${name}`)
      }
    ) {
      return RESOLVED
    }

    if (platform === 'darwin') {
      if (
        yield {
          resolution: new URL(`${linkedProtocol}lib${name}.dylib`)
        }
      ) {
        return RESOLVED
      }
    }

    return YIELDED
  }

  if (platform === 'linux' || platform === 'android') {
    if (version !== null) {
      if (
        yield {
          resolution: new URL(`${linkedProtocol}lib${name}.${version}.so`)
        }
      ) {
        return RESOLVED
      }
    }

    if (
      yield {
        resolution: new URL(`${linkedProtocol}lib${name}.so`)
      }
    ) {
      return RESOLVED
    }

    return YIELDED
  }

  if (platform === 'win32') {
    if (version !== null) {
      if (
        yield {
          resolution: new URL(`${linkedProtocol}${name}-${version}.dll`)
        }
      ) {
        return RESOLVED
      }
    }

    if (
      yield {
        resolution: new URL(`${linkedProtocol}${name}.dll`)
      }
    ) {
      return RESOLVED
    }
  }

  return UNRESOLVED
}

exports.isWindowsDriveLetter = resolve.isWindowsDriveLetter

exports.startsWithWindowsDriveLetter = resolve.startsWithWindowsDriveLetter
