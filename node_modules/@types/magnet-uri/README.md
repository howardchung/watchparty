# Installation
> `npm install --save @types/magnet-uri`

# Summary
This package contains type definitions for magnet-uri (https://github.com/webtorrent/magnet-uri).

# Details
Files were exported from https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/magnet-uri.
## [index.d.ts](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/magnet-uri/index.d.ts)
````ts
/// <reference types="node" />

declare const MagnetUri: MagnetUri.MagnetUri;

declare namespace MagnetUri {
    interface MagnetUri {
        (uri: string): Instance;
        decode(uri: string): Instance;
        encode(parsed: Instance): string;
    }

    interface Instance extends Object {
        dn?: string | string[] | undefined;
        tr?: string | string[] | undefined;
        xs?: string | string[] | undefined;
        as?: string | string[] | undefined;
        ws?: string | string[] | undefined;
        kt?: string[] | undefined;
        ix?: number | number[] | undefined;
        xt?: string | string[] | undefined;
        infoHash?: string | undefined;
        infoHashBuffer?: Buffer | undefined;
        name?: string | string[] | undefined;
        keywords?: string | string[] | undefined;
        announce?: string[] | undefined;
        urlList?: string[] | undefined;
    }
}

export = MagnetUri;

````

### Additional Details
 * Last updated: Tue, 07 Nov 2023 09:09:39 GMT
 * Dependencies: [@types/node](https://npmjs.com/package/@types/node)

# Credits
These definitions were written by [Tomasz Łaziuk](https://github.com/tlaziuk).
