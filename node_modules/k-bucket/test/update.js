'use strict'
const test = require('tape')
const KBucket = require('../')

test('invalid index results in exception', function (t) {
  const kBucket = new KBucket()
  const contact = { id: Buffer.from('a') }
  kBucket.add(contact)
  t.throws(function () {
    kBucket._update(contact, 1)
  })
  t.end()
})

test('deprecated vectorClock results in contact drop', function (t) {
  const kBucket = new KBucket()
  const contact = { id: Buffer.from('a'), vectorClock: 3 }
  kBucket.add(contact)
  kBucket._update(kBucket.root, 0, { id: Buffer.from('a'), vectorClock: 2 })
  t.same(kBucket.root.contacts[0].vectorClock, 3)
  t.end()
})

test('equal vectorClock results in contact marked as most recent', function (t) {
  const kBucket = new KBucket()
  const contact = { id: Buffer.from('a'), vectorClock: 3 }
  kBucket.add(contact)
  kBucket.add({ id: Buffer.from('b') })
  kBucket._update(kBucket.root, 0, contact)
  t.same(kBucket.root.contacts[1], contact)
  t.end()
})

test('more recent vectorClock results in contact update and contact being marked as most recent', function (t) {
  const kBucket = new KBucket()
  const contact = { id: Buffer.from('a'), old: 'property', vectorClock: 3 }
  kBucket.add(contact)
  kBucket.add({ id: Buffer.from('b') })
  kBucket._update(kBucket.root, 0, { id: Buffer.from('a'), newer: 'property', vectorClock: 4 })
  t.true(contact.id.equals(kBucket.root.contacts[1].id))
  t.same(kBucket.root.contacts[1].vectorClock, 4)
  t.same(kBucket.root.contacts[1].old, undefined)
  t.same(kBucket.root.contacts[1].newer, 'property')
  t.end()
})

test('should generate "updated"', function (t) {
  t.plan(2)
  const kBucket = new KBucket()
  const contact1 = { id: Buffer.from('a'), vectorClock: 1 }
  const contact2 = { id: Buffer.from('a'), vectorClock: 2 }
  kBucket.on('updated', function (oldContact, newContact) {
    t.same(oldContact, contact1)
    t.same(newContact, contact2)
    t.end()
  })
  kBucket.add(contact1)
  kBucket.add(contact2)
})

test('should generate event "updated" when updating a split node', function (t) {
  t.plan(3)
  const kBucket = new KBucket({
    localNodeId: Buffer.from('') // need non-random localNodeId for deterministic splits
  })
  for (let i = 0; i < kBucket.numberOfNodesPerKBucket + 1; ++i) {
    kBucket.add({ id: Buffer.from('' + i) })
  }
  t.false(kBucket.bucket)
  const contact1 = { id: Buffer.from('a'), vectorClock: 1 }
  const contact2 = { id: Buffer.from('a'), vectorClock: 2 }
  kBucket.on('updated', function (oldContact, newContact) {
    t.same(oldContact, contact1)
    t.same(newContact, contact2)
    t.end()
  })
  kBucket.add(contact1)
  kBucket.add(contact2)
})
