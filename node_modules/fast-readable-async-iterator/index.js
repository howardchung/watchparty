if (typeof ReadableStream !== 'undefined') {
  if (!ReadableStream.prototype[Symbol.asyncIterator]) {
    ReadableStream.prototype[Symbol.asyncIterator] = function ({ preventCancel } = {}) {
      const reader = this.getReader()
      const stream = this
      let last = reader.read()
      return {
        next () {
          const temp = last
          last = reader.read()
          return temp
        },
        async return (value) {
          await last
          reader.releaseLock()
          if (!preventCancel) stream.cancel()
          return { done: true, value }
        },
        async throw (err) {
          await this.return()
          throw err
        },
        [Symbol.asyncIterator] () {
          return this
        }
      }
    }
  }
  if (!ReadableStream.prototype.getIterator) {
    ReadableStream.prototype.getIterator = function ({ preventCancel } = {}) {
      return this[Symbol.asyncIterator]({ preventCancel })
    }
  }
}
