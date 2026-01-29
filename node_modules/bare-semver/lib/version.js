const errors = require('./errors')

const Version = module.exports = exports = class Version {
  constructor (major, minor, patch, opts = {}) {
    const {
      prerelease = [],
      build = []
    } = opts

    this.major = major
    this.minor = minor
    this.patch = patch
    this.prerelease = prerelease
    this.build = build
  }

  compare (version) {
    return exports.compare(this, version)
  }

  toString () {
    let result = `${this.major}.${this.minor}.${this.patch}`

    if (this.prerelease.length) {
      result += '-' + this.prerelease.join('.')
    }

    if (this.build.length) {
      result += '+' + this.build.join('.')
    }

    return result
  }
}

exports.parse = function parse (input, state = { position: 0, partial: false }) {
  let i = state.position
  let c

  const unexpected = (expected) => {
    let msg

    if (i >= input.length) {
      msg = `Unexpected end of input in '${input}'`
    } else {
      msg = `Unexpected token '${input[i]}' in '${input}' at position ${i}`
    }

    if (expected) msg += `, ${expected}`

    throw errors.INVALID_VERSION(msg, unexpected)
  }

  const components = []

  while (components.length < 3) {
    c = input[i]

    if (components.length > 0) {
      if (c === '.') c = input[++i]
      else unexpected('expected \'.\'')
    }

    if (c === '0') {
      components.push(0)

      i++
    } else if (c >= '1' && c <= '9') {
      let j = 0
      do c = input[i + ++j]
      while (c >= '0' && c <= '9')

      components.push(parseInt(input.substring(i, i + j)))

      i += j
    } else unexpected('expected /[0-9]/')
  }

  const prerelease = []

  if (input[i] === '-') {
    i++

    while (true) {
      c = input[i]

      let tag = ''
      let j = 0

      while (c >= '0' && c <= '9') c = input[i + ++j]

      let isNumeric = false

      if (j) {
        tag += input.substring(i, i + j)

        c = input[i += j]

        isNumeric = tag[0] !== '0' || tag.length === 1
      }

      j = 0

      while ((c >= '0' && c <= '9') || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '-') c = input[i + ++j]

      if (j) {
        tag += input.substring(i, i + j)

        c = input[i += j]
      } else if (!isNumeric) unexpected('expected /[a-zA-Z-]/')

      prerelease.push(tag)

      if (c === '.') c = input[++i]
      else break
    }
  }

  const build = []

  if (input[i] === '+') {
    i++

    while (true) {
      c = input[i]

      let tag = ''
      let j = 0

      while ((c >= '0' && c <= '9') || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '-') c = input[i + ++j]

      if (j) {
        tag += input.substring(i, i + j)

        c = input[i += j]
      } else unexpected('expected /[0-9a-zA-Z-]/')

      build.push(tag)

      if (c === '.') c = input[++i]
      else break
    }
  }

  if (i < input.length && state.partial === false) unexpected('expected end of input')

  state.position = i

  return new Version(...components, { prerelease, build })
}

const integer = /^[0-9]+$/

exports.compare = function compare (a, b) {
  if (a.major > b.major) return 1
  if (a.major < b.major) return -1

  if (a.minor > b.minor) return 1
  if (a.minor < b.minor) return -1

  if (a.patch > b.patch) return 1
  if (a.patch < b.patch) return -1

  if (a.prerelease.length === 0) return b.prerelease.length === 0 ? 0 : 1
  if (b.prerelease.length === 0) return -1

  let i = 0
  do {
    let x = a.prerelease[i]
    let y = b.prerelease[i]

    if (x === undefined) return y === undefined ? 0 : -1
    if (y === undefined) return 1

    if (x === y) continue

    const xInt = integer.test(x)
    const yInt = integer.test(y)

    if (xInt && yInt) {
      x = +x
      y = +y
    } else {
      if (xInt) return -1
      if (yInt) return 1
    }

    return x > y ? 1 : -1
  } while (++i)
}
