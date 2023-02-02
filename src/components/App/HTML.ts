import { Player } from './Player';
import querystring from 'querystring';

export class HTML implements Player {
  leftVideo: HTMLMediaElement | null;
  launchMultiSelect: Function;
  constructor(videoEl: HTMLMediaElement | null, launchMultiSelect: Function) {
    this.leftVideo = videoEl;
    this.launchMultiSelect = launchMultiSelect;
  }
  getCurrentTime = () => {
    return this.leftVideo?.currentTime ?? 0;
  };

  getDuration = () => {
    return this.leftVideo?.duration ?? 0;
  };

  isMuted = () => {
    return this.leftVideo?.muted ?? false;
  };

  isSubtitled = () => {
    return this.getSubtitleMode() === 'showing';
  };

  getPlaybackRate = (): number => {
    return this.leftVideo?.playbackRate ?? 1;
  };

  setPlaybackRate = (rate: number) => {
    if (this.leftVideo) {
      this.leftVideo.playbackRate = rate;
    }
  };

  setSrcAndTime = async (src: string, time: number) => {
    const leftVideo = this.leftVideo;
    if (leftVideo) {
      leftVideo.srcObject = null;
      leftVideo.currentTime = time;
      this.setSubtitleMode('hidden');
      leftVideo.innerHTML = '';
      // Check for HLS
      // https://moctobpltc-i.akamaihd.net/hls/live/571329/eight/playlist.m3u8
      let spl = src.split('.');
      if (
        spl[spl.length - 1] === 'm3u8' &&
        !leftVideo?.canPlayType('application/vnd.apple.mpegurl')
      ) {
        let hls = new window.Hls();
        hls.loadSource(src);
        hls.attachMedia(leftVideo);
      } else if (src.startsWith('magnet:')) {
        // WebTorrent
        // magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent
        window.watchparty.webtorrent?._server?.close();
        window.watchparty.webtorrent?.destroy();
        window.watchparty.webtorrent = new window.WebTorrent();
        await navigator.serviceWorker?.register('sw.min.js');
        const controller = await navigator.serviceWorker.ready;
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log(controller, controller.active?.state);
        const server = await window.watchparty.webtorrent.createServer({
          controller,
        });
        console.log(server);
        await new Promise((resolve) => setTimeout(resolve, 500));
        await new Promise((resolve) => {
          window.watchparty.webtorrent.add(
            src,
            {
              announce: [
                'wss://tracker.btorrent.xyz',
                'wss://tracker.openwebtorrent.com',
              ],
              destroyStoreOnDestroy: true,
              maxWebConns: 4,
              path: '/tmp/webtorrent/',
              storeCacheSlots: 20,
              strategy: 'sequential',
              noPeersIntervalTime: 30,
            },
            async (torrent: any) => {
              // Got torrent metadata!
              console.log('Client is downloading:', torrent.infoHash);

              // Torrents can contain many files.
              const files = torrent.files;
              const filtered = files.filter(
                (f: any) => f.length >= 10 * 1024 * 1024
              );
              const fileIndex = querystring.parse(src)
                .fileIndex as unknown as number;
              // Try to find a single large file to play
              const target =
                files[fileIndex] ?? (filtered.length > 1 ? null : filtered[0]);
              if (!target) {
                // Open the selector
                this.launchMultiSelect(
                  files.map((f: any, i: number) => ({
                    name: f.name as string,
                    url: src + `&fileIndex=${i}`,
                    length: f.length as number,
                  }))
                );
              } else {
                target.streamTo(leftVideo);
              }
              resolve(null);
            }
          );
        });
      } else {
        leftVideo.src = src;
      }
    }
  };

  playVideo = async () => {
    if (this.leftVideo) {
      await this.leftVideo.play();
    }
  };

  pauseVideo = () => {
    if (this.leftVideo) {
      this.leftVideo.pause();
    }
  };

  seekVideo = (time: number) => {
    if (this.leftVideo) {
      this.leftVideo.currentTime = time;
    }
  };

  shouldPlay = () => {
    const leftVideo = this.leftVideo;
    return Boolean(leftVideo?.paused || leftVideo?.ended);
  };

  setMute = (muted: boolean) => {
    const leftVideo = this.leftVideo;
    if (leftVideo) {
      leftVideo.muted = muted;
    }
    const audio = document.getElementById('iPhoneAudio') as HTMLAudioElement;
    if (audio) {
      audio.muted = muted;
    }
  };

  setVolume = (volume: number) => {
    if (this.leftVideo) {
      this.leftVideo.volume = volume;
    }
  };

  getVolume = (): number => {
    return this.leftVideo?.volume ?? 1;
  };

  showSubtitle = () => {
    // No-op since we open the subtitle modal
    return;
  };

  setSubtitleMode = (mode?: TextTrackMode) => {
    if (this.leftVideo) {
      for (var i = 0; i < this.leftVideo.textTracks.length; i++) {
        this.leftVideo.textTracks[i].mode =
          mode ??
          (this.leftVideo.textTracks[i].mode === 'hidden'
            ? 'showing'
            : 'hidden');
      }
    }
  };

  getSubtitleMode = () => {
    return this.leftVideo?.textTracks[0]?.mode ?? 'hidden';
  };

  isReady = () => {
    return Boolean(this.leftVideo);
  };
}
