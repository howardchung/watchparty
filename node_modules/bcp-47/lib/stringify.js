'use strict'

module.exports = stringify

// Compile a language schema to a BCP 47 language tag.
function stringify(schema) {
  var fields = schema || {}
  var result = []
  var values
  var index
  var value

  if (fields.irregular || fields.regular) {
    return fields.irregular || fields.regular
  }

  if (fields.language) {
    result = result.concat(
      fields.language,
      fields.extendedLanguageSubtags || [],
      fields.script || [],
      fields.region || [],
      fields.variants || []
    )

    values = fields.extensions || []
    index = -1

    while (++index < values.length) {
      value = values[index]

      if (value.singleton && value.extensions && value.extensions.length) {
        result = result.concat(value.singleton, value.extensions)
      }
    }
  }

  if (fields.privateuse && fields.privateuse.length) {
    result = result.concat('x', fields.privateuse)
  }

  return result.join('-')
}
