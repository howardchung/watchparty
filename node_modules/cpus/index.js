/*! cpus. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
var os = require('os')

module.exports = function cpus () {
  return os.cpus()
}
