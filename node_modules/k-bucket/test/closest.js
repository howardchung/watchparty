'use strict'
const test = require('tape')
const KBucket = require('../')

test('throws TypeError if contact.id is not a Uint8Array', function (t) {
  t.throws(function () {
    (new KBucket()).closest('foo', 4)
  }, /^TypeError: id is not a Uint8Array$/)
  t.end()
})

test('throw TypeError if n is not number', function (t) {
  t.throws(function () {
    (new KBucket()).closest(Buffer.from([42]), null)
  }, /^TypeError: n is not positive number$/)
  t.end()
})

test('closest nodes are returned', function (t) {
  const kBucket = new KBucket()
  for (let i = 0; i < 0x12; ++i) kBucket.add({ id: Buffer.from([i]) })
  const contact = { id: Buffer.from([0x15]) } // 00010101
  const contacts = kBucket.closest(contact.id, 3)
  t.same(contacts.length, 3)
  t.same(contacts[0].id, Buffer.from([0x11])) // distance: 00000100
  t.same(contacts[1].id, Buffer.from([0x10])) // distance: 00000101
  t.same(contacts[2].id, Buffer.from([0x05])) // distance: 00010000
  t.end()
})

test('n is Infinity by default', function (t) {
  const kBucket = new KBucket({ localNodeId: Buffer.from([0x00, 0x00]) })
  for (let i = 0; i < 1e3; ++i) kBucket.add({ id: Buffer.from([~~(i / 256), i % 256]) })
  t.true(kBucket.closest(Buffer.from([0x80, 0x80])).length > 100)
  t.end()
})

test('closest nodes are returned (including exact match)', function (t) {
  const kBucket = new KBucket()
  for (let i = 0; i < 0x12; ++i) kBucket.add({ id: Buffer.from([i]) })
  const contact = { id: Buffer.from([0x11]) } // 00010001
  const contacts = kBucket.closest(contact.id, 3)
  t.same(contacts[0].id, Buffer.from([0x11])) // distance: 00000000
  t.same(contacts[1].id, Buffer.from([0x10])) // distance: 00000001
  t.same(contacts[2].id, Buffer.from([0x01])) // distance: 00010000
  t.end()
})

test('closest nodes are returned even if there isn\'t enough in one bucket', function (t) {
  const kBucket = new KBucket({ localNodeId: Buffer.from([0x00, 0x00]) })
  for (let i = 0; i < kBucket.numberOfNodesPerKBucket; i++) {
    kBucket.add({ id: Buffer.from([0x80, i]) })
    kBucket.add({ id: Buffer.from([0x01, i]) })
  }
  kBucket.add({ id: Buffer.from([0x00, 0x01]) })
  const contact = { id: Buffer.from([0x00, 0x03]) } // 0000000000000011
  const contacts = kBucket.closest(contact.id, 22)
  t.same(contacts[0].id, Buffer.from([0x00, 0x01])) // distance: 0000000000000010
  t.same(contacts[1].id, Buffer.from([0x01, 0x03])) // distance: 0000000100000000
  t.same(contacts[2].id, Buffer.from([0x01, 0x02])) // distance: 0000000100000010
  t.same(contacts[3].id, Buffer.from([0x01, 0x01]))
  t.same(contacts[4].id, Buffer.from([0x01, 0x00]))
  t.same(contacts[5].id, Buffer.from([0x01, 0x07]))
  t.same(contacts[6].id, Buffer.from([0x01, 0x06]))
  t.same(contacts[7].id, Buffer.from([0x01, 0x05]))
  t.same(contacts[8].id, Buffer.from([0x01, 0x04]))
  t.same(contacts[9].id, Buffer.from([0x01, 0x0b]))
  t.same(contacts[10].id, Buffer.from([0x01, 0x0a]))
  t.same(contacts[11].id, Buffer.from([0x01, 0x09]))
  t.same(contacts[12].id, Buffer.from([0x01, 0x08]))
  t.same(contacts[13].id, Buffer.from([0x01, 0x0f]))
  t.same(contacts[14].id, Buffer.from([0x01, 0x0e]))
  t.same(contacts[15].id, Buffer.from([0x01, 0x0d]))
  t.same(contacts[16].id, Buffer.from([0x01, 0x0c]))
  t.same(contacts[17].id, Buffer.from([0x01, 0x13]))
  t.same(contacts[18].id, Buffer.from([0x01, 0x12]))
  t.same(contacts[19].id, Buffer.from([0x01, 0x11]))
  t.same(contacts[20].id, Buffer.from([0x01, 0x10]))
  t.same(contacts[21].id, Buffer.from([0x80, 0x03])) // distance: 1000000000000000
  // console.log(require('util').inspect(kBucket, false, null))
  t.end()
})
