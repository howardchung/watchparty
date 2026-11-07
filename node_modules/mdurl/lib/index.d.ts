export interface Url {
  protocol: string | null
  slashes: boolean | null
  auth: string | null
  port: string | null
  hostname: string | null
  hash: string | null
  search: string | null
  pathname: string | null
}

export function decode(string: string, exclude?: string): string

export namespace decode {
  let defaultChars: string
  let componentChars: string
}

export function encode(string: string, keepEscaped?: boolean): string
export function encode(string: string, exclude: string, keepEscaped?: boolean): string

export namespace encode {
  let defaultChars: string
  let componentChars: string
}

export function format(url: Url): string
export function parse(url: string, slashesDenoteHost?: boolean): Url
