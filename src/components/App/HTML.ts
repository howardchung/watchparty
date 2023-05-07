import { default as toWebVTT } from 'srt-webvtt';
import { Player } from './Player';

export class HTML implements Player {
  elId: string;
  constructor(elId: string) {
    this.elId = elId;
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
      leftVideo.currentTime = time;
      leftVideo.src = src;
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

  clearState = () => {
    const leftVideo = this.getVideoEl();

    // Clear src and srcObject
    leftVideo.src = '';
    leftVideo.srcObject = null;

    // Clear subtitles
    this.setSubtitleMode('hidden');
    leftVideo.innerHTML = '';
  };

  loadSubtitles = async (src: string) => {
    const leftVideo = this.getVideoEl();
    if (!leftVideo) {
      return;
    }
    // Clear subtitles and put new ones in
    leftVideo.innerHTML = '';
    if (Boolean(src)) {
      let subtitleSrc = src;
      if (subtitleSrc) {
        const response = await window.fetch(subtitleSrc);
        const buffer = await response.arrayBuffer();
        const url = await toWebVTT(new Blob([buffer]));
        const track = document.createElement('track');
        track.kind = 'captions';
        track.label = 'English';
        track.srclang = 'en';
        track.src = url;
        leftVideo.appendChild(track);
        leftVideo.textTracks[0].mode = 'showing';
      }
    }
  };

  syncSubtitles = (sharerTime: number) => {
    // When sharing, our timestamp doesn't match the subtitles so adjust them
    // For each cue, subtract the videoTS of the sharer, then add our own
    const leftVideo = this.getVideoEl();
    const track = leftVideo?.textTracks[0];
    let offset = leftVideo.currentTime - sharerTime;
    if (track && track.cues && offset) {
      for (let i = 0; i < track.cues.length; i++) {
        let cue = track?.cues?.[i];
        if (!cue) {
          continue;
        }
        // console.log(cue.text, offset, (cue as any).origStart, (cue as any).origEnd);
        if (!(cue as any).origStart) {
          (cue as any).origStart = cue.startTime;
          (cue as any).origEnd = cue.endTime;
        }
        cue.startTime = (cue as any).origStart + offset;
        cue.endTime = (cue as any).origEnd + offset;
      }
    }
  };

  getTimeRanges = (): { start: number; end: number }[] => {
    const leftVideo = this.getVideoEl();
    const buffers = [];
    const rangeCount = leftVideo?.buffered.length;
    for (let i = 0; i < rangeCount; i++) {
      const start = leftVideo?.buffered.start(i);
      const end = leftVideo?.buffered.end(i);
      buffers.push({ start, end });
    }
    return buffers;
  };

  setLoop = (loop: boolean): void => {
    const leftVideo = this.getVideoEl();
    leftVideo.loop = loop;
  };
}
