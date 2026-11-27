# Synthetic integrated-player fixture

`movie.mkv` contains a generated 320 × 180 test pattern, two generated sine-wave AAC tracks, and the authored Persian captions in `captions.srt`. It contains no third-party media. Container duration: 27 seconds (`-shortest` ends at the last subtitle). It exercises the actual AVPlayer demuxer, native MediaSource decoding, audio selection, and subtitle renderer.

Generated with FFmpeg 6.1.1:

```sh
ffmpeg -f lavfi -i 'testsrc2=size=320x180:rate=12:duration=32' \
  -f lavfi -i 'sine=frequency=440:sample_rate=48000:duration=32' \
  -f lavfi -i 'sine=frequency=880:sample_rate=48000:duration=32' \
  -i captions.srt -map 0:v -map 1:a -map 2:a -map 3:s \
  -c:v libx264 -preset veryfast -crf 32 -g 24 -c:a aac -b:a 32k -c:s srt \
  -metadata:s:a:0 language=fas -metadata:s:a:0 title=Persian \
  -metadata:s:a:1 language=eng -metadata:s:a:1 title=English \
  -metadata:s:s:0 language=fas -metadata:s:s:0 title=Persian -shortest movie.mkv
```


Default-player regression variants use the same synthetic source, with no personal media:

```sh
ffmpeg -i movie.mkv -map 0:v:0 -map 0:a:0 -c copy -movflags +faststart movie.mp4
ffmpeg -i movie.mkv -map 0:v:0 -map 0:a:0 -c:v libvpx-vp9 -b:v 80k -c:a libopus movie.webm
```


`sync-long.mp4` is an additional authored 120-second solid-color H.264/AAC fixture. It keeps the owner playing while a joining player's decoder and bounded admission retry settle, without reaching the end of the shorter track-selection fixture. Generated with FFmpeg 6.1.1:

```sh
ffmpeg -f lavfi -i 'color=c=0x354f52:size=160x90:rate=6:duration=120' \
  -f lavfi -i 'sine=frequency=440:sample_rate=16000:duration=120' \
  -c:v libx264 -preset ultrafast -crf 35 -g 12 -c:a aac -b:a 16k \
  -movflags +faststart sync-long.mp4
```

`hevc-main10.mkv` is a 12-second synthetic 160×90 test pattern with AAC audio.
It exercises the software renderer, including a seek away from its first frame.

```sh
ffmpeg -f lavfi -i testsrc2=size=160x90:rate=15 -f lavfi -i sine=frequency=440:sample_rate=48000 \
  -t 12 -c:v libx265 -pix_fmt yuv420p10le -preset ultrafast -x265-params keyint=15 \
  -c:a aac -b:a 32k hevc-main10.mkv
```
