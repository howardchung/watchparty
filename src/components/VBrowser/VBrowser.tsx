import React from 'react';

import { EVENT } from './events';
import { NekoClient } from '.';
import GuacamoleKeyboard from './keyboard';
import config from '../../config';

// import { EVENT } from './events';

export default class VBrowser extends React.Component<{
  username: string;
  password: string;
  hostname: string;
  controlling: boolean;
  resolution: string;
  setResolution: (resolution: string) => void;
  quality: string;
  setQuality: (quality: string) => void;
  doPlay: () => Promise<void>;
}> {
  // private observer = new ResizeObserver(this.onResize);
  private keyboard = GuacamoleKeyboard();
  private focused = false;
  private fullscreen = false;
  private activeKeys: Set<number> = new Set();
  private controlling = false;
  private scroll = 1; // 1 to 10
  private scroll_invert = true;
  private width = 1280;
  private height = 720;
  private rate = 30;
  private keepAliveInterval = 0;
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
    this.keepAliveInterval = window.setInterval(
      () => this.$client.sendMessage('chat/message'),
      30000,
    );

    this.$client.on(EVENT.CONNECTED, () => {
      if (this.props.controlling) {
        this.takeControl();
      }
    });
    this.$client.on(EVENT.DISCONNECTED, () => {
      this.$client.login(url, this.props.password, this.props.username);
    });
    this.$client.on(EVENT.SCREEN.RESOLUTION, (data) => {
      this.width = data.width;
      this.height = data.height;
      this.rate = data.rate;
      // Update our state with the resolution sent from server
      this.props.setResolution(`${this.width}x${this.height}@${this.rate}`);
      this.props.setQuality(String(data.quality));
    });
    this.$client.on(EVENT.TRACK, async (track: MediaStreamTrack, stream) => {
      // console.log(track, streams);
      const video = document.getElementById('leftVideo') as HTMLVideoElement;
      video.src = '';
      video.srcObject = stream;
      // Manually play audio for iPhone Safari since this seems to create two separate streams
      if (stream.getTracks().length === 1 && track.kind === 'audio') {
        const audio = document.getElementById(
          'iPhoneAudio',
        ) as HTMLAudioElement;
        audio.srcObject = new MediaStream([track]);
        audio.play();
      }
      await this.props.doPlay();
    });
    this.$client.on(EVENT.CONTROL.CLIPBOARD, this.onClipboardChanged);

    if (config.NODE_ENV === 'development') {
      this.$client.on('debug', (e, data) => console.log(e, data));
    }

    const url =
      location.protocol.replace('http', 'ws') +
      '//' +
      this.props.hostname +
      '/ws';
    this.$client.login(url, this.props.password, this.props.username);

    // this._container.current?.addEventListener('resize', this.onResize);
    // this.onResize();

    // document.addEventListener('fullscreenchange', () => {
    //   this.onResize();
    // });

    // document.addEventListener('focusin', this.onFocus.bind(this));
    // document.addEventListener('focusout', this.onBlur.bind(this));

    document
      .getElementById('leftOverlay')
      ?.addEventListener('wheel', this.onWheel, { passive: false });

    /* Initialize Guacamole Keyboard */
    this.keyboard.onkeydown = (key: number) => {
      if (!this.focused || !this.controlling) {
        return true;
      }
      this.$client.sendData('keydown', { key: this.keyMap(key) });
      return false;
    };
    this.keyboard.onkeyup = (key: number) => {
      if (!this.focused || !this.controlling) {
        return;
      }
      this.$client.sendData('keyup', { key: this.keyMap(key) });
    };
    this.keyboard.listenTo(document.getElementById('leftOverlay') as Element);
  }

  componentDidUpdate(prevProps: any) {
    // console.log(this.props.controlling, prevProps.controlling);
    this.controlling = this.props.controlling;
    if (this.props.controlling && !prevProps.controlling) {
      this.takeControl();
    }
    if (
      this.props.resolution !== prevProps.resolution ||
      (this.props.quality && this.props.quality !== prevProps.quality)
    ) {
      this.changeResolution(this.props.resolution, this.props.quality);
    }
  }

  componentWillUnmount() {
    window.clearInterval(this.keepAliveInterval);
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

  changeResolution = (resString: string, quality: string) => {
    const split = resString.split(/x|@/);
    const width = Number(split[0]);
    const height = Number(split[1]);
    const rate = Number(split[2]);
    this.$client.sendMessage(EVENT.SCREEN.SET, {
      width,
      height,
      rate,
      quality: Number(quality),
    });
  };

  onClipboardChanged(clipboard: string) {
    if (
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function'
    ) {
      // Received clipboard contents from vbrowser
      navigator.clipboard.writeText(clipboard);
    }
  }
  onFocus = async (e: React.MouseEvent) => {
    if (
      this.props.controlling &&
      navigator.clipboard &&
      typeof navigator.clipboard.readText === 'function'
    ) {
      const text = await navigator.clipboard.readText();
      // console.log('[FOCUS]', text);
      // send clipboard contents to vbrowser
      this.$client.sendMessage(EVENT.CONTROL.CLIPBOARD, { text });
      this.$client.sendMessage(EVENT.CONTROL.KEYBOARD, {
        capsLock: e.getModifierState('CapsLock'),
        numLock: e.getModifierState('NumLock'),
        scrollLock: e.getModifierState('ScrollLock'),
      });
    }
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
    this.$client.sendData('mousedown', { key: e.button + 1 });
  };

  onMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!this.controlling) {
      return;
    }
    this.onMousePos(e);
    this.$client.sendData('mouseup', { key: e.button + 1 });
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
    this.onFocus(e);
    this.focused = true;
  };

  onMouseLeave = (e: React.MouseEvent) => {
    if (!this.controlling) {
      return;
    }
    this._overlay.current!.blur();
    this.focused = false;
    this.keyboard.reset();
  };

  KeyTable = {
    XK_ISO_Level3_Shift: 0xfe03, // AltGr
    XK_Mode_switch: 0xff7e, // Character set switch
    XK_Control_L: 0xffe3, // Left control
    XK_Control_R: 0xffe4, // Right control
    XK_Meta_L: 0xffe7, // Left meta
    XK_Meta_R: 0xffe8, // Right meta
    XK_Alt_L: 0xffe9, // Left alt
    XK_Alt_R: 0xffea, // Right alt
    XK_Super_L: 0xffeb, // Left super
    XK_Super_R: 0xffec, // Right super
  };

  get hasMacOSKbd() {
    return /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);
  }

  keyMap(key: number): number {
    // Alt behaves more like AltGraph on macOS, so shuffle the
    // keys around a bit to make things more sane for the remote
    // server. This method is used by noVNC, RealVNC and TigerVNC
    // (and possibly others).
    if (this.hasMacOSKbd) {
      switch (key) {
        case this.KeyTable.XK_Meta_L:
          key = this.KeyTable.XK_Control_L;
          break;
        case this.KeyTable.XK_Super_L:
          key = this.KeyTable.XK_Alt_L;
          break;
        case this.KeyTable.XK_Super_R:
          key = this.KeyTable.XK_Super_L;
          break;
        case this.KeyTable.XK_Alt_L:
          key = this.KeyTable.XK_Mode_switch;
          break;
        case this.KeyTable.XK_Alt_R:
          key = this.KeyTable.XK_ISO_Level3_Shift;
          break;
      }
    }
    return key;
  }

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
      <div
        id="leftVideoParent"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <div
          ref={this._container}
          style={{ width: '100%', height: 'fit-content', position: 'relative' }}
        >
          <video
            playsInline
            ref={this._video}
            id="leftVideo"
            style={{ width: '100%' }}
          />
          <audio id="iPhoneAudio" />
          <div
            ref={this._overlay}
            id={'leftOverlay'}
            tabIndex={0}
            style={{
              width: document.getElementById('leftVideo')?.clientWidth,
              height: document.getElementById('leftVideo')?.clientHeight,
              position: 'absolute',
              top: 0,
              bottom: 0,
              // disable firefox scrollbars?
              scrollbarWidth: 'none',
            }}
            onClick={this.onClick}
            onContextMenu={this.onContextMenu}
            // onWheel={this.onWheel}
            onMouseMove={this.onMouseMove}
            onMouseDown={this.onMouseDown}
            onMouseUp={this.onMouseUp}
            onMouseEnter={this.onMouseEnter}
            onMouseLeave={this.onMouseLeave}
          />
        </div>
      </div>
    );
  }
}
