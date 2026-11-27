These small test-only MPEG-TS fixtures contain a generated black 160×90 frame sequence and a generated 440 Hz sine wave, with no external source media. They exercise actual hls.js demuxing and browser media/track behavior in player-parity.spec.ts. Manifests and WebVTT are served deterministically by the test.

Regenerate with GStreamer (not required to run the test):

```sh
gst-launch-1.0 -q videotestsrc num-buffers=60 pattern=black ! video/x-raw,width=160,height=90,framerate=30/1 ! x264enc tune=zerolatency key-int-max=30 bitrate=64 ! h264parse ! mpegtsmux ! filesink location=video.mpegts
gst-launch-1.0 -q audiotestsrc num-buffers=94 samplesperbuffer=1024 wave=sine freq=440 ! audio/x-raw,rate=48000 ! audioconvert ! avenc_aac bitrate=32000 ! aacparse ! mpegtsmux ! filesink location=audio.mpegts
```

The `default/` VOD playlist and segments come from the same synthetic MKV/MP4 fixture:

```sh
ffmpeg -i ../player-mkv/movie.mp4 -c copy -hls_time 4 -hls_playlist_type vod default/playlist.m3u8
```
