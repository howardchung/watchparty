module.exports = Timer

function Timer (ms, fn, ctx) {
  if (!(this instanceof Timer)) return new Timer(ms, fn, ctx)
  this.ms = ms
  this.ontimeout = fn
  this.context = ctx || null
  this.called = false
  this._timeout = setTimeout(call, ms, this)
  this._timeout.unref()
}

Timer.prototype.refresh = function () {
  if (this.called || this.ontimeout === null) return
  this._timeout.refresh()
}

Timer.prototype.destroy = function () {
  this.ontimeout = null
  clearTimeout(this._timeout)
}

function call (self) {
  self.called = true
  self.ontimeout.call(self.context)
}
