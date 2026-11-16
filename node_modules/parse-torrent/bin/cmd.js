#!/usr/bin/env node

import stdin from 'get-stdin'
import { remote } from '../index.js'

function usage () {
  console.error('Usage: parse-torrent /path/to/torrent')
  console.error('       parse-torrent magnet_uri')
  console.error('       parse-torrent --stdin')
  console.error('       parse-torrent --raw /path/to/torrent')
  console.error('       parse-torrent --raw magnet_uri')
}

function error (err) {
  console.error(err.message)
  process.exit(1)
}

const args = process.argv.slice(2)

if (!args[0] || args.includes('--help')) {
  usage()
  process.exit(1)
}

if (args.includes('--stdin') || args.includes('-')) stdin.buffer().then(onTorrentId).catch(error)
else if (args.includes() === '--version' || args.includes('-v')) console.log(require('../package.json').version)
else onTorrentId(args[args.length - 1])

function onTorrentId (torrentId) {
  remote(torrentId, function (err, parsedTorrent) {
    if (err) return error(err)

    if (args.includes('--raw')) {
      recursiveStringify(parsedTorrent.info)
    } else {
      delete parsedTorrent.info
    }

    delete parsedTorrent.infoBuffer
    delete parsedTorrent.infoHashBuffer

    console.log(JSON.stringify(parsedTorrent, undefined, 2))
  })
}

function recursiveStringify (obj) {
  for (const key of Object.keys(obj)) {
    if (!Buffer.isBuffer(obj[key]) &&
        typeof obj[key] === 'object' && obj[key] !== null) {
      recursiveStringify(obj[key])
    } else {
      obj[key] = obj[key].toString()
    }
  }
}
