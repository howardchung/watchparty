import URL from 'bare-url'

type ConditionalSpecifier =
  | string
  | ConditionalSpecifier[]
  | { [condition: string]: ConditionalSpecifier }

type ImportsMap = { [specifier: string]: ConditionalSpecifier }

type ExportsMap = ImportsMap

type ResolutionsMap = { [href: string]: ImportsMap }

type Builtins = ConditionalSpecifier[]

type Conditions = string[] | Conditions[]

type Engines = { [name: string]: string }

type JSON = string | number | boolean | JSON[] | { [key: string]: JSON }

interface ResolveOptions {
  builtinProtocol?: string
  builtins?: Builtins
  conditions?: Conditions
  defer?: string[]
  deferredProtocol?: string
  engines?: Engines
  extensions?: string[]
  imports?: ImportsMap
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
  export {
    type ConditionalSpecifier,
    type ImportsMap,
    type ExportsMap,
    type ResolutionsMap,
    type Builtins,
    type Conditions,
    type Engines,
    type ResolveOptions
  }

  export const constants: {
    UNRESOLVED: number
    YIELDED: number
    RESOLVED: number
  }

  export type Resolver = Generator<
    { package: URL } | { resolution: URL },
    number,
    void | boolean | JSON | null
  >

  export function module(
    specifier: string,
    parentURL: URL,
    opts?: ResolveOptions
  ): Resolver

  export function url(
    url: string,
    parentURL: URL,
    opts?: ResolveOptions
  ): Resolver

  export function preresolved(
    specifier: string,
    resolutions: ResolutionsMap,
    parentURL: URL,
    opts?: ResolveOptions
  ): Resolver

  export function package(
    packageSpecifier: string,
    parentURL: URL,
    opts?: ResolveOptions
  ): Resolver

  export function packageSelf(
    packageName: string,
    packageSubpath: string,
    parentURL: URL,
    opts?: ResolveOptions
  ): Resolver

  export function packageExports(
    packageURL: URL,
    subpath: string,
    packageExports: ExportsMap,
    opts?: ResolveOptions
  ): Resolver

  export function packageImports(
    specifier: string,
    parentURL: URL,
    opts?: ResolveOptions
  ): Resolver

  export function packageImportsExports(
    matchKey: string,
    matchObject: ImportsMap | ExportsMap,
    packageURL: URL,
    isImports: boolean,
    opts?: ResolveOptions
  ): Resolver

  export function packageTarget(
    packageURL: URL,
    target: ConditionalSpecifier,
    patternMatch: string,
    isImports: boolean,
    opts?: ResolveOptions
  ): Resolver

  export function builtinTarget(
    packageSpecifier: string,
    packageVersion: string,
    target: ConditionalSpecifier,
    opts?: ResolveOptions
  ): Resolver

  export function file(
    filename: string,
    parentURL: URL,
    isIndex: boolean,
    opts?: ResolveOptions
  ): Resolver

  export function directory(
    dirname: string,
    parentURL: URL,
    opts?: ResolveOptions
  ): Resolver
}

export = resolve
