var recordCache = require('./')

var rc = recordCache({
  maxAge: 10,
  maxSize: 100
})

rc.add('hello', 'world')
rc.add('hello', 'welt')
rc.add('hello', 'verden')

console.log(rc.get('hello', 2))
setTimeout(() => console.log(rc.get('hello', 2)), 200)
