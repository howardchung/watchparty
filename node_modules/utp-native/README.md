# utp-native

Native bindings for [libutp](https://github.com/bittorrent/libutp). For more information about utp read [BEP 29](http://www.bittorrent.org/beps/bep_0029.html).

```
npm install utp-native
```

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

## Usage

``` js
const utp = require('utp-native')

const server = utp.createServer(function (socket) {
  socket.pipe(socket) // echo server
})

server.listen(10000, function () {
  const socket = utp.connect(10000)

  socket.write('hello world')
  socket.end()

  socket.on('data', function (data) {
    console.log('echo: ' + data)
  })
  socket.on('end', function () {
    console.log('echo: (ended)')
  })
})
```

## API

There two APIs available. One that mimicks the net core module in Node as much as possible and another one that allows you to reuse the same udp socket for both the client and server. The last one is useful if you plan on using this in combination with NAT hole punching.

## [net](http://nodejs.org/api/net.html)-like API

#### `server = utp.createServer([options], [onconnection])`

Create a new utp server instance.

Options include

```js
{
  allowHalfOpen: true // set to false to disallow half open connections
}
```

#### `server.listen([port], [address], [onlistening])`

Listen for on port. If you don't provide a port or pass in `0` a free port will be used. Optionally you can provide an interface address as well, defaults to `0.0.0.0`.

#### `addr = server.address()`

Returns an address object, `{port, address}` that tell you which port / address this server is bound to.

#### `server.on('listening')`

Emitted when the server is listening

#### `server.on('connection', connection)`

Emitted when a client has connected to this server

#### `server.on('error', err)`

Emitted when a critical error happened

#### `server.close()`

Closes the server.

#### `server.on('close')`

Emitted when the server is fully closed. Note that this will only happen after all connections to the server are closed.

#### `server.maxConnections`

Set this property is you want to limit the max amount of connections you want to receive

#### `server.connections`

An array of all the connections the server has.

#### `server.ref()`

Opposite of unref.

#### `server.unref()`

Unreferences the server from the node event loop.

#### `connection = utp.connect(port, [host], [options])`

Create a new client connection. host defaults to localhost.
The client connection is a duplex stream that you can write / read from.

Options include:

```js
{
  allowHalfOpen: true // set to false to disallow half open connections
}
```

#### `address = connection.address()`

Similar to `server.address`.

#### `connection.remoteAddress`

The address of the remote peer.

#### `connection.remotePort`

The port of the remote peer.

#### `connection.setInteractive(interactive)`

If you don't need every packet as soon as they arrive
set `connection.setInteractive(false)`.

This might greatly improve performance

#### `connection.setContentSize(size)`

Set the expected content size. This will make utp-native
buffer larger chunks of data until `size` bytes have been read.

This might greatly improve performance

#### `connection.setTimeout(ms, [ontimeout])`

Set a continuous timeout. If no packets have been received within `ms`
a timeout event is triggered. Up to you to listen for this event and
potentially destroy the socket. All timeouts are cancelled on socket end.

#### `connection.on('close')`

Emitted when the connection is fully closed.

#### `connection.on('error', err)`

Emitted if an unexpected error happens.

#### `connection.destroy()`

Forcefully destroys the connection.

In addition to this the connection has all the classic stream methods such as `.write` etc.

Note that utp requires the first data message to be sent from the client in a client/server scenario.
In most cases this is what happens anyway but something to be aware of. This module will cork the server stream until it
receives a client message because of that.

## Socket API

The socket api allows you to reuse the same underlying UDP socket to both connect to other clients on accept incoming connections. It also mimicks the node core [dgram socket](https://nodejs.org/api/dgram.html#dgram_class_dgram_socket) api.

#### `socket = utp([options])`

Create a new utp socket.

Options include:

```js
{
  allowHalfOpen: true // set to false to disallow half open connections
}
```

#### `socket.bind([port], [host], [onlistening])`

Bind the socket.

#### `socket.on('listening')`

Emitted when the socket is bound.

#### `socket.send(buf, offset, len, port, host, [callback])`

Send a udp message.

#### `socket.on('message', buffer, rinfo)`

Listen for a udp message.

#### `socket.close()`

Close the socket.

#### `address = socket.address()`

Returns an address object, `{port, address}` that tell you which port / address this socket is bound to.

#### `socket.on('close')`

Emitted when the socket is fully closed.

#### `socket.on('error')`

Emitted if the socket experiences an error.

#### `socket.listen([port], [host], [onlistening])`

Start listening for incoming connections. Performs a bind as well.

#### `socket.on('connection', connection)`

Emitted after you start listening and a client connects to this socket.
Connection is similar to the connection used in the net api.

#### `connection = socket.connect(port, host)`

Connect to another socket. Connection is similar to the connection used in the net api.

#### `socket.unref()`

Dereference the socket from the node event loop.

#### `socket.ref()`

Opposite of `socket.unref()`

## Development

When developing you'll need to install the build tools based on your platform to make node-gyp run.
Then run:

```sh
npm run fetch-libutp
```

This will fetch the libutp dependency as a gitsubmodule.
Then build it using

```sh
npm install
```

To rebuild it simply do:

```sh
node-gyp build
```

## License

MIT
