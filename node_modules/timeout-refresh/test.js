const tape = require('tape')

run('', require('./'))
run('browser: ', require('./browser'))

function run (prefix, timeout) {
  tape(prefix + 'refresh', function (t) {
    var refreshing = true
    var timedout = false

    const ctx = {}
    const to = timeout(100, function () {
      t.ok(ctx === this)
      t.ok(!refreshing)
      timedout = true
    }, ctx)

    const i = setInterval(function () {
      to.refresh()
    }, 50)

    setTimeout(function () {
      refreshing = false
      clearInterval(i)
      setTimeout(function () {
        t.ok(timedout)
        t.end()
      }, 100)
    }, 500)
  })

  tape(prefix + 'destroy', function (t) {
    var timedout = false

    const to = timeout(100, function () {
      t.fail('should be destroyed')
      timedout = true
    })

    const i = setInterval(function () {
      to.refresh()
    }, 50)

    setTimeout(function () {
      clearInterval(i)
      to.destroy()
      setTimeout(function () {
        t.ok(!timedout)
        t.end()
      }, 100)
    }, 500)
  })

  tape(prefix + 'cannot be refreshed after call', function (t) {
    t.plan(2)

    var timedout = false

    const to = timeout(50, function () {
      t.notOk(timedout, 'did not already timeout')
      t.pass('should be destroyed')
      to.refresh()
      timedout = true
    })

    setTimeout(function () {
      t.end()
    }, 500)
  })
}
