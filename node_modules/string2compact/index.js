import addrToIPPort from 'addr-to-ip-port'
import ipaddr from 'ipaddr.js'

const addrs = addrs => {
  if (typeof addrs === 'string') {
    addrs = [addrs]
  }

  return Buffer.concat(addrs.map(addr => {
    const s = addrToIPPort(addr)
    if (s.length !== 2) {
      throw new Error('invalid address format, expecting: 10.10.10.5:128')
    }

    const ip = ipaddr.parse(s[0])
    const ipBuf = Buffer.from(ip.toByteArray())
    const port = s[1]
    const portBuf = Buffer.allocUnsafe(2)
    portBuf.writeUInt16BE(port, 0)
    return Buffer.concat([ipBuf, portBuf])
  }))
}

/**
 * Also support this usage:
 *   string2compact.multi([ '10.10.10.5:128', '100.56.58.99:28525' ])
 *
 * for parallelism with the `compact2string` module.
 */
export default addrs
export { addrs as multi, addrs as multi6 }
