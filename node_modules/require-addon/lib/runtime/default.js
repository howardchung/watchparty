if (typeof require.addon === 'function') {
  module.exports = require.addon.bind(require)
} else {
  module.exports = function addon(specifier, parentURL) {
    throw new Error(
      `Cannot find addon '${specifier}' imported from '${parentURL}'`
    )
  }
}
