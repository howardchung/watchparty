'use strict'
const test = require('tape')
const KBucket = require('../')

test('throws TypeError if contact has not property id', function (t) {
  t.throws(function () {
    (new KBucket()).add(null)
  }, /^TypeError: contact.id is not a Uint8Array$/)
  t.end()
})

test('throws TypeError if contact.id is not a Uint8Array', function (t) {
  t.throws(function () {
    (new KBucket()).add({ id: 'foo' })
  }, /^TypeError: contact.id is not a Uint8Array$/)
  t.end()
})

test('adding a contact places it in root node', function (t) {
  const kBucket = new KBucket()
  const contact = { id: Buffer.from('a') }
  kBucket.add(contact)
  t.same(kBucket.root.contacts, [contact])
  t.end()
})

test('adding an existing contact does not increase number of contacts in root node', function (t) {
  const kBucket = new KBucket()
  const contact = { id: Buffer.from('a') }
  kBucket.add(contact)
  kBucket.add({ id: Buffer.from('a') })
  t.same(kBucket.root.contacts.length, 1)
  t.end()
})

test('adding same contact moves it to the end of the root node (most-recently-contacted end)', function (t) {
  const kBucket = new KBucket()
  const contact = { id: Buffer.from('a') }
  kBucket.add(contact)
  t.same(kBucket.root.contacts.length, 1)
  kBucket.add({ id: Buffer.from('b') })
  t.same(kBucket.root.contacts.length, 2)
  t.true(kBucket.root.contacts[0] === contact) // least-recently-contacted end
  kBucket.add(contact)
  t.same(kBucket.root.contacts.length, 2)
  t.true(kBucket.root.contacts[1] === contact) // most-recently-contacted end
  t.end()
})

test('adding contact to bucket that can\'t be split results in calling "ping" callback', function (t) {
  t.plan(3 /* numberOfNodesToPing */ + 2)
  const kBucket = new KBucket({ localNodeId: Buffer.from([0x00, 0x00]) })
  let j
  kBucket.on('ping', function (contacts, replacement) {
    t.same(contacts.length, kBucket.numberOfNodesToPing)
    // console.dir(kBucket.root.right.contacts[0])
    for (let i = 0; i < kBucket.numberOfNodesToPing; ++i) {
      // the least recently contacted end of the node should be pinged
      t.true(contacts[i] === kBucket.root.right.contacts[i])
    }
    t.same(replacement, { id: Buffer.from([0x80, j]) })
    t.end()
  })
  for (j = 0; j < kBucket.numberOfNodesPerKBucket + 1; ++j) {
    kBucket.add({ id: Buffer.from([0x80, j]) }) // make sure all go into "far away" node
  }
})

test('should generate event "added" once', function (t) {
  t.plan(1)
  const kBucket = new KBucket()
  const contact = { id: Buffer.from('a') }
  kBucket.on('added', function (newContact) {
    t.same(newContact, contact)
  })
  kBucket.add(contact)
  kBucket.add(contact)
  t.end()
})

test('should generate event "added" when adding to a split node', function (t) {
  t.plan(2)
  const kBucket = new KBucket({
    localNodeId: Buffer.from('') // need non-random localNodeId for deterministic splits
  })
  for (let i = 0; i < kBucket.numberOfNodesPerKBucket + 1; ++i) {
    kBucket.add({ id: Buffer.from('' + i) })
  }
  t.same(kBucket.root.contacts, null)
  const contact = { id: Buffer.from('a') }
  kBucket.on('added', function (newContact) {
    t.same(newContact, contact)
  })
  kBucket.add(contact)
  t.end()
})
