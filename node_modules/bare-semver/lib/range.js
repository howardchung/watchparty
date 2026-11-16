const constants = require('./constants')
const errors = require('./errors')
const Version = require('./version')
const Comparator = require('./comparator')

const Range = module.exports = exports = class Range {
  constructor (comparators = []) {
    this.comparators = comparators
  }

  test (version) {
    for (const set of this.comparators) {
      let matches = true

      for (const comparator of set) {
        if (comparator.test(version)) continue
        matches = false
        break
      }

      if (matches) return true
    }

    return false
  }

  toString () {
    let result = ''
    let first = true

    for (const set of this.comparators) {
      if (first) first = false
      else result += ' || '

      result += set.join(' ')
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

  const comparators = []

  while (i < input.length) {
    const set = []

    while (i < input.length) {
      c = input[i]

      let operator = constants.EQ

      if (c === '<') {
        operator = constants.LT
        c = input[++i]

        if (c === '=') {
          operator = constants.LTE
          c = input[++i]
        }
      } else if (c === '>') {
        operator = constants.GT
        c = input[++i]

        if (c === '=') {
          operator = constants.GTE
          c = input[++i]
        }
      } else if (c === '=') {
        c = input[++i]
      }

      const state = { position: i, partial: true }

      set.push(new Comparator(operator, Version.parse(input, state)))

      c = input[i = state.position]

      while (c === ' ') c = input[++i]

      if (c === '|' && input[i + 1] === '|') {
        c = input[i += 2]

        while (c === ' ') c = input[++i]

        break
      }

      if (c && c !== '<' && c !== '>') unexpected('expected \'||\', \'<\', or \'>\'')
    }

    if (set.length) comparators.push(set)
  }

  if (i < input.length && state.partial === false) unexpected('expected end of input')

  state.position = i

  return new Range(comparators)
}
