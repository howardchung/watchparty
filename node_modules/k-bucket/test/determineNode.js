'use strict'
const test = require('tape')
const KBucket = require('../')

const LEFT_NODE = 0
const RIGHT_NODE = 1
const ROOT_NODE = { left: LEFT_NODE, right: RIGHT_NODE }

test('id 00000000, bitIndex 0, should be low', function (t) {
  const kBucket = new KBucket()
  t.same(kBucket._determineNode(ROOT_NODE, Buffer.from([0x00]), 0), LEFT_NODE)
  t.end()
})

test('id 01000000, bitIndex 0, should be low', function (t) {
  const kBucket = new KBucket()
  t.same(kBucket._determineNode(ROOT_NODE, Buffer.from([0x40]), 0), LEFT_NODE)
  t.end()
})

test('id 01000000, bitIndex 1, should be high', function (t) {
  const kBucket = new KBucket()
  t.same(kBucket._determineNode(ROOT_NODE, Buffer.from([0x40]), 1), RIGHT_NODE)
  t.end()
})

test('id 01000000, bitIndex 2, should be low', function (t) {
  const kBucket = new KBucket()
  t.same(kBucket._determineNode(ROOT_NODE, Buffer.from([0x40]), 2), LEFT_NODE)
  t.end()
})

test('id 01000000, bitIndex 9, should be low', function (t) {
  const kBucket = new KBucket()
  t.same(kBucket._determineNode(ROOT_NODE, Buffer.from([0x40]), 9), LEFT_NODE)
  t.end()
})

test('id 01000001, bitIndex 7, should be high', function (t) {
  const kBucket = new KBucket()
  t.same(kBucket._determineNode(ROOT_NODE, Buffer.from([0x41]), 7), RIGHT_NODE)
  t.end()
})

test('id 0100000100000000, bitIndex 7, should be high', function (t) {
  const kBucket = new KBucket()
  t.same(kBucket._determineNode(ROOT_NODE, Buffer.from([0x41, 0x00]), 7), RIGHT_NODE)
  t.end()
})

test('id 000000000100000100000000, bitIndex 15, should be high', function (t) {
  const kBucket = new KBucket()
  t.same(kBucket._determineNode(ROOT_NODE, Buffer.from([0x00, 0x41, 0x00]), 15), RIGHT_NODE)
  t.end()
})
