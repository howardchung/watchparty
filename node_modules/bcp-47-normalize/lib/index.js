'use strict'

var bcp47 = require('bcp-47')
var match = require('bcp-47-match')
var matches = require('./matches.json')
var fields = require('./fields.json')
var defaults = require('./defaults.json')
var many = require('./many.json')

module.exports = normalize

var own = {}.hasOwnProperty

var collator = new Intl.Collator()

var emptyExtraFields = {
  variants: [],
  extensions: [],
  privateuse: [],
  irregular: null,
  regular: null
}

function normalize(value, options) {
  var settings = options || {}
  // 1. normalize and lowercase the tag (`sgn-be-fr` -> `sfb`).
  var schema = bcp47.parse(String(value || '').toLowerCase(), settings)
  var tag = bcp47.stringify(schema)
  var index = -1
  var key

  if (!tag) {
    return tag
  }

  // 2. Do fancy, expensive replaces (`ha-latn-gh` -> `ha-gh`).
  while (++index < matches.length) {
    if (match.extendedFilter(tag, matches[index].from).length) {
      replace(schema, matches[index].from, matches[index].to)
      tag = bcp47.stringify(schema)
    }
  }

  // 3. Do basic field replaces (`en-840` -> `en-us`).
  index = -1

  while (++index < fields.length) {
    if (remove(schema, fields[index].from.field, fields[index].from.value)) {
      add(schema, fields[index].to.field, fields[index].to.value)
    }
  }

  // 4. Remove defaults (`nl-nl` -> `nl`).
  tag = bcp47.stringify(Object.assign({}, schema, emptyExtraFields))
  index = -1

  while (++index < defaults.length) {
    if (tag === defaults[index]) {
      replace(
        schema,
        defaults[index],
        defaults[index].split('-').slice(0, -1).join('-')
      )
      tag = bcp47.stringify(Object.assign({}, schema, emptyExtraFields))
    }
  }

  // 5. Sort extensions on singleton.
  schema.extensions.sort(compareSingleton)

  // 6. Warn if fields (currently only regions) should be updated but have
  // multiple choices.
  if (settings.warning) {
    for (key in many) {
      if (own.call(many[key], schema[key])) {
        settings.warning(
          'Deprecated ' +
            key +
            ' `' +
            schema[key] +
            '`, expected one of `' +
            many[key][schema[key]].join('`, `') +
            '`',
          null,
          7
        )
      }
    }
  }

  // 7. Add proper casing back.
  // Format script (ISO 15924) as titlecase (example: `Latn`):
  if (schema.script) {
    schema.script =
      schema.script.charAt(0).toUpperCase() + schema.script.slice(1)
  }

  // Format region (ISO 3166) as uppercase (note: this doesn’t affect numeric
  // codes, which is fine):
  if (schema.region) {
    schema.region = schema.region.toUpperCase()
  }

  return bcp47.stringify(schema)
}

function replace(schema, from, to) {
  var left = bcp47.parse(from)
  var right = bcp47.parse(to)
  var removed = []
  var key

  // Remove values from `from`:
  for (key in left) {
    if (left[key] && left[key].length && remove(schema, key, left[key])) {
      removed.push(key)
    }
  }

  // Add values from `to`:
  for (key in right) {
    // Only add values that are defined on `to`, and that were either removed by
    // `from` or are currently empty.
    if (
      right[key] &&
      right[key].length &&
      (removed.indexOf(key) > -1 || !schema[key] || !schema[key].length)
    ) {
      add(schema, key, right[key])
    }
  }
}

function remove(object, key, value) {
  var removed = false
  var current
  var result
  var index
  var item

  /* istanbul ignore else - this is currently done by wrapping code, so else is
   * never reached.
   * However, that could change in the future, so leave this guard here. */
  if (value) {
    current = object[key]
    result = current

    if (current && typeof current === 'object') {
      result = []
      index = -1

      while (++index < current.length) {
        item = current[index]

        if (value.indexOf(item) < 0) {
          result.push(item)
        } else {
          removed = true
        }
      }
    } else if (current === value) {
      result = null
      removed = true
    }

    object[key] = result
  }

  return removed
}

function add(object, key, value) {
  var current = object[key]
  var list
  var index
  var item

  if (current && typeof current === 'object') {
    list = [].concat(value)
    index = -1

    while (++index < list.length) {
      item = list[index]

      /* istanbul ignore else - this currently can’t happen, but guard for the
       * future. */
      if (current.indexOf(item) < 0) {
        current.push(item)
      }
    }
  } else {
    object[key] = value
  }
}

function compareSingleton(left, right) {
  return collator.compare(left.singleton, right.singleton)
}
