import { Player } from './Player';
import querystring from 'querystring';

export class YouTube implements Player {
  watchPartyYTPlayer: any | null;
  constructor(watchPartyYTPlayer: any) {
    this.watchPartyYTPlayer = watchPartyYTPlayer;
  }
  getCurrentTime = () => {
    return this.watchPartyYTPlayer?.getCurrentTime() ?? 0;
  };

  getDuration = () => {
    return this.watchPartyYTPlayer?.getDuration() ?? 0;
  };

  isMuted = () => {
    return this.watchPartyYTPlayer?.isMuted() ?? false;
  };

  isSubtitled = (): boolean => {
    try {
      const current = this.watchPartyYTPlayer?.getOption('captions', 'track');
      return Boolean(current && current.languageCode);
    } catch (e) {
      console.warn(e);
      return false;
    }
  };

  getPlaybackRate = (): number => {
    return this.watchPartyYTPlayer?.getPlaybackRate() ?? 1;
  };

  setPlaybackRate = (rate: number) => {
    this.watchPartyYTPlayer?.setPlaybackRate(rate);
  };

  setSrcAndTime = async (src: string, time: number) => {
    let url = new window.URL(src);
    // Standard link https://www.youtube.com/watch?v=ID
    let videoId = querystring.parse(url.search.substring(1))['v'];
    // Link shortener https://youtu.be/ID
    let altVideoId = src.split('/').slice(-1)[0];
    this.watchPartyYTPlayer?.cueVideoById(videoId || altVideoId, time);
  };

  playVideo = async () => {
    setTimeout(() => {
      console.log('play yt');
      this.watchPartyYTPlayer?.playVideo();
    }, 200);
  };

  pauseVideo = () => {
    this.watchPartyYTPlayer?.pauseVideo();
  };

  seekVideo = (time: number) => {
    this.watchPartyYTPlayer?.seekTo(time, true);
  };

  shouldPlay = () => {
    return (
      this.watchPartyYTPlayer?.getPlayerState() ===
        window.YT?.PlayerState.PAUSED ||
      this.getCurrentTime() === this.getDuration()
    );
  };

  setMute = (muted: boolean) => {
    if (muted) {
      this.watchPartyYTPlayer?.mute();
    } else {
      this.watchPartyYTPlayer?.unMute();
    }
  };

  setVolume = (volume: number) => {
    this.watchPartyYTPlayer?.setVolume(volume * 100);
  };

  getVolume = (): number => {
    const volume = this.watchPartyYTPlayer?.getVolume();
    return volume / 100;
  };

  showSubtitle = () => {
    const isSubtitled = this.isSubtitled();
    // console.log(isSubtitled);
    if (isSubtitled) {
      // BUG this doesn't actually set the value so subtitles can't be toggled off
      this.watchPartyYTPlayer?.setOption('captions', 'track', {});
    } else {
      this.watchPartyYTPlayer?.setOption('captions', 'reload', true);
      const tracks = this.watchPartyYTPlayer?.getOption(
        'captions',
        'tracklist'
      );
      this.watchPartyYTPlayer?.setOption('captions', 'track', tracks?.[0]);
    }
  };

  setSubtitleMode = (mode?: TextTrackMode) => {
    return;
  };

  getSubtitleMode = () => {
    return 'hidden' as TextTrackMode;
  };

  isReady = () => {
    return Boolean(this.watchPartyYTPlayer);
  };

  stopVideo = () => {
    this.watchPartyYTPlayer?.stopVideo();
  };
}
