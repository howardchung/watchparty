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

  //@ts-ignore
  private observer = new ResizeObserver(this.onResize.bind(this));
  private focused = false;
  private fullscreen = false;
  private activeKeys: Set<number> = new Set();
  private hosting = true; // TODO set based on actual host
  // TODO current host can pass control around
  private locked = false;
  private scroll = 5; // 1 to 10
  // TODO customize these values
  private horizontal = 16;
  private vertical = 9;
  private width = 1280;
  private height = 720;
  private _component = this.refs.component as HTMLElement;
  private _container = this.refs.container as HTMLElement;
  private _overlay = this.refs.overlay as HTMLElement;
  private _aspect = this.refs.aspect as HTMLElement;
  private _player = this.refs.player as HTMLElement;
  private _video = document.getElementById('leftVideo') as HTMLVideoElement;
  private _resolution = this.refs.resolution;
  private $client = new NekoClient();

  // @Watch('width')
  // onWidthChanged(width: number) {
  //   this.onResise();
  // }

  // @Watch('height')
  // onHeightChanged(height: number) {
  //   this.onResise();
  // }

  componentDidMount() {
    // TODO use server-assigned values instead of defaults
    const url = 'ws://13.66.162.252:5000';;
    this.$client.login(url, 'neko', 'admin');

    this._container.addEventListener('resize', this.onResize);
    // this.onStreamChanged(this.stream);
    this.onResize();

    document.addEventListener('fullscreenchange', () => {
      this.onResize();
    });

    document.addEventListener('focusin', this.onFocus.bind(this));
    document.addEventListener('focusout', this.onBlur.bind(this));
  }

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

  onClipboardChanged(clipboard: string) {
    if (
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function'
    ) {
      navigator.clipboard.writeText(clipboard).catch(console.error);
    }
  }

  async onFocus() {
    if (!document.hasFocus()) {
      return;
    }

    if (
      this.hosting &&
      navigator.clipboard &&
      typeof navigator.clipboard.readText === 'function'
    ) {
      const text = await navigator.clipboard.readText();
      // TODO send clipboard to remote
    }
  }

  onBlur() {
    if (!this.focused || !this.hosting || this.locked) {
      return;
    }

    this.activeKeys.forEach(key => {
      this.$client.sendData('keyup', { key });
      this.activeKeys.delete(key);
    });
  }

  onMousePos(e: MouseEvent) {
    // TODO allow reading remote resolution
    const { w, h } = { w: this.width, h: this.height };
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

  onResize() {
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

  render() {
    return <div ref="component">
    <div ref="player">
      <div ref="container">
        <video ref="video" id="leftVideo" />
        <div
          ref="overlay"
          tabIndex={0}
          // @click.stop.prevent
          // @contextmenu.stop.prevent
          // @wheel.stop.prevent="onWheel"
          // @mousemove.stop.prevent="onMouseMove"
          // @mousedown.stop.prevent="onMouseDown"
          // @mouseup.stop.prevent="onMouseUp"
          // @mouseenter.stop.prevent="onMouseEnter"
          // @mouseleave.stop.prevent="onMouseLeave"
          // @keydown.stop.prevent="onKeyDown"
          // @keyup.stop.prevent="onKeyUp"
        />
        <div ref="aspect" />
      </div>
      <div ref="resolution" />
    </div>
  </div>;
  }
}
