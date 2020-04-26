import React from 'react';
import { NekoClient } from '.';

export default class Video extends React.Component {
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
  private _component = React.createRef<HTMLDivElement>();
  private _container = React.createRef<HTMLDivElement>();
  private _overlay = React.createRef<HTMLDivElement>();
  private _aspect = React.createRef<HTMLDivElement>();
  private _player = React.createRef<HTMLDivElement>();
  private _video = React.createRef<HTMLVideoElement>();
  private _resolution = React.createRef<HTMLDivElement>();
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
    const url = 'wss://azure.howardchung.net:5000/';
    this.$client.login(url, 'neko', 'admin');
    this.$client.on('debug', (e) => console.log(e));

    this._container.current?.addEventListener('resize', this.onResize);
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

    this._video.current!.srcObject = stream;
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
      console.log(text);
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
    const rect = this._overlay.current!.getBoundingClientRect();
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
    this._overlay.current!.focus();
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
      const offsetWidth = this._component.current?.offsetWidth;
      const offsetHeight = this._component.current?.offsetHeight;
      this._player.current!.style.width = `${offsetWidth}px`;
      this._player.current!.style.height = `${offsetHeight}px`;
      height = offsetHeight as number;
    } else {
      const offsetHeight = this._player.current?.offsetHeight;
      height = offsetHeight as number;
    }

    this._container.current!.style.maxWidth = `${
      (this.horizontal / this.vertical) * height
    }px`;
    this._aspect.current!.style.paddingBottom = `${
      (this.vertical / this.horizontal) * 100
    }%`;
  }

  render() {
    return <div ref={this._component}>
    <div ref={this._player}>
      <div ref={this._container}>
        <video ref={this._video} id="leftVideo" />
        <div
          ref={this._overlay}
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
        <div ref={this._aspect} />
      </div>
      <div ref={this._resolution} />
    </div>
  </div>;
  }
}
