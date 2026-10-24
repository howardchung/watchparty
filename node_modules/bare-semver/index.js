exports.constants = require('./lib/constants')
exports.errors = require('./lib/errors')

const Version = exports.Version = require('./lib/version')
const Range = exports.Range = require('./lib/range')
exports.Comparator = require('./lib/comparator')

exports.satisfies = function satisfies (version, range) {
  if (typeof version === 'string') version = Version.parse(version)
  if (typeof range === 'string') range = Range.parse(range)

  return range.test(version)
}
