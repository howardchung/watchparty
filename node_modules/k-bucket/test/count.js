'use strict'
const test = require('tape')
const KBucket = require('../')

test('count returns 0 when no contacts in bucket', function (t) {
  const kBucket = new KBucket()
  t.same(kBucket.count(), 0)
  t.end()
})

test('count returns 1 when 1 contact in bucket', function (t) {
  const kBucket = new KBucket()
  const contact = { id: Buffer.from('a') }
  kBucket.add(contact)
  t.same(kBucket.count(), 1)
  t.end()
})

test('count returns 1 when same contact added to bucket twice', function (t) {
  const kBucket = new KBucket()
  const contact = { id: Buffer.from('a') }
  kBucket.add(contact)
  kBucket.add(contact)
  t.same(kBucket.count(), 1)
  t.end()
})

test('count returns number of added unique contacts', function (t) {
  const kBucket = new KBucket()
  kBucket.add({ id: Buffer.from('a') })
  kBucket.add({ id: Buffer.from('a') })
  kBucket.add({ id: Buffer.from('b') })
  kBucket.add({ id: Buffer.from('b') })
  kBucket.add({ id: Buffer.from('c') })
  kBucket.add({ id: Buffer.from('d') })
  kBucket.add({ id: Buffer.from('c') })
  kBucket.add({ id: Buffer.from('d') })
  kBucket.add({ id: Buffer.from('e') })
  kBucket.add({ id: Buffer.from('f') })
  t.same(kBucket.count(), 6)
  t.end()
})
