'use strict'

// See https://tools.ietf.org/html/rfc4647#section-3.1
// for more information on the algorithms.

exports.basicFilter = factory(basic, true)
exports.extendedFilter = factory(extended, true)
exports.lookup = factory(lookup)

// Basic Filtering (Section 3.3.1) matches a language priority list consisting
// of basic language ranges (Section 2.1) to sets of language tags.
function basic(tag, range) {
  return range === '*' || tag === range || tag.indexOf(range + '-') > -1
}

// Extended Filtering (Section 3.3.2) matches a language priority list
// consisting of extended language ranges (Section 2.2) to sets of language
// tags.
function extended(tag, range) {
  // 3.3.2.1
  var left = tag.split('-')
  var right = range.split('-')
  var leftIndex = 0
  var rightIndex = 0

  // 3.3.2.2
  if (right[rightIndex] !== '*' && left[leftIndex] !== right[rightIndex]) {
    return false
  }

  leftIndex++
  rightIndex++

  // 3.3.2.3
  while (rightIndex < right.length) {
    // 3.3.2.3.A
    if (right[rightIndex] === '*') {
      rightIndex++
      continue
    }

    // 3.3.2.3.B
    if (!left[leftIndex]) return false

    // 3.3.2.3.C
    if (left[leftIndex] === right[rightIndex]) {
      leftIndex++
      rightIndex++
      continue
    }

    // 3.3.2.3.D
    if (left[leftIndex].length === 1) return false

    // 3.3.2.3.E
    leftIndex++
  }

  // 3.3.2.4
  return true
}

// Lookup (Section 3.4) matches a language priority list consisting of basic
// language ranges to sets of language tags to find the one exact language tag
// that best matches the range.
function lookup(tag, range) {
  var right = range
  var index

  /* eslint-disable-next-line no-constant-condition */
  while (true) {
    if (right === '*' || tag === right) return true

    index = right.lastIndexOf('-')

    if (index < 0) return false

    if (right.charAt(index - 2) === '-') index -= 2

    right = right.slice(0, index)
  }
}

// Factory to perform a filter or a lookup.
// This factory creates a function that accepts a list of tags and a list of
// ranges, and contains logic to exit early for lookups.
// `check` just has to deal with one tag and one range.
// This match function iterates over ranges, and for each range,
// iterates over tags.  That way, earlier ranges matching any tag have
// precedence over later ranges.
function factory(check, filter) {
  return match

  function match(tags, ranges) {
    var left = cast(tags, 'tag')
    var right = cast(ranges == null ? '*' : ranges, 'range')
    var matches = []
    var rightIndex = -1
    var range
    var leftIndex
    var next

    while (++rightIndex < right.length) {
      range = right[rightIndex].toLowerCase()

      // Ignore wildcards in lookup mode.
      if (!filter && range === '*') continue

      leftIndex = -1
      next = []

      while (++leftIndex < left.length) {
        if (check(left[leftIndex].toLowerCase(), range)) {
          // Exit if this is a lookup and we have a match.
          if (!filter) return left[leftIndex]
          matches.push(left[leftIndex])
        } else {
          next.push(left[leftIndex])
        }
      }

      left = next
    }

    // If this is a filter, return the list.  If it’s a lookup, we didn’t find
    // a match, so return `undefined`.
    return filter ? matches : undefined
  }
}

// Validate tags or ranges, and cast them to arrays.
function cast(values, name) {
  var value = values && typeof values === 'string' ? [values] : values

  if (!value || typeof value !== 'object' || !('length' in value)) {
    throw new Error(
      'Invalid ' + name + ' `' + value + '`, expected non-empty string'
    )
  }

  return value
}
