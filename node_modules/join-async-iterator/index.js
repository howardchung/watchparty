module.exports = async function * (iterators) {
  for (let iterator of iterators) {
    // can be lazy functions returning streams
    if (typeof iterator === 'function') iterator = iterator()
    yield * iterator
  }
}
