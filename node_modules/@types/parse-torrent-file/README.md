# Installation
> `npm install --save @types/parse-torrent-file`

# Summary
This package contains type definitions for parse-torrent-file (https://github.com/webtorrent/parse-torrent-file).

# Details
Files were exported from https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/parse-torrent-file.
## [index.d.ts](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/parse-torrent-file/index.d.ts)
````ts
/// <reference types="node" />

declare function ParseTorrentFile(torrent: Buffer | ParseTorrentFile.Torrent): ParseTorrentFile.Instance;

declare namespace ParseTorrentFile {
    function decode(torrent: Buffer | Torrent): Instance;
    function encode(parsed: Instance): Buffer;

    interface TorrentInfo {
        "name.utf-8"?: string | undefined;
        name?: string | undefined;
        files?: File[] | undefined;
        "piece length"?: number | undefined;
        pieces?: number | undefined;
        private?: boolean | undefined;
    }

    interface Torrent {
        info?: TorrentInfo | undefined;
        "creation date"?: number | undefined;
        "created by"?: string | undefined;
        comment?: Buffer | undefined;
        "announce-list"?: string[][] | undefined;
        announce?: string | undefined;
        "url-list"?: Buffer | undefined;
    }

    interface ParsedFile {
        path: string;
        name: string;
        length: number;
        offset: number;
    }

    interface Instance extends Object {
        info?: TorrentInfo | undefined;
        infoBuffer?: Buffer | undefined;
        infoHash?: string | undefined;
        infoHashBuffer?: Buffer | undefined;
        name?: string | undefined;
        private?: boolean | undefined;
        created?: Date | undefined;
        createdBy?: string | undefined;
        announce?: string[] | undefined;
        urlList?: string[] | undefined;
        pieceLength?: number | undefined;
        lastPieceLength?: number | undefined;
        pieces?: string[] | undefined;
        length?: number | undefined;
        files?: ParsedFile[] | undefined;
    }
}

export = ParseTorrentFile;

````

### Additional Details
 * Last updated: Tue, 07 Nov 2023 09:09:39 GMT
 * Dependencies: [@types/node](https://npmjs.com/package/@types/node)

# Credits
These definitions were written by [Tomasz Łaziuk](https://github.com/tlaziuk).
