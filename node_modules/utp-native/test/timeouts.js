const tape = require('tape')
const dgram = require('dgram')
const utp = require('../')

tape('connection timeout. this may take >20s', function (t) {
  const socket = dgram.createSocket('udp4')
  socket.bind(0, function () {
    const connection = utp.connect(socket.address().port)
    connection.on('error', function (err) {
      socket.close()
      t.same(err.message, 'UTP_ETIMEDOUT')
      t.end()
    })
  })
})

tape('write timeout. this may take >20s', function (t) {
  const server = utp.createServer()
  var connection

  server.on('connection', function (socket) {
    t.pass('server received connection')
    server.close()
    socket.destroy()
  })

  server.on('close', function () {
    connection.write('hello?')
  })

  server.listen(function () {
    connection = utp.connect(server.address().port)
    connection.on('connect', function () {
      t.pass('connected to server')
    })
    connection.on('error', function (err) {
      t.same(err.message, 'UTP_ETIMEDOUT')
      t.end()
    })
  })
})

tape('server max connections. this may take >20s', function (t) {
  var inc = 0
  const server = utp.createServer({ allowHalfOpen: false }, function (socket) {
    inc++
    t.ok(inc < 3)
    socket.write('hi')
  })

  server.maxConnections = 2
  server.listen(0, function () {
    var a = utp.connect(server.address().port)
    a.write('hi')
    a.on('connect', function () {
      var b = utp.connect(server.address().port)
      b.write('hi')
      b.on('connect', function () {
        var c = utp.connect(server.address().port)
        c.write('hi')
        c.on('connect', function () {
          t.fail('only 2 connections')
        })
        c.on('error', function () {
          a.destroy()
          b.destroy()
          c.destroy()
          server.close()
          t.pass('should error')
          t.end()
        })
      })
    })
  })
})
