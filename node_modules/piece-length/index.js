module.exports = length

function length (bytes) {
  return Math.max(16384, 1 << Math.log2(bytes < 1024 ? 1 : bytes / 1024) + 0.5 | 0)
}
