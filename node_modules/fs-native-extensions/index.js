const binding = require('./binding')

function onwork (err) {
  if (err) this.reject(err)
  else this.resolve()
}

exports.tryLock = function tryLock (fd, offset = 0, length = 0, opts = {}) {
  if (typeof offset === 'object') {
    opts = offset
    offset = 0
  }

  if (typeof length === 'object') {
    opts = length
    length = 0
  }

  if (typeof opts !== 'object') {
    opts = {}
  }

  try {
    binding.fs_ext_napi_try_lock(fd, offset, length, opts.shared ? 0 : 1)
  } catch (err) {
    if (err.code === 'EAGAIN') return false
    throw err
  }

  return true
}

exports.waitForLock = function waitForLock (fd, offset = 0, length = 0, opts = {}) {
  if (typeof offset === 'object') {
    opts = offset
    offset = 0
  }

  if (typeof length === 'object') {
    opts = length
    length = 0
  }

  if (typeof opts !== 'object') {
    opts = {}
  }

  const req = Buffer.alloc(binding.sizeof_fs_ext_napi_lock_t)
  const ctx = {
    req,
    resolve: null,
    reject: null
  }

  const promise = new Promise((resolve, reject) => {
    ctx.resolve = resolve
    ctx.reject = reject
  })

  try {
    binding.fs_ext_napi_wait_for_lock(req, fd, offset, length, opts.shared ? 0 : 1, ctx, onwork)
  } catch (err) {
    return Promise.reject(err)
  }

  return promise
}

exports.tryDowngradeLock = function tryDowngradeLock (fd, offset = 0, length = 0) {
  try {
    binding.fs_ext_napi_try_downgrade_lock(fd, offset, length)
  } catch (err) {
    if (err.code === 'EAGAIN') return false
    throw err
  }

  return true
}

exports.waitForDowngradeLock = function downgradeLock (fd, offset = 0, length = 0) {
  const req = Buffer.alloc(binding.sizeof_fs_ext_napi_lock_t)
  const ctx = {
    req,
    resolve: null,
    reject: null
  }

  const promise = new Promise((resolve, reject) => {
    ctx.resolve = resolve
    ctx.reject = reject
  })

  try {
    binding.fs_ext_napi_wait_for_downgrade_lock(req, fd, offset, length, ctx, onwork)
  } catch (err) {
    return Promise.reject(err)
  }

  return promise
}

exports.tryUpgradeLock = function tryUpgradeLock (fd, offset = 0, length = 0) {
  try {
    binding.fs_ext_napi_try_upgrade_lock(fd, offset, length)
  } catch (err) {
    if (err.code === 'EAGAIN') return false
    throw err
  }

  return true
}

exports.waitForUpgradeLock = function upgradeLock (fd, offset = 0, length = 0) {
  const req = Buffer.alloc(binding.sizeof_fs_ext_napi_lock_t)
  const ctx = {
    req,
    resolve: null,
    reject: null
  }

  const promise = new Promise((resolve, reject) => {
    ctx.resolve = resolve
    ctx.reject = reject
  })

  try {
    binding.fs_ext_napi_wait_for_upgrade_lock(req, fd, offset, length, ctx, onwork)
  } catch (err) {
    return Promise.reject(err)
  }

  return promise
}

exports.unlock = function unlock (fd, offset = 0, length = 0) {
  binding.fs_ext_napi_unlock(fd, offset, length)
}

exports.trim = function trim (fd, offset, length) {
  const req = Buffer.alloc(binding.sizeof_fs_ext_napi_trim_t)
  const ctx = {
    req,
    resolve: null,
    reject: null
  }

  const promise = new Promise((resolve, reject) => {
    ctx.resolve = resolve
    ctx.reject = reject
  })

  try {
    binding.fs_ext_napi_trim(req, fd, offset, length, ctx, onwork)
  } catch (err) {
    return Promise.reject(err)
  }

  return promise
}

exports.sparse = function sparse (fd) {
  // Short circuit on everything but Windows
  if (process.platform !== 'win32') return Promise.resolve()

  const req = Buffer.alloc(binding.sizeof_fs_ext_napi_sparse_t)
  const ctx = {
    req,
    resolve: null,
    reject: null
  }

  const promise = new Promise((resolve, reject) => {
    ctx.resolve = resolve
    ctx.reject = reject
  })

  try {
    binding.fs_ext_napi_sparse(req, fd, ctx, onwork)
  } catch (err) {
    return Promise.reject(err)
  }

  return promise
}

exports.swap = function swap (from, to) {
  const req = Buffer.alloc(binding.sizeof_fs_ext_napi_swap_t)
  const ctx = {
    req,
    resolve: null,
    reject: null
  }

  const promise = new Promise((resolve, reject) => {
    ctx.resolve = resolve
    ctx.reject = reject
  })

  try {
    binding.fs_ext_napi_swap(req, from, to, ctx, onwork)
  } catch (err) {
    return Promise.reject(err)
  }

  return promise
}
