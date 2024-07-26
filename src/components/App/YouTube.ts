import { MediaPlayerClass } from 'dashjs';
import { Player } from './Player';

export class YouTube implements Player {
  watchPartyYTPlayer: YT.Player | null;
  constructor(watchPartyYTPlayer: YT.Player | null) {
    this.watchPartyYTPlayer = watchPartyYTPlayer;
  }
  clearDashState = () => {};
  setDashState = (player: MediaPlayerClass) => {};

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
    // This actually isn't accurate after subtitles have been toggled off because track doesn't update
    // try {
    //   const current = this.watchPartyYTPlayer?.getOption('captions', 'track');
    //   return Boolean(current && current.languageCode);
    // } catch (e) {
    //   console.warn(e);
    //   return false;
    // }
    return false;
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
    let videoId = new URLSearchParams(url.search).get('v');
    // Link shortener https://youtu.be/ID
    let altVideoId = src.split('/').slice(-1)[0].split('?')[0];
    this.watchPartyYTPlayer?.cueVideoById(videoId || altVideoId, time);
    // this.watchPartyYTPlayer?.cuePlaylist({listType: 'playlist', list: 'OLAK5uy_mtoaOGQksRdPbwlNtQ9IiK67wir5QqyIc'});
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
    return (volume ?? 0) / 100;
  };

  setSubtitleMode = (mode?: TextTrackMode, lang?: string) => {
    // Show the available options
    // console.log(this.watchPartyYTPlayer?.getOptions('captions'));
    if (mode === 'showing') {
      console.log(lang);
      //@ts-ignore
      this.watchPartyYTPlayer?.setOption('captions', 'reload', true);
      //@ts-ignore
      this.watchPartyYTPlayer?.setOption('captions', 'track', {
        languageCode: lang ?? 'en',
      });
    }
    if (mode === 'hidden') {
      // BUG this doesn't actually set the value of track
      // so we can't determine if subtitles are on or off
      // need to provide separate menu options
      //@ts-ignore
      this.watchPartyYTPlayer?.setOption('captions', 'track', {});
    }
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

  clearState = () => {
    return;
  };

  loadSubtitles = async (src: string) => {
    return;
  };

  syncSubtitles = (sharerTime: number) => {
    return;
  };

  getTimeRanges = (): { start: number; end: number }[] => {
    return [
      {
        start: 0,
        end:
          (this.watchPartyYTPlayer?.getVideoLoadedFraction() ?? 0) *
          this.getDuration(),
      },
    ];
  };

  setLoop = (loop: boolean): void => {
    this.watchPartyYTPlayer?.setLoop(loop);
  };

  getVideoEl = (): HTMLMediaElement => {
    return document.getElementById('leftYt') as HTMLMediaElement;
  };
}
