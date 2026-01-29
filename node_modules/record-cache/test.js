var tape = require('tape')
var recordCache = require('./')

tape('add and get', function (t) {
  var rc = recordCache()
  rc.add('hello', 'world')
  t.same(rc.get('hello'), ['world'])
  t.end()
})

tape('add and get buffer', function (t) {
  var rc = recordCache()
  rc.add('hello', Buffer.from('world'))
  t.same(rc.get('hello'), [Buffer.from('world')])
  t.end()
})

tape('add and get (more than one)', function (t) {
  var rc = recordCache()
  rc.add('hello', 'world')
  rc.add('hello', 'verden')
  rc.add('hello', 'welt')
  t.same(rc.get('hello').sort(), ['verden', 'welt', 'world'])

  var list = rc.get('hello', 2)
  t.ok(list[0] !== list[1])
  t.ok(['verden', 'welt', 'world'].includes(list[0]))
  t.ok(['verden', 'welt', 'world'].includes(list[1]))
  t.end()
})

tape('get is randomised', function (t) {
  var rc = recordCache()

  rc.add('hello', 'a')
  rc.add('hello', 'b')
  rc.add('hello', 'c')

  var map = {}

  for (var i = 0; i < 1000; i++) {
    map[rc.get('hello', 2).join('')] = true
  }

  t.same(map, {ab: true, ba: true, cb: true, bc: true, ac: true, ca: true})
  t.end()
})

tape('get capped', function (t) {
  var rc = recordCache({maxSize: 10})

  for (var i = 0; i < 50; i++) {
    rc.add('hello', '' + i)
  }

  t.ok(rc.get('hello').length <= 20)
  t.ok(rc.size <= 20)
  t.notOk(rc.get('hello').includes('0'))
  t.notOk(rc.get('hello').includes('29'))
  t.end()
})

tape('get capped with many record sets', function (t) {
  var rc = recordCache({maxSize: 10})

  for (var i = 0; i < 50; i++) {
    rc.add('' + i, 'hello')
  }

  t.ok(rc.size <= 20)
  t.same(rc.get('0'), [])
  t.same(rc.get('29'), [])
  t.same(rc.get('49'), ['hello'])
  t.end()
})

tape('many updates is fine when capped', function (t) {
  var rc = recordCache({maxSize: 10})

  for (var i = 0; i < 10; i++) {
    rc.add('hello', '' + i)
  }
  for (var j = 0; j < 100; j++) {
    rc.add('hello', '9')
  }

  t.same(rc.get('hello').sort().join(''), '0123456789')
  t.end()
})

tape('remove', function (t) {
  var rc = recordCache()

  t.same(rc.get('hello'), [])
  rc.remove('hello', 'world')
  t.same(rc.get('hello'), [])
  rc.add('hello', 'world')
  t.same(rc.get('hello'), ['world'])
  rc.remove('hello', 'world')
  t.same(rc.get('hello'), [])
  t.end()
})

tape('remove with other value', function (t) {
  var rc = recordCache()

  rc.add('hello', 'hi')
  t.same(rc.get('hello'), ['hi'])
  rc.remove('hello', 'world')
  t.same(rc.get('hello'), ['hi'])
  rc.add('hello', 'world')
  t.same(rc.get('hello').sort(), ['hi', 'world'])
  rc.remove('hello', 'world')
  t.same(rc.get('hello'), ['hi'])
  t.end()
})

tape('clear', function (t) {
  var rc = recordCache()

  rc.clear()
  t.same(rc.get('hello'), [])
  rc.add('hello', 'a')
  rc.add('hello', 'b')
  rc.add('foo', 'bar')
  t.same(rc.get('hello').sort(), ['a', 'b'])
  rc.clear()
  t.same(rc.get('hello'), [])
  t.same(rc.get('foo'), [])
  t.end()
})

tape('maxAge', function (t) {
  var rc = recordCache({maxAge: 20})

  rc.add('hello', 'world')
  rc.add('hello', 'verden')
  setTimeout(function () {
    t.same(rc.get('hello').sort(), ['verden', 'world'])
    setTimeout(function () {
      t.same(rc.get('hello'), [])
      rc.destroy()
      t.end()
    }, 35)
  }, 5)
})

tape('maxAge but one value is staying alive', function (t) {
  var rc = recordCache({maxAge: 20})

  rc.add('hello', 'world')
  rc.add('hello', 'verden')
  var interval = setInterval(function () {
    rc.add('hello', 'verden')
  }, 5)
  setTimeout(function () {
    t.same(rc.get('hello').sort(), ['verden', 'world'])
    setTimeout(function () {
      clearInterval(interval)
      t.same(rc.get('hello'), ['verden'])
      rc.destroy()
      t.end()
    }, 35)
  }, 5)
})

tape('add dedups buffers', function (t) {
  var rc = recordCache()

  rc.add('hello', Buffer.from('world'))
  rc.add('hello', Buffer.from('world'))

  t.same(rc.get('hello'), [Buffer.from('world')])
  t.end()
})

tape('add and remove buffer', function (t) {
  var rc = recordCache()

  rc.add('hello', Buffer.from('world'))
  rc.remove('hello', Buffer.from('world'))

  t.same(rc.get('hello'), [])
  t.end()
})
