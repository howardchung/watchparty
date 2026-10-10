module.exports = Timeout

function Timeout (ms, fn, ctx) {
  if (!(this instanceof Timeout)) return new Timeout(ms, fn, ctx)
  this.ms = ms
  this.ontimeout = fn
  this.context = ctx || null
  this.called = false
  this._timeout = setTimeout(call, ms, this)
}

Timeout.prototype.refresh = function () {
  if (this.called || this.ontimeout === null) return
  clearTimeout(this._timeout)
  this._timeout = setTimeout(call, this.ms, this)
}

Timeout.prototype.destroy = function () {
  this.ontimeout = null
  clearTimeout(this._timeout)
}

function call (self) {
  self.called = true
  self.ontimeout.call(self.context)
}
