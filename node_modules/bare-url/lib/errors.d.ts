declare class URLError extends Error {
  static INVALID_URL(msg?: string): URLError
  static INVALID_URL_SCHEME(msg?: string): URLError
  static INVALID_FILE_URL_HOST(msg?: string): URLError
  static INVALID_FILE_URL_PATH(msg?: string): URLError
}

export = URLError
