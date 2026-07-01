#!/usr/bin/env node

const socket = require('./')({ allowHalfOpen: false })
var host = null
var port = 0

for (var i = 2; i < process.argv.length; i++) {
  if (process.argv[i][0] !== '-') {
    const parts = process.argv[i].split(':')
    port = Number(parts.pop()) || 0
    host = parts.pop()
  }
}

if (process.argv.indexOf('-l') > -1) {
  socket.listen(port)
  socket.maxConnections = 1
  socket.on('connection', onconnection)
} else {
  if (!port) {
    console.error('Usage: ucat [-l] host:port')
    process.exit(1)
  }
  onconnection(socket.connect(port, host))
}

function onconnection (connection) {
  process.stdin.pipe(connection).pipe(process.stdout)
  connection.on('end', function () {
    process.exit()
  })
  connection.on('close', function () {
    process.exit()
  })
  process.once('SIGINT', function () {
    connection.end()
  })
}
