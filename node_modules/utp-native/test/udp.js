const tape = require('tape')
const utp = require('../')

tape('bind', function (t) {
  const sock = utp()

  sock.bind(function () {
    const { port, address } = sock.address()
    t.same(address, '0.0.0.0')
    t.same(typeof port, 'number')
    t.ok(port > 0 && port < 65536)
    sock.close(() => t.end())
  })
})

tape('bind, close, bind', function (t) {
  const sock = utp()

  sock.bind(function () {
    const { port, address } = sock.address()
    t.same(address, '0.0.0.0')
    t.same(typeof port, 'number')
    t.ok(port > 0 && port < 65536)
    sock.close(function () {
      const otherSock = utp()

      otherSock.bind(port, function () {
        const addr = otherSock.address()
        t.same(addr.port, port)
        t.same(addr.address, address)
        otherSock.close(() => t.end())
      })
    })
  })
})

tape('bind after error', function (t) {
  const a = utp()
  const b = utp()

  a.listen(function () {
    b.once('error', function (err) {
      t.ok(err, 'should error')
      b.listen(function () {
        t.pass('should still bind')
        a.close(() => b.close(() => t.end()))
      })
    })
    b.listen(a.address().port)
  })
})

tape('send message', function (t) {
  const sock = utp()

  sock.bind(0, '127.0.0.1', function () {
    const addr = sock.address()

    sock.on('message', function (message, rinfo) {
      t.same(rinfo, addr)
      t.same(message, Buffer.from('hello'))
      sock.close(() => t.end())
    })

    sock.send(Buffer.from('hello'), 0, 5, addr.port, addr.address, function (err) {
      t.error(err, 'no error')
    })
  })
})

tape('send after close', function (t) {
  const sock = utp()

  sock.bind(0, '127.0.0.1', function () {
    const { port, address } = sock.address()
    sock.send(Buffer.from('hello'), 0, 5, port, address, function (err) {
      t.error(err, 'no error')
      sock.close(function () {
        sock.send(Buffer.from('world'), 0, 5, port, address, function (err) {
          t.ok(err, 'should error')
          t.end()
        })
      })
    })
  })
})
