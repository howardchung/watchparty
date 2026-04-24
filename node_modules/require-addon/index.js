const runtime = require('./lib/runtime')

if (runtime === 'bare') {
  module.exports = require('./lib/runtime/bare')
} else if (runtime === 'node') {
  module.exports = require('./lib/runtime/node')
} else {
  module.exports = require('./lib/runtime/default')
}
