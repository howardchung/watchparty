# k-rpc

Low-level implementation of the k-rpc protocol used by the BitTorrent DHT.

```
npm install k-rpc
```

Read [BEP 5](http://www.bittorrent.org/beps/bep_0005.html) and [BEP 44](http://www.bittorrent.org/beps/bep_0044.html) for more background info.

[![build status](http://img.shields.io/travis/mafintosh/k-rpc.svg?style=flat)](http://travis-ci.org/mafintosh/k-rpc)

## Usage

``` js
var krpc = require('k-rpc')
var rpc = krpc()

var target = new Buffer('aaaabbbbccccddddeeeeffffaaaabbbbccccdddd', 'hex')

// query the BitTorrent DHT to find nodes near the target buffer
rpc.closest(target, {q: 'get_peers', a: {info_hash: target}}, onreply, done)

function onreply (message, node) {
  console.log('visited peer', message, node)
}

function done () {
  console.log('(done)')
}
```

## API

#### `var rpc = krpc([options])`

Create a new rpc instance. Options include

``` js
{
  // per peer query timeout defaults to 2s
  timeout: 2000,
  // an array of bootstrap nodes. defaults to the BitTorrent bootstrap nodes
  nodes: ['example.com:6881'],
  // how many concurrent queries should be made. defaults to 16
  concurrency: 16,
  // how big should be routing buckets be. defaults to 20.
  k: 20,
  // the local node id. defaults to 20 random bytes
  id: Buffer(...),
  // Length of ID in bytes, defaults to 20 (sha1)
  idLength: 20,
  // optional k-rpc-socket instance
  krpcSocket: krpcSocket(opts)
}
```

#### `rpc.id`

Buffer containing the local node id.

#### `rpc.nodes`

Routing table populated by running `rpc.populate`. This is a [k-bucket](https://github.com/tristanls/k-bucket) instance.

#### `rpc.populate(target, query, [callback])`

Populate the `rpc.nodes` routing table with nodes discovered by looking for other peers close to our own local node id using the specified query. The internal routing table will be used for subsequent closest queries to take load of the bootstrap nodes.

``` js
// send a find_node query
rpc.populate(rpc.id, {q: 'find_node', a: {id: rpc.id, target: rpc.id}}, function () {
  console.log('internal routing table fully populated')
})
```

You should call this method as soon as possible to spread out query load in the DHT.
Callback is called with `(err, numberOfReplies)`.

#### `rpc.closest(target, query, onreply, [callback])`

Find peers close the specified target buffer whilst sending the specified query. `onreply` will be called with `(reply, node)` for every reply received and the callback is called with `(err, totalNumberOfReplies)`.

``` js
// find peers sharing a torrent info_hash
rpc.closest(infoHash, {q: 'get_peers', a: {id: rpc.id: info_hash: infoHash}}, onreply, function () {
  console.log('no more peers to be found')
})

function onreply (message, node) {
  if (message.r && message.r.values) console.log('received peers')
}
```

If a closest query is being executed while a population request in being run the closest query will take priority.

You can return `false` from onreply to stop the query. This is useful if you are only looking for a single peer for example.

``` js
function onreply(message, node) {
  console.log('will only fire once')
  return false
}
```

#### `rpc.query(node, query, callback)`

Query a single node. If the node has a token it is set as `a.token` in the query automatically.
Callback is called with `(err, reply)`.

#### `rpc.queryAll(nodes, query, onreply, callback)`

Query multiple nodes with the same query. `query.a.token` will be set as the corresponding nodes token when querying.
Callback is called with `(err, numberOfReplies)` and `onreply` will be caleld with `(reply, node)` as the nodes reply.

#### `rpc.destroy()`

Destroy the underlying rpc socket.

#### `rpc.on('query', query, node)`

Emitted when a query is received.

#### `rpc.response(node, query, response, [nodes], [callback])`

Send a response to a node for a specific query. If you pass in an array of nodes `{id: nodeId, host: someHost, port: somePort}` they will be added to the response.

#### `rpc.error(node, query, error, [callback])`

Send an error response for a query.

#### `rpc.on('ping', oldNodes, swapNew)`

Emitted when the bucket is full. Try and `oldNodes` and if one
of them fails call `swapNew` with that node to swap if for a newer one

## License

MIT
