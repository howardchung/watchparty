module.exports = class SemVerError extends Error {
  constructor (msg, code, fn = SemVerError) {
    super(`${code}: ${msg}`)
    this.code = code

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, fn)
    }
  }

  get name () {
    return 'SemVerError'
  }

  static INVALID_VERSION (msg, fn = SemVerError.INVALID_VERSION) {
    return new SemVerError(msg, 'INVALID_VERSION', fn)
  }

  static INVALID_RANGE (msg, fn = SemVerError.INVALID_RANGE) {
    return new SemVerError(msg, 'INVALID_RANGE', fn)
  }
}
