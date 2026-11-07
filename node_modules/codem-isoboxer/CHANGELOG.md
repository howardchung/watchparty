## codem-isoboxer 0.3.8 (2023/02/17) ##

* Add support for prft boxes
* Add support for stts and ctts boxes
* Fix box parsing when length is equal to 0

## codem-isoboxer 0.3.7 (2019/02/04) ##

* Add support for more VisualSampleEntry types (@davemevans)

## codem-isoboxer 0.3.6 (2018/08/14) ##

* Support for emsg box version 1 (@jeoliva)

## codem-isoboxer 0.3.5 (2017/11/20) ##

* Performance improvement in data reading/writing (@nicosang)

## codem-isoboxer 0.3.4 (2017/06/16) ##

* Renamed `--no-write` to `--no-writing` to prevent naming clash

## codem-isoboxer 0.3.3 (2017/05/05) ##

* fallback for browsers that don't support `Uint8Array.from` (@bbert)

## codem-isoboxer 0.3.2 (2017/02/07) ##

* fix for rounding error on 64-bit numbers (@nicosang)

## codem-isoboxer 0.3.1 (2017/01/25) ##

* fix for zero filled buffer hang (@bendenoz)

## codem-isoboxer 0.3.0 (2016/12/23) ##

* write support (@bbert)
* encrypted boxes support (encv,enca,frma,pssh,schm,sdtp,tenc) (@nicosang)

## codem-isoboxer 0.2.10 (2016/12/02) ##

* Updated `subs` parser to follow the spec more closely (@bbert, @TobbeEdgeware)

## codem-isoboxer 0.2.9 (2016/11/29) ##

* `dref`, `url `, `urn `, `smhd` parsing (@bbert)

## codem-isoboxer 0.2.8 (2016/11/23) ##

* Improved `avc1` and `mp4a` parsers (@bbert)
* Fixes to `ftyp`, `styp` (@bbert)
* Added JSHint (`npm run jshint`)

## codem-isoboxer 0.2.7 (2016/11/11) ##

* Merged `subs` support (@TobbeEdgeware)

## codem-isoboxer 0.2.6 (2016/09/16) ##

* Added API to add additional box parsers using `addBoxParser` (@NatalyMagluy)

## codem-isoboxer 0.2.4 / 0.2.5 (2016/08/22) ##

* Split stsd into separate box parsers (entries are simply boxes)
* Added separate mp4a, avc1 parsers with minor tweaks
* Fixed an error where a null-terminated field containing a string that is not terminated might exceed box boundaries
* Updated dependencies
* (0.2.5 contains only a version bump because dist files were not updated)

## codem-isoboxer 0.2.3 (2016/03/29) ##

* Added support for mehd, mfro, stsd (partial), tfra and trex (@danotrilogic)

## codem-isoboxer 0.2.2 (2016/02/01) ##

* Added support for WebVTT cues (vttC, vttc, vlab, payl, vtte)
* Updated UTF-8 decoder

## codem-isoboxer 0.2.1 (2015/07/29) ##

* Added support for `elst` box
* Fixed build

## codem-isoboxer 0.2.0 (2015/07/29) ##

* Added support for modular builds (#1). See README (Advanced build options) for details.

## codem-isoboxer 0.1.1 (2015/07/06) ##

* Added support for `hdlr` box

## codem-isoboxer 0.1.0 (2015/06/02) ##

* Improved performance for `fetch` function

## codem-isoboxer 0.0.6 (2015/05/13) ##

* Basic support for incomplete buffers (flagged with `_incomplete` property)
* Added support for `ssix` box
* Added `_root` property

## codem-isoboxer 0.0.5 (2015/04/17) ##

* Added support for TextDecoder to convert DataViews to strings (when available)
* Added test suite

## codem-isoboxer 0.0.4 (2015/04/02) ##

* Renamed ISOBoxer.create to ISOBoxer.parseBuffer (be explicit about function names)
* Fixed error in bit-shifting

## codem-isoboxer 0.0.3 (2015/03/26) ##

* Added a simple utility function to convert a DataView to a string (ISOBoxer.Utils.dataViewToString)

## codem-isoboxer 0.0.2 (2015/03/26) ##

* Added `fetch` and `fetchAll` functions to ISOFile

## codem-isoboxer 0.0.1 (2015/03/26) ##

* Initial release