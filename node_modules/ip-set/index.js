const ip = require('ip')

class IPSetNode {
  constructor (start, end) {
    this.start = start
    this.end = end
    this.max = end
    this.depth = 1
    this.left = null
    this.right = null
  }

  add (start, end) {
    const d = start - this.start
    let update = false

    if (d === 0 && this.end < end) {
      this.end = end
      update = true
    } else if (d < 0) {
      if (this.left) {
        update = this.left.add(start, end)
        if (update) this._balance()
      } else {
        this.left = new IPSetNode(start, end)
        update = true
      }
    } else if (d > 0) {
      if (this.right) {
        update = this.right.add(start, end)
        if (update) this._balance()
      } else {
        this.right = new IPSetNode(start, end)
        update = true
      }
    }

    if (update) this._update()
    return update
  }

  contains (addr) {
    let node = this
    while (node && !(addr >= node.start && addr <= node.end)) {
      if (node.left && node.left.max >= addr) node = node.left
      else node = node.right
    }
    return !!node
  }

  _balance () {
    const ldepth = this.left ? this.left.depth : 0
    const rdepth = this.right ? this.right.depth : 0

    if (ldepth > rdepth + 1) {
      const lldepth = this.left.left ? this.left.left.depth : 0
      const lrdepth = this.left.right ? this.left.right.depth : 0
      if (lldepth < lrdepth) this.left._rotateRR()
      this._rotateLL()
    } else if (ldepth + 1 < rdepth) {
      const rrdepth = this.right.right ? this.right.right.depth : 0
      const rldepth = this.right.left ? this.right.left.depth : 0
      if (rldepth > rrdepth) this.right._rotateLL()
      this._rotateRR()
    }
  }

  _rotateLL () {
    const _start = this.start
    const _end = this.end
    const _right = this.right

    this.start = this.left.start
    this.end = this.left.end
    this.right = this.left
    this.left = this.left.left

    this.right.left = this.right.right
    this.right.right = _right
    this.right.start = _start
    this.right.end = _end

    this.right._update()
    this._update()
  }

  _rotateRR () {
    const _start = this.start
    const _end = this.end
    const _left = this.left

    this.start = this.right.start
    this.end = this.right.end
    this.end = this.right.end
    this.left = this.right
    this.right = this.right.right

    this.left.right = this.left.left
    this.left.left = _left
    this.left.start = _start
    this.left.end = _end

    this.left._update()
    this._update()
  }

  _update () {
    this.depth = 1
    if (this.left) this.depth = this.left.depth + 1
    if (this.right && this.depth <= this.right.depth) this.depth = this.right.depth + 1
    this.max = Math.max(this.end, this.left ? this.left.max : 0, this.right ? this.right.max : 0)
  }
}

class IPSet {
  constructor (blocklist) {
    this.tree = null
    if (Array.isArray(blocklist)) {
      blocklist.forEach(block => {
        this.add(block)
      })
    }
  }

  add (start, end) {
    if (!start) return
    if (typeof start === 'object') {
      end = start.end
      start = start.start
    }

    const cidrStr = /\/\d{1,2}/
    if (typeof start === 'string' && cidrStr.test(start)) {
      const ipSubnet = ip.cidrSubnet(start)
      start = ipSubnet.networkAddress
      end = ipSubnet.broadcastAddress
    }
    if (typeof start !== 'number') start = ip.toLong(start)

    if (!end) end = start
    if (typeof end !== 'number') end = ip.toLong(end)

    if (start < 0 || end > 4294967295 || end < start) throw new Error('Invalid block range')

    if (this.tree) this.tree.add(start, end)
    else this.tree = new IPSetNode(start, end)
  }

  contains (addr) {
    if (!this.tree) return false
    if (typeof addr !== 'number') addr = ip.toLong(addr)
    return this.tree.contains(addr)
  }
}

module.exports = IPSet
