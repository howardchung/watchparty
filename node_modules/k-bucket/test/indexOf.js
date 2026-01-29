'use strict'
const test = require('tape')
const KBucket = require('../')

test('indexOf returns a contact with id that contains the same byte sequence as the test contact', function (t) {
  const kBucket = new KBucket()
  kBucket.add({ id: Buffer.from('a') })
  t.same(kBucket._indexOf(kBucket.root, Buffer.from('a')), 0)
  t.end()
})

test('indexOf returns -1 if contact is not found', function (t) {
  const kBucket = new KBucket()
  kBucket.add({ id: Buffer.from('a') })
  t.same(kBucket._indexOf(kBucket.root, Buffer.from('b')), -1)
  t.end()
})
