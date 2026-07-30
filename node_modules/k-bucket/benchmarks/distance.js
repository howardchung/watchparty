'use strict'
const KBucket = require('../index')

const _0000000100100100 = Buffer.from('0124', 'hex')
const _0100000000100100 = Buffer.from('4024', 'hex')

const hrtime = process.hrtime()
for (let i = 0; i < 1e7; i++) {
  KBucket.distance(_0000000100100100, _0100000000100100)
}
const diff = process.hrtime(hrtime)
console.log(diff[0] * 1e9 + diff[1])
