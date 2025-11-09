const to = setTimeout(function () {}, 1000)
clearTimeout(to)

module.exports = to.refresh
  ? require('./refresh')
  : process.versions.electron ? require('./browser') : require('./timers')
