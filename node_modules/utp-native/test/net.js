const tape = require('tape')
const utp = require('../')

tape('server + connect', function (t) {
  var connected = false

  const server = utp.createServer(function (socket) {
    connected = true
    socket.write('hello mike')
    socket.end()
  })

  server.listen(function () {
    var socket = utp.connect(server.address().port)

    socket.on('connect', function () {
      socket.destroy()
      server.close()
      t.ok(connected, 'connected successfully')
      t.end()
    })

    socket.write('hello joe')
  })
})

tape('server + connect with resolve', function (t) {
  var connected = false

  const server = utp.createServer(function (socket) {
    connected = true
    socket.write('hello mike')
    socket.end()
  })

  server.listen(function () {
    const socket = utp.connect(server.address().port, 'localhost')

    socket.on('connect', function () {
      socket.destroy()
      server.close()
      t.ok(connected, 'connected successfully')
      t.end()
    })

    socket.write('hello joe')
  })
})

tape('bad resolve', function (t) {
  t.plan(2)

  const socket = utp.connect(10000, 'domain.does-not-exist')

  socket.on('connect', function () {
    t.fail('should not connect')
  })

  socket.on('error', function () {
    t.pass('errored')
  })

  socket.on('close', function () {
    t.pass('closed')
    t.end()
  })
})

tape('server immediate close', function (t) {
  t.plan(2)

  const server = utp.createServer(function (socket) {
    socket.write('hi')
    socket.end()
    server.close(function () {
      t.pass('closed')
    })
  })

  server.listen(0, function () {
    var socket = utp.connect(server.address().port)

    socket.write('hi')
    socket.once('connect', function () {
      socket.end()
    })

    socket.on('close', function () {
      t.pass('client closed')
    })
  })
})

tape.skip('only server sends', function (t) {
  // this is skipped because it doesn't work.
  // utpcat has the same issue so this seems to be a bug
  // in libutp it self
  // in practice this is less of a problem as most protocols
  // exchange a handshake message. would be great to get fixed though
  var server = utp.createServer(function (socket) {
    socket.write('hi')
  })

  server.listen(0, function () {
    var socket = utp.connect(server.address().port)

    socket.on('data', function (data) {
      t.same(data, Buffer.from('hi'))
      socket.destroy()
      server.close()
    })
  })
})

tape('server listens on a port in use', function (t) {
  if (Number(process.versions.node.split('.')[0]) === 0) {
    t.pass('skipping since node 0.10 forces SO_REUSEADDR')
    t.end()
    return
  }

  const server = utp.createServer()
  server.listen(0, function () {
    const server2 = utp.createServer()
    server2.listen(server.address().port, function () {
      t.fail('should not be listening')
    })
    server2.on('error', function () {
      server.close()
      server2.close()
      t.pass('had error')
      t.end()
    })
  })
})

tape('echo server', function (t) {
  const server = utp.createServer(function (socket) {
    socket.pipe(socket)
    socket.on('data', function (data) {
      t.same(data, Buffer.from('hello'))
    })
    socket.on('end', function () {
      socket.end()
    })
  })

  server.listen(0, function () {
    const socket = utp.connect(server.address().port)

    socket.write('hello')
    socket.on('data', function (data) {
      socket.end()
      server.close()
      t.same(data, Buffer.from('hello'))
      t.end()
    })
  })
})

tape('echo server back and fourth', function (t) {
  var echoed = 0

  const server = utp.createServer(function (socket) {
    socket.pipe(socket)
    socket.on('data', function (data) {
      echoed++
      t.same(data, Buffer.from('hello'))
    })
  })

  server.listen(0, function () {
    const socket = utp.connect(server.address().port)

    var rounds = 10

    socket.write('hello')
    socket.on('data', function (data) {
      if (--rounds) return socket.write(data)
      socket.end()
      server.close()
      t.same(echoed, 10)
      t.same(Buffer.from('hello'), data)
      t.end()
    })
  })
})

tape('echo big message', function (t) {
  var packets = 0

  const big = Buffer.alloc(8 * 1024 * 1024)
  big.fill('yolo')

  const server = utp.createServer(function (socket) {
    socket.on('data', () => packets++)
    socket.pipe(socket)
  })

  server.listen(0, function () {
    const then = Date.now()
    const socket = utp.connect(server.address().port)
    const buffer = Buffer.alloc(big.length)

    var ptr = 0

    socket.write(big)
    socket.on('data', function (data) {
      packets++
      data.copy(buffer, ptr)
      ptr += data.length
      if (big.length === ptr) {
        socket.end()
        server.close()
        t.same(buffer, big)
        t.pass('echo took ' + (Date.now() - then) + 'ms (' + packets + ' packets)')
        t.end()
      }
    })
  })
})

tape('echo big message with setContentSize', function (t) {
  var packets = 0

  const big = Buffer.alloc(8 * 1024 * 1024)
  big.fill('yolo')

  const server = utp.createServer(function (socket) {
    socket.setContentSize(big.length)
    socket.on('data', () => packets++)
    socket.pipe(socket)
  })

  server.listen(0, function () {
    const then = Date.now()
    const socket = utp.connect(server.address().port)
    const buffer = Buffer.alloc(big.length)

    var ptr = 0

    socket.setContentSize(big.length)
    socket.write(big)
    socket.on('data', function (data) {
      packets++
      data.copy(buffer, ptr)
      ptr += data.length
      if (big.length === ptr) {
        socket.end()
        server.close()
        t.same(buffer, big)
        t.pass('echo took ' + (Date.now() - then) + 'ms (' + packets + ' packets)')
        t.end()
      }
    })
  })
})

tape('two connections', function (t) {
  var count = 0
  var gotA = false
  var gotB = false

  const server = utp.createServer(function (socket) {
    count++
    socket.pipe(socket)
  })

  server.listen(0, function () {
    const socket1 = utp.connect(server.address().port)
    const socket2 = utp.connect(server.address().port)

    socket1.write('a')
    socket2.write('b')

    socket1.on('data', function (data) {
      gotA = true
      t.same(data, Buffer.from('a'))
      if (gotB) done()
    })

    socket2.on('data', function (data) {
      gotB = true
      t.same(data, Buffer.from('b'))
      if (gotA) done()
    })

    function done () {
      socket1.end()
      socket2.end()
      server.close()
      t.ok(gotA)
      t.ok(gotB)
      t.same(count, 2)
      t.end()
    }
  })
})

tape('emits close', function (t) {
  var serverClosed = false
  var clientClosed = false

  const server = utp.createServer(function (socket) {
    socket.resume()
    socket.on('end', function () {
      socket.end()
    })
    socket.on('close', function () {
      serverClosed = true
      if (clientClosed) done()
    })
  })

  server.listen(0, function () {
    const socket = utp.connect(server.address().port)
    socket.write('hi')
    socket.end() // utp does not support half open
    socket.resume()
    socket.on('close', function () {
      clientClosed = true
      if (serverClosed) done()
    })
  })

  function done () {
    server.close()
    t.ok(serverClosed)
    t.ok(clientClosed)
    t.end()
  }
})

tape('flushes', function (t) {
  var sent = ''
  const server = utp.createServer(function (socket) {
    var buf = ''
    socket.setEncoding('utf-8')
    socket.on('data', function (data) {
      buf += data
    })
    socket.on('end', function () {
      server.close()
      socket.end()
      t.same(buf, sent)
      t.end()
    })
  })

  server.listen(0, function () {
    const socket = utp.connect(server.address().port)
    for (var i = 0; i < 50; i++) {
      socket.write(i + '\n')
      sent += i + '\n'
    }
    socket.end()
  })
})

tape('close waits for connections to close', function (t) {
  var sent = ''
  const server = utp.createServer(function (socket) {
    var buf = ''
    socket.setEncoding('utf-8')
    socket.on('data', function (data) {
      buf += data
    })
    socket.on('end', function () {
      socket.end()
      t.same(buf, sent)
      t.end()
    })
    server.close()
  })

  server.listen(0, function () {
    const socket = utp.connect(server.address().port)
    for (var i = 0; i < 50; i++) {
      socket.write(i + '\n')
      sent += i + '\n'
    }
    socket.end()
  })
})

tape('disable half open', function (t) {
  t.plan(2)
  const server = utp.createServer({ allowHalfOpen: false }, function (socket) {
    socket.on('data', function (data) {
      t.same(data, Buffer.from('a'))
    })
    socket.on('close', function () {
      server.close(function () {
        t.pass('everything closed')
      })
    })
  })

  server.listen(0, function () {
    const socket = utp.connect(server.address().port, '127.0.0.1', { allowHalfOpen: true })

    socket.write('a')
    socket.end()
  })
})

tape('timeout', function (t) {
  t.plan(3)

  var serverClosed = false
  var clientClosed = false
  var missing = 2

  const server = utp.createServer(function (socket) {
    socket.setTimeout(100, function () {
      t.pass('timed out')
      socket.destroy()
    })
    socket.resume()
    socket.write('hi')
    socket.on('close', function () {
      serverClosed = true
      done()
    })
  })

  server.listen(0, function () {
    const socket = utp.connect(server.address().port)
    socket.write('hi')
    socket.resume()
    socket.on('end', function () {
      socket.destroy()
    })
    socket.on('close', function () {
      clientClosed = true
      done()
    })
  })

  function done () {
    if (--missing) return
    server.close()
    t.ok(clientClosed)
    t.ok(serverClosed)
    t.end()
  }
})
