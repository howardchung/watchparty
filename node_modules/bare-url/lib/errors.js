module.exports = class URLError extends Error {
  constructor(msg, code, fn = URLError) {
    super(`${code}: ${msg}`)
    this.code = code

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, fn)
    }
  }

  get name() {
    return 'URLError'
  }

  static INVALID_URL(msg = 'Invalid URL') {
    return new URLError(msg, 'INVALID_URL', URLError.INVALID_URL)
  }

  static INVALID_URL_SCHEME(msg = 'Invalid URL') {
    return new URLError(msg, 'INVALID_URL_SCHEME', URLError.INVALID_URL_SCHEME)
  }

  static INVALID_FILE_URL_HOST(msg = 'Invalid file: URL host') {
    return new URLError(
      msg,
      'INVALID_FILE_URL_HOST',
      URLError.INVALID_FILE_URL_HOST
    )
  }

  static INVALID_FILE_URL_PATH(msg = 'Invalid file: URL path') {
    return new URLError(
      msg,
      'INVALID_FILE_URL_PATH',
      URLError.INVALID_FILE_URL_PATH
    )
  }
}
