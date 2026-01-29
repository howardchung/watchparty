import { createHash, randomBytes as rand } from 'node:crypto'

const decoder = new TextDecoder()
export const arr2text = (data, enc) => {
  if (data.byteLength > 1024) {
    if (!enc) return decoder.decode(data)
    const dec = new TextDecoder(enc)
    return dec.decode(data)
  }
  return Buffer.from(data).toString(enc || 'utf8')
}

export const text2arr = str => new Uint8Array(Buffer.from(str, 'utf8'))

export const arr2base = data => Buffer.from(data).toString('base64')

export const base2arr = str => new Uint8Array(Buffer.from(str, 'base64'))

export const hex2bin = hex => Buffer.from(hex, 'hex').toString('binary')

export const bin2hex = bin => Buffer.from(bin, 'binary').toString('hex')

export const hash = async (data, format, algo = 'sha1') => {
  algo = algo.replace('sha-', 'sha')
  const out = createHash(algo).update(data)
  return format ? out.digest(format) : new Uint8Array(out.digest().buffer)
}

export const randomBytes = size => {
  return new Uint8Array(rand(size))
}

export * from './util.js'
