const utp = require('./')

const server = utp.createServer(function (socket) {
  console.log('Server received socket')
  socket.pipe(socket)
})

server.listen(9000, function () {
  console.log('Server is listening on port %d', server.address().port)

  const socket = utp.connect(9000)

  socket.write('hello world')
  socket.end()

  socket.on('data', function (data) {
    console.log('echo:', data.toString())
  })

  socket.on('end', function () {
    console.log('echo: (ended)')
  })
})
