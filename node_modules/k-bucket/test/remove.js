'use strict'
const test = require('tape')
const KBucket = require('../')

test('throws TypeError if contact.id is not a Uint8Array', function (t) {
  const kBucket = new KBucket()
  const contact = { id: 'foo' }
  t.throws(function () {
    kBucket.remove(contact.id)
  })
  t.end()
})

test('removing a contact should remove contact from nested buckets', function (t) {
  const kBucket = new KBucket({ localNodeId: Buffer.from([0x00, 0x00]) })
  let i
  for (i = 0; i < kBucket.numberOfNodesPerKBucket; ++i) {
    kBucket.add({ id: Buffer.from([0x80, i]) }) // make sure all go into "far away" bucket
  }
  // cause a split to happen
  kBucket.add({ id: Buffer.from([0x00, i]) })
  // console.log(require('util').inspect(kBucket, false, null))
  const contactToDelete = { id: Buffer.from([0x80, 0x00]) }
  t.same(kBucket._indexOf(kBucket.root.right, contactToDelete.id), 0)
  kBucket.remove(Buffer.from([0x80, 0x00]))
  t.same(kBucket._indexOf(kBucket.root.right, contactToDelete.id), -1)
  t.end()
})

test('should generate "removed"', function (t) {
  t.plan(1)
  const kBucket = new KBucket()
  const contact = { id: Buffer.from('a') }
  kBucket.on('removed', function (removedContact) {
    t.same(removedContact, contact)
    t.end()
  })
  kBucket.add(contact)
  kBucket.remove(contact.id)
})

test('should generate event "removed" when removing from a split bucket', function (t) {
  t.plan(2)
  const kBucket = new KBucket({
    localNodeId: Buffer.from('') // need non-random localNodeId for deterministic splits
  })
  for (let i = 0; i < kBucket.numberOfNodesPerKBucket + 1; ++i) {
    kBucket.add({ id: Buffer.from('' + i) })
  }
  t.false(kBucket.bucket)
  const contact = { id: Buffer.from('a') }
  kBucket.on('removed', function (removedContact) {
    t.same(removedContact, contact)
    t.end()
  })
  kBucket.add(contact)
  kBucket.remove(contact.id)
})
