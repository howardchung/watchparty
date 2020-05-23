import React from 'react';

import { EVENT } from './events';
import { NekoClient } from '.';

// import { EVENT } from './events';

export default class VBrowser extends React.Component<{
  username: string;
  password: string;
  hostname: string;
  controlling: boolean;
  setLoadingFalse: Function;
  resolution: string;
}> {
  //@ts-ignore
  // private observer = new ResizeObserver(this.onResize);
  private focused = false;
  private fullscreen = false;
  private activeKeys: Set<number> = new Set();
  private controlling = false;
  private scroll = 1; // 1 to 10
  private scroll_invert = true;
  private width = 1280;
  private height = 720;
  // private _component = React.createRef<HTMLDivElement>();
  private _container = React.createRef<HTMLDivElement>();
  private _overlay = React.createRef<HTMLDivElement>();
  // private _aspect = React.createRef<HTMLDivElement>();
  // private _player = React.createRef<HTMLDivElement>();
  private _video = React.createRef<HTMLVideoElement>();
  // private _resolution = React.createRef<HTMLDivElement>();
  private $client: NekoClient = new NekoClient();

  componentDidMount() {
    this.controlling = this.props.controlling;

    this.$client.on(EVENT.CONNECTED, () => {
      if (this.props.controlling) {
        this.takeControl();
      }
      this.setResolution(this.props.resolution);
    });
    this.$client.on(EVENT.DISCONNECTED, () => {
      this.$client.login(url, this.props.password, this.props.username);
    });
    this.$client.on(EVENT.SCREEN.RESOLUTION, (data) => {
      this.width = data.width;
      this.height = data.height;
    });
    this.$client.on(EVENT.TRACK, (stream) => {
      // console.log(track, streams);
      const video = document.getElementById('leftVideo') as HTMLVideoElement;
      video.src = '';
      video.srcObject = stream;
      video.play();
    });

    if (process.env.NODE_ENV === 'development') {
      this.$client.on('debug', (e, data) => console.log(e, data));
    }

    const url = 'wss://' + this.props.hostname + '/';
    this.$client.login(url, this.props.password, this.props.username);

    // this._container.current?.addEventListener('resize', this.onResize);
    // this.onResize();

    // document.addEventListener('fullscreenchange', () => {
    //   this.onResize();
    // });

    document.addEventListener('focusin', this.onFocus.bind(this));
    document.addEventListener('focusout', this.onBlur.bind(this));

    document
      .getElementById('leftOverlay')
      ?.addEventListener('wheel', this.onWheel, { passive: false });
  }

  componentDidUpdate(prevProps: any) {
    // console.log(this.props.controlling, prevProps.controlling);
    this.controlling = this.props.controlling;
    if (this.props.controlling && !prevProps.controlling) {
      this.takeControl();
    }
    if (this.props.resolution !== prevProps.resolution) {
      this.setResolution(this.props.resolution);
    }
  }

  componentWillUnmount() {
    this.$client.removeAllListeners();
    this.$client.logout();
  }

  takeControl = () => {
    if (this.$client.connected) {
      this.$client.sendMessage(EVENT.ADMIN.CONTROL);
    } else {
      this.$client.once(EVENT.CONNECTED, () => {
        this.$client.sendMessage(EVENT.ADMIN.CONTROL);
      });
    }
  };

  setResolution = (resString: string) => {
    const split = resString.split(/x|@/);
    const width = Number(split[0]);
    const height = Number(split[1]);
    const rate = Number(split[2]);
    this.$client.sendMessage(EVENT.SCREEN.SET, { width, height, rate });
  };

  // onClipboardChanged(clipboard: string) {
  //   if (
  //     navigator.clipboard &&
  //     typeof navigator.clipboard.writeText === 'function'
  //   ) {
  //     navigator.clipboard.writeText(clipboard).catch(console.error);
  //   }
  // }

  onFocus = async () => {
    // if (
    //   this.hosting &&
    //   navigator.clipboard &&
    //   typeof navigator.clipboard.readText === 'function'
    // ) {
    //   const text = await navigator.clipboard.readText();
    //   console.log(text);
    //   // TODO send clipboard to remote
    // }
  };

  onBlur = () => {
    if (!this.focused || !this.controlling) {
      return;
    }

    this.activeKeys.forEach((key) => {
      this.$client.sendData('keyup', { key });
      this.activeKeys.delete(key);
    });
  };

  onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  onContextMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  onMousePos = (e: MouseEvent | React.MouseEvent) => {
    const { w, h } = { w: this.width, h: this.height };
    const rect = this._overlay.current!.getBoundingClientRect();
    this.$client.sendData('mousemove', {
      x: Math.round((w / rect.width) * (e.clientX - rect.left)),
      y: Math.round((h / rect.height) * (e.clientY - rect.top)),
    });
  };

  onWheel = (e: WheelEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!this.controlling) {
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
  };

  onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!this.controlling) {
      return;
    }
    this.onMousePos(e);
    this.$client.sendData('mousedown', { key: e.button });
  };

  onMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!this.controlling) {
      return;
    }
    this.onMousePos(e);
    this.$client.sendData('mouseup', { key: e.button });
  };

  onMouseMove = (e: React.MouseEvent) => {
    if (!this.controlling) {
      return;
    }
    this.onMousePos(e);
  };

  onMouseEnter = (e: React.MouseEvent) => {
    if (!this.controlling) {
      return;
    }
    this._overlay.current!.focus();
    this.onFocus();
    this.focused = true;
  };

  onMouseLeave = (e: React.MouseEvent) => {
    if (!this.controlling) {
      return;
    }
    this._overlay.current!.blur();
    this.focused = false;
  };

  // frick you firefox
  getCode = (e: React.KeyboardEvent): number => {
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
  };

  onKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!this.focused || !this.controlling) {
      return;
    }

    let key = this.getCode(e);
    this.$client.sendData('keydown', { key });
    this.activeKeys.add(key);
  };

  onKeyUp = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!this.focused || !this.controlling) {
      return;
    }

    let key = this.getCode(e);
    this.$client.sendData('keyup', { key });
    this.activeKeys.delete(key);
  };

  onResize = () => {
    // let height = 0;
    // if (!this.fullscreen) {
    //   const offsetWidth = this._component.current?.offsetWidth;
    //   const offsetHeight = this._component.current?.offsetHeight;
    //   this._player.current!.style.width = `${offsetWidth}px`;
    //   this._player.current!.style.height = `${offsetHeight}px`;
    //   height = offsetHeight as number;
    // } else {
    //   const offsetHeight = this._player.current?.offsetHeight;
    //   height = offsetHeight as number;
    // }
    // this._container.current!.style.maxWidth = `${
    //   (this.horizontal / this.vertical) * height
    // }px`;
    // this._aspect.current!.style.paddingBottom = `${
    //   (this.vertical / this.horizontal) * 100
    // }%`;
  };

  render() {
    return (
      <div ref={this._container} style={{ position: 'relative' }}>
        <video ref={this._video} id="leftVideo" style={{ width: '100%' }} />
        <div
          ref={this._overlay}
          id={'leftOverlay'}
          tabIndex={0}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            bottom: 0,
            overflow: 'scroll',
            overscrollBehavior: 'contain',
          }}
          onClick={this.onClick}
          onContextMenu={this.onContextMenu}
          // onWheel={this.onWheel}
          onMouseMove={this.onMouseMove}
          onMouseDown={this.onMouseDown}
          onMouseUp={this.onMouseUp}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          onKeyDown={this.onKeyDown}
          onKeyUp={this.onKeyUp}
        />
      </div>
    );
  }
}
