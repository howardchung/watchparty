const test = require('tape')
const blockIterator = require('../')
const fs = require('fs')

test('basic test', async t => {
  const fstr = fs.createReadStream(__filename)

  let stat
  t.doesNotThrow(() => {
    stat = fs.statSync(__filename)
  }, 'stat should not throw')

  let totalBytes = 0
  for await (const data of blockIterator(fstr, 16)) {
    t.equal(data.length, 16, 'chunks should be 16 bytes long')
    totalBytes += data.length
  }
  const expectedBytes = stat.size + (16 - stat.size % 16)
  t.equal(totalBytes, expectedBytes, 'Should be multiple of 16')
  t.end()
})
