# nat-api

[![NPM Version][nat-api-ni]][nat-api-nu]
[![Build Status][nat-api-bi]][nat-api-bu]
[![Dependency Status][nat-api-di]][nat-api-du]
[![Standard - Javascript Style Guide][standard-image]][standard-url]

Fast port mapping with **UPnP** and **NAT-PMP** in NodeJS.

## Install

**Required: NodeJS >= 10**

```sh
npm install @silentbot1/nat-api
```

## Usage

```js
const NatAPI = require('nat-api')

// For NAT-PMP + NAT-UPNP, use:
const client = new NatAPI({ enablePMP: true, enableUPNP: true })

// Note: upnpPermanentFallback is disabled by default, meaning leases on routers which only support UPnP permanent leases will fail, this includes RouterOS/Mikrotik, Netgear, and other ISP provided routers. 

// Map public port 1000 to private port 1000 with UDP and TCP
client.map(1000).then(() => {
  console.log('Port mapped!')
}).catch((err) => {
  return console.log('Error', err)
})

// Map public port 2000 to private port 3000 with UDP and TCP
client.map(2000, 3000).then(() => {
  console.log('Port mapped!')
}).catch((err) => {
  return console.log('Error', err)
})

// Map public port 4000 to private port 5000 with only UDP
client.map({ publicPort: 4000, privatePort: 5000, ttl: 1800, protocol: 'UDP' }).then(() => {
  console.log('Port mapped!')
}).catch((err) =>{
  return console.log('Error', err)
})

// Unmap port public and private port 1000 with UDP and TCP
client.unmap(1000).then(() => {
  console.log('Port unmapped!') 
}).catch((err) => {
  return console.log('Error', err)
})

// Get external IP
client.externalIp().then((ip) => {
  console.log('External IP:', ip)
}).catch((err) => {
  return console.log('Error', err)
})

// Destroy object
client.destroy().then(() => {
  console.log('Client has been destroyed!')
}).catch((err) => {
  return console.log('Error', err)
})
```

## API

### `client = new NatAPI([opts])`

Create a new `nat-api` instance.

If `opts` is specified, then the default options (shown below) will be overridden.

```js
{
  ttl: 1200, // Time to live of each port mapping in seconds (default: 1200)
  autoUpdate: true, // Refresh all the port mapping to keep them from expiring (default: true)
  gateway: '192.168.1.1', // Default gateway (default: null)
  enablePMP: false, // Enable PMP (default: true)
  enableUPNP: false, // Enable UPNP (default: true)
  upnpPermanentFallback: false // Enable UPNP permanent leases fallback (default: false)
}
```

If `gateway` is not set, then `nat-api` will get the default gateway based on the current network interface.

### `client.map(port): Promise<void>`
* `port`: Public and private ports

This method will use `port` for mapping the public port to the same private port.

It uses the default TTL and creates a map for UDP and TCP.

### `client.map(publicPort, privatePort): Promise<void>`
* `publicPort`: Public port
* `privatePort`: Private port

This is another quick way of mapping `publciPort` to `privatePort` for both UDP and TCP.

### `client.map(opts): Promise<void>`
* `opts`:
 - `publicPort`: Public port
 - `privatePort`: Private port
 - `protocol`: Port protocol (`UDP`, `TCP` or `null` for both)
 - `ttl`: Overwrite the default TTL in seconds.
 - `description`: Description of the port mapping

### `client.unmap(port): Promise<void>`

Unmap any port that has the public port or private port equal to `port`.

### `client.unmap(publicPort, privatePort): Promise<void>`

Unmap any port that has the public port or private port equal to `publicPort` and `privatePort`, respectively.

### `client.unmap(opts): Promise<void>`

Unmap any port that contains the parameters provided in `opts`.

### `client.externalIp(): Promise<string>`

Get the external IP address.

### `client.destroy(): Promise<void>`

Destroy the client. Unmaps all the ports open with `nat-api` and cleans up large data structure resources.

## Additional Information

- http://miniupnp.free.fr/nat-pmp.html
- http://wikipedia.org/wiki/NAT_Port_Mapping_Protocol
- http://tools.ietf.org/html/draft-cheshire-nat-pmp-03


## License

MIT. Copyright (c) [Brad Marsden](https://github.com/silentbot1)

[nat-api-ni]: https://img.shields.io/npm/v/@silentbot1/nat-api.svg
[nat-api-nu]: https://npmjs.org/package/@silentbot1/nat-api
[nat-api-bi]: https://img.shields.io/github/actions/workflow/status/silentbot1/nat-api/ci.yml?branch=master
[nat-api-bu]: https://github.com/silentbot1/nat-api/actions
[nat-api-di]: https://img.shields.io/librariesio/release/npm/@silentbot1/nat-api
[nat-api-du]: https://libraries.io/npm/@silentbot1%2Fnat-api
[standard-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard-url]: https://standardjs.com
