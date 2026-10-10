module.exports = class AddonResolveError extends Error {
  constructor(msg, code, fn = AddonResolveError) {
    super(`${code}: ${msg}`)
    this.code = code

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, fn)
    }
  }

  get name() {
    return 'AddonResolveError'
  }

  static INVALID_ADDON_SPECIFIER(msg) {
    return new AddonResolveError(
      msg,
      'INVALID_ADDON_SPECIFIER',
      AddonResolveError.INVALID_ADDON_SPECIFIER
    )
  }

  static INVALID_PACKAGE_NAME(msg) {
    return new AddonResolveError(
      msg,
      'INVALID_PACKAGE_NAME',
      AddonResolveError.INVALID_PACKAGE_NAME
    )
  }
}
