const tape = require('tape')
const dgram = require('dgram')
const utp = require('../')

tape('dgram-like socket', function (t) {
  const socket = utp()

  socket.on('message', function (buf, rinfo) {
    t.same(rinfo.port, socket.address().port)
    t.same(rinfo.address, '127.0.0.1')
    t.same(buf, Buffer.from('hello'))
    socket.close()
    t.end()
  })

  socket.bind(function () {
    socket.send(Buffer.from('hello'), 0, 5, socket.address().port, '127.0.0.1')
  })
})

tape('double close', function (t) {
  const socket = utp()

  socket.on('close', function () {
    socket.close(function () {
      t.pass('closed twice')
      t.end()
    })
  })

  socket.bind(0, function () {
    socket.close()
  })
})

tape('echo socket', function (t) {
  const socket = utp()

  socket.on('message', function (buf, rinfo) {
    socket.send(buf, 0, buf.length, rinfo.port, rinfo.address)
  })

  socket.bind(function () {
    var other = dgram.createSocket('udp4')
    other.on('message', function (buf, rinfo) {
      t.same(rinfo.port, socket.address().port)
      t.same(rinfo.address, '127.0.0.1')
      t.same(buf, Buffer.from('hello'))
      socket.close()
      other.close()
      t.end()
    })
    other.send(Buffer.from('hello'), 0, 5, socket.address().port, '127.0.0.1')
  })
})

tape('echo socket with resolve', function (t) {
  const socket = utp()

  socket.on('message', function (buf, rinfo) {
    socket.send(buf, 0, buf.length, rinfo.port, 'localhost')
  })

  socket.bind(function () {
    const other = dgram.createSocket('udp4')
    other.on('message', function (buf, rinfo) {
      t.same(rinfo.port, socket.address().port)
      t.same(rinfo.address, '127.0.0.1')
      t.same(buf, Buffer.from('hello'))
      socket.close()
      other.close()
      t.end()
    })
    other.send(Buffer.from('hello'), 0, 5, socket.address().port, '127.0.0.1')
  })
})

tape('combine server and connection', function (t) {
  const socket = utp()
  var gotClient = false

  socket.on('connection', function (client) {
    gotClient = true
    t.same(client.remotePort, socket.address().port)
    t.same(client.remoteAddress, '127.0.0.1')
    client.pipe(client)
  })

  socket.listen(function () {
    var client = socket.connect(socket.address().port)
    client.write('hi')
    client.on('data', function (data) {
      socket.close()
      client.destroy()
      t.same(data, Buffer.from('hi'))
      t.ok(gotClient)
      t.end()
    })
  })
})

tape('both ends write first', function (t) {
  var missing = 2
  const socket = utp()

  socket.on('connection', function (connection) {
    connection.write('a')
    connection.on('data', function (data) {
      t.same(data, Buffer.from('b'))
      connection.end()
      done()
    })
  })

  socket.listen(0, function () {
    var connection = socket.connect(socket.address().port)
    connection.write('b')
    connection.on('data', function (data) {
      t.same(data, Buffer.from('a'))
      connection.end()
      done()
    })
  })

  function done () {
    if (--missing) return
    socket.close()
    t.end()
  }
})
