function wait (time) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

module.exports = {
  wait
}
