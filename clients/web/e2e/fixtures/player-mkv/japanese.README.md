Synthetic Japanese track fixture for `fallback-tracks.spec.ts`.

`japanese.mkv` copies eight seconds of the generated video and audio from
`movie.mkv`, with three audio streams and three SubRip subtitle streams.
Their respective language tags are `ja`, `jpn`, and absent. Titles are absent.
The authored subtitle reads `日本語の字幕` from 2 to 20 seconds. No user media
or third-party content is included.

Generate `/tmp/watchparty-ja.srt` with:

```srt
1
00:00:02,000 --> 00:00:20,000
日本語の字幕
```

Then run FFmpeg 6.1.1 from this directory:

```sh
ffmpeg -i movie.mkv -i /tmp/watchparty-ja.srt \
  -map 0:v -map 0:a:0 -map 0:a:1 -map 0:a:0 -map 1:s -map 1:s -map 1:s \
  -t 8 -c copy -map_metadata -1 \
  -metadata:s:a:0 language=ja -metadata:s:a:1 language=jpn \
  -metadata:s:s:0 language=ja -metadata:s:s:1 language=jpn japanese.mkv
```

The test fails integrated fetches but permits the browser media request to
reproduce successful fallback without presuming CORS is the original cause.
Persian discovery relies on the separately owned protocol stream-type fix in
`avPlayer.ts`; it does not require a Japanese-specific parser change.
