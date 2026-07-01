# create-torrent [![ci][ci-image]][ci-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url] [![javascript style guide][standard-image]][standard-url]

[ci-image]: https://github.com/webtorrent/create-torrent/actions/workflows/ci.yml/badge.svg
[ci-url]: https://github.com/webtorrent/create-torrent/actions/workflows/ci.yml
[npm-image]: https://img.shields.io/npm/v/create-torrent.svg
[npm-url]: https://npmjs.org/package/create-torrent
[downloads-image]: https://img.shields.io/npm/dm/create-torrent.svg
[downloads-url]: https://npmjs.org/package/create-torrent
[standard-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[standard-url]: https://standardjs.com

#### Create .torrent files

![creation](https://raw.githubusercontent.com/webtorrent/create-torrent/master/img.jpg)

This module is used by [WebTorrent](http://webtorrent.io)! This module works in node.js and the browser (with [browserify](http://browserify.org/)).

### install

```
npm install create-torrent
```

### usage

The simplest way to use `create-torrent` is like this:

```js
import createTorrent from 'create-torrent'
import fs from 'fs'

createTorrent('/path/to/folder', (err, torrent) => {
  if (!err) {
    // `torrent` is a Buffer with the contents of the new .torrent file
    fs.writeFile('my.torrent', torrent)
  }
})
```

A reasonable piece length (approx. 1024 pieces) will automatically be selected
for the .torrent file, or you can override it if you want a different size (See
API docs below).

### api

#### `createTorrent(input, [opts], function callback (err, torrent) {})`

Create a new `.torrent` file.

`input` can be any of the following:

- path to the file or folder on filesystem (string)
- W3C [File](https://developer.mozilla.org/en-US/docs/Web/API/File) object (from an `<input>` or drag and drop)
- W3C [FileList](https://developer.mozilla.org/en-US/docs/Web/API/FileList) object (basically an array of `File` objects)
- Node [Buffer](http://nodejs.org/api/buffer.html) object
- Node [stream.Readable](http://nodejs.org/api/stream.html) object

Or, an **array of `string`, `File`, `Buffer`, or `stream.Readable` objects**.

`opts` is optional and allows you to set special settings on the produced .torrent file.

``` js
{
  name: String,             // name of the torrent (default = basename of `path`, or 1st file's name)
  comment: String,          // free-form textual comments of the author
  createdBy: String,        // name and version of program used to create torrent
  creationDate: Date        // creation time in UNIX epoch format (default = now)
  filterJunkFiles: Boolean, // remove hidden and other junk files? (default = true)
  private: Boolean,         // is this a private .torrent? (default = false)
  pieceLength: Number,      // force a custom piece length (number of bytes)
  maxPieceLength: Number,   // force a maximum piece length for auto piece length selection, does not affect pieceLength option (default = 4 MiB)
  announceList: [[String]], // custom trackers (array of arrays of strings) (see [bep12](http://www.bittorrent.org/beps/bep_0012.html))
  urlList: [String],        // web seed urls (see [bep19](http://www.bittorrent.org/beps/bep_0019.html))
  info: Object,             // add non-standard info dict entries, e.g. info.source, a convention for cross-seeding
  onProgress: Function      // called with the number of bytes hashed and estimated total size after every piece
}
```

If `announceList` is omitted, the following trackers will be included automatically:

- udp://tracker.leechers-paradise.org:6969
- udp://tracker.coppersurfer.tk:6969
- udp://tracker.opentrackr.org:1337
- udp://explodie.org:6969
- udp://tracker.empire-js.us:1337
- wss://tracker.btorrent.xyz
- wss://tracker.openwebtorrent.com
- wss://tracker.webtorrent.dev

Trackers that start with `wss://` are for WebRTC peers. See
[WebTorrent](https://webtorrent.io) to learn more.

`callback` is called with an error and a Buffer of the torrent data. It is up to you to
save it to a file if that's what you want to do.

**Note:** Every torrent is required to have a name. If one is not explicitly provided
through `opts.name`, one will be determined automatically using the following logic:

- If all files share a common path prefix, that will be used. For example, if all file
  paths start with `/imgs/` the torrent name will be `imgs`.
- Otherwise, the first file that has a name will determine the torrent name. For example,
  if the first file is `/foo/bar/baz.txt`, the torrent name will be `baz.txt`.
- If no files have names (say that all files are Buffer or Stream objects), then a name
  like "Unnamed Torrent <id>" will be generated.

**Note:** Every file is required to have a name. For filesystem paths or W3C File objects,
the name is included in the object. For Buffer or Readable stream types, a `name` property
can be set on the object, like this:

```js
const buf = Buffer.from('Some file content')
buf.name = 'Some file name'
```

### command line

```
usage: create-torrent <directory OR file> {-o outfile.torrent}

Create a torrent file from a directory or file.

If an output file isn\'t specified with `-o`, the torrent file will be
written to stdout.
```

### license

MIT. Copyright (c) [Feross Aboukhadijeh](https://feross.org) and [WebTorrent, LLC](https://webtorrent.io).
