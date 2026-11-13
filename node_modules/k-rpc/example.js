var krpc = require('./')
var rpc = krpc()

var target = Buffer.from('aaaabbbbccccddddeeeeffffaaaabbbbccccdddd', 'hex')

rpc.on('query', function (query, peer) {
  // console.log(query, peer)
})

var then = Date.now()

rpc.populate(rpc.id, { q: 'find_node', a: { id: rpc.id, target: rpc.id } }, function () {
  console.log('(populated)', Date.now() - then)
})

rpc.closest(target, { q: 'get_peers', a: { info_hash: target } }, visit, function (_, n) {
  console.log('(closest)', Date.now() - then, n)
})

function visit (res, peer) {
  var peers = res.r.values ? parsePeers(res.r.values) : []
  if (peers.length) console.log('count peers:', peers.length)
}

function parsePeers (buf) {
  var peers = []

  try {
    for (var i = 0; i < buf.length; i++) {
      var port = buf[i].readUInt16BE(4)
      if (!port) continue
      peers.push({
        host: parseIp(buf[i], 0),
        port: port
      })
    }
  } catch (err) {
    // do nothing
  }

  return peers
}

function parseIp (buf, offset) {
  return buf[offset++] + '.' + buf[offset++] + '.' + buf[offset++] + '.' + buf[offset++]
}
