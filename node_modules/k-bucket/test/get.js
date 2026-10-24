'use strict'
const test = require('tape')
const KBucket = require('../')

test('throws TypeError if id is not a Uint8Array', function (t) {
  const kBucket = new KBucket()
  t.throws(function () {
    kBucket.get('foo')
  })
  t.end()
})

test('get retrieves null if no contacts', function (t) {
  const kBucket = new KBucket()
  t.same(kBucket.get(Buffer.from('foo')), null)
  t.end()
})

test('get retrieves a contact that was added', function (t) {
  const kBucket = new KBucket()
  const contact = { id: Buffer.from('a') }
  kBucket.add(contact)
  t.true(Buffer.from('a').equals(kBucket.get(Buffer.from('a')).id))
  t.end()
})

test('get retrieves most recently added contact if same id', function (t) {
  const kBucket = new KBucket()
  const contact = { id: Buffer.from('a'), foo: 'foo', bar: ':p', vectorClock: 0 }
  const contact2 = { id: Buffer.from('a'), foo: 'bar', vectorClock: 1 }
  kBucket.add(contact)
  kBucket.add(contact2)
  t.true(Buffer.from('a').equals(kBucket.get(Buffer.from('a')).id))
  t.same(kBucket.get(Buffer.from('a')).foo, 'bar')
  t.same(kBucket.get(Buffer.from('a')).bar, undefined)
  t.end()
})

test('get retrieves contact from nested leaf node', function (t) {
  const kBucket = new KBucket({ localNodeId: Buffer.from([0x00, 0x00]) })
  let i
  for (i = 0; i < kBucket.numberOfNodesPerKBucket; ++i) {
    kBucket.add({ id: Buffer.from([0x80, i]) }) // make sure all go into "far away" bucket
  }
  // cause a split to happen
  kBucket.add({ id: Buffer.from([0x00, i]), find: 'me' })
  t.same(kBucket.get(Buffer.from([0x00, i])).find, 'me')
  t.end()
})
