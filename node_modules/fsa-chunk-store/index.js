import getFileRegex from 'filename-reserved-regex'
import './createWritable.js'

const RESERVED_FILENAME_REGEX = getFileRegex()

// this can be bad when multiple instances of this app are running
if (globalThis.navigator?.storage?.getDirectory) {
  navigator.storage.getDirectory().then(storageDir => {
    storageDir.removeEntry('chunks', { recursive: true }).catch(() => {})
  })
}

const noop = (_, __) => {}
const err = (cb = noop, err) => queueMicrotask(() => cb(new Error(err)))
export default class FSAChunkStore {
  name = ''

  chunks = [] // individual chunks, required for reads :/
  chunkMap = [] // full files
  directoryMap = {}
  files

  rootDirPromise
  storageDirPromise
  chunksDirPromise

  closing = false
  closed = false

  /**
   * @param {number} chunkLength
   * @param {{ name?: string, rootDir?: Promise<FileSystemDirectoryHandle>, length?: number, files?: {path: string, length: number, offset?: number, handle?: Promise<FileSystemFileHandle>, blob?: Promise<Blob>, stream?: Promise<FileSystemWritableFileStream> }[] }} [opts]
   */
  constructor (chunkLength, opts = {}) {
    this.chunkLength = Number(chunkLength)

    if (!this.chunkLength) {
      throw new Error('First argument must be a chunk length')
    }

    if (!globalThis.navigator?.storage?.getDirectory) {
      throw new Error('FSA API is not supported')
    }

    this.closed = false

    this.name = opts.name || crypto.randomUUID()

    this.rootDirPromise = opts.rootDir || navigator.storage.getDirectory()
    this.storageDirPromise = (async () => {
      const rootDir = await this.rootDirPromise
      return rootDir.getDirectoryHandle(this.name, { create: true })
    })()
    // if there are no files the chunks are the storage
    this.chunksDirPromise = this.storageDirPromise

    if (opts.files && opts.rootDir) {
      // if files exist, use throwaway, wipeable folder for chunks which are a cache
      this.chunksDirPromise = this._getChunksDirHandle()
      this.files = opts.files.map((file, i, files) => {
        if (file.path == null) throw new Error('File is missing `path` property')
        if (file.length == null) throw new Error('File is missing `length` property')
        if (file.offset == null) {
          if (i === 0) {
            file.offset = 0
          } else {
            const prevFile = files[i - 1]
            file.offset = prevFile.offset + prevFile.length
          }
        }

        // file handles
        if (file.handle == null) file.handle = this._createFileHandle({ path: file.path })
        file.blob = this._createBlobReference(file.handle)

        // file chunkMap
        const fileStart = file.offset
        const fileEnd = file.offset + file.length

        const firstChunk = Math.floor(fileStart / this.chunkLength)
        const lastChunk = Math.floor((fileEnd - 1) / this.chunkLength)

        for (let i = firstChunk; i <= lastChunk; ++i) {
          const chunkStart = i * this.chunkLength
          const chunkEnd = chunkStart + this.chunkLength

          const from = (fileStart < chunkStart) ? 0 : fileStart - chunkStart
          const to = (fileEnd > chunkEnd) ? this.chunkLength : fileEnd - chunkStart
          const offset = (fileStart > chunkStart) ? 0 : chunkStart - fileStart

          if (!this.chunkMap[i]) this.chunkMap[i] = []

          this.chunkMap[i].push({ from, to, offset, file })
        }

        return file
      })

      // close streams is page is frozen/unloaded, they will re-open if the user returns via BFC
      window.addEventListener('pagehide', () => this.cleanup())

      this.length = this.files.reduce((sum, file) => sum + file.length, 0)
      if (opts.length != null && opts.length !== this.length) {
        throw new Error('total `files` length is not equal to explicit `length` option')
      }
    } else {
      this.length = Number(opts.length) || Infinity
    }

    if (this.length !== Infinity) {
      this.lastChunkLength = this.length % this.chunkLength || this.chunkLength
      this.lastChunkIndex = Math.ceil(this.length / this.chunkLength) - 1
    }
  }

  async _getChunkHandle (index) {
    let chunk = this.chunks[index]
    if (!chunk) {
      const storageDir = await this.chunksDirPromise
      this.chunks[index] = chunk = await storageDir.getFileHandle(index, { create: true })
    }
    return chunk
  }

  /**
   * @param {{path: string}} opts
   */
  async _createFileHandle (opts) {
    const fileName = opts.path.slice(opts.path.lastIndexOf('/') + 1)
    return (await this._getDirectoryHandle(opts)).getFileHandle(fileName.replace(RESERVED_FILENAME_REGEX, ''), { create: true })
  }

  async _createBlobReference (handle) {
    return (await handle).getFile()
  }

  /**
   * recursive, equiv of cd and mkdirp
   * @param {{path: string}} opts
   * @returns {Promise<FileSystemDirectoryHandle>}
   */
  async _getDirectoryHandle (opts) {
    const lastIndex = opts.path.lastIndexOf('/')
    if (lastIndex === -1 || lastIndex === 0) return this.storageDirPromise
    const path = opts.path = opts.path.slice(0, lastIndex)
    if (!this.directoryMap[path]) {
      this.directoryMap[path] = (async () => {
        const parent = await this._getDirectoryHandle(opts)
        return parent.getDirectoryHandle(path.slice(path.lastIndexOf('/') + 1), { create: true })
      })()
    }
    return this.directoryMap[path]
  }

  async _getChunksDirHandle () {
    const storageDir = await navigator.storage.getDirectory()
    const chunksDir = await storageDir.getDirectoryHandle('chunks', { create: true })
    return chunksDir.getDirectoryHandle(this.name, { create: true })
  }

  async put (index, buf, cb = noop) {
    try {
      await this._put(index, buf)
      cb(null)
      return null
    } catch (e) {
      queueMicrotask(() => cb(e))
      return e
    }
  }

  /**
   * @param {Promise<FileSystemFileHandle>} handle
   */
  async getStreamForHandle (handle) {
    return (await handle).createWritable({ keepExistingData: true })
  }

  // wrapped in prep for callback drop
  async _put (index, buf) {
    if (this.closed) throw new Error('Storage is closed')

    const isLastChunk = index === this.lastChunkIndex
    if (isLastChunk && buf.length !== this.lastChunkLength) throw new Error(`Last chunk length must be ${this.lastChunkLength}`)
    if (!isLastChunk && buf.length !== this.chunkLength) throw new Error(`Chunk length must be ${this.chunkLength}`)

    const chunkWrite = (async () => {
      const chunk = await this._getChunkHandle(index)
      const stream = await chunk.createWritable({ keepExistingData: false })
      await stream.write(buf)
      await stream.close()
    })()

    if (!this.files) return chunkWrite

    const targets = this.chunkMap[index]
    if (!targets) throw new Error('No files matching the request range')
    const promises = targets.map(async ({ file, offset, from, to }) => {
      if (!file.stream) {
        file.stream = this.getStreamForHandle(file.handle)
      }
      await (await file.stream).write({ type: 'write', position: offset, data: buf.slice(from, to) })
    })
    promises.push(chunkWrite)
    await Promise.all(promises)
  }

  async get (index, opts, cb = noop) {
    if (opts == null) opts = {}
    try {
      const data = await this._get(index, opts)
      cb(null, data)
      return data
    } catch (e) {
      cb(e)
      return e
    }
  }

  // wrapped in prep for callback drop
  async _get (index, opts) {
    if (typeof opts === 'function') return this.get(index, undefined, opts)
    if (this.closed) throw new Error('Storage is closed')

    const isLastChunk = index === this.lastChunkIndex
    const chunkLength = isLastChunk ? /** @type {number} */(this.lastChunkLength) : this.chunkLength

    const rangeFrom = opts.offset || 0
    const rangeTo = opts.length ? rangeFrom + opts.length : chunkLength
    const len = opts.length || chunkLength - rangeFrom

    if (rangeFrom < 0 || rangeFrom < 0 || rangeTo > chunkLength) throw new Error('Invalid offset and/or length')

    if (rangeFrom === rangeTo) return new Uint8Array(0)

    if (!this.files || this.chunks[index]) {
      const chunk = await this._getChunkHandle(index)
      let file = await chunk.getFile()
      if (rangeFrom !== 0 || len !== chunkLength) {
        file = file.slice(rangeFrom, len + rangeFrom)
      }
      const buf = await file.arrayBuffer()

      if (buf.byteLength === 0) throw new Error(`Index ${index} does not exist`)
      return new Uint8Array(buf)
    }

    // if chunk was GC'ed
    let targets = this.chunkMap[index]
    if (!targets) throw new Error('No files matching the request range')
    if (opts) {
      targets = targets.filter(({ from, to }) => to > rangeFrom && from < rangeTo)
      if (targets.length === 0) throw new Error('No files matching the request range')
    }

    const promises = targets.map(async ({ from, to, offset, file }) => {
      if (opts) {
        if (to > rangeTo) to = rangeTo
        if (from < rangeFrom) {
          offset += (rangeFrom - from)
          from = rangeFrom
        }
      }
      const blob = await file.blob
      return blob.slice(offset, offset + to - from)
    })
    const values = await Promise.all(promises)
    const buf = values.length === 1 ? await values[0].arrayBuffer() : await new Blob(values).arrayBuffer()
    if (buf.byteLength === 0) throw new Error(`Index ${index} does not exist`)
    return new Uint8Array(buf)
  }

  async close (cb = noop) {
    if (this.closing) return err(cb, 'Storage is closed')

    this.closing = true
    this.chunkMap = undefined
    this.directoryMap = undefined
    if (this.files) await this.cleanup()
    this.closed = true
    queueMicrotask(() => cb(null))
  }

  async cleanup () {
    if (this.closed || !this.files) return
    const streams = []
    for (const file of this.files) {
      if (file.stream) {
        streams.push(file.stream.then(stream => stream.close()))
        file.stream = undefined
      }
    }
    const clearChunks = (async () => {
      const storageDir = await this.chunksDirPromise
      this.chunks = []
      // .remove() doesnt exist on firefox or safari
      for await (const key of storageDir.keys()) {
        await storageDir.removeEntry(key, { recursive: true })
      }
      this.chunksDirPromise = this._getChunksDirHandle()
      await this.chunksDirPromise
    })()
    await Promise.all(streams)
    for (const file of this.files) {
      file.blob = this._createBlobReference(file.handle)
    }
    await clearChunks
  }

  async destroy (cb = noop) {
    this.close(async (err) => {
      if (err) return cb(err)
      try {
        const rootDir = await this.rootDirPromise
        // .remove() doesnt exist on firefox or safari
        await rootDir.removeEntry(this.name, { recursive: true })
      } catch (err) {
        return cb(err)
      }
      cb(null)
    })
  }
}
