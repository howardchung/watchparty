var low = require('./')
var tape = require('tape')

tape('last one wins', function (t) {
  t.plan(2)

  var expected = [1, 5]
  var fn = low(function (num, cb) {
    t.same(num, expected.shift())
    process.nextTick(cb)
  })

  fn(1)
  fn(2)
  fn(3)
  fn(4)
  fn(5)
})

tape('calls callbacks', function (t) {
  t.plan(7)

  var expected = [1, 5]
  var fn = low(function (num, cb) {
    t.same(num, expected.shift())
    process.nextTick(cb)
  })

  fn(1, called)
  fn(2, called)
  fn(3, called)
  fn(4, called)
  fn(5, called)

  function called () {
    t.ok(true)
  }
})

tape('calls callbacks twice', function (t) {
  t.plan(13)

  var expected = [1, 5, 6, 9]
  var fn = low(function (num, cb) {
    t.same(num, expected.shift())
    process.nextTick(cb)
  })

  fn(1, called)
  fn(2, called)
  fn(3, called)
  fn(4, called)
  fn(5, function () {
    called()
    fn(6, called)
    fn(7, called)
    fn(8, called)
    fn(9, called)
  })

  function called () {
    t.ok(true)
  }
})

tape('calls callbacks with errors', function (t) {
  t.plan(7)

  var expected = [1, 5]
  var fn = low(function (num, cb) {
    t.same(num, expected.shift())
    process.nextTick(function () {
      if (!expected.length) cb(new Error('lol'))
      else cb()
    })
  })

  fn(1, called)
  fn(2, calledWithError)
  fn(3, calledWithError)
  fn(4, calledWithError)
  fn(5, calledWithError)

  function calledWithError (err) {
    t.same(err.message, 'lol')
  }

  function called (err) {
    t.ok(!err)
  }
})

tape('works with falsy arg', function (t) {
  t.plan(7)

  var expected = [1, 0]
  var fn = low(function (num, cb) {
    t.same(num, expected.shift())
    process.nextTick(cb)
  })

  fn(1, called)
  fn(2, called)
  fn(3, called)
  fn(4, called)
  fn(0, called)

  function called () {
    t.ok(true)
  }
})
