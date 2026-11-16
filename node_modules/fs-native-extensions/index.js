const { isWindows } = require('which-runtime')
const binding = require('./binding')

function onwork(err, result) {
  if (err) this.reject(err)
  else this.resolve(result)
}

exports.tryLock = function tryLock(fd, offset = 0, length = 0, opts = {}) {
  if (typeof offset === 'object') {
    opts = offset
    offset = 0
  }

  if (typeof length === 'object') {
    opts = length
    length = 0
  }

  if (typeof opts !== 'object' || opts === null) {
    opts = {}
  }

  try {
    binding.tryLock(fd, offset, length, opts.shared !== true)
  } catch (err) {
    if (err.code === 'EAGAIN') return false
    throw err
  }

  return true
}

exports.waitForLock = function waitForLock(
  fd,
  offset = 0,
  length = 0,
  opts = {}
) {
  if (typeof offset === 'object') {
    opts = offset
    offset = 0
  }

  if (typeof length === 'object') {
    opts = length
    length = 0
  }

  if (typeof opts !== 'object' || opts === null) {
    opts = {}
  }

  const req = {
    handle: null,
    resolve: null,
    reject: null
  }

  const promise = new Promise((resolve, reject) => {
    req.resolve = resolve
    req.reject = reject
  })

  try {
    req.handle = binding.waitForLock(
      fd,
      offset,
      length,
      opts.shared !== true,
      req,
      onwork
    )
  } catch (err) {
    return Promise.reject(err)
  }

  return promise
}

exports.tryDowngradeLock = function tryDowngradeLock(
  fd,
  offset = 0,
  length = 0
) {
  try {
    binding.tryDowngradeLock(fd, offset, length)
  } catch (err) {
    if (err.code === 'EAGAIN') return false
    throw err
  }

  return true
}

exports.waitForDowngradeLock = function downgradeLock(
  fd,
  offset = 0,
  length = 0
) {
  const req = {
    handle: null,
    resolve: null,
    reject: null
  }

  const promise = new Promise((resolve, reject) => {
    req.resolve = resolve
    req.reject = reject
  })

  try {
    req.handle = binding.waitForDowngradeLock(fd, offset, length, req, onwork)
  } catch (err) {
    return Promise.reject(err)
  }

  return promise
}

exports.tryUpgradeLock = function tryUpgradeLock(fd, offset = 0, length = 0) {
  try {
    binding.tryUpgradeLock(fd, offset, length)
  } catch (err) {
    if (err.code === 'EAGAIN') return false
    throw err
  }

  return true
}

exports.waitForUpgradeLock = function upgradeLock(fd, offset = 0, length = 0) {
  const req = {
    handle: null,
    resolve: null,
    reject: null
  }

  const promise = new Promise((resolve, reject) => {
    req.resolve = resolve
    req.reject = reject
  })

  try {
    req.handle = binding.waitForUpgradeLock(fd, offset, length, req, onwork)
  } catch (err) {
    return Promise.reject(err)
  }

  return promise
}

exports.unlock = function unlock(fd, offset = 0, length = 0) {
  binding.unlock(fd, offset, length)
}

exports.trim = function trim(fd, offset, length) {
  const req = {
    handle: null,
    resolve: null,
    reject: null
  }

  const promise = new Promise((resolve, reject) => {
    req.resolve = resolve
    req.reject = reject
  })

  try {
    req.handle = binding.trim(fd, offset, length, req, onwork)
  } catch (err) {
    return Promise.reject(err)
  }

  return promise
}

exports.sparse = function sparse(fd) {
  // Short circuit on everything but Windows
  if (!isWindows) return Promise.resolve()

  const req = {
    handle: null,
    resolve: null,
    reject: null
  }

  const promise = new Promise((resolve, reject) => {
    req.resolve = resolve
    req.reject = reject
  })

  try {
    req.handle = binding.sparse(fd, req, onwork)
  } catch (err) {
    return Promise.reject(err)
  }

  return promise
}

exports.swap = function swap(from, to) {
  const req = {
    handle: null,
    resolve: null,
    reject: null
  }

  const promise = new Promise((resolve, reject) => {
    req.resolve = resolve
    req.reject = reject
  })

  try {
    req.handle = binding.swap(from, to, req, onwork)
  } catch (err) {
    return Promise.reject(err)
  }

  return promise
}

exports.getAttr = function getAttr(fd, name) {
  const req = {
    handle: null,
    resolve: null,
    reject: null
  }

  const promise = new Promise((resolve, reject) => {
    req.resolve = resolve
    req.reject = reject
  })

  try {
    req.handle = binding.getAttr(fd, name, req, onwork)
  } catch (err) {
    return Promise.reject(err)
  }

  return promise.then((buffer) =>
    buffer === null ? null : Buffer.from(buffer)
  )
}

exports.setAttr = function setAttr(fd, name, value, encoding) {
  if (typeof value === 'string') value = Buffer.from(value, encoding)

  const req = {
    value,
    handle: null,
    resolve: null,
    reject: null
  }

  const promise = new Promise((resolve, reject) => {
    req.resolve = resolve
    req.reject = reject
  })

  try {
    req.handle = binding.setAttr(
      fd,
      name,
      value.buffer,
      value.byteOffset,
      value.byteLength,
      req,
      onwork
    )
  } catch (err) {
    return Promise.reject(err)
  }

  return promise
}

exports.removeAttr = function removeAttr(fd, name) {
  const req = {
    handle: null,
    resolve: null,
    reject: null
  }

  const promise = new Promise((resolve, reject) => {
    req.resolve = resolve
    req.reject = reject
  })

  try {
    req.handle = binding.removeAttr(fd, name, req, onwork)
  } catch (err) {
    return Promise.reject(err)
  }

  return promise
}

exports.listAttrs = function listAttrs(fd) {
  const req = {
    handle: null,
    resolve: null,
    reject: null
  }

  const promise = new Promise((resolve, reject) => {
    req.resolve = resolve
    req.reject = reject
  })

  try {
    req.handle = binding.listAttrs(fd, req, onwork)
  } catch (err) {
    return Promise.reject(err)
  }

  return promise
}
