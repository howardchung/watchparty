declare class ModuleResolveError extends Error {
  readonly code: string

  static INVALID_MODULE_SPECIFIER(msg: string): ModuleResolveError
  static INVALID_PACKAGE_TARGET(msg: string): ModuleResolveError
  static PACKAGE_PATH_NOT_EXPORTED(msg: string): ModuleResolveError
  static PACKAGE_IMPORT_NOT_DEFINED(msg: string): ModuleResolveError
  static UNSUPPORTED_ENGINE(msg: string): ModuleResolveError
}

export = ModuleResolveError
