#!/usr/bin/env node
import fs from 'fs'
import minimist from 'minimist'
import createTorrent from '../index.js'

const argv = minimist(process.argv.slice(2), {
  alias: {
    o: 'outfile',
    n: 'name',
    h: 'help',
    v: 'version'
  },
  boolean: [
    'help',
    'version',
    'private'
  ],
  string: [
    'outfile',
    'name',
    'creationDate',
    'comment',
    'createdBy',
    'announce',
    'urlList'
  ],
  default: {
    createdBy: 'WebTorrent <https://webtorrent.io>'
  }
})

const infile = argv._[0]
const outfile = argv.outfile
const help = `usage: create-torrent <directory OR file> [OPTIONS]

Create a torrent file from a directory or file.

If an output file isn't specified with '-o', the torrent file will be
written to stdout.

-o, --outfile    Output file. If not specified, stdout is used [string]
-n, --name       Torrent name [string]
--creationDate   Creation date [Date]
--comment        Torrent comment [string]
--createdBy      Created by client [string]
--private        Private torrent? [boolean] [default: false]
--pieceLength    Piece length [number] [default: reasonable length]
--announce       Tracker url [string] [default: reasonable trackers]
--urlList        Web seed url [string]`

if (argv.version) {
  console.log(require('../package.json').version)
  process.exit(0)
}

if (!infile || argv.help) {
  console.log(help)
  process.exit(0)
}

createTorrent(infile, argv, (err, torrent) => {
  if (err) {
    console.error(err.stack)
    process.exit(1)
  } else if (outfile) {
    fs.writeFile(outfile, torrent, err => {
      if (err) {
        console.error(err.stack)
        process.exit(1)
      }
    })
  } else {
    process.stdout.write(torrent)
  }
})
