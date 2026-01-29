var lastOneWins = require('./')

var print = lastOneWins(function (val, cb) {
  setTimeout(function () {
    console.log(val)
    cb()
  }, 100)
})

print('hello')
print(' dank ')
print(' dank ')
print(' dank ')
print(' dank ')
print(' dank ')
print(' dank ')
print('world')

setTimeout(function () {
  print('hmm')
  print('lol')
  print('lol')
  print('lol')
  print('now?')
}, 300)
