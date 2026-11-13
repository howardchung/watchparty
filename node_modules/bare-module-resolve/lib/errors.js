module.exports = class ModuleResolveError extends Error {
  constructor(msg, code, fn = ModuleResolveError) {
    super(`${code}: ${msg}`)
    this.code = code

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, fn)
    }
  }

  get name() {
    return 'ModuleResolveError'
  }

  static INVALID_MODULE_SPECIFIER(msg) {
    return new ModuleResolveError(
      msg,
      'INVALID_MODULE_SPECIFIER',
      ModuleResolveError.INVALID_MODULE_SPECIFIER
    )
  }

  static INVALID_PACKAGE_TARGET(msg) {
    return new ModuleResolveError(
      msg,
      'INVALID_PACKAGE_TARGET',
      ModuleResolveError.INVALID_PACKAGE_TARGET
    )
  }

  static PACKAGE_PATH_NOT_EXPORTED(msg) {
    return new ModuleResolveError(
      msg,
      'PACKAGE_PATH_NOT_EXPORTED',
      ModuleResolveError.PACKAGE_PATH_NOT_EXPORTED
    )
  }

  static PACKAGE_IMPORT_NOT_DEFINED(msg) {
    return new ModuleResolveError(
      msg,
      'PACKAGE_IMPORT_NOT_DEFINED',
      ModuleResolveError.PACKAGE_IMPORT_NOT_DEFINED
    )
  }

  static UNSUPPORTED_ENGINE(msg) {
    return new ModuleResolveError(
      msg,
      'UNSUPPORTED_ENGINE',
      ModuleResolveError.UNSUPPORTED_ENGINE
    )
  }
}
