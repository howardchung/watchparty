'use strict'

const crypto = require('crypto')
const KBucket = require('../')

function getNextId () {
  seed = crypto.createHash('sha256').update(seed).digest()
  return seed
}

let seed = process.env.SEED || crypto.randomBytes(32).toString('hex')
console.log('Seed: ' + seed)
getNextId()
const bucket = new KBucket()
for (let j = 0; j < 1e4; ++j) bucket.add({ id: getNextId() })

console.time('KBucket.closest')
for (let i = 0; i < 1e4; i++) {
  bucket.closest(seed, 10)
}
console.timeEnd('KBucket.closest')
console.log('Memory: ', process.memoryUsage())
