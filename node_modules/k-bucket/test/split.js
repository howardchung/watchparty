'use strict'
const test = require('tape')
const KBucket = require('../')

test('adding a contact does not split node', function (t) {
  const kBucket = new KBucket()
  kBucket.add({ id: Buffer.from('a') })
  t.same(kBucket.root.left, null)
  t.same(kBucket.root.right, null)
  t.notSame(kBucket.root.contacts, null)
  t.end()
})

test('adding maximum number of contacts (per node) [20] into node does not split node', function (t) {
  const kBucket = new KBucket()
  for (let i = 0; i < kBucket.numberOfNodesPerKBucket; ++i) {
    kBucket.add({ id: Buffer.from('' + i) })
  }
  t.same(kBucket.root.left, null)
  t.same(kBucket.root.right, null)
  t.notSame(kBucket.root.contacts, null)
  t.end()
})

test('adding maximum number of contacts (per node) + 1 [21] into node splits the node', function (t) {
  const kBucket = new KBucket()
  for (let i = 0; i < kBucket.numberOfNodesPerKBucket + 1; ++i) {
    kBucket.add({ id: Buffer.from('' + i) })
  }
  t.notSame(kBucket.root.left, null)
  t.notSame(kBucket.root.right, null)
  t.same(kBucket.root.contacts, null)
  t.end()
})

test('split nodes contain all added contacts', function (t) {
  t.plan(20 /* numberOfNodesPerKBucket */ + 2)
  const kBucket = new KBucket({ localNodeId: Buffer.from([0x00]) })
  const foundContact = {}
  for (let i = 0; i < kBucket.numberOfNodesPerKBucket + 1; ++i) {
    kBucket.add({ id: Buffer.from([i]) })
    foundContact[i] = false
  }
  const traverse = function (node) {
    if (node.contacts === null) {
      traverse(node.left)
      traverse(node.right)
    } else {
      node.contacts.forEach(function (contact) {
        foundContact[parseInt(contact.id.toString('hex'), 16)] = true
      })
    }
  }
  traverse(kBucket.root)
  Object.keys(foundContact).forEach(function (key) { t.true(foundContact[key], key) })
  t.same(kBucket.root.contacts, null)
  t.end()
})

test('when splitting nodes the "far away" node should be marked to prevent splitting "far away" node', function (t) {
  t.plan(5)
  const kBucket = new KBucket({ localNodeId: Buffer.from([0x00]) })
  for (let i = 0; i < kBucket.numberOfNodesPerKBucket + 1; ++i) {
    kBucket.add({ id: Buffer.from([i]) })
  }
  // above algorithm will split left node 4 times and put 0x00 through 0x0f
  // in the left node, and put 0x10 through 0x14 in right node
  // since localNodeId is 0x00, we expect every right node to be "far" and
  // therefore marked as "dontSplit = true"
  // there will be one "left" node and four "right" nodes (t.expect(5))
  const traverse = function (node, dontSplit) {
    if (node.contacts === null) {
      traverse(node.left, false)
      traverse(node.right, true)
    } else {
      if (dontSplit) t.true(node.dontSplit)
      else t.false(node.dontSplit)
    }
  }
  traverse(kBucket.root)
  t.end()
})
