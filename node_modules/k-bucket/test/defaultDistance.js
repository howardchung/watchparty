'use strict'
const test = require('tape')
const KBucket = require('../')

const bucket = new KBucket()

test('distance between 00000000 and 00000000 is 00000000', function (t) {
  t.same(bucket.distance(Buffer.from([0x00]), Buffer.from([0x00])), 0)
  t.end()
})

test('distance between 00000000 and 00000001 is 00000001', function (t) {
  t.same(bucket.distance(Buffer.from([0x00]), Buffer.from([0x01])), 1)
  t.end()
})

test('distance between 00000010 and 00000001 is 00000011', function (t) {
  t.same(bucket.distance(Buffer.from([0x02]), Buffer.from([0x01])), 3)
  t.end()
})

test('distance between 00000000 and 0000000000000000 is 0000000011111111', function (t) {
  t.same(bucket.distance(Buffer.from([0x00]), Buffer.from([0x00, 0x00])), 255)
  t.end()
})

test('distance between 0000000100100100 and 0100000000100100 is 0100000100000000', function (t) {
  t.same(bucket.distance(Buffer.from([0x01, 0x24]), Buffer.from([0x40, 0x24])), 16640)
  t.end()
})
