const b4a = require('b4a')

var EMPTY = []

module.exports = RecordCache

function RecordSet () {
  this.list = []
  this.map = new Map()
}

RecordSet.prototype.add = function (record, value) {
  var k = toString(record)
  var r = this.map.get(k)
  if (r) return false

  r = {index: this.list.length, record: value || record}
  this.list.push(r)
  this.map.set(k, r)
  return true
}

RecordSet.prototype.remove = function (record) {
  var k = toString(record)
  var r = this.map.get(k)
  if (!r) return false

  swap(this.list, r.index, this.list.length - 1)
  this.list.pop()
  this.map.delete(k)
  return true
}

function RecordStore () {
  this.records = new Map()
  this.size = 0
}

RecordStore.prototype.add = function (name, record, value) {
  var r = this.records.get(name)

  if (!r) {
    r = new RecordSet()
    this.records.set(name, r)
  }

  if (r.add(record, value)) {
    this.size++
    return true
  }

  return false
}

RecordStore.prototype.remove = function (name, record, value) {
  var r = this.records.get(name)
  if (!r) return false

  if (r.remove(record, value)) {
    this.size--
    if (!r.map.size) this.records.delete(name)
    return true
  }

  return false
}

RecordStore.prototype.get = function (name) {
  var r = this.records.get(name)
  return r ? r.list : EMPTY
}

function RecordCache (opts) {
  if (!(this instanceof RecordCache)) return new RecordCache(opts)
  if (!opts) opts = {}

  this.maxSize = opts.maxSize || Infinity
  this.maxAge = opts.maxAge || 0

  this._onstale = opts.onStale || opts.onstale || null
  this._fresh = new RecordStore()
  this._stale = new RecordStore()
  this._interval = null
  this._gced = false

  if (this.maxAge && this.maxAge < Infinity) {
    // 2/3 gives us a span of 0.66-1.33 maxAge or avg maxAge
    var tick = Math.ceil(2 / 3 * this.maxAge)
    this._interval = setInterval(this._gcAuto.bind(this), tick)
    if (this._interval.unref) this._interval.unref()
  }
}

Object.defineProperty(RecordCache.prototype, 'size', {
  get: function () {
    return this._fresh.size + this._stale.size
  }
})

RecordCache.prototype.add = function (name, record, value) {
  this._stale.remove(name, record, value)
  if (this._fresh.add(name, record, value) && this._fresh.size > this.maxSize) {
    this._gc()
  }
}

RecordCache.prototype.remove = function (name, record, value) {
  this._fresh.remove(name, record, value)
  this._stale.remove(name, record, value)
}

RecordCache.prototype.get = function (name, n) {
  var a = this._fresh.get(name)
  var b = this._stale.get(name)
  var aLen = a.length
  var bLen = b.length
  var len = aLen + bLen

  if (n > len || !n) n = len
  var result = new Array(n)

  for (var i = 0; i < n; i++) {
    var j = Math.floor(Math.random() * (aLen + bLen))
    if (j < aLen) {
      result[i] = a[j].record
      swap(a, j, --aLen)
    } else {
      j -= aLen
      result[i] = b[j].record
      swap(b, j, --bLen)
    }
  }

  return result
}

RecordCache.prototype._gcAuto = function () {
  if (!this._gced) this._gc()
  this._gced = false
}

RecordCache.prototype._gc = function () {
  if (this._onstale && this._stale.size > 0) this._onstale(this._stale)
  this._stale = this._fresh
  this._fresh = new RecordStore()
  this._gced = true
}

RecordCache.prototype.clear = function () {
  this._gc()
  this._gc()
}

RecordCache.prototype.destroy = function () {
  this.clear()
  clearInterval(this._interval)
  this._interval = null
}

function toString (record) {
  return b4a.isBuffer(record) ? b4a.toString(record, 'hex') : record
}

function swap (list, a, b) {
  var tmp = list[a]
  tmp.index = b
  list[b].index = a
  list[a] = list[b]
  list[b] = tmp
}
