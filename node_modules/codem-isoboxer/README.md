# codem-isoboxer

[![Build Status](https://travis-ci.org/madebyhiro/codem-isoboxer.svg?branch=master)](https://travis-ci.org/madebyhiro/codem-isoboxer)

* http://github.com/madebyhiro/codem-isoboxer

## Description

`codem-isoboxer` is a lightweight JavaScript MP4 (MPEG-4, ISOBMFF) parser. It is meant to be small, fast and efficient. A typical use-case would be inclusion in a new player framework (for emerging standards such as MPEG-DASH which rely on ISOBMFF for most situations, or HLS using fragmented MP4) or to extract metadata from MPEG-4 files:

* Parsing `emsg` boxes for in-band events;
* Parsing `mdat` boxes for extracting subtitles;
* Validating ISOBMFF segments before playing them back;
* [etc.]

Currently a limited set of ISOBMFF boxes is supported:

### ISO/IEC 14496-12:2012 (ISOBMFF)
* ardi
* dinf
* edts
* elst
* elng
* free / skip
* ftyp / styp
* grpl
* hdlr
* imda
* kind
* labl
* mdat
* mdia
* mdhd
* meco
* mehd
* meta
* mfhd
* mfra
* mfro
* minf
* moov / moof
* mp4a / enca
* mvex
* mvhd / mfhd
* prsl
* sidx
* ssix
* stbl
* stsd
* strk
* subs
* tfhd / tkhd
* tfdt
* tfra
* traf / trak
* tref
* trex
* trun
* udta

### ISO/IEC 23009-1:2014 (MPEG-DASH)

* emsg

### ISO/IEC 14496-30:2014 (Timed text and other visual overlays in ISOBMFF)

* vttC
* vttc
* vtte
* vlab
* payl
* sttg

### ISO/IEC 14496-15:2014 (Carriage of network abstraction layer (NAL) unit structured video in ISO base media file format)

* avc1/2/3/4 / hev1 / hvc1 / encv

Support for more boxes can easily be added by adding additional box parsers in `src/parsers`. Some utility functions are included to help with reading the various ISOBMFF data types from the raw file. Also, see the [Box Support page on the Wiki](https://github.com/madebyhiro/codem-isoboxer/wiki/Box-support) for a full list.

## Requirements

A modern web browser with support for:

* ArrayBuffer
* DataView
* TextDecoder (optional)

## Usage

Include one of the files in the `dist` folder (regular or minified) in your web page/application:

    <script type="text/javascript" src="iso_boxer.min.js"></script>

Then, you can parse a file by calling the `parseBuffer` function:

    var parsedFile = ISOBoxer.parseBuffer(arrayBuffer);
    console.log(parsedFile.boxes);

The `arrayBuffer` can be obtained for example by issuing an `XMLHttpRequest` with `responsetype` set to `arrayBuffer`, or by using
the `FileReader` API to read a local file.

`codem-isoboxer` makes no assumptions on the validity of the given file and/or segment. It also does minimal handling of the data
types and provides mostly a raw interface. Some frequently used attributes are parsed to easier-to-use types, such as the major
brand and list of compatible brands in the `ftyp` box.

For traversing the box structure you can use the `_parent` property. It returns exactly what you expect: the parent of the
current box. The opposite is the `boxes` property (only available on container boxes such as `moov`), which gives you its children.
Every box also has a `_root` property which returns the top-level (file) container.

Another way to use the software is to only retrieve the boxes you are interested in. This way you don't have to traverse the box
structure yourself:

    var parsedFile = ISOBoxer.parseBuffer(arrayBuffer); // Parse the file
    var ftyp       = parsedFile.fetch('ftyp');          // Fetch the first box with the specified type (`ftyp`)
    var mdats      = parsedFile.fetchAll('mdat');       // Fetch all the boxes with the specified type (`mdat`)

Traversal of the box structure is always depth first. Note that while you jump directly to a box using the fetch commands, the entire parsed structure is still available, so the `_parent`, `_root` and `boxes` properties are still available.

An additional utility method is included to convert DataViews into strings. This uses the `TextDecoder` interface is available,
otherwise it falls back to a naïve implementation (bytes to character codes). If the `TextDecoder` interface is available you can
supply an additional `encoding` parameter (defaults to `utf-8`) to the function.

    var parsedFile = ISOBoxer.parseBuffer(arrayBuffer); // Parse the file
    var mdat       = parsedFile.fetch('mdat');          // Get the first 'mdat' box
    var text       = ISOBoxer.Utils.dataViewToString(mdat.data); // Convert the data into a string (e.g. captions)

Basic support for incomplete buffers is also available. Boxes and containers that cannot be fully parsed (due to an empty buffer)
will be marked with an `_incomplete` property. You can simply add new data to the `ArrayBuffer` when it becomes available and
re-parse the buffer.

### NodeJS

Does it work in NodeJS? Well, it's really meant to be run in a web browser, but since Node supports most features it shouldn't be
a problem. You can install it using NPM:

    npm install codem-isoboxer

Then use it in your code (NodeJS v0.10.36 tested, 0.12.x should work as well):

    var ISOBoxer    = require('codem-isoboxer'),
        fs          = require('fs');
    var arrayBuffer = new Uint8Array(fs.readFileSync('my_test_file.mp4')).buffer;
    var parsedFile  = ISOBoxer.parseBuffer(arrayBuffer);

Et voila. It does not support any of the fancy stream stuff from Node. Also, the Node console has some issues with printing objects
that contain buffers/dataviews/circular references. It might not look pretty in the console, but it works.

## Development

Check out the source from Github. Make changes to the files in `/src` (not in `/dist`). We use `grunt` to build the distribution files. If you add a box parser be sure to include a comment that points toward the relevant section in the specs. And if at all possible add a (small!) file to `test/fixtures` to provide an example.
The test directory is not included in the published package on npmjs.org because of the included MPEG-4 files.

### Building

    grunt

### Using grunt watcher

You can use `grunt-contrib-watch` to watch for changes to the source and automatically build it:

    grunt watch

### Tests

Included is a small set of tests which check the code against a known set of ISOBMFF files. The tests use NodeJS with `jasmine-node`.
Make sure you have the grunt watcher running, as it tests against the resulting build of the JavaScript files. Usage:

    # npm install jasmine-node -g
    # jasmine-node test/spec

When adding new parsers please consider adding an ISOBMFF test file and a relevant test spec.

Please note, for size concerns, tests are only included in the Github repository and not in the released packages on NPM.

## Advanced build options

### Writing functionality

By default, `codem-isoboxer` build file contains all the code that manages the parsing AND the writing functionalities.
If you are only interested in the parsing functionality, you can generate a build without writing functionality. The syntax for building is:

    grunt --no-writing

### Modular build

`codem-isoboxer` now has the option for modular builds. This means you can specify which boxes you are interested in during build time and you will get a generated file containing only the necessary boxes. This can help you further decrease the size of the library if you know you will only need access to some boxes. The syntax for building is:

    grunt --boxes=moov,mdat

This will generate a build that only contains the code to parse these boxes and can yield significantly smaller builds. The list needs to be comma-separated. Be sure not to include any white-space in it. Note that some parsers share identical code (e.g. `ftyp`/`styp`, `free`/`skip` and all the regular container boxes). Including one of those will automatically include the other ones as well, but at no additional build size. See `src/parsers` for a list of available parsers and see which parsers share code.

`codem-isoboxer` does not take into account the box hierarchy/dependency when building, you must explicitly specify which boxes you need (e.g. if you want to parse `mvhd` you must also include `moov`). Boxes that are not included don't have their properties set, but you can still access their type and size properties and the raw data (`._raw`).

## Demo

Open `test/index.html` in your browser. Use the file picker to select a local MPEG-4 file to parse it. Results will be in the `window.parsedFile` variable. Inspect it from your browser's console. Some test files are included in `test/fixtures` (not included in the package published on npmjs.org).

## License

`codem-isoboxer` is released under the MIT license, see `LICENSE.txt`.
