import type WebTorrent from 'webtorrent';
import { isHls, isMagnet } from '../../utils';
import { Player } from './Player';

export class HTML implements Player {
  elId: string;
  launchMultiSelect: (
    multi: { name: string; url: string; length: number; playFn?: () => void }[]
  ) => void;
  constructor(
    elId: string,
    launchMultiSelect: (
      multi: {
        name: string;
        url: string;
        length: number;
        playFn?: () => void;
      }[]
    ) => void
  ) {
    this.elId = elId;
    this.launchMultiSelect = launchMultiSelect;
  }

  getVideoEl = (): HTMLMediaElement => {
    return document.getElementById(this.elId) as HTMLMediaElement;
  };

  getCurrentTime = () => {
    return this.getVideoEl()?.currentTime ?? 0;
  };

  getDuration = () => {
    return this.getVideoEl()?.duration ?? 0;
  };

  isMuted = () => {
    return this.getVideoEl()?.muted ?? false;
  };

  isSubtitled = () => {
    return this.getSubtitleMode() === 'showing';
  };

  getPlaybackRate = (): number => {
    return this.getVideoEl()?.playbackRate ?? 1;
  };

  setPlaybackRate = (rate: number) => {
    if (this.getVideoEl()) {
      this.getVideoEl().playbackRate = rate;
    }
  };

  setSrcAndTime = async (src: string, time: number) => {
    const leftVideo = this.getVideoEl();
    if (leftVideo) {
      leftVideo.srcObject = null;

      // Clear subtitles
      this.setSubtitleMode('hidden');
      leftVideo.innerHTML = '';

      // Check for HLS
      // https://moctobpltc-i.akamaihd.net/hls/live/571329/eight/playlist.m3u8
      if (
        isHls(src) &&
        !leftVideo?.canPlayType('application/vnd.apple.mpegurl')
      ) {
        const Hls = (await import('hls.js')).default;
        let hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(leftVideo);
        return;
      }
      // Set to room time (don't do for HLS streams since durations will be different)
      leftVideo.currentTime = time;
      if (isMagnet(src)) {
        // WebTorrent
        // magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent
        // Can't import webtorrent directly yet since it uses importAssertions feature
        //@ts-ignore
        const WebTorrent = (await import('webtorrent/dist/webtorrent.min.js'))
          .default;
        //@ts-ignore
        window.watchparty.webtorrent?._server?.close();
        window.watchparty.webtorrent?.destroy();
        window.watchparty.webtorrent = new WebTorrent();
        await navigator.serviceWorker?.register('/sw.min.js');
        const controller = await navigator.serviceWorker.ready;
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log(controller, controller.active?.state);
        // createServer is only in v2, types are outdated
        //@ts-ignore
        const server = await window.watchparty.webtorrent.createServer({
          controller,
        });
        console.log(server);
        await new Promise((resolve) => setTimeout(resolve, 500));
        await new Promise((resolve) => {
          window.watchparty.webtorrent?.add(
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
              //@ts-ignore
              noPeersIntervalTime: 30,
            },
            async (torrent: WebTorrent.Torrent) => {
              // Got torrent metadata!
              console.log('Client is downloading:', torrent.infoHash);

              // Torrents can contain many files.
              const files = torrent.files;
              const filtered = files.filter(
                (f: WebTorrent.TorrentFile) => f.length >= 10 * 1024 * 1024
              );
              const fileIndex = new URLSearchParams(src).get(
                'fileIndex'
              ) as unknown as number;
              // Try to find a single large file to play
              const target =
                files[fileIndex] ?? (filtered.length > 1 ? null : filtered[0]);
              if (!target) {
                // Open the selector
                this.launchMultiSelect(
                  files.map((f: WebTorrent.TorrentFile, i: number) => ({
                    name: f.name as string,
                    url: src + `&fileIndex=${i}`,
                    length: f.length as number,
                  }))
                );
              } else {
                //@ts-ignore
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
    if (this.getVideoEl()) {
      await this.getVideoEl().play();
    }
  };

  pauseVideo = () => {
    if (this.getVideoEl()) {
      this.getVideoEl().pause();
    }
  };

  seekVideo = (time: number) => {
    if (this.getVideoEl()) {
      this.getVideoEl().currentTime = time;
    }
  };

  shouldPlay = () => {
    const leftVideo = this.getVideoEl();
    return Boolean(leftVideo?.paused || leftVideo?.ended);
  };

  setMute = (muted: boolean) => {
    const leftVideo = this.getVideoEl();
    if (leftVideo) {
      leftVideo.muted = muted;
    }
    const audio = document.getElementById('iPhoneAudio') as HTMLAudioElement;
    if (audio) {
      audio.muted = muted;
    }
  };

  setVolume = (volume: number) => {
    if (this.getVideoEl()) {
      this.getVideoEl().volume = volume;
    }
  };

  getVolume = (): number => {
    return this.getVideoEl()?.volume ?? 1;
  };

  setSubtitleMode = (mode?: TextTrackMode) => {
    if (this.getVideoEl()) {
      for (var i = 0; i < this.getVideoEl().textTracks.length; i++) {
        this.getVideoEl().textTracks[i].mode =
          mode ??
          (this.getVideoEl().textTracks[i].mode === 'hidden'
            ? 'showing'
            : 'hidden');
      }
    }
  };

  getSubtitleMode = () => {
    return this.getVideoEl()?.textTracks[0]?.mode ?? 'hidden';
  };

  isReady = () => {
    return Boolean(this.getVideoEl());
  };
}
