module.exports = function cpus () {
  var num = navigator.hardwareConcurrency || 1
  var cpus = []
  for (var i = 0; i < num; i++) {
    cpus.push({
      model: '',
      speed: 0,
      times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 }
    })
  }
  return cpus
}
