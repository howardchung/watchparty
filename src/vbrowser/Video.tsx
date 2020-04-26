import React from 'react';
import { NekoClient } from '.';

export default class Video extends React.Component{
  // @Ref('component') readonly _component!: HTMLElement;
  // @Ref('container') readonly _container!: HTMLElement;
  // @Ref('overlay') readonly _overlay!: HTMLElement;
  // @Ref('aspect') readonly _aspect!: HTMLElement;
  // @Ref('player') readonly _player!: HTMLElement;
  // @Ref('video') readonly _video!: HTMLVideoElement;
  // @Ref('resolution') readonly _resolution!: any;

  private observer = new ResizeObserver(this.onResise.bind(this));
  private focused = false;
  private fullscreen = false;
  private activeKeys: Set<number> = new Set();
  private hosting = true;
  private locked = false;
  $client = new NekoClient();

  // @Watch('width')
  // onWidthChanged(width: number) {
  //   this.onResise();
  // }

  // @Watch('height')
  // onHeightChanged(height: number) {
  //   this.onResise();
  // }

  onStreamChanged(stream?: MediaStream) {
    if (!this._video || !stream) {
      return;
    }

    if ('srcObject' in this._video) {
      this._video.srcObject = stream;
    } else {
      // @ts-ignore
      this._video.src = window.URL.createObjectURL(this.stream); // for older browsers
    }
  }

  onPlayingChanged(playing: boolean) {
    if (playing) {
      this.play();
    } else {
      this.pause();
    }
  }

  onClipboardChanged(clipboard: string) {
    if (
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function'
    ) {
      navigator.clipboard.writeText(clipboard).catch(console.error);
    }
  }

  mounted() {
    this._container.addEventListener('resize', this.onResise);
    this.onStreamChanged(this.stream);
    this.onResise();

    this.observer.observe(this._component);

    this._player.addEventListener('fullscreenchange', () => {
      this.onResise();
    });

    document.addEventListener('focusin', this.onFocus.bind(this));
    document.addEventListener('focusout', this.onBlur.bind(this));
  }

  play() {
    if (!this._video.paused || !this.playable) {
      return;
    }

    try {
      this._video
        .play()
        .then(() => {
          this.onResise();
        })
        .catch((err) => this.$log.error);
    } catch (err) {
      this.$log.error(err);
    }
  }

  pause() {
    if (this._video.paused || !this.playable) {
      return;
    }

    this._video.pause();
  }

  toggle() {
    if (!this.playable) {
      return;
    }

    if (!this.playing) {
      this.$accessor.video.play();
    } else {
      this.$accessor.video.pause();
    }
  }

  requestFullscreen() {
    this._player.requestFullscreen();
    this.onResise();
  }

  onFocus() {
    if (!document.hasFocus() || !this.$accessor.active) {
      return;
    }

    if (
      this.hosting &&
      navigator.clipboard &&
      typeof navigator.clipboard.readText === 'function'
    ) {
      navigator.clipboard
        .readText()
        .then((text) => {
          if (this.clipboard !== text) {
            this.$accessor.remote.setClipboard(text);
            this.$accessor.remote.sendClipboard(text);
          }
        })
        .catch(this.$log.error);
    }
  }

  onBlur() {
    if (!this.focused || !this.hosting || this.locked) {
      return;
    }

    for (let key of this.activeKeys) {
      this.$client.sendData('keyup', { key });
      this.activeKeys.delete(key);
    }
  }

  onMousePos(e: MouseEvent) {
    const { w, h } = this.$accessor.video.resolution;
    const rect = this._overlay.getBoundingClientRect();
    this.$client.sendData('mousemove', {
      x: Math.round((w / rect.width) * (e.clientX - rect.left)),
      y: Math.round((h / rect.height) * (e.clientY - rect.top)),
    });
  }

  onWheel(e: WheelEvent) {
    if (!this.hosting || this.locked) {
      return;
    }
    this.onMousePos(e);

    let x = e.deltaX;
    let y = e.deltaY;

    if (this.scroll_invert) {
      x = x * -1;
      y = y * -1;
    }

    x = Math.min(Math.max(x, -this.scroll), this.scroll);
    y = Math.min(Math.max(y, -this.scroll), this.scroll);

    this.$client.sendData('wheel', { x, y });
  }

  onMouseDown(e: MouseEvent) {
    if (!this.hosting || this.locked) {
      return;
    }
    this.onMousePos(e);
    this.$client.sendData('mousedown', { key: e.button });
  }

  onMouseUp(e: MouseEvent) {
    if (!this.hosting || this.locked) {
      return;
    }
    this.onMousePos(e);
    this.$client.sendData('mouseup', { key: e.button });
  }

  onMouseMove(e: MouseEvent) {
    if (!this.hosting || this.locked) {
      return;
    }
    this.onMousePos(e);
  }

  onMouseEnter(e: MouseEvent) {
    this._overlay.focus();
    this.onFocus();
    this.focused = true;
  }

  onMouseLeave(e: MouseEvent) {
    this.focused = false;
  }

  // frick you firefox
  getCode(e: KeyboardEvent): number {
    let key = e.keyCode;
    if (key === 59 && (e.key === ';' || e.key === ':')) {
      key = 186;
    }

    if (key === 61 && (e.key === '=' || e.key === '+')) {
      key = 187;
    }

    if (key === 173 && (e.key === '-' || e.key === '_')) {
      key = 189;
    }

    return key;
  }

  onKeyDown(e: KeyboardEvent) {
    if (!this.focused || !this.hosting || this.locked) {
      return;
    }

    let key = this.getCode(e);
    this.$client.sendData('keydown', { key });
    this.activeKeys.add(key);
  }

  onKeyUp(e: KeyboardEvent) {
    if (!this.focused || !this.hosting || this.locked) {
      return;
    }

    let key = this.getCode(e);
    this.$client.sendData('keyup', { key });
    this.activeKeys.delete(key);
  }

  onResise() {
    let height = 0;
    if (!this.fullscreen) {
      const { offsetWidth, offsetHeight } = this._component;
      this._player.style.width = `${offsetWidth}px`;
      this._player.style.height = `${offsetHeight}px`;
      height = offsetHeight;
    } else {
      const { offsetWidth, offsetHeight } = this._player;
      height = offsetHeight;
    }

    this._container.style.maxWidth = `${
      (this.horizontal / this.vertical) * height
    }px`;
    this._aspect.style.paddingBottom = `${
      (this.vertical / this.horizontal) * 100
    }%`;
  }
}
