/*! create-torrent. MIT License. WebTorrent LLC <https://webtorrent.io/opensource> */
import bencode from 'bencode'
import blockIterator from 'block-iterator'
import calcPieceLength from 'piece-length'
import corePath from 'path'
import isFile from 'is-file'
import { isJunk } from 'junk'
import joinIterator from 'join-async-iterator'
import parallel from 'run-parallel'
import queueMicrotask from 'queue-microtask'
import { hash, hex2arr } from 'uint8-util'
import 'fast-readable-async-iterator'

import getFiles from './get-files.js' // browser exclude

const announceList = [
  ['udp://tracker.leechers-paradise.org:6969'],
  ['udp://tracker.coppersurfer.tk:6969'],
  ['udp://tracker.opentrackr.org:1337'],
  ['udp://explodie.org:6969'],
  ['udp://tracker.empire-js.us:1337'],
  ['wss://tracker.btorrent.xyz'],
  ['wss://tracker.openwebtorrent.com'],
  ['wss://tracker.webtorrent.dev']
]

/**
 * Create a torrent.
 * @param  {string|File|FileList|Buffer|Stream|Array.<string|File|Buffer|Stream>} input
 * @param  {Object} opts
 * @param  {string=} opts.name
 * @param  {Date=} opts.creationDate
 * @param  {string=} opts.comment
 * @param  {string=} opts.createdBy
 * @param  {boolean|number=} opts.private
 * @param  {number=} opts.pieceLength
 * @param  {number=} opts.maxPieceLength
 * @param  {Array.<Array.<string>>=} opts.announceList
 * @param  {Array.<string>=} opts.urlList
 * @param  {Object=} opts.info
 * @param  {Function} opts.onProgress
 * @param  {function} cb
 * @return {Buffer} buffer of .torrent file data
 */
function createTorrent (input, opts, cb) {
  if (typeof opts === 'function') [opts, cb] = [cb, opts]
  opts = opts ? Object.assign({}, opts) : {}

  _parseInput(input, opts, (err, files, singleFileTorrent) => {
    if (err) return cb(err)
    opts.singleFileTorrent = singleFileTorrent
    onFiles(files, opts, cb)
  })
}

function parseInput (input, opts, cb) {
  if (typeof opts === 'function') [opts, cb] = [cb, opts]
  opts = opts ? Object.assign({}, opts) : {}
  _parseInput(input, opts, cb)
}

const pathSymbol = Symbol('itemPath')

/**
 * Parse input file and return file information.
 */
function _parseInput (input, opts, cb) {
  if (isFileList(input)) input = Array.from(input)
  if (!Array.isArray(input)) input = [input]

  if (input.length === 0) throw new Error('invalid input type')

  input.forEach(item => {
    if (item == null) throw new Error(`invalid input type: ${item}`)
  })

  // In Electron, use the true file path
  input = input.map(item => {
    if (isBlob(item) && typeof item.path === 'string' && typeof getFiles === 'function') return item.path
    return item
  })

  // If there's just one file, allow the name to be set by `opts.name`
  if (input.length === 1 && typeof input[0] !== 'string' && !input[0].name) input[0].name = opts.name

  let commonPrefix = null
  input.forEach((item, i) => {
    if (typeof item === 'string') {
      return
    }

    let path = item.fullPath || item.name
    if (!path) {
      path = `Unknown File ${i + 1}`
      item.unknownName = true
    }

    item[pathSymbol] = path.split('/')

    // Remove initial slash
    if (!item[pathSymbol][0]) {
      item[pathSymbol].shift()
    }

    if (item[pathSymbol].length < 2) { // No real prefix
      commonPrefix = null
    } else if (i === 0 && input.length > 1) { // The first file has a prefix
      commonPrefix = item[pathSymbol][0]
    } else if (item[pathSymbol][0] !== commonPrefix) { // The prefix doesn't match
      commonPrefix = null
    }
  })

  const filterJunkFiles = opts.filterJunkFiles === undefined ? true : opts.filterJunkFiles
  if (filterJunkFiles) {
    // Remove junk files
    input = input.filter(item => {
      if (typeof item === 'string') {
        return true
      }
      return !isJunkPath(item[pathSymbol])
    })
  }

  if (commonPrefix) {
    input.forEach(item => {
      const pathless = (ArrayBuffer.isView(item) || isReadable(item)) && !item[pathSymbol]
      if (typeof item === 'string' || pathless) return
      item[pathSymbol].shift()
    })
  }

  if (!opts.name && commonPrefix) {
    opts.name = commonPrefix
  }

  if (!opts.name) {
    // use first user-set file name
    input.some(item => {
      if (typeof item === 'string') {
        opts.name = corePath.basename(item)
        return true
      } else if (!item.unknownName) {
        opts.name = item[pathSymbol][item[pathSymbol].length - 1]
        return true
      }
      return false
    })
  }

  if (!opts.name) {
    opts.name = `Unnamed Torrent ${Date.now()}`
  }

  if (!opts.maxPieceLength) {
    opts.maxPieceLength = 4 * 1024 * 1024
  }

  const numPaths = input.reduce((sum, item) => sum + Number(typeof item === 'string'), 0)

  let isSingleFileTorrent = (input.length === 1)

  if (input.length === 1 && typeof input[0] === 'string') {
    if (typeof getFiles !== 'function') {
      throw new Error('filesystem paths do not work in the browser')
    }
    // If there's a single path, verify it's a file before deciding this is a single
    // file torrent
    isFile(input[0], (err, pathIsFile) => {
      if (err) return cb(err)
      isSingleFileTorrent = pathIsFile
      processInput()
    })
  } else {
    queueMicrotask(processInput)
  }

  function processInput () {
    parallel(input.map(item => cb => {
      const file = {}

      if (isBlob(item)) {
        file.getStream = item.stream()
        file.length = item.size
      } else if (ArrayBuffer.isView(item)) {
        file.getStream = [item] // wrap in iterable to write entire buffer at once instead of unwrapping all bytes
        file.length = item.length
      } else if (isReadable(item)) {
        file.getStream = getStreamStream(item, file)
        file.length = 0
      } else if (typeof item === 'string') {
        if (typeof getFiles !== 'function') {
          throw new Error('filesystem paths do not work in the browser')
        }
        const keepRoot = numPaths > 1 || isSingleFileTorrent
        getFiles(item, keepRoot, cb)
        return // early return!
      } else {
        throw new Error('invalid input type')
      }
      file.path = item[pathSymbol]
      cb(null, file)
    }), (err, files) => {
      if (err) return cb(err)
      files = files.flat()
      cb(null, files, isSingleFileTorrent)
    })
  }
}

const MAX_OUTSTANDING_HASHES = 5

async function getPieceList (files, pieceLength, estimatedTorrentLength, opts, cb) {
  const pieces = []
  let length = 0
  let hashedLength = 0

  const streams = files.map(file => file.getStream)

  const onProgress = opts.onProgress

  let remainingHashes = 0
  let pieceNum = 0
  let ended = false

  const iterator = blockIterator(joinIterator(streams), pieceLength, { zeroPadding: false })
  try {
    for await (const chunk of iterator) {
      await new Promise(resolve => {
        length += chunk.length
        const i = pieceNum
        ++pieceNum
        if (++remainingHashes < MAX_OUTSTANDING_HASHES) resolve()
        hash(chunk, 'hex').then(hash => {
          pieces[i] = hash
          --remainingHashes
          hashedLength += chunk.length
          if (onProgress) onProgress(hashedLength, estimatedTorrentLength)
          resolve()
          if (ended && remainingHashes === 0) cb(null, hex2arr(pieces.join('')), length)
        })
      })
    }
    if (remainingHashes === 0) return cb(null, hex2arr(pieces.join('')), length)
    ended = true
  } catch (err) {
    cb(err)
  }
}

function onFiles (files, opts, cb) {
  let _announceList = opts.announceList

  if (!_announceList) {
    if (typeof opts.announce === 'string') _announceList = [[opts.announce]]
    else if (Array.isArray(opts.announce)) {
      _announceList = opts.announce.map(u => [u])
    }
  }

  if (!_announceList) _announceList = []

  if (globalThis.WEBTORRENT_ANNOUNCE) {
    if (typeof globalThis.WEBTORRENT_ANNOUNCE === 'string') {
      _announceList.push([[globalThis.WEBTORRENT_ANNOUNCE]])
    } else if (Array.isArray(globalThis.WEBTORRENT_ANNOUNCE)) {
      _announceList = _announceList.concat(globalThis.WEBTORRENT_ANNOUNCE.map(u => [u]))
    }
  }

  // When no trackers specified, use some reasonable defaults
  if (opts.announce === undefined && opts.announceList === undefined) {
    _announceList = _announceList.concat(announceList)
  }

  if (typeof opts.urlList === 'string') opts.urlList = [opts.urlList]

  const torrent = {
    info: {
      name: opts.name
    },
    'creation date': Math.ceil((Number(opts.creationDate) || Date.now()) / 1000),
    encoding: 'UTF-8'
  }

  if (_announceList.length !== 0) {
    torrent.announce = _announceList[0][0]
    torrent['announce-list'] = _announceList
  }

  if (opts.comment !== undefined) torrent.comment = opts.comment

  if (opts.createdBy !== undefined) torrent['created by'] = opts.createdBy

  if (opts.private !== undefined) torrent.info.private = Number(opts.private)

  if (opts.info !== undefined) Object.assign(torrent.info, opts.info)

  // "ssl-cert" key is for SSL torrents, see:
  //   - http://blog.libtorrent.org/2012/01/bittorrent-over-ssl/
  //   - http://www.libtorrent.org/manual-ref.html#ssl-torrents
  //   - http://www.libtorrent.org/reference-Create_Torrents.html
  if (opts.sslCert !== undefined) torrent.info['ssl-cert'] = opts.sslCert

  if (opts.urlList !== undefined) torrent['url-list'] = opts.urlList

  const estimatedTorrentLength = files.reduce(sumLength, 0)
  const pieceLength = opts.pieceLength || Math.min(calcPieceLength(estimatedTorrentLength), opts.maxPieceLength)
  torrent.info['piece length'] = pieceLength

  getPieceList(
    files,
    pieceLength,
    estimatedTorrentLength,
    opts,
    (err, pieces, torrentLength) => {
      if (err) return cb(err)
      torrent.info.pieces = pieces

      files.forEach(file => {
        delete file.getStream
      })

      if (opts.singleFileTorrent) {
        torrent.info.length = torrentLength
      } else {
        torrent.info.files = files
      }

      cb(null, bencode.encode(torrent))
    }
  )
}

/**
 * Determine if a a file is junk based on its path
 * (defined as hidden OR recognized by the `junk` package)
 *
 * @param  {string} path
 * @return {boolean}
 */
function isJunkPath (path) {
  const filename = path[path.length - 1]
  return filename[0] === '.' && isJunk(filename)
}

/**
 * Accumulator to sum file lengths
 * @param  {number} sum
 * @param  {Object} file
 * @return {number}
 */
function sumLength (sum, file) {
  return sum + file.length
}

/**
 * Check if `obj` is a W3C `Blob` object (which `File` inherits from)
 * @param  {*} obj
 * @return {boolean}
 */
function isBlob (obj) {
  return typeof Blob !== 'undefined' && obj instanceof Blob
}

/**
 * Check if `obj` is a W3C `FileList` object
 * @param  {*} obj
 * @return {boolean}
 */
function isFileList (obj) {
  return typeof FileList !== 'undefined' && obj instanceof FileList
}

/**
 * Check if `obj` is a node Readable stream
 * @param  {*} obj
 * @return {boolean}
 */
function isReadable (obj) {
  return typeof obj === 'object' && obj != null && typeof obj.pipe === 'function'
}

/**
 * Convert a readable stream to a lazy async iterator. Adds instrumentation to track
 * the number of bytes in the stream and set `file.length`.
 *
 * @generator
 * @param  {Stream} readable
 * @param  {Object} file
 * @return {Uint8Array} stream data/chunk
 */
async function * getStreamStream (readable, file) {
  for await (const chunk of readable) {
    file.length += chunk.length
    yield chunk
  }
}

export default createTorrent
export { parseInput, announceList, isJunkPath }
