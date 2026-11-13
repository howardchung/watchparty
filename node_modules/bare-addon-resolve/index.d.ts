import URL from 'bare-url'
import {
  constants,
  type Builtins,
  type Conditions,
  type ResolutionsMap
} from 'bare-module-resolve'

type JSON = string | number | boolean | JSON[] | { [key: string]: JSON }

interface ResolveOptions {
  builtinProtocol?: string
  builtins?: Builtins
  conditions?: Conditions
  extensions?: string[]
  host?: string
  hosts?: string[]
  linked?: boolean
  linkedProtocol?: string
  matchedConditions?: string[]
  resolutions?: ResolutionsMap
}

declare function resolve(
  specifier: string,
  parentURL: URL,
  readPackage?: (url: URL) => JSON | null
): Iterable<URL>

declare function resolve(
  specifier: string,
  parentURL: URL,
  readPackage: (url: URL) => Promise<JSON | null>
): AsyncIterable<URL>

declare function resolve(
  specifier: string,
  parentURL: URL,
  opts: ResolveOptions,
  readPackage?: (url: URL) => JSON | null
): Iterable<URL>

declare function resolve(
  specifier: string,
  parentURL: URL,
  opts: ResolveOptions,
  readPackage: (url: URL) => Promise<JSON | null>
): AsyncIterable<URL>

declare namespace resolve {
  export { constants, type ResolveOptions }

  export type Resolver = Generator<
    { resolution: URL } | { package: URL },
    number,
    void | boolean | JSON | null
  >

  export function addon(
    specifier: string,
    parentURL: URL,
    opts?: ResolveOptions
  ): Resolver

  export function url(
    specifier: string,
    parentURL: URL,
    opts?: ResolveOptions
  ): Resolver

  export function package(
    packageSpecifier: string,
    packageVersion: string,
    parentURL: URL,
    opts?: ResolveOptions
  ): Resolver

  export function packageSelf(
    packageName: string,
    packageSubpath: string,
    packageVersion: string,
    parentURL: URL,
    opts?: ResolveOptions
  ): Resolver

  export function file(
    filename: string,
    parentURL: URL,
    opts?: ResolveOptions
  ): Resolver

  export function directory(
    dirname: string,
    version: string,
    parentURL: URL,
    opts?: ResolveOptions
  ): Resolver

  export function linked(
    name: string,
    version?: string,
    opts?: ResolveOptions
  ): Resolver
}

export = resolve
