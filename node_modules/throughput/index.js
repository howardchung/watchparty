const hrtime = typeof process !== 'undefined' && !!process.hrtime
const maxTick = 65535
const resolution = 10
const timeDiff = hrtime
  ? 1e9 / resolution
  : 1e3 / resolution

const now = hrtime
  ? () => {
      const [seconds, nanoseconds] = process.hrtime()
      return (seconds * 1e9 + nanoseconds)
    }
  : () => performance.now()

/** @param {number} start */
function getTick (start) {
  return (now() - start) / timeDiff & maxTick
}

/** @param {number} seconds */
module.exports = function (seconds) {
  const start = now()

  const size = resolution * (seconds || 5)
  const buffer = [0]
  let pointer = 1
  let last = (getTick(start) - 1) & maxTick

  return function (delta) {
    const tick = getTick(start)
    let dist = (tick - last) & maxTick
    if (dist > size) dist = size
    last = tick

    while (dist--) {
      if (pointer === size) pointer = 0
      buffer[pointer] = buffer[pointer === 0 ? size - 1 : pointer - 1]
      pointer++
    }

    if (delta) buffer[pointer - 1] += delta

    /** @type {number} */
    const top = buffer[pointer - 1]
    /** @type {number} */
    const btm = buffer.length < size ? 0 : buffer[pointer === size ? 0 : pointer]

    return buffer.length < resolution ? top : (top - btm) * resolution / buffer.length
  }
}
