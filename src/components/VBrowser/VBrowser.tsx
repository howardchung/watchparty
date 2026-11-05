import React from "react";

import { EVENT } from "./events";
import { NekoClient } from "./client";
import GuacamoleKeyboard from "./keyboard";
import config from "../../config";
import { ActionIcon, Button, TextInput } from "@mantine/core";
import {
  IconArrowDown,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUp,
  IconBackspace,
  IconChevronDown,
  IconChevronUp,
  IconClipboard,
  IconCopy,
  IconCornerDownLeft,
  IconMouse,
  IconPointer,
  IconSend,
} from "@tabler/icons-react";

const SHIFTED_CHARS = new Set(
  '~!@#$%^&*()_+{}|:"<>?ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(""),
);

export class VBrowser extends React.Component<{
  username: string;
  password: string;
  hostname: string;
  controlling: boolean;
  resolution: string;
  setResolution: (resolution: string) => void;
  quality: string;
  setQuality: (quality: string) => void;
  doPlay: () => Promise<void>;
  isMobile: boolean;
  showTouchControls: boolean;
}> {
  state = {
    cursorPos: { x: 640, y: 360 },
    mobileTextInput: "",
    ctrlActive: false,
    altActive: false,
    shiftActive: false,
  };
  private resizeObserver?: ResizeObserver;
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
  private cursorX = 640;
  private cursorY = 360;
  private touchStartX = 0;
  private touchStartY = 0;
  private touchMoved = false;
  private twoFingerGesture = false;
  private twoFingerMoved = false;
  private lastTwoFingerX = 0;
  private lastTwoFingerY = 0;
  private scrollAccumX = 0;
  private scrollAccumY = 0;
  private longPressTriggered = false;
  private longPressTimer?: number;
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
      () => this.$client.sendMessage("chat/message"),
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
      this.cursorX = Math.min(this.cursorX, this.width);
      this.cursorY = Math.min(this.cursorY, this.height);
      // Update our state with the resolution sent from server
      this.props.setResolution(`${this.width}x${this.height}@${this.rate}`);
      this.props.setQuality(String(data.quality));
    });
    this.$client.on(EVENT.TRACK, async (track: MediaStreamTrack, stream) => {
      // console.log(track, streams);
      const video = document.getElementById("leftVideo") as HTMLVideoElement;
      video.src = "";
      video.srcObject = stream;
      // Manually play audio for iPhone Safari since this seems to create two separate streams
      if (stream.getTracks().length === 1 && track.kind === "audio") {
        const audio = document.getElementById(
          "iPhoneAudio",
        ) as HTMLAudioElement;
        audio.srcObject = new MediaStream([track]);
        audio.play();
      }
      await this.props.doPlay();
    });
    this.$client.on(EVENT.CONTROL.CLIPBOARD, this.onClipboardChanged);

    if (config.NODE_ENV === "development") {
      this.$client.on("debug", (e, data) => console.log(e, data));
    }

    const url =
      location.protocol.replace("http", "ws") +
      "//" +
      this.props.hostname +
      "/ws";
    this.$client.login(url, this.props.password, this.props.username);

    // this._container.current?.addEventListener('resize', this.onResize);
    // this.onResize();

    // document.addEventListener('fullscreenchange', () => {
    //   this.onResize();
    // });

    // document.addEventListener('focusin', this.onFocus.bind(this));
    // document.addEventListener('focusout', this.onBlur.bind(this));

    document
      .getElementById("leftOverlay")
      ?.addEventListener("wheel", this.onWheel, { passive: false });

    /* Initialize Guacamole Keyboard */
    this.keyboard.onkeydown = (key: number) => {
      if (!this.focused || !this.controlling) {
        return true;
      }
      const keyToSend = this.keyMap(key);
      this.$client.sendData("keydown", { key: keyToSend });
      return false;
    };
    this.keyboard.onkeyup = (key: number) => {
      if (!this.focused || !this.controlling) {
        return;
      }
      this.$client.sendData("keyup", { key: this.keyMap(key) });
    };
    this.keyboard.listenTo(document.getElementById("leftOverlay")!);

    if (typeof ResizeObserver !== "undefined" && this._video.current) {
      this.resizeObserver = new ResizeObserver(() => {
        this.forceUpdate();
      });
      this.resizeObserver.observe(this._video.current);
    }
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
    window.clearTimeout(this.longPressTimer);
    this.resizeObserver?.disconnect();
    this.$client.removeAllListeners();
    this.$client.logout();
  }

  takeControl = () => {
    if (this.$client.connected) {
      this.$client.sendMessage(EVENT.ADMIN.CONTROL);
      this.$client.sendMessage(EVENT.CONTROL.CLIPBOARD, { text: "" });
    } else {
      this.$client.once(EVENT.CONNECTED, () => {
        this.$client.sendMessage(EVENT.ADMIN.CONTROL);
        this.$client.sendMessage(EVENT.CONTROL.CLIPBOARD, { text: "" });
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
      typeof navigator.clipboard.writeText === "function"
    ) {
      // Received clipboard contents from vbrowser
      navigator.clipboard.writeText(clipboard);
    }
  }
  onFocus = async (e: React.MouseEvent) => {
    if (this.props.controlling) {
      if (
        navigator.clipboard &&
        typeof navigator.clipboard.readText === "function"
      ) {
        try {
          const text = await navigator.clipboard.readText();
          // send clipboard contents to vbrowser
          this.$client.sendMessage(EVENT.CONTROL.CLIPBOARD, { text });
        } catch (e) {
          console.warn(e);
        }
      }
      this.$client.sendMessage(EVENT.CONTROL.KEYBOARD, {
        capsLock: e.getModifierState("CapsLock"),
        numLock: e.getModifierState("NumLock"),
        scrollLock: e.getModifierState("ScrollLock"),
      });
    }
  };

  onBlur = () => {
    if (!this.focused || !this.controlling) {
      return;
    }

    // Reset the vbrowser clipboard (it will be repopulated the next time the controller focuses)
    this.$client.sendMessage(EVENT.CONTROL.CLIPBOARD, { text: "" });
    this.activeKeys.forEach((key) => {
      this.$client.sendData("keyup", { key });
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
    if (!rect.width || !rect.height) {
      return;
    }
    const x = Math.round((w / rect.width) * (e.clientX - rect.left));
    const y = Math.round((h / rect.height) * (e.clientY - rect.top));
    this.cursorX = Math.max(0, Math.min(w, x));
    this.cursorY = Math.max(0, Math.min(h, y));
    this.$client.sendData("mousemove", {
      x: this.cursorX,
      y: this.cursorY,
    });
  };

  moveCursorTo = (x: number, y: number) => {
    if (!this.controlling) {
      return;
    }
    this.cursorX = Math.max(0, Math.min(this.width, Math.round(x)));
    this.cursorY = Math.max(0, Math.min(this.height, Math.round(y)));
    this.$client.sendData("mousemove", {
      x: this.cursorX,
      y: this.cursorY,
    });
    this.setState({ cursorPos: { x: this.cursorX, y: this.cursorY } });
  };

  moveCursorBy = (dx: number, dy: number) => {
    this.moveCursorTo(this.cursorX + dx, this.cursorY + dy);
  };

  clickAtCursor = (button: number = 1) => {
    if (!this.controlling) {
      return;
    }
    this.$client.sendData("mousemove", {
      x: this.cursorX,
      y: this.cursorY,
    });
    this.$client.sendData("mousedown", { key: button });
    this.$client.sendData("mouseup", { key: button });
  };

  scrollAtCursor = (dx: number, dy: number) => {
    if (!this.controlling) {
      return;
    }
    this.$client.sendData("mousemove", {
      x: this.cursorX,
      y: this.cursorY,
    });
    this.$client.sendData("wheel", { x: dx, y: dy });
  };

  handleSurfaceTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!this.controlling) {
      return;
    }
    e.stopPropagation();
    window.clearTimeout(this.longPressTimer);

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
      this.touchMoved = false;
      this.twoFingerGesture = false;
      this.longPressTriggered = false;

      if (this._overlay.current) {
        const rect = this._overlay.current.getBoundingClientRect();
        if (rect.width && rect.height) {
          this.moveCursorTo(
            (this.width / rect.width) * (touch.clientX - rect.left),
            (this.height / rect.height) * (touch.clientY - rect.top),
          );
        }
      }

      this.longPressTimer = window.setTimeout(() => {
        if (!this.touchMoved && !this.twoFingerGesture) {
          this.longPressTriggered = true;
          this.clickAtCursor(3);
        }
      }, 450);
    } else if (e.touches.length >= 2) {
      this.twoFingerGesture = true;
      this.twoFingerMoved = false;
      this.scrollAccumX = 0;
      this.scrollAccumY = 0;
      this.lastTwoFingerX =
        (e.touches[0].clientX + e.touches[1].clientX) / 2;
      this.lastTwoFingerY =
        (e.touches[0].clientY + e.touches[1].clientY) / 2;
    }
  };

  handleSurfaceTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!this.controlling) {
      return;
    }
    e.stopPropagation();

    if (e.touches.length === 1 && !this.twoFingerGesture) {
      const touch = e.touches[0];
      const totalDist = Math.hypot(
        touch.clientX - this.touchStartX,
        touch.clientY - this.touchStartY,
      );
      if (totalDist > 6) {
        this.touchMoved = true;
        window.clearTimeout(this.longPressTimer);
      }
      if (this._overlay.current) {
        const rect = this._overlay.current.getBoundingClientRect();
        if (rect.width && rect.height) {
          this.moveCursorTo(
            (this.width / rect.width) * (touch.clientX - rect.left),
            (this.height / rect.height) * (touch.clientY - rect.top),
          );
        }
      }
    } else if (e.touches.length >= 2) {
      window.clearTimeout(this.longPressTimer);
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const dx = midX - this.lastTwoFingerX;
      const dy = midY - this.lastTwoFingerY;
      this.lastTwoFingerX = midX;
      this.lastTwoFingerY = midY;

      this.scrollAccumX += dx;
      this.scrollAccumY += dy;
      const step = 14;
      if (
        Math.abs(this.scrollAccumX) >= step ||
        Math.abs(this.scrollAccumY) >= step
      ) {
        this.twoFingerMoved = true;
        const wheelX =
          Math.abs(this.scrollAccumX) >= step
            ? Math.sign(this.scrollAccumX) * this.scroll
            : 0;
        const wheelY =
          Math.abs(this.scrollAccumY) >= step
            ? Math.sign(this.scrollAccumY) * this.scroll
            : 0;
        if (wheelX !== 0) {
          this.scrollAccumX %= step;
        }
        if (wheelY !== 0) {
          this.scrollAccumY %= step;
        }
        this.scrollAtCursor(wheelX, wheelY);
      }
    }
  };

  handleSurfaceTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!this.controlling) {
      return;
    }
    e.stopPropagation();
    window.clearTimeout(this.longPressTimer);

    if (this.twoFingerGesture) {
      if (e.touches.length === 0) {
        if (!this.twoFingerMoved) {
          this.clickAtCursor(3);
        }
        this.twoFingerGesture = false;
      }
      return;
    }

    if (e.touches.length === 0 && !this.touchMoved && !this.longPressTriggered) {
      this.clickAtCursor(1);
    }
  };

  sendKeyTap = (keysym: number) => {
    if (!this.controlling) {
      return;
    }
    const { ctrlActive, altActive, shiftActive } = this.state;
    if (ctrlActive) {
      this.$client.sendData("keydown", { key: 0xffe3 });
    }
    if (altActive) {
      this.$client.sendData("keydown", { key: 0xffe9 });
    }
    if (shiftActive) {
      this.$client.sendData("keydown", { key: 0xffe1 });
    }
    const mapped = this.keyMap(keysym);
    this.$client.sendData("keydown", { key: mapped });
    this.$client.sendData("keyup", { key: mapped });
    if (shiftActive) {
      this.$client.sendData("keyup", { key: 0xffe1 });
    }
    if (altActive) {
      this.$client.sendData("keyup", { key: 0xffe9 });
    }
    if (ctrlActive) {
      this.$client.sendData("keyup", { key: 0xffe3 });
    }
    if (ctrlActive || altActive || shiftActive) {
      this.setState({
        ctrlActive: false,
        altActive: false,
        shiftActive: false,
      });
    }
  };

  charToKeysym = (ch: string): number | null => {
    if (ch === "\n" || ch === "\r") {
      return 0xff0d;
    }
    if (ch === "\t") {
      return 0xff09;
    }
    const codepoint = ch.codePointAt(0);
    if (codepoint === undefined) {
      return null;
    }
    if (codepoint <= 0xff) {
      return codepoint;
    }
    return 0x01000000 | codepoint;
  };

  sendText = (text: string, sendEnter: boolean = false) => {
    if (!this.controlling || !text) {
      if (this.controlling && sendEnter) {
        this.sendKeyTap(0xff0d);
      }
      return;
    }
    const { ctrlActive, altActive, shiftActive } = this.state;
    if ((ctrlActive || altActive || shiftActive) && text.length === 1) {
      const keysym = this.charToKeysym(text.toLowerCase());
      if (keysym !== null) {
        this.sendKeyTap(keysym);
      }
      if (sendEnter) {
        this.sendKeyTap(0xff0d);
      }
      return;
    }
    for (const ch of text) {
      const keysym = this.charToKeysym(ch);
      if (keysym === null) {
        continue;
      }
      const needsShift = SHIFTED_CHARS.has(ch);
      if (needsShift) {
        this.$client.sendData("keydown", { key: 0xffe1 });
      }
      this.$client.sendData("keydown", { key: keysym });
      this.$client.sendData("keyup", { key: keysym });
      if (needsShift) {
        this.$client.sendData("keyup", { key: 0xffe1 });
      }
    }
    if (sendEnter) {
      this.sendKeyTap(0xff0d);
    }
  };

  sendCtrlShortcut = (keysym: number) => {
    if (!this.controlling) {
      return;
    }
    this.$client.sendData("keydown", { key: 0xffe3 });
    this.$client.sendData("keydown", { key: keysym });
    this.$client.sendData("keyup", { key: keysym });
    this.$client.sendData("keyup", { key: 0xffe3 });
  };

  pasteToVBrowser = async () => {
    if (!this.controlling) {
      return;
    }
    let text = this.state.mobileTextInput;
    if (
      !text &&
      navigator.clipboard &&
      typeof navigator.clipboard.readText === "function"
    ) {
      try {
        text = await navigator.clipboard.readText();
      } catch (e) {
        console.warn(e);
      }
    }
    if (text) {
      this.$client.sendMessage(EVENT.CONTROL.CLIPBOARD, { text });
    }
    this.sendCtrlShortcut(118); // Ctrl+V
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

    this.$client.sendData("wheel", { x, y });
  };

  onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!this.controlling) {
      return;
    }
    this.onMousePos(e);
    this.$client.sendData("mousedown", { key: e.button + 1 });
  };

  onMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!this.controlling) {
      return;
    }
    this.onMousePos(e);
    this.$client.sendData("mouseup", { key: e.button + 1 });
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
    //   height = offsetHeight;
    // } else {
    //   const offsetHeight = this._player.current?.offsetHeight;
    //   height = offsetHeight;
    // }
    // this._container.current!.style.maxWidth = `${
    //   (this.horizontal / this.vertical) * height
    // }px`;
    // this._aspect.current!.style.paddingBottom = `${
    //   (this.vertical / this.horizontal) * 100
    // }%`;
  };

  render() {
    // leftVideoParent is the target for fullscreen, which loses its style when set to fullscreenElement
    // extra container layer is to be able to keep styling for overlay/video
    const cursorLeftPct = this.width
      ? (this.state.cursorPos.x / this.width) * 100
      : 50;
    const cursorTopPct = this.height
      ? (this.state.cursorPos.y / this.height) * 100
      : 50;
    return (
      <>
        <div
          id="leftVideoParent"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          <div
            ref={this._container}
            style={{
              position: "relative",
              width: "100%",
              height: document.getElementById("leftVideo")?.clientHeight,
            }}
          >
            <video
              playsInline
              ref={this._video}
              id="leftVideo"
              onLoadedMetadata={() => this.forceUpdate()}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                // maxHeight: document.fullscreenElement ? undefined : VIDEO_MAX_HEIGHT_CSS,
              }}
            />
            <div
              ref={this._overlay}
              id={"leftOverlay"}
              tabIndex={0}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: document.getElementById("leftVideo")?.clientWidth,
                height: document.getElementById("leftVideo")?.clientHeight,
                // disable firefox scrollbars?
                scrollbarWidth: "none",
                touchAction: this.props.controlling ? "none" : "auto",
                overflow: "hidden",
              }}
              onClick={this.onClick}
              onContextMenu={this.onContextMenu}
              // onWheel={this.onWheel}
              onMouseMove={this.onMouseMove}
              onMouseDown={this.onMouseDown}
              onMouseUp={this.onMouseUp}
              onMouseEnter={this.onMouseEnter}
              onMouseLeave={this.onMouseLeave}
              onTouchStart={this.handleSurfaceTouchStart}
              onTouchMove={this.handleSurfaceTouchMove}
              onTouchEnd={this.handleSurfaceTouchEnd}
            >
              {this.props.controlling && this.props.showTouchControls && (
                <div
                  style={{
                    position: "absolute",
                    left: `${cursorLeftPct}%`,
                    top: `${cursorTopPct}%`,
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    border: "2px solid #fff",
                    backgroundColor: "rgba(33, 133, 208, 0.8)",
                    boxShadow: "0 0 4px rgba(0,0,0,0.8)",
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none",
                    zIndex: 5,
                  }}
                />
              )}
            </div>
            <audio id="iPhoneAudio" />
          </div>
          {this.props.controlling && this.props.showTouchControls && (
            <div
              style={{
                width: "100%",
                backgroundColor: "rgba(20, 22, 26, 0.95)",
                borderTop: "1px solid rgba(255, 255, 255, 0.12)",
                padding: "6px 8px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                zIndex: 10,
              }}
            >
              {/* Mouse controls row */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Button
                  size="compact-xs"
                  color="blue"
                  leftSection={<IconMouse size={14} />}
                  onClick={() => this.clickAtCursor(1)}
                >
                  Left Click
                </Button>
                <Button
                  size="compact-xs"
                  color="indigo"
                  leftSection={<IconPointer size={14} />}
                  onClick={() => this.clickAtCursor(3)}
                >
                  Right Click
                </Button>
                <Button
                  size="compact-xs"
                  color="gray"
                  leftSection={<IconChevronUp size={14} />}
                  onClick={() =>
                    this.scrollAtCursor(
                      0,
                      this.scroll_invert ? this.scroll : -this.scroll,
                    )
                  }
                >
                  Scroll Up
                </Button>
                <Button
                  size="compact-xs"
                  color="gray"
                  leftSection={<IconChevronDown size={14} />}
                  onClick={() =>
                    this.scrollAtCursor(
                      0,
                      this.scroll_invert ? -this.scroll : this.scroll,
                    )
                  }
                >
                  Scroll Down
                </Button>
              </div>

              {/* Text input bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (this.state.mobileTextInput) {
                    this.sendText(this.state.mobileTextInput, true);
                    this.setState({ mobileTextInput: "" });
                  } else {
                    this.sendKeyTap(0xff0d);
                  }
                }}
                style={{
                  display: "flex",
                  gap: "4px",
                  alignItems: "center",
                }}
              >
                <TextInput
                  size="xs"
                  style={{ flexGrow: 1 }}
                  placeholder="Type text or URL..."
                  value={this.state.mobileTextInput}
                  onChange={(e) =>
                    this.setState({ mobileTextInput: e.currentTarget.value })
                  }
                />
                <Button
                  size="compact-xs"
                  color="blue"
                  leftSection={<IconSend size={14} />}
                  onClick={() => {
                    if (this.state.mobileTextInput) {
                      this.sendText(this.state.mobileTextInput, false);
                      this.setState({ mobileTextInput: "" });
                    }
                  }}
                >
                  Send
                </Button>
                <Button
                  size="compact-xs"
                  color="green"
                  type="submit"
                  leftSection={<IconCornerDownLeft size={14} />}
                >
                  Enter
                </Button>
              </form>

              {/* Special keys & shortcuts bar */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px",
                  alignItems: "center",
                }}
              >
                <Button
                  size="compact-xs"
                  color={this.state.ctrlActive ? "yellow" : "dark"}
                  onClick={() =>
                    this.setState({ ctrlActive: !this.state.ctrlActive })
                  }
                >
                  Ctrl
                </Button>
                <Button
                  size="compact-xs"
                  color={this.state.altActive ? "yellow" : "dark"}
                  onClick={() =>
                    this.setState({ altActive: !this.state.altActive })
                  }
                >
                  Alt
                </Button>
                <Button
                  size="compact-xs"
                  color={this.state.shiftActive ? "yellow" : "dark"}
                  onClick={() =>
                    this.setState({ shiftActive: !this.state.shiftActive })
                  }
                >
                  Shift
                </Button>
                <Button
                  size="compact-xs"
                  color="dark"
                  onClick={() => this.sendKeyTap(0xff1b)}
                >
                  Esc
                </Button>
                <Button
                  size="compact-xs"
                  color="dark"
                  onClick={() => this.sendKeyTap(0xff09)}
                >
                  Tab
                </Button>
                <Button
                  size="compact-xs"
                  color="dark"
                  onClick={() => this.sendKeyTap(0x0020)}
                >
                  Space
                </Button>
                <ActionIcon
                  size="sm"
                  color="dark"
                  title="Backspace"
                  onClick={() => this.sendKeyTap(0xff08)}
                >
                  <IconBackspace size={16} />
                </ActionIcon>
                <ActionIcon
                  size="sm"
                  color="dark"
                  title="Left Arrow"
                  onClick={() => this.sendKeyTap(0xff51)}
                >
                  <IconArrowLeft size={16} />
                </ActionIcon>
                <ActionIcon
                  size="sm"
                  color="dark"
                  title="Up Arrow"
                  onClick={() => this.sendKeyTap(0xff52)}
                >
                  <IconArrowUp size={16} />
                </ActionIcon>
                <ActionIcon
                  size="sm"
                  color="dark"
                  title="Down Arrow"
                  onClick={() => this.sendKeyTap(0xff54)}
                >
                  <IconArrowDown size={16} />
                </ActionIcon>
                <ActionIcon
                  size="sm"
                  color="dark"
                  title="Right Arrow"
                  onClick={() => this.sendKeyTap(0xff53)}
                >
                  <IconArrowRight size={16} />
                </ActionIcon>
                <Button
                  size="compact-xs"
                  color="dark"
                  leftSection={<IconCopy size={12} />}
                  onClick={() => this.sendCtrlShortcut(99)}
                >
                  Copy
                </Button>
                <Button
                  size="compact-xs"
                  color="dark"
                  leftSection={<IconClipboard size={12} />}
                  onClick={this.pasteToVBrowser}
                >
                  Paste
                </Button>
                <Button
                  size="compact-xs"
                  color="dark"
                  onClick={() => this.sendCtrlShortcut(97)}
                >
                  Select All
                </Button>
              </div>
            </div>
          )}
        </div>
      </>
    );
  }
}
