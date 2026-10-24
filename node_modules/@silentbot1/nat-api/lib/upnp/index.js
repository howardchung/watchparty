import Ssdp from './ssdp.js'

export default class Client {
  constructor (opts = {}) {
    this.permanentFallback = opts.permanentFallback || false
    this.ssdp = new Ssdp({ permanentFallback: this.permanentFallback })
    this.timeout = 1800

    this._destroyed = false
  }

  async portMapping (options) {
    if (this._destroyed) throw new Error('client is destroyed')

    const { gateway, address } = await this.findGateway()

    const ports = this._normalizeOptions(options)
    const description = options.description || 'node:nat:upnp'
    const protocol = options.protocol ? options.protocol.toUpperCase() : 'TCP'
    let ttl = 60 * 30

    if (typeof options.ttl === 'number') ttl = options.ttl
    if (typeof options.ttl === 'string' && !isNaN(options.ttl)) ttl = Number(options.ttl)

    return gateway.run('AddPortMapping', [
      ['NewRemoteHost', ports.remote.host],
      ['NewExternalPort', ports.remote.port],
      ['NewProtocol', protocol],
      ['NewInternalPort', ports.internal.port],
      ['NewInternalClient', ports.internal.host || address],
      ['NewEnabled', 1],
      ['NewPortMappingDescription', description],
      ['NewLeaseDuration', ttl]
    ])
  }

  async portUnmapping (options) {
    if (this._destroyed) throw new Error('client is destroyed')

    const { gateway } = await this.findGateway()

    const ports = this._normalizeOptions(options)
    const protocol = options.protocol ? options.protocol.toUpperCase() : 'TCP'

    return gateway.run('DeletePortMapping', [
      ['NewRemoteHost', ports.remote.host],
      ['NewExternalPort', ports.remote.port],
      ['NewProtocol', protocol]
    ])
  }

  async getMappings (options) {
    if (this._destroyed) throw new Error('client is destroyed')

    if (!options) options = {}

    const { gateway, address } = await this.findGateway()

    let end = false
    let i = 0
    let results = []

    do {
      let data

      try {
        data = await gateway.run('GetGenericPortMappingEntry', [['NewPortMappingIndex', i++]])
      } catch (e) {
        if (i !== 1) end = true
        break
      }

      let key = null
      Object.keys(data).some((k) => {
        if (!/:GetGenericPortMappingEntryResponse/.test(k)) return false
        key = k
        return true
      })

      if (!key) throw new Error('Incorrect response')

      data = data[key]

      const result = {
        public: {
          host: (typeof data.NewRemoteHost === 'string') && (data.NewRemoteHost || ''),
          port: parseInt(data.NewExternalPort, 10)
        },
        private: {
          host: data.NewInternalClient,
          port: parseInt(data.NewInternalPort, 10)
        },
        protocol: data.NewProtocol.toLowerCase(),
        enabled: data.NewEnabled === '1',
        description: data.NewPortMappingDescription,
        ttl: parseInt(data.NewLeaseDuration, 10)
      }
      result.local = (result.private.host === address)

      results.push(result)
    } while (!end)

    if (options.local) {
      results = results.filter((item) => {
        return item.local
      })
    }

    if (options.description) {
      results = results.filter((item) => {
        if (typeof item.description !== 'string') return false

        if (options.description instanceof RegExp) {
          return item.description.match(options.description) !== null
        } else {
          return item.description.indexOf(options.description) !== -1
        }
      })
    }

    return results
  }

  async externalIp () {
    if (this._destroyed) throw new Error('client is destroyed')

    const { gateway } = await this.findGateway()

    const data = await gateway.run('GetExternalIPAddress', [])

    let key = null
    Object.keys(data).some((k) => {
      if (!/:GetExternalIPAddressResponse$/.test(k)) return false

      key = k
      return true
    })

    if (!key) throw new Error('Incorrect response')

    return data[key].NewExternalIPAddress
  }

  async findGateway () {
    if (this._destroyed) throw new Error('client is destroyed')

    const { device, address } = await this.ssdp.search(
      'urn:schemas-upnp-org:device:InternetGatewayDevice:1', this.timeout
    )

    return { gateway: device, address }
  }

  destroy () {
    this._destroyed = true
    return this.ssdp.destroy()
  }

  _normalizeOptions (options) {
    const toObject = (addr) => {
      if (typeof addr === 'number') return { port: addr }
      if (typeof addr === 'string' && !isNaN(addr)) return { port: Number(addr) }
      if (typeof addr === 'object') return addr

      return {}
    }

    return {
      remote: toObject(options.public),
      internal: toObject(options.private)
    }
  }
}
