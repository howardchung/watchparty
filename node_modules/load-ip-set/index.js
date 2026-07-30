/*! load-ip-set. MIT License. WebTorrent LLC <https://webtorrent.io/opensource> */
import fs from 'fs'
import fetch from 'cross-fetch-ponyfill'
import IPSet from 'ip-set'
import { Netmask } from 'netmask'
import once from 'once'
import split from 'split'
import zlib from 'zlib'
import queueMicrotask from 'queue-microtask'

// Match single IPs and IP ranges (IPv4 and IPv6), with or without a description
const ipSetRegex = /^\s*(?:[^#].*?\s*:\s*)?([a-f0-9.:]+)(?:\s*-\s*([a-f0-9.:]+))?\s*$/

// Match CIDR IPv4 ranges in the form A.B.C.D/E, with or without a description
const cidrRegex = /^\s*(?:[^#].*?\s*:\s*)?([0-9.:]+)\/([0-9]{1,2})\s*$/

async function loadIPSet (input, opts, cb) {
  if (typeof opts === 'function') return loadIPSet(input, {}, opts)
  cb = once(cb)

  if (Array.isArray(input) || !input) {
    queueMicrotask(() => {
      cb(null, new IPSet(input))
    })
  } else if (/^https?:\/\//.test(input)) {
    let res = null
    try {
      res = await fetch(input, opts)
    } catch (err) {
      return cb(err)
    }
    const text = await res.text()
    const blocklist = []
    for (const line of text.split('\n')) {
      handleLine(line, blocklist)
    }
    cb(null, new IPSet(blocklist))
  } else {
    let f = fs.createReadStream(input).on('error', cb)
    if (/.gz$/.test(input)) f = f.pipe(zlib.Gunzip())
    onStream(f)
  }
  function handleLine (line, blocklist) {
    let match = ipSetRegex.exec(line)
    if (match) {
      blocklist.push({ start: match[1], end: match[2] })
    } else {
      match = cidrRegex.exec(line)
      if (match) {
        const range = new Netmask(`${match[1]}/${match[2]}`)
        blocklist.push({ start: range.first, end: range.broadcast || range.last })
      }
    }
  }

  function onStream (stream) {
    const blocklist = []
    stream
      .on('error', cb)
      .pipe(split())
      .on('data', line => {
        handleLine(line, blocklist)
      })
      .on('end', () => {
        cb(null, new IPSet(blocklist))
      })
  }
}

export default loadIPSet
