# k-rpc-socket

Low level implementation of the k-rpc network layer that the [BitTorrent DHT](http://www.bittorrent.org/beps/bep_0005.html) uses.
Mostly extracted from the [bittorrent-dht](https://github.com/feross/bittorrent-dht) module on npm into its own repo.

```
npm install k-rpc-socket
```

[![build status](http://travis-ci.org/mafintosh/k-rpc-socket.svg?branch=master)](http://travis-ci.org/mafintosh/k-rpc-socket)

## Usage

``` js
var rpc = require('k-rpc-socket')

var socket = rpc()

socket.on('query', function (query, peer) {
  socket.response(peer, query, {echo: query.a})
})

socket.bind(10000, function () {
  var anotherSocket = rpc()
  anotherSocket.query({host: '127.0.0.1', port: 10000}, {q: 'echo', a: {hello: 'world'}}, function (err, response) {
    console.log(response.r) // prints {echo: {hello: Buffer('world')}}
  })
})
```

## API

#### `var socket = rpc([options])`

Create a new k-rpc-socket. Options include:

``` js
{
  timeout: queryTimeout, // defaults to 2s
  socket: optionalUdpSocket,
  isIP: optionalBooleanFunction
}
```

#### `socket.send(peer, message, [callback])`

Send a raw message. The callback is called when the message has been flushed from the socket.

#### `var id = socket.query(peer, query, [callback])`

Send a query message. The callback is called with `(err, response, peer, request)`.
You should set the method name you are trying to call as `{q: 'method_name'}` and query data as `{a: someQueryData}`.

The query method returns a query id. You can use this id to cancel the query using the `.cancel` method.

#### `socket.cancel(id)`

Cancel a query. Will call the corresponding query's callback with an error indicating that it was cancelled.

#### `socket.response(peer, query, response, [callback])`

Send a response to a query. The callback is called when the message has been flushed from the socket.

#### `socket.error(peer, query, error, [callback])`

Send an error reploy to a query. The callback is called when the message has been flushed from the socket.

#### `socket.inflight`

Integer representing the number of concurrent queries that are currently pending.

#### `socket.destroy()`

Destroys and unbinds the socket

#### `socket.bind([port], [address], [callback])`

Call this to bind to a specific port. If port is not specified or is 0, the operating system
will attempt to bind to a random port. If address is not specified, the operating system will
attempt to listen on all addresses.

If you don't call this a random free port will be chosen.

#### `socket.on('query', query, peer)`

When a query is received a `query` event is emitted with the query data and a peer object representing the querying peer.

#### `socket.on('warning', error)`

Emitted when a non fatal error has occured. It is safe to ignore this.

#### `socket.on('error', error)`

Emitted when a fatal error has occured.

## License

MIT
