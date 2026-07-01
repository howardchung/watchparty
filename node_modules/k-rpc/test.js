var krpc = require('./')
var tape = require('tape')

tape('query + reply', function (t) {
  var server = krpc()

  server.on('query', function (query, peer) {
    t.same(query.q.toString(), 'echo')
    t.same(query.a.hello, 42)
    server.response(peer, query, { hello: 42 })
  })

  server.bind(0, function () {
    var id = Buffer.from('aaaabbbbccccddddeeeeaaaabbbbccccddddeeee', 'hex')
    var client = krpc({
      nodes: ['localhost:' + server.address().port]
    })

    client.closest(id, { q: 'echo', a: { hello: 42 } }, onreply, function (err, n) {
      server.destroy()
      client.destroy()
      t.error(err)
      t.same(n, 1)
      t.end()
    })

    function onreply (message, node) {
      t.same(node.address, '127.0.0.1')
      t.same(node.port, server.address().port)
      t.same(message.r.hello, 42)
    }
  })
})

tape('query + closest', function (t) {
  var server = krpc()
  var other = krpc()
  var visitedOther = false

  other.on('query', function (query, peer) {
    visitedOther = true
    t.same(query.q.toString(), 'echo')
    t.same(query.a.hello, 42)
    server.response(peer, query, { hello: 42 })
  })

  server.on('query', function (query, peer) {
    t.same(query.q.toString(), 'echo')
    t.same(query.a.hello, 42)
    server.response(peer, query, { hello: 42 }, [{ host: '127.0.0.1', port: other.address().port, id: other.id }])
  })

  other.bind(0, function () {
    server.bind(0, function () {
      var replies = 2
      var id = Buffer.from('aaaabbbbccccddddeeeeaaaabbbbccccddddeeee', 'hex')
      var client = krpc({
        nodes: ['localhost:' + server.address().port, 'localhost:' + other.address().port]
      })

      client.closest(id, { q: 'echo', a: { hello: 42 } }, onreply, function (err, n) {
        server.destroy()
        client.destroy()
        other.destroy()
        t.error(err)
        t.same(replies, 0)
        t.same(n, 2)
        t.ok(visitedOther)
        t.end()
      })

      function onreply (message, node) {
        replies--
        t.same(message.r.hello, 42)
      }
    })
  })
})
