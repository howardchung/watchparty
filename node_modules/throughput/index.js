const maxTick = 65535
const resolution = 10
const timeDiff = 1000 / resolution
function getTick (start) {
  return (+Date.now() - start) / timeDiff & 65535
}

module.exports = function (seconds) {
  const start = +Date.now()

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

    const top = buffer[pointer - 1]
    const btm = buffer.length < size ? 0 : buffer[pointer === size ? 0 : pointer]

    return buffer.length < resolution ? top : (top - btm) * resolution / buffer.length
  }
}
