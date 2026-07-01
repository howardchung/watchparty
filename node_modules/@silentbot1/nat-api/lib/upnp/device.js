import fetch from 'cross-fetch-ponyfill'
import xml2js from 'xml2js'

const ERROR_MESSAGES = {
  606: 'Action not authorized',
  714: 'The specified value does not exist in the array',
  715: 'The source IP address cannot be wild-carded',
  716: 'The external port cannot be wild-carded',
  718: 'The port mapping entry specified conflicts with a mapping assigned previously to another client',
  724: 'Internal and External port values MUST be the same',
  725: 'The NAT implementation only supports permanent lease times on port mappings',
  726: 'RemoteHost must be a wildcard and cannot be a specific IP address or DNS name',
  727: 'ExternalPort MUST be a wildcard and cannot be a specific port value',
  728: 'There are not enough free ports available to complete port mapping',
  729: 'Attempted port mapping is not allowed due to conflict with other mechanisms',
  732: 'The internal port cannot be wild-carded'
}

export default class Device {
  constructor (opts = {}) {
    this.url = opts.url
    this.permanentFallback = opts.permanentFallback || false
    this.services = [
      'urn:schemas-upnp-org:service:WANIPConnection:1',
      'urn:schemas-upnp-org:service:WANIPConnection:2',
      'urn:schemas-upnp-org:service:WANPPPConnection:1'
    ]
  }

  async run (action, args) {
    const info = await this._getService(this.services)

    const requestBody = '<?xml version="1.0"?>' +
             '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" ' +
               's:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
               '<s:Body>' +
                 '<u:' + action + ' xmlns:u=' + JSON.stringify(info.service) + '>' +
                   args.map((args) => {
                     return '<' + args[0] + '>' +
                           (args[1] ? args[1] : '') +
                           '</' + args[0] + '>'
                   }).join('') +
                 '</u:' + action + '>' +
               '</s:Body>' +
             '</s:Envelope>'

    const res = await fetch(info.controlURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset="utf-8"',
        'Content-Length': Buffer.byteLength(requestBody),
        Connection: 'close',
        SOAPAction: JSON.stringify(info.service + '#' + action)
      },
      body: requestBody
    })

    const rawBody = await res.text()

    const parser = new xml2js.Parser(xml2js.defaults['0.1'])
    const body = await parser.parseStringPromise(rawBody)

    if (res.status === 500) {
      const fault = body['s:Body']['s:Fault']
      const faultString = fault.faultString || fault.faultstring
      if (faultString.toLowerCase() === 'upnperror') {
        const errorCode = parseInt(fault.detail.UPnPError.errorCode, 10)
        const errorMessage = ERROR_MESSAGES[errorCode] || `Request failed, status code: ${res.status}, fault string ${faultString}`
        if (errorCode === 725 && this.permanentFallback) {
          args[args.length - 1] = ['NewLeaseDuration', 0]
          return this.run(action, args)
        } else {
          throw new Error(errorMessage)
        }
      }
    } else if (res.status !== 200) {
      throw new Error('Request failed: ' + res.status)
    }

    const soapns = this._getNamespace(
      body,
      'http://schemas.xmlsoap.org/soap/envelope/'
    )

    return body[soapns + 'Body']
  }

  async _getService (types) {
    const info = await this._getXml(this.url)

    const s = this._parseDescription(info).services.filter((service) => {
      return types.indexOf(service.serviceType) !== -1
    })

    // Use the first available service
    if (s.length === 0 || !s[0].controlURL || !s[0].SCPDURL) {
      throw new Error('Service not found')
    }

    const base = new URL(info.baseURL || this.url)
    const addPrefix = (u) => {
      let uri
      try {
        uri = new URL(u)
      } catch (err) {
        // Is only the path of the URL
        uri = new URL(u, base.href)
      }

      uri.host = uri.host || base.host
      uri.protocol = uri.protocol || base.protocol

      return uri.toString()
    }

    return {
      service: s[0].serviceType,
      SCPDURL: addPrefix(s[0].SCPDURL),
      controlURL: addPrefix(s[0].controlURL)
    }
  }

  async _getXml (url) {
    const response = await fetch(url)
    if (response.status !== 200) throw new Error('Request failed: ' + response.status)
    const text = await response.text()

    const parser = new xml2js.Parser(xml2js.defaults['0.1'])
    return parser.parseStringPromise(text)
  }

  _parseDescription (info) {
    const services = []
    const devices = []

    const toArray = (item) => {
      return Array.isArray(item) ? item : [item]
    }

    const traverseServices = (service) => {
      if (!service) return
      services.push(service)
    }

    const traverseDevices = (device) => {
      if (!device) return
      devices.push(device)

      if (device.deviceList && device.deviceList.device) {
        toArray(device.deviceList.device).forEach(traverseDevices)
      }

      if (device.serviceList && device.serviceList.service) {
        toArray(device.serviceList.service).forEach(traverseServices)
      }
    }

    traverseDevices(info.device)

    return {
      services,
      devices
    }
  }

  _getNamespace (data, uri) {
    let ns

    if (data['@']) {
      Object.keys(data['@']).some((key) => {
        if (!/^xmlns:/.test(key)) return false
        if (data['@'][key] !== uri) return false

        ns = key.replace(/^xmlns:/, '')
        return true
      })
    }

    return ns ? ns + ':' : ''
  }
}
