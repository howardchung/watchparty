type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array

type Encoding = 
  | 'utf-8'
  | 'utf-16le'
  | 'latin-1'
  | 'ascii'

type HashType = 
  | 'hex'
  | 'base64'

type HashAlgo = 
  | 'sha-1'
  | 'sha-256'
  | 'sha-384'
  | 'sha-512'

type Uint8 = Uint8Array | Array<number>

type Hex = string

type Base64 = string


export function concat (chunks: (TypedArray | Array<number>)[], size?: number): Uint8Array

export function equal (a: Uint8, b: Uint8): boolean

export function arr2hex (data: Uint8): Hex

export function hex2arr (str: Hex): Uint8Array

export function arr2text (data: ArrayBuffer | Uint8Array, enc?: Encoding): string

export function arr2base (data: Uint8): Base64

export function base2arr (str: Base64): Uint8Array

export function text2arr (str: string): Uint8Array

export function hex2bin (str: Hex): string

export function bin2hex (str: string): Hex

export function hash (data: string | TypedArray | ArrayBuffer | DataView, format?: HashType, algo?: HashAlgo): Promise<Uint8Array | Hex | Base64>

export function randomBytes (size: number): Uint8Array
