declare class AddonResolveError extends Error {
  readonly code: string

  static INVALID_ADDON_SPECIFIER(msg: string): AddonResolveError
  static INVALID_PACKAGE_NAME(msg: string): AddonResolveError
}

export = AddonResolveError
