# throughput

Speed measurement

```
npm install throughput
```

## Usage

``` js
const throughput = require('throughput')
const fs = require('fs')

// Let's measure how fast we can read from /dev/urandom
const speed = throughput()
const stream = fs.createReadStream('/dev/urandom')

stream.on('data', function(data) {
  // Simply call speed with the amount of bytes transferred
  const bytesPerSecond = speed(data.length)

  console.log(bytesPerSecond+' bytes/second')
})
```

You can always get the current speed by calling `speed()`.

Per default `throughput` uses a 5 second buffer.
To change this simply pass another value to the constructor

``` js
const speed = throughput(20) // uses a 20s buffer instead
```

This is an improved version of `speedometer` by `mafintosh`, which used timeouts, which cause a lot of issues.

## License

MIT