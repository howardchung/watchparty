import React from 'react';
import {
  Button,
  Grid,
  Segment,
  Divider,
  Dimmer,
  Loader,
  Header,
  Label,
  Input,
  Icon,
  List,
  Comment,
  Progress,
  Dropdown,
  Message,
  Modal,
  DropdownProps,
  Menu,
  Popup,
} from 'semantic-ui-react';
//@ts-ignore
import { Slider } from 'react-semantic-ui-range';
// import { v4 as uuidv4 } from 'uuid';
import querystring from 'querystring';
import { generateName } from './generateName';
//@ts-ignore
import VTTConverter from 'srt-webvtt';
//@ts-ignore
import magnet from 'magnet-uri';
//@ts-ignore
import io from 'socket.io-client';
//@ts-ignore
import { parseStringPromise } from 'xml2js';
import './App.css';
import { examples } from './examples';
import {
  testAutoplay,
  getMediaType,
  isMobile,
  formatSpeed,
  getDefaultPicture,
  getColorHex,
  formatTimestamp,
  debounce,
  decodeEntities,
  getMediaPathForList,
} from './utils';
import { getCurrentSettings } from './Settings';
import Video from './vbrowser/Video';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: any;
    YT: any;
    FB: any;
    fbAsyncInit: Function;
  }
}

const serverPath =
  process.env.REACT_APP_SERVER_HOST ||
  `${window.location.protocol}//${window.location.hostname}${
    process.env.NODE_ENV === 'production' ? '' : ':8080'
  }`;
export const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  // { urls: 'turn:13.66.162.252:3478', username: 'username', credential: 'password' },
  {
    urls: 'turn:212.47.251.184:3478',
    username: 'username',
    credential: 'password',
  },
  {
    urls: 'turn:numb.viagenie.ca',
    credential: 'watchparty',
    username: 'howardzchung@gmail.com',
  },
];

interface AppState {
  state: 'init' | 'starting' | 'connected';
  currentMedia: string;
  currentMediaPaused: boolean;
  participants: User[];
  rosterUpdateTS: Number;
  chat: ChatMessage[];
  tsMap: NumberDict;
  nameMap: StringDict;
  pictureMap: StringDict;
  myName: string;
  myPicture: string;
  loading: boolean;
  scrollTimestamp: number;
  fullScreen: boolean;
  controlsTimestamp: number;
  watchOptions: SearchResult[];
  isScreenSharing: boolean;
  isScreenSharingFile: boolean;
  isControlling: boolean;
  isVBrowser: boolean;
  fbUserID?: string;
  isFBReady: boolean;
  isYouTubeReady: boolean;
  isAutoPlayable: boolean;
  downloaded: number;
  total: number;
  speed: number;
  connections: number;
  multiStreamSelection?: any[];
  error: string;
  settings: Settings;
}

export default class App extends React.Component<null, AppState> {
  state: AppState = {
    state: 'starting',
    currentMedia: '',
    currentMediaPaused: false,
    participants: [],
    rosterUpdateTS: Number(new Date()),
    chat: [],
    tsMap: {},
    nameMap: {},
    pictureMap: {},
    myName: '',
    myPicture: '',
    loading: true,
    scrollTimestamp: 0,
    fullScreen: false,
    controlsTimestamp: 0,
    watchOptions: [],
    isScreenSharing: false,
    isScreenSharingFile: false,
    isControlling: false,
    isVBrowser: false,
    fbUserID: undefined,
    isFBReady: false,
    isYouTubeReady: false,
    isAutoPlayable: true,
    downloaded: 0,
    total: 0,
    speed: 0,
    connections: 0,
    multiStreamSelection: undefined,
    error: '',
    settings: {},
  };
  socket: any = null;
  watchPartyYTPlayer: any = null;
  ytDebounce = true;
  screenShareStream?: MediaStream;
  screenHostPC: PCDict = {};
  screenSharePC?: RTCPeerConnection;
  progressUpdater?: number;

  async componentDidMount() {
    const canAutoplay = await testAutoplay();
    this.setState({ isAutoPlayable: canAutoplay });

    document.onfullscreenchange = () => {
      this.setState({ fullScreen: Boolean(document.fullscreenElement) });
    };

    // Send heartbeat to the server
    window.setInterval(() => {
      window.fetch(serverPath + '/ping');
    }, 10 * 60 * 1000);

    this.loadSettings();
    this.loadFBData();
    this.loadYouTube();
    this.init();
  }

  loadSettings = async () => {
    // Load settings from localstorage and remote
    const customSettingsData = await fetch(serverPath + '/settings');
    const customSettings = await customSettingsData.json();
    let settings = { ...getCurrentSettings(), ...customSettings };
    this.setState({ settings });
  };

  loadFBData = () => {
    if (!window.FB || !this.socket) {
      setTimeout(this.loadFBData, 1000);
      return;
    }
    window.FB.getLoginStatus((response: any) => {
      this.setState({ isFBReady: true });
      const fbUserID =
        response.status === 'connected' && response.authResponse.userID;
      if (fbUserID) {
        window.FB.api(
          '/me',
          {
            fields: 'id,first_name,name,email,picture.width(256).height(256)',
          },
          (response: any) => {
            // console.log(response);
            const picture =
              response &&
              response.picture &&
              response.picture.data &&
              response.picture.data.url;
            const name = response && response.first_name;
            this.setState({ fbUserID });
            this.updateName(null, { value: name });
            this.updatePicture(picture);
          }
        );
      }
    });
  };

  loadYouTube = () => {
    // This code loads the IFrame Player API code asynchronously.
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag!.parentNode!.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      // Note: this fails silently if the element is not available
      const ytPlayer = new window.YT.Player('leftYt', {
        events: {
          onReady: () => {
            this.watchPartyYTPlayer = ytPlayer;
            this.setState({ isYouTubeReady: true, loading: false });
            // We might have failed to play YT originally, ask for the current video again
            if (this.isYouTube()) {
              this.socket.emit('CMD:askHost');
            }
          },
          onStateChange: (e: any) => {
            if (
              getMediaType(this.state.currentMedia) === 'youtube' &&
              e.data === window.YT?.PlayerState?.CUED
            ) {
              this.setState({ loading: false });
            }
            // console.log(this.ytDebounce, e.data, this.watchPartyYTPlayer?.getVideoUrl());
            if (
              this.ytDebounce &&
              ((e.data === window.YT?.PlayerState?.PLAYING &&
                this.state.currentMediaPaused) ||
                (e.data === window.YT?.PlayerState?.PAUSED &&
                  !this.state.currentMediaPaused))
            ) {
              this.ytDebounce = false;
              if (e.data === window.YT?.PlayerState?.PLAYING) {
                this.socket.emit('CMD:play');
                this.doPlay();
              } else {
                this.socket.emit('CMD:pause');
                this.doPause();
              }
              window.setTimeout(() => (this.ytDebounce = true), 500);
            }
          },
        },
      });
    };
  };

  init = () => {
    // Load room ID from url
    let roomId = '/default';
    let query = window.location.hash.substring(1);
    if (query) {
      roomId = '/' + query;
    }
    this.join(roomId);
  };

  join = async (roomId: string) => {
    const socket = io.connect(serverPath + roomId);
    this.socket = socket;
    socket.on('connect', async () => {
      this.setState({ state: 'connected' });
      // Load username from localstorage
      let userName = window.localStorage.getItem('watchparty-username');
      this.updateName(null, { value: userName || generateName() });
      this.loadFBData();
    });
    socket.on('error', (err: any) => {
      console.error(err);
      this.setState({ error: "There's no room with this name." });
    });
    socket.on('REC:play', () => {
      this.doPlay();
    });
    socket.on('REC:pause', () => {
      this.doPause();
    });
    socket.on('REC:seek', (data: any) => {
      this.doSeek(data);
    });
    socket.on('REC:host', (data: any) => {
      let currentMedia = data.video || '';
      if (this.isScreenShare() && !currentMedia.startsWith('screenshare://')) {
        this.stopScreenShare();
      }
      if (this.isFileShare() && !currentMedia.startsWith('fileshare://')) {
        this.stopScreenShare();
      }
      if (this.isVBrowser() && !currentMedia.startsWith('vbrowser://')) {
        this.stopVBrowser();
      }
      this.setState(
        {
          currentMedia,
          currentMediaPaused: data.paused,
          loading: Boolean(data.video),
        },
        () => {
          if (this.state.isScreenSharingFile) {
            console.log(
              'skipping REC:host video since fileshare is using leftVideo'
            );
            this.setState({ loading: false });
            return;
          }
          // Stop all players
          const leftVideo = document.getElementById(
            'leftVideo'
          ) as HTMLMediaElement;
          leftVideo?.pause();
          this.watchPartyYTPlayer?.stopVideo();

          // If we can't autoplay, start muted
          if (!this.state.isAutoPlayable) {
            this.setMute(true);
          }

          if (this.isYouTube() && !this.watchPartyYTPlayer) {
            console.log(
              'YT player not ready, onReady callback will retry when it is'
            );
          } else {
            // Start this video
            this.doSrc(data.video, data.videoTS);
            if (!data.paused) {
              this.doPlay();
            }
            leftVideo?.addEventListener(
              'loadedmetadata',
              () => {
                this.setState({ loading: false });
              },
              { once: true }
            );
            // One time, when we're ready to play
            leftVideo?.addEventListener(
              'canplay',
              () => {
                this.setState({ loading: false });
                this.jumpToLeader();
              },
              { once: true }
            );

            // Progress updater
            window.clearInterval(this.progressUpdater);
            this.setState({ downloaded: 0, total: 0, speed: 0 });
            if (currentMedia.includes('/stream?torrent=magnet')) {
              this.progressUpdater = window.setInterval(async () => {
                const response = await window.fetch(
                  currentMedia.replace('/stream', '/progress')
                );
                const data = await response.json();
                this.setState({
                  downloaded: data.downloaded,
                  total: data.total,
                  speed: data.speed,
                  connections: data.connections,
                });
              }, 1000);
            }
          }
        }
      );
    });
    socket.on('REC:chat', (data: ChatMessage) => {
      if (document.visibilityState && document.visibilityState !== 'visible') {
        new Audio('/clearly.mp3').play();
      }
      this.state.chat.push(data);
      this.setState({
        chat: this.state.chat,
        scrollTimestamp: Number(new Date()),
      });
    });
    socket.on('REC:tsMap', (data: NumberDict) => {
      this.setState({ tsMap: data });
    });
    socket.on('REC:nameMap', (data: StringDict) => {
      this.setState({ nameMap: data });
    });
    socket.on('REC:pictureMap', (data: StringDict) => {
      this.setState({ pictureMap: data });
    });
    socket.on('roster', (data: User[]) => {
      this.setState(
        { participants: data, rosterUpdateTS: Number(new Date()) },
        () => {
          this.updateScreenShare();
          this.updateVBrowser();
        }
      );
    });
    socket.on('chatinit', (data: any) => {
      this.setState({ chat: data, scrollTimestamp: Number(new Date()) });
    });
    socket.on('signalSS', async (data: any) => {
      // Handle messages received from signaling server
      const msg = data.msg;
      const from = data.from;
      // Determine whether the message came from the sharer or the sharee
      const pc = (data.sharer
        ? this.screenSharePC
        : this.screenHostPC[from]) as RTCPeerConnection;
      if (msg.ice !== undefined) {
        pc.addIceCandidate(new RTCIceCandidate(msg.ice));
      } else if (msg.sdp && msg.sdp.type === 'offer') {
        // console.log('offer');
        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        this.sendSignalSS(from, { sdp: pc.localDescription }, !data.sharer);
      } else if (msg.sdp && msg.sdp.type === 'answer') {
        pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
      }
    });
    window.setInterval(() => {
      this.socket.emit('CMD:ts', this.getCurrentTime());
    }, 1000);
  };

  setupFileShare = async () => {
    // Create an input element
    const inputElement = document.createElement('input');

    // Set its type to file
    inputElement.type = 'file';

    // Set accept to the file types you want the user to select.
    // Include both the file extension and the mime type
    // inputElement.accept = accept;

    // set onchange event to call callback when user has selected file
    inputElement.addEventListener('change', () => {
      const file = inputElement.files![0];
      const leftVideo = document.getElementById(
        'leftVideo'
      ) as HTMLMediaElement;
      leftVideo.src = URL.createObjectURL(file);
      leftVideo.play();
      //@ts-ignore
      const stream = leftVideo.captureStream();
      // Can render video to a canvas to resize it, reduce size
      stream.onaddtrack = () => {
        // console.log(stream, stream.getVideoTracks(), stream.getAudioTracks());
        if (
          !this.screenShareStream &&
          stream.getVideoTracks().length &&
          stream.getAudioTracks().length
        ) {
          stream.getVideoTracks()[0].onended = this.stopScreenShare;
          this.screenShareStream = stream;
          this.socket.emit('CMD:joinScreenShare', { file: true });
          this.setState({ isScreenSharing: true, isScreenSharingFile: true });
        }
      };
    });

    // dispatch a click event to open the file dialog
    inputElement.dispatchEvent(new MouseEvent('click'));
  };

  setupScreenShare = async () => {
    //@ts-ignore
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: 'never', width: 720, logicalSurface: true },
      audio: true,
    });
    stream.getVideoTracks()[0].onended = this.stopScreenShare;
    this.screenShareStream = stream;
    this.socket.emit('CMD:joinScreenShare');
    this.setState({ isScreenSharing: true });
  };

  stopScreenShare = async () => {
    this.screenShareStream &&
      this.screenShareStream.getTracks().forEach((track) => {
        track.stop();
      });
    this.screenShareStream = undefined;
    if (this.screenSharePC) {
      this.screenSharePC.close();
      this.screenSharePC = undefined;
    }
    Object.values(this.screenHostPC).forEach((pc) => {
      pc.close();
    });
    this.screenHostPC = {};
    if (this.state.isScreenSharing) {
      this.socket.emit('CMD:leaveScreenShare');
    }
    this.setState({ isScreenSharing: false, isScreenSharingFile: false });
  };

  updateScreenShare = async () => {
    if (!this.isScreenShare() && !this.isFileShare()) {
      return;
    }
    // TODO teardown for those who leave
    const sharer = this.state.participants.find((p) => p.isScreenShare);
    if (sharer && sharer.id === this.socket.id) {
      // We're the sharer, create a connection to each other member
      this.state.participants.forEach((user) => {
        const id = user.id;
        if (id === this.socket.id && this.state.isScreenSharingFile) {
          // Don't set up a connection to ourselves if sharing file
          return;
        }
        if (!this.screenHostPC[id]) {
          // Set up the RTCPeerConnection for sharing media to each member
          const pc = new RTCPeerConnection({ iceServers });
          this.screenHostPC[id] = pc;
          //@ts-ignore
          pc.addStream(this.screenShareStream);
          pc.onicecandidate = (event) => {
            // We generated an ICE candidate, send it to peer
            if (event.candidate) {
              this.sendSignalSS(id, { ice: event.candidate }, true);
            }
          };
          pc.onnegotiationneeded = async () => {
            // Start connection for peer's video
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            this.sendSignalSS(id, { sdp: pc.localDescription }, true);
          };
        }
      });
    }
    // We're a watcher, establish connection to sharer
    // If screensharing, sharer also does this
    // If filesharing, sharer does not do this since we use leftVideo
    if (sharer && !this.screenSharePC && !this.state.isScreenSharingFile) {
      const pc = new RTCPeerConnection({ iceServers });
      this.screenSharePC = pc;
      pc.onicecandidate = (event) => {
        // We generated an ICE candidate, send it to peer
        if (event.candidate) {
          this.sendSignalSS(sharer.id, { ice: event.candidate });
        }
      };
      //@ts-ignore
      pc.onaddstream = (event: any) => {
        console.log('stream from webrtc peer');
        // Mount the stream from peer
        const stream = event.stream;
        // console.log(stream);
        const leftVideo = document.getElementById(
          'leftVideo'
        ) as HTMLMediaElement;
        leftVideo.src = '';
        leftVideo.srcObject = stream;
        leftVideo.play();
      };
    }
  };

  setupVBrowser = async () => {
    this.socket.emit('CMD:startVBrowser');
  };

  stopVBrowser = async () => {
    this.socket.emit('CMD:stopVBrowser');
  };

  updateVBrowser = async () => {
    if (!this.isVBrowser()) {
      return;
    }
    const controller = this.state.participants.find((p) => p.isController);
    if (controller && controller.id === this.socket.id) {
      this.setState({ isControlling: true });
    } else {
      this.setState({ isControlling: false });
    }
  };

  changeController = async (e: any, data: DropdownProps) => {
    // console.log(data);
    this.socket.emit('CMD:changeController', data.value);
  };

  sendSignalSS = async (to: string, data: any, sharer?: boolean) => {
    // console.log('sendSS', to, data);
    this.socket.emit('signalSS', { to, msg: data, sharer });
  };

  isYouTube = () => {
    return getMediaType(this.state.currentMedia) === 'youtube';
  };

  isVideo = () => {
    return getMediaType(this.state.currentMedia) === 'video';
  };

  isScreenShare = () => {
    return this.state.currentMedia.startsWith('screenshare://');
  };

  isFileShare = () => {
    return this.state.currentMedia.startsWith('fileshare://');
  };

  isVBrowser = () => {
    return this.state.currentMedia.startsWith('vbrowser://');
  };

  getVBrowserPass = () => {
    return this.state.currentMedia.replace('vbrowser://', '').split('@')[0];
  };

  getVBrowserHost = () => {
    return this.state.currentMedia.replace('vbrowser://', '').split('@')[1];
  };

  getCurrentTime = () => {
    if (this.isVideo()) {
      const leftVideo = document.getElementById(
        'leftVideo'
      ) as HTMLMediaElement;
      return leftVideo.currentTime;
    }
    if (this.isYouTube()) {
      return this.watchPartyYTPlayer?.getCurrentTime();
    }
  };

  getDuration = () => {
    if (this.isVideo()) {
      const leftVideo = document.getElementById(
        'leftVideo'
      ) as HTMLMediaElement;
      return leftVideo.duration;
    }
    if (this.isYouTube()) {
      return this.watchPartyYTPlayer?.getDuration();
    }
    return 0;
  };

  isPaused = () => {
    if (this.isVideo()) {
      const leftVideo = document.getElementById(
        'leftVideo'
      ) as HTMLMediaElement;
      return leftVideo.paused || leftVideo.ended;
    }
    if (this.isYouTube()) {
      return (
        this.watchPartyYTPlayer?.getPlayerState() ===
          window.YT?.PlayerState?.PAUSED ||
        this.watchPartyYTPlayer?.getPlayerState() ===
          window.YT?.PlayerState?.ENDED
      );
    }
    return false;
  };

  isMuted = () => {
    if (this.isVideo()) {
      const leftVideo = document.getElementById(
        'leftVideo'
      ) as HTMLMediaElement;
      return leftVideo.muted;
    }
    if (this.isYouTube()) {
      return this.watchPartyYTPlayer?.isMuted();
    }
    return false;
  };

  isSubtitled = () => {
    if (this.isVideo()) {
      const leftVideo = document.getElementById(
        'leftVideo'
      ) as HTMLMediaElement;
      return (
        leftVideo.textTracks[0] && leftVideo.textTracks[0].mode === 'showing'
      );
    }
    if (this.isYouTube()) {
      try {
        const current = this.watchPartyYTPlayer?.getOption('captions', 'track');
        return Boolean(current && current.languageCode);
      } catch (e) {
        console.warn(e);
        return false;
      }
    }
    return false;
  };

  jumpToLeader = () => {
    // Jump to the leader's position
    const maxTS = Math.max(...Object.values(this.state.tsMap));
    if (maxTS > 0) {
      console.log('jump to leader at ', maxTS);
      this.doSeek(maxTS);
    }
  };

  doSrc = async (src: string, time: number) => {
    console.log('doSrc', src, time);
    if (this.isScreenShare() || this.isFileShare() || this.isVBrowser()) {
      // No-op as we'll set video when WebRTC completes
      return;
    }
    if (this.isVideo()) {
      const leftVideo = document.getElementById(
        'leftVideo'
      ) as HTMLMediaElement;
      leftVideo.srcObject = null;
      leftVideo.src = src;
      leftVideo.currentTime = time;
      // Clear subtitles
      leftVideo.innerHTML = '';
      let subtitleSrc = '';
      if (src.includes('/stream?torrent=magnet')) {
        subtitleSrc = src.replace('/stream', '/subtitles2');
      } else if (src.startsWith('http')) {
        const subtitlePath = src.slice(0, src.lastIndexOf('/') + 1);
        // Expect subtitle name to be file name + .srt
        subtitleSrc =
          subtitlePath + 'subtitles/' + this.getFileName(src) + '.srt';
      }
      if (subtitleSrc) {
        const response = await window.fetch(subtitleSrc);
        const buffer = await response.arrayBuffer();
        const vttConverter = new VTTConverter(new Blob([buffer]));
        const url = await vttConverter.getURL();
        const track = document.createElement('track');
        track.kind = 'captions';
        track.label = 'English';
        track.srclang = 'en';
        track.src = url;
        leftVideo.appendChild(track);
      }
    }
    if (this.isYouTube()) {
      let url = new window.URL(src);
      let videoId = querystring.parse(url.search.substring(1))['v'];
      this.watchPartyYTPlayer?.cueVideoById(videoId, time);
    }
  };

  doPlay = async () => {
    this.setState({ currentMediaPaused: false }, async () => {
      if (this.isVideo()) {
        const leftVideo = document.getElementById(
          'leftVideo'
        ) as HTMLMediaElement;
        await leftVideo.play();
      }
      if (this.isYouTube()) {
        console.log('play yt');
        this.watchPartyYTPlayer?.playVideo();
      }
    });
  };

  doPause = () => {
    this.setState({ currentMediaPaused: true }, async () => {
      if (this.isVideo()) {
        const leftVideo = document.getElementById(
          'leftVideo'
        ) as HTMLMediaElement;
        leftVideo.pause();
      }
      if (this.isYouTube()) {
        console.log('pause');
        this.watchPartyYTPlayer?.pauseVideo();
      }
    });
  };

  doSeek = (time: number) => {
    if (this.isVideo()) {
      const leftVideo = document.getElementById(
        'leftVideo'
      ) as HTMLMediaElement;
      leftVideo.currentTime = time;
    }
    if (this.isYouTube()) {
      this.watchPartyYTPlayer?.seekTo(time, true);
    }
  };

  togglePlay = () => {
    let shouldPlay = true;
    if (this.isVideo()) {
      const leftVideo = document.getElementById(
        'leftVideo'
      ) as HTMLMediaElement;
      shouldPlay = leftVideo.paused || leftVideo.ended;
    } else if (this.isYouTube()) {
      shouldPlay =
        this.watchPartyYTPlayer?.getPlayerState() ===
          window.YT?.PlayerState.PAUSED ||
        this.getCurrentTime() === this.getDuration();
    }
    if (shouldPlay) {
      this.socket.emit('CMD:play');
      this.doPlay();
    } else {
      this.socket.emit('CMD:pause');
      this.doPause();
    }
  };

  onSeek = (e: any, time: number) => {
    let target = Math.max(time, 0);
    if (e) {
      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const max = rect.width;
      target = (x / max) * this.getDuration();
    }
    this.doSeek(target);
    this.socket.emit('CMD:seek', target);
  };

  onVideoKeydown = (e: any) => {
    if (e.key === ' ') {
      e.preventDefault();
      this.togglePlay();
    } else if (e.key === 'ArrowRight') {
      this.onSeek(null, this.getCurrentTime() + 10);
    } else if (e.key === 'ArrowLeft') {
      this.onSeek(null, this.getCurrentTime() - 10);
    } else if (e.key === 'c') {
      this.toggleSubtitle();
    } else if (e.key === 't') {
      this.fullScreen(false);
    } else if (e.key === 'f') {
      this.fullScreen(true);
    } else if (e.key === 'm') {
      this.toggleMute();
    }
  };

  fullScreen = async (bVideoOnly: boolean) => {
    let container = document.getElementById(
      'fullScreenContainer'
    ) as HTMLElement;
    if (bVideoOnly || isMobile()) {
      container = document.getElementById(
        this.isYouTube() ? 'leftYt' : 'leftVideo'
      ) as HTMLElement;
    }
    if (!document.fullscreenElement) {
      await container.requestFullscreen();
      return;
    }
    const bChangeElements = document.fullscreenElement !== container;
    await document.exitFullscreen();
    if (bChangeElements) {
      await container.requestFullscreen();
    }
  };

  toggleMute = () => {
    this.setMute(!this.isMuted());
  };

  setMute = (muted: boolean) => {
    if (this.isVideo()) {
      const leftVideo = document.getElementById(
        'leftVideo'
      ) as HTMLMediaElement;
      leftVideo.muted = muted;
    }
    if (this.isYouTube()) {
      if (muted) {
        this.watchPartyYTPlayer?.mute();
      } else {
        this.watchPartyYTPlayer?.unMute();
      }
    }
  };

  setVolume = (volume: number) => {
    if (this.isVideo()) {
      const leftVideo = document.getElementById(
        'leftVideo'
      ) as HTMLMediaElement;
      leftVideo.volume = volume;
    }
    if (this.isYouTube()) {
      this.watchPartyYTPlayer?.setVolume(volume * 100);
    }
  };

  getVolume = () => {
    if (this.isVideo()) {
      const leftVideo = document.getElementById(
        'leftVideo'
      ) as HTMLMediaElement;
      return leftVideo.volume;
    }
    if (this.isYouTube()) {
      const volume = this.watchPartyYTPlayer?.getVolume();
      return volume / 100;
    }
  };

  toggleSubtitle = () => {
    if (this.isVideo()) {
      const leftVideo = document.getElementById(
        'leftVideo'
      ) as HTMLMediaElement;
      if (leftVideo.textTracks[0]) {
        leftVideo.textTracks[0].mode =
          leftVideo.textTracks[0].mode === 'showing' ? 'hidden' : 'showing';
      }
    }
    if (this.isYouTube()) {
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
        this.watchPartyYTPlayer?.setOption('captions', 'track', tracks[0]);
      }
    }
  };

  setMedia = (e: any, data: DropdownProps) => {
    this.socket.emit('CMD:host', data.value);
  };

  launchMultiSelect = (data: any) => {
    this.setState({ multiStreamSelection: data });
  };

  resetMultiSelect = () => {
    this.setState({ multiStreamSelection: undefined });
  };

  updateName = (e: any, data: { value: string }) => {
    this.setState({ myName: data.value });
    this.socket.emit('CMD:name', data.value);
    window.localStorage.setItem('watchparty-username', data.value);
  };

  updatePicture = (url: string) => {
    this.setState({ myPicture: url });
    this.socket.emit('CMD:picture', url);
  };

  getMediaDisplayName = (input: string) => {
    if (!input) {
      return '';
    }
    // Show the whole URL for youtube
    if (getMediaType(input) === 'youtube') {
      return input;
    }
    if (input.startsWith('screenshare://')) {
      let id = input.slice('screenshare://'.length);
      return this.state.nameMap[id] + "'s screen";
    }
    if (input.startsWith('fileshare://')) {
      let id = input.slice('fileshare://'.length);
      return this.state.nameMap[id] + "'s file";
    }
    if (input.startsWith('vbrowser://')) {
      return 'Virtual Browser';
    }
    if (input.includes('/stream?torrent=magnet')) {
      const search = new URL(input).search;
      const magnetUrl = querystring.parse(search.substring(1)).torrent;
      const magnetParsed = magnet.decode(magnetUrl);
      return magnetParsed.name;
    }
    // Get the filename out of the URL
    return input;
  };

  getFileName = (input: string) => {
    return input.split('/').slice(-1)[0];
  };

  render() {
    const sharer = this.state.participants.find((p) => p.isScreenShare);
    const controller = this.state.participants.find((p) => p.isController);
    return (
      <React.Fragment>
        {this.state.multiStreamSelection && (
          <MultiStreamModal
            streams={this.state.multiStreamSelection}
            setMedia={this.setMedia}
            resetMultiSelect={this.resetMultiSelect}
          />
        )}
        {this.state.error && (
          <Modal inverted basic open>
            <Header as="h1" style={{ textAlign: 'center' }}>
              {this.state.error}
            </Header>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                primary
                size="huge"
                onClick={() => {
                  window.location.href = '/';
                }}
                icon
                labelPosition="left"
              >
                <Icon name="home" />
                Go to home page
              </Button>
            </div>
          </Modal>
        )}
        {!this.state.error && !this.state.isAutoPlayable && (
          <Modal inverted basic open>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                primary
                size="huge"
                onClick={() => {
                  this.setState({ isAutoPlayable: true });
                  this.setMute(false);
                }}
                icon
                labelPosition="left"
              >
                <Icon name="sign-in" />
                Join Party
              </Button>
            </div>
          </Modal>
        )}
        <Banner fbUserID={this.state.fbUserID} />
        {
          <Grid stackable celled="internally">
            <Grid.Row>
              {
                <Grid.Column width={12}>
                  {this.state.state === 'connected' && <Jeopardy socket={this.socket} nameMap={this.state.nameMap} pictureMap={this.state.pictureMap} />}
                </Grid.Column>
              }
              {
                <Grid.Column
                  width={4}
                  style={{ display: 'flex', flexDirection: 'column' }}
                  className="fullHeightColumn"
                >
                  <Input
                    inverted
                    fluid
                    label={'My name is:'}
                    value={this.state.myName}
                    onChange={this.updateName}
                    icon={
                      <Icon
                        onClick={() =>
                          this.updateName(null, { value: generateName() })
                        }
                        name="refresh"
                        inverted
                        circular
                        link
                      />
                    }
                  />
                  {/* <Divider inverted horizontal></Divider> */}
                  {!this.state.fullScreen && (
                    <Chat
                      chat={this.state.chat}
                      nameMap={this.state.nameMap}
                      pictureMap={this.state.pictureMap}
                      socket={this.socket}
                      scrollTimestamp={this.state.scrollTimestamp}
                      getMediaDisplayName={this.getMediaDisplayName}
                    />
                  )}
                </Grid.Column>
              }
            </Grid.Row>
          </Grid>
        }
        {this.state.state === 'connected' && (
          <VideoChat
            socket={this.socket}
            participants={this.state.participants}
            nameMap={this.state.nameMap}
            pictureMap={this.state.pictureMap}
            tsMap={this.state.tsMap}
            rosterUpdateTS={this.state.rosterUpdateTS}
          />
        )}
      </React.Fragment>
    );
  }
}

class Banner extends React.Component<{ fbUserID: string | undefined }> {
  createRoom = async () => {
    const response = await window.fetch(serverPath + '/createRoom', {
      method: 'POST',
    });
    const data = await response.json();
    const { name } = data;
    window.location.hash = '#' + name;
    window.location.reload();
  };

  render() {
    const { fbUserID } = this.props;
    return (
      <React.Fragment>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            padding: '1em',
            paddingBottom: '0px',
          }}
        >
          <a href="/" style={{ display: 'flex' }}>
            <div
              style={{ height: '85px', width: '85px', position: 'relative' }}
            >
              <Icon
                inverted
                name="film"
                size="big"
                circular
                color="blue"
                style={{ position: 'absolute' }}
              />
              <Icon
                inverted
                name="group"
                size="big"
                circular
                color="green"
                style={{ position: 'absolute', right: 0, bottom: 0 }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                width: '130px',
              }}
            >
              <div
                style={{
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: 700,
                  color: '#2185d0',
                  fontSize: '30px',
                  lineHeight: '30px',
                }}
              >
                Watch
              </div>
              <div
                style={{
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: 700,
                  color: '#21ba45',
                  fontSize: '30px',
                  lineHeight: '30px',
                  marginLeft: 'auto',
                }}
              >
                Party
              </div>
            </div>
          </a>
          <div style={{ display: 'flex', marginLeft: '10px', alignItems: 'center' }}>
            <a
              href="https://discord.gg/3rYj5HV"
              target="_blank"
              rel="noopener noreferrer"
              className="footerIcon"
              title="Discord"
            >
              <Icon name="discord" size="big" link />
            </a>
            <a
              href="https://github.com/howardchung/watchparty"
              target="_blank"
              rel="noopener noreferrer"
              className="footerIcon"
              title="GitHub"
            >
              <Icon name="github" size="big" link />
            </a>
          </div>
          <div
            className="mobileStack"
            style={{
              display: 'flex',
              width: '450px',
              marginLeft: 'auto',
            }}
          >
            <Popup
              content="Create a new room with a random URL that you can share with friends"
              trigger={
                <Button
                  fluid
                  color="blue"
                  size="medium"
                  icon
                  labelPosition="left"
                  onClick={this.createRoom}
                  className="toolButton"
                >
                  <Icon name="certificate" />
                  New Room
                </Button>
              }
            />
            {!fbUserID && (
              <Popup
                content="Optionally sign in with Facebook to use your profile photo in chat"
                trigger={
                  <Button
                    fluid
                    icon
                    labelPosition="left"
                    onClick={() =>
                      window.FB.login(
                        (response: any) => {
                          window.location.reload();
                        },
                        { scope: 'public_profile,email' }
                      )
                    }
                    color="facebook"
                    className="toolButton"
                  >
                    <Icon name="facebook" />
                    Sign in
                  </Button>
                }
              />
            )}
            {fbUserID && (
              <Button
                fluid
                icon
                labelPosition="left"
                onClick={() =>
                  window.FB.logout((response: any) => {
                    window.location.reload();
                  })
                }
                color="facebook"
                className="toolButton"
              >
                <Icon name="facebook" />
                Sign out
              </Button>
            )}
            {/* <SettingsModal trigger={<Button fluid inverted color="green" size="medium" icon labelPosition="left" className="toolButton"><Icon name="setting" />Settings</Button>} /> */}
          </div>
        </div>
        <Divider inverted horizontal>
          <Header inverted as="h4">
            <Icon name="film" />
            Watch videos with your friends!
          </Header>
        </Divider>
      </React.Fragment>
    );
  }
}

interface VideoChatProps {
  socket: any;
  participants: User[];
  pictureMap: StringDict;
  nameMap: StringDict;
  tsMap: NumberDict;
  rosterUpdateTS: Number;
}

class VideoChat extends React.Component<VideoChatProps> {
  ourStream?: MediaStream;
  videoRefs: any = {};
  videoPCs: PCDict = {};
  socket = this.props.socket;

  componentDidMount() {
    this.socket.on('signal', this.handleSignal);
  }

  componentWillUnmount() {
    this.socket.off('signal', this.handleSignal);
  }

  componentDidUpdate(prevProps: VideoChatProps) {
    if (this.props.rosterUpdateTS !== prevProps.rosterUpdateTS) {
      this.updateWebRTC();
    }
  }

  handleSignal = async (data: any) => {
      // Handle messages received from signaling server
      const msg = data.msg;
      const from = data.from;
      const pc = this.videoPCs[from];
      console.log('recv', from, data);
      if (msg.ice !== undefined) {
        pc.addIceCandidate(new RTCIceCandidate(msg.ice));
      } else if (msg.sdp && msg.sdp.type === 'offer') {
        // console.log('offer');
        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        this.sendSignal(from, { sdp: pc.localDescription });
      } else if (msg.sdp && msg.sdp.type === 'answer') {
        pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
      }
  };

  setupWebRTC = async () => {
    // Set up our own video
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    this.ourStream = stream;
    // alert server we've joined video chat
    this.socket.emit('CMD:joinVideo');
  };

  stopWebRTC = () => {
    this.ourStream &&
      this.ourStream.getTracks().forEach((track) => {
        track.stop();
      });
    this.ourStream = undefined;
    Object.values(this.videoPCs).forEach((pc) => {
      pc.close();
    });
    this.videoPCs = {};
    this.socket.emit('CMD:leaveVideo');
  };

  toggleVideoWebRTC = () => {
    if (this.ourStream) {
      this.ourStream.getVideoTracks()[0].enabled = !this.ourStream.getVideoTracks()[0]
        .enabled;
    }
  };

  getVideoWebRTC = () => {
    return this.ourStream && this.ourStream.getVideoTracks()[0].enabled;
  };

  toggleAudioWebRTC = () => {
    if (this.ourStream) {
      this.ourStream.getAudioTracks()[0].enabled = !this.ourStream.getAudioTracks()[0]
        .enabled;
    }
  };

  getAudioWebRTC = () => {
    return (
      this.ourStream &&
      this.ourStream.getAudioTracks()[0] &&
      this.ourStream.getAudioTracks()[0].enabled
    );
  };

  updateWebRTC = () => {
    // TODO teardown connections to people who leave
    if (!this.ourStream) {
      // We haven't started video chat, exit
      return;
    }
    this.props.participants.forEach((user) => {
      const id = user.id;
      if (!user.isVideoChat || this.videoPCs[id]) {
        return;
      }
      if (id === this.socket.id) {
        this.videoPCs[id] = new RTCPeerConnection();
        this.videoRefs[id].srcObject = this.ourStream;
      } else {
        const pc = new RTCPeerConnection({ iceServers });
        this.videoPCs[id] = pc;
        // Add our own video as outgoing stream
        //@ts-ignore
        pc.addStream(this.ourStream);
        pc.onicecandidate = (event) => {
          // We generated an ICE candidate, send it to peer
          if (event.candidate) {
            this.sendSignal(id, { ice: event.candidate });
          }
        };
        //@ts-ignore
        pc.onaddstream = (event: any) => {
          // Mount the stream from peer
          const stream = event.stream;
          // console.log(stream);
          this.videoRefs[id].srcObject = stream;
        };
        // For each pair, have the lexicographically smaller ID be the offerer
        const isOfferer = this.socket.id < id;
        if (isOfferer) {
          pc.onnegotiationneeded = async () => {
            // Start connection for peer's video
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            this.sendSignal(id, { sdp: pc.localDescription });
          };
        }
      }
    });
  };

  sendSignal = async (to: string, data: any) => {
    console.log('send', to, data);
    this.socket.emit('signal', { to, msg: data });
  };

  render() {
    const { participants, pictureMap, nameMap, tsMap, socket } = this.props;
    return (
      <div
        style={{
          display: 'flex',
          width: '100%',
          paddingLeft: '1em',
          overflowX: 'scroll',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '140px',
            justifyContent: 'center',
          }}
        >
          {!this.ourStream && (
            <Button
              //fluid
              color={'purple'}
              circular
              size="big"
              icon
              //labelPosition="left"
              onClick={this.setupWebRTC}
            >
              <Icon name="video" />
              {/* {`Join`} */}
            </Button>
          )}
          {this.ourStream && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
              }}
            >
              <Button
                fluid
                color={'red'}
                size="tiny"
                icon
                labelPosition="left"
                onClick={this.stopWebRTC}
              >
                <Icon name="external" />
                {`Leave`}
              </Button>
              <Button
                fluid
                color={this.getVideoWebRTC() ? 'green' : 'red'}
                size="tiny"
                icon
                labelPosition="left"
                onClick={this.toggleVideoWebRTC}
              >
                <Icon name="video" />
                {this.getVideoWebRTC() ? 'On' : 'Off'}
              </Button>
              <Button
                fluid
                color={this.getAudioWebRTC() ? 'green' : 'red'}
                size="tiny"
                icon
                labelPosition="left"
                onClick={this.toggleAudioWebRTC}
              >
                <Icon
                  name={
                    this.getAudioWebRTC() ? 'microphone' : 'microphone slash'
                  }
                />
                {this.getAudioWebRTC() ? 'On' : 'Off'}
              </Button>
            </div>
          )}
        </div>
        <div style={{ display: 'flex' }}>
          {participants.map((p) => {
            return (
              <div key={p.id}>
                <div
                  style={{
                    position: 'relative',
                    marginLeft: '4px',
                  }}
                >
                  <div>
                    {this.ourStream && p.isVideoChat ? (
                      <video
                        ref={(el) => {
                          this.videoRefs[p.id] = el;
                        }}
                        className="videoChatContent"
                        autoPlay
                        muted={p.id === socket.id}
                        data-id={p.id}
                      />
                    ) : (
                      <img
                        className="videoChatContent"
                        src={
                          pictureMap[p.id] ||
                          getDefaultPicture(nameMap[p.id], getColorHex(p.id))
                        }
                        alt=""
                      />
                    )}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '4px',
                        left: '0px',
                        width: '100%',
                        backgroundColor: '#' + getColorHex(p.id),
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 700,
                        display: 'flex',
                      }}
                    >
                      <div
                        title={nameMap[p.id] || p.id}
                        style={{
                          width: '80px',
                          backdropFilter: 'brightness(80%)',
                          padding: '4px',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          display: 'inline-block',
                        }}
                      >
                        {p.isVideoChat && <Icon size="small" name="video" />}
                        {nameMap[p.id] || p.id}
                      </div>
                      <div
                        style={{
                          backdropFilter: 'brightness(60%)',
                          padding: '4px',
                          flexGrow: 1,
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        {formatTimestamp(tsMap[p.id] || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

interface ChatProps {
  chat: ChatMessage[];
  nameMap: StringDict;
  pictureMap: StringDict;
  socket: any;
  scrollTimestamp: number;
  className?: string;
  getMediaDisplayName: Function;
}

class Chat extends React.Component<ChatProps> {
  public state = { chatMsg: '', isNearBottom: true };
  messagesRef = React.createRef<HTMLDivElement>();

  componentDidMount() {
    this.scrollToBottom();
    this.messagesRef.current?.addEventListener('scroll', this.onScroll);
  }

  componentDidUpdate(prevProps: ChatProps) {
    if (this.props.scrollTimestamp !== prevProps.scrollTimestamp) {
      if (prevProps.scrollTimestamp === 0 || this.state.isNearBottom) {
        this.scrollToBottom();
      }
    }
  }

  updateChatMsg = (e: any, data: { value: string }) => {
    this.setState({ chatMsg: data.value });
  };

  sendChatMsg = () => {
    if (!this.state.chatMsg) {
      return;
    }
    this.setState({ chatMsg: '' });
    this.props.socket.emit('CMD:chat', this.state.chatMsg);
  };

  onScroll = () => {
    this.setState({ isNearBottom: this.isChatNearBottom() });
  };

  isChatNearBottom = () => {
    return (
      this.messagesRef.current &&
      this.messagesRef.current.scrollHeight -
        this.messagesRef.current.scrollTop -
        this.messagesRef.current.offsetHeight <
        100
    );
  };

  scrollToBottom = () => {
    if (this.messagesRef.current) {
      this.messagesRef.current.scrollTop = this.messagesRef.current.scrollHeight;
    }
  };

  formatMessage = (cmd: string, msg: string): React.ReactNode | string => {
    if (cmd === 'host') {
      return (
        <React.Fragment>
          {`changed the video to `}
          <span style={{ textTransform: 'initial' }}>
            {this.props.getMediaDisplayName(msg)}
          </span>
        </React.Fragment>
      );
    } else if (cmd === 'seek') {
      return `jumped to ${formatTimestamp(msg)}`;
    } else if (cmd === 'play') {
      return `started the video at ${formatTimestamp(msg)}`;
    } else if (cmd === 'pause') {
      return `paused the video at ${formatTimestamp(msg)}`;
    }
    return cmd;
  };

  render() {
    return (
      <Segment
        className={this.props.className}
        inverted
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          flexGrow: '1',
          minHeight: 0,
          marginTop: 0,
        }}
      >
        <div
          className="chatContainer"
          ref={this.messagesRef}
          style={{ position: 'relative' }}
        >
          <Comment.Group>
            {this.props.chat.map((msg) => (
              <ChatMessage
                key={msg.timestamp + msg.id}
                {...msg}
                pictureMap={this.props.pictureMap}
                nameMap={this.props.nameMap}
                formatMessage={this.formatMessage}
              />
            ))}
            {/* <div ref={this.messagesEndRef} /> */}
          </Comment.Group>
          {!this.state.isNearBottom && (
            <Button
              size="tiny"
              onClick={this.scrollToBottom}
              style={{
                position: 'sticky',
                bottom: 0,
                display: 'block',
                margin: '0 auto',
              }}
            >
              Jump to bottom
            </Button>
          )}
        </div>
        <Input
          inverted
          fluid
          onKeyPress={(e: any) => e.key === 'Enter' && this.sendChatMsg()}
          onChange={this.updateChatMsg}
          value={this.state.chatMsg}
          icon={
            <Icon
              onClick={this.sendChatMsg}
              name="send"
              inverted
              circular
              link
            />
          }
          placeholder="Enter a message..."
        />
      </Segment>
    );
  }
}

interface SearchComponentProps {
  setMedia: Function;
  type?: 'youtube' | 'mediaServer' | 'searchServer';
  launchMultiSelect?: Function;
  mediaPath: string | undefined;
  streamPath: string | undefined;
}

class SearchComponent extends React.Component<SearchComponentProps> {
  state = {
    results: [] as SearchResult[],
    resetDropdown: Number(new Date()),
    loading: false,
    lastResultTimestamp: Number(new Date()),
    inputMedia: undefined,
  };
  debounced: any = null;

  doSearch = async (e: any) => {
    e.persist();
    this.setState({ inputMedia: e.target.value }, () => {
      if (!this.debounced) {
        this.debounced = debounce(async () => {
          this.setState({ loading: true });
          let query = this.state.inputMedia || '';
          let results: SearchResult[] = [];
          let timestamp = Number(new Date());
          if (this.props.type === 'youtube') {
            results = await getYouTubeResults(query);
          } else if (
            this.props.type === 'mediaServer' &&
            this.props.mediaPath
          ) {
            results = await getMediaPathResults(this.props.mediaPath, query);
          } else if (
            this.props.type === 'searchServer' &&
            this.props.streamPath
          ) {
            results = await getStreamPathResults(this.props.streamPath, query);
          }
          if (timestamp > this.state.lastResultTimestamp) {
            this.setState({
              loading: false,
              results,
              lastResultTimestamp: timestamp,
            });
          }
        }, 500);
      }
      this.debounced();
    });
  };

  setMedia = (e: any, data: DropdownProps) => {
    window.setTimeout(
      () => this.setState({ resetDropdown: Number(new Date()) }),
      200
    );
    this.props.setMedia(e, data);
  };

  render() {
    const setMedia = this.setMedia;
    let placeholder = 'Search for streams';
    let icon = 'film';
    if (this.props.type === 'youtube') {
      placeholder = 'Search YouTube';
      icon = 'youtube';
    } else if (this.props.type === 'mediaServer') {
      placeholder = 'Search files';
      icon = 'file';
    }
    if (this.state.loading) {
      icon = 'loading circle notch';
    }
    return (
      <React.Fragment>
        <Dropdown
          key={this.state.resetDropdown}
          fluid
          button
          icon={icon}
          className="icon"
          labeled
          search={(() => {}) as any}
          text={placeholder}
          onSearchChange={this.doSearch}
          // onBlur={() => this.setState({ results: this.state.watchOptions })}
          //searchQuery={this.state.query}
          //loading={this.state.loading}
        >
          {Boolean(this.state.results.length) ? (
            <Dropdown.Menu>
              {this.state.results.map((result: SearchResult) => {
                if (this.props.type === 'youtube') {
                  return (
                    <YouTubeSearchResult {...result} setMedia={setMedia} />
                  );
                } else if (this.props.type === 'mediaServer') {
                  return (
                    <MediaPathSearchResult {...result} setMedia={setMedia} />
                  );
                }
                return (
                  <StreamPathSearchResult
                    {...result}
                    setMedia={setMedia}
                    launchMultiSelect={this.props.launchMultiSelect as Function}
                    streamPath={this.props.streamPath || ''}
                  />
                );
              })}
            </Dropdown.Menu>
          ) : null}
        </Dropdown>
      </React.Fragment>
    );
  }
}

const YouTubeSearchResult = (props: SearchResult & { setMedia: Function }) => {
  const result = props;
  const setMedia = props.setMedia;
  return (
    <Menu.Item
      onClick={(e) => {
        setMedia(e, { value: result.url });
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img style={{ height: '40px' }} src={result.img} alt={result.name} />
        <Icon name="youtube" />
        <div style={{ marginLeft: '5px' }}>{decodeEntities(result.name)}</div>
      </div>
    </Menu.Item>
  );
};

const MediaPathSearchResult = (
  props: SearchResult & { setMedia: Function }
) => {
  const result = props;
  const setMedia = props.setMedia;
  return (
    <Menu.Item
      onClick={(e) => {
        setMedia(e, { value: result.url });
      }}
    >
      <div style={{ display: 'flex' }}>
        <Icon name="file" />
        {result.name}
      </div>
    </Menu.Item>
  );
};

class StreamPathSearchResult extends React.Component<
  SearchResult & {
    setMedia: Function;
    launchMultiSelect: Function;
    streamPath: string;
  }
> {
  render() {
    const result = this.props;
    const setMedia = this.props.setMedia;
    return (
      <React.Fragment>
        <Menu.Item
          onClick={async (e) => {
            this.props.launchMultiSelect([]);
            let response = await window.fetch(
              this.props.streamPath +
                '/data?torrent=' +
                encodeURIComponent(result.magnet!)
            );
            let metadata = await response.json();
            // console.log(metadata);
            if (
              metadata.files.filter(
                (file: any) => file.length > 10 * 1024 * 1024
              ).length > 1
            ) {
              // Multiple large files, present user selection
              const multiStreamSelection = metadata.files.map(
                (file: any, i: number) => ({
                  ...file,
                  url:
                    this.props.streamPath +
                    '/stream?torrent=' +
                    encodeURIComponent(result.magnet!) +
                    '&fileIndex=' +
                    i,
                })
              );
              multiStreamSelection.sort((a: any, b: any) =>
                a.name.localeCompare(b.name)
              );
              this.props.launchMultiSelect(multiStreamSelection);
            } else {
              this.props.launchMultiSelect(undefined);
              setMedia(e, {
                value:
                  this.props.streamPath +
                  '/stream?torrent=' +
                  encodeURIComponent(result.magnet!),
              });
            }
          }}
        >
          <Label
            circular
            empty
            color={Number(result.seeders) ? 'green' : 'red'}
          />
          <Icon name="film" />
          {result.name +
            ' - ' +
            result.size +
            ' - ' +
            result.seeders +
            ' peers'}
        </Menu.Item>
      </React.Fragment>
    );
  }
}

interface ComboBoxProps {
  setMedia: Function;
  currentMedia: string;
  getMediaDisplayName: Function;
  launchMultiSelect: Function;
  mediaPath: string | undefined;
  streamPath: string | undefined;
}

class ComboBox extends React.Component<ComboBoxProps> {
  state = {
    inputMedia: undefined as string | undefined,
    results: undefined,
    loading: false,
    lastResultTimestamp: Number(new Date()),
  };
  debounced: any = null;

  setMedia = (e: any, data: DropdownProps) => {
    window.setTimeout(
      () => this.setState({ inputMedia: undefined, results: undefined }),
      200
    );
    this.props.setMedia(e, data);
  };

  doSearch = async (e: any) => {
    e.persist();
    this.setState({ inputMedia: e.target.value }, () => {
      if (!this.debounced) {
        this.debounced = debounce(async () => {
          this.setState({ loading: true });
          const query: string = this.state.inputMedia || '';
          let timestamp = Number(new Date());
          /* 
          If input is empty or starts with http
            If we have a mediaPath use that for results
            Else show the default list of demo videos
          If input is anything else:
            If we have a stream server use that for results
            Else search YouTube
        */
          let results: JSX.Element[] | undefined = undefined;
          if (query === '' || (query && query.startsWith('http'))) {
            if (this.props.mediaPath) {
              const data = await getMediaPathResults(
                this.props.mediaPath,
                query
              );
              results = data.map((result: SearchResult) => (
                <MediaPathSearchResult {...result} setMedia={this.setMedia} />
              ));
            } else {
              results = examples.map((option: any) => (
                <Menu.Item
                  onClick={(e: any) => this.setMedia(e, { value: option.url })}
                >
                  {option.url}
                </Menu.Item>
              ));
            }
          } else {
            if (query && query.length >= 2) {
              if (this.props.streamPath) {
                const data = await getStreamPathResults(
                  this.props.streamPath,
                  query
                );
                results = data.map((result: SearchResult) => (
                  <StreamPathSearchResult
                    {...result}
                    setMedia={this.setMedia}
                    launchMultiSelect={this.props.launchMultiSelect}
                    streamPath={this.props.streamPath || ''}
                  />
                ));
              } else {
                const data = await getYouTubeResults(query);
                results = data.map((result) => (
                  <YouTubeSearchResult {...result} setMedia={this.setMedia} />
                ));
              }
            }
          }
          if (timestamp > this.state.lastResultTimestamp) {
            this.setState({
              loading: false,
              results,
              lastResultTimestamp: timestamp,
            });
          }
        }, 500);
      }
      this.debounced();
    });
  };

  render() {
    const { currentMedia, getMediaDisplayName } = this.props;
    const { results } = this.state;
    return (
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex' }}>
          <Input
            style={{ flexGrow: 1 }}
            inverted
            fluid
            focus
            onChange={this.doSearch}
            onFocus={(e: any) => {
              e.persist();
              this.setState(
                {
                  inputMedia: getMediaDisplayName(currentMedia),
                },
                () => {
                  if (
                    !this.state.inputMedia ||
                    (this.state.inputMedia &&
                      this.state.inputMedia.startsWith('http'))
                  ) {
                    this.doSearch(e);
                  }
                }
              );
              setTimeout(() => e.target.select(), 100);
            }}
            onBlur={() =>
              setTimeout(
                () =>
                  this.setState({ inputMedia: undefined, results: undefined }),
                100
              )
            }
            onKeyPress={(e: any) => {
              if (e.key === 'Enter') {
                this.setMedia(e, {
                  value: this.state.inputMedia,
                });
              }
            }}
            icon={
              <Icon
                onClick={(e: any) =>
                  this.setMedia(e, {
                    value: this.state.inputMedia,
                  })
                }
                name="arrow right"
                link
                circular
                //bordered
              />
            }
            loading={this.state.loading}
            label={'Now Watching:'}
            placeholder="Enter URL (YouTube, video file, etc.), or enter search term"
            value={
              this.state.inputMedia !== undefined
                ? this.state.inputMedia
                : getMediaDisplayName(currentMedia)
            }
          />
        </div>
        {Boolean(results) && this.state.inputMedia !== undefined && (
          <Menu
            fluid
            vertical
            style={{
              position: 'absolute',
              top: '22px',
              maxHeight: '250px',
              overflow: 'scroll',
              zIndex: 1001,
            }}
          >
            {results}
          </Menu>
        )}
      </div>
    );
  }
}

async function getMediaPathResults(
  mediaPath: string,
  query: string
): Promise<SearchResult[]> {
  // Get media list if provided
  const response = await window.fetch(mediaPath);
  let results: SearchResult[] = [];
  if (mediaPath.includes('s3.')) {
    // S3-style buckets return data in XML
    const xml = await response.text();
    const data = await parseStringPromise(xml);
    let filtered = data.ListBucketResult.Contents.filter(
      (file: any) => !file.Key[0].includes('/')
    );
    results = filtered.map((file: any) => ({
      url: mediaPath + '/' + file.Key[0],
      name: mediaPath + '/' + file.Key[0],
    }));
  } else {
    const data = await response.json();
    results = data
      .filter((file: any) => file.type === 'file')
      .map((file: any) => ({
        url: file.url || getMediaPathForList(mediaPath) + file.name,
        name: getMediaPathForList(mediaPath) + file.name,
      }));
  }
  // results = results.filter((option: SearchResult) =>
  //   option.name.toLowerCase().includes(query.toLowerCase())
  // );
  return results;
}

async function getStreamPathResults(
  streamPath: string,
  query: string
): Promise<SearchResult[]> {
  const response = await window.fetch(
    streamPath + '/search?q=' + encodeURIComponent(query)
  );
  const data = await response.json();
  return data;
}

async function getYouTubeResults(query: string): Promise<SearchResult[]> {
  const response = await window.fetch(
    serverPath + '/youtube?q=' + encodeURIComponent(query)
  );
  const data = await response.json();
  return data;
}

const MultiStreamModal = ({
  streams,
  setMedia,
  resetMultiSelect,
}: {
  streams: any[];
  setMedia: Function;
  resetMultiSelect: Function;
}) => (
  <Modal inverted basic open closeIcon onClose={resetMultiSelect as any}>
    <Modal.Header>Select a file</Modal.Header>
    <Modal.Content>
      {streams.length === 0 && <Loader />}
      {streams && (
        <List inverted>
          {streams.map((file: any) => (
            <List.Item>
              <List.Icon name="file" />
              <List.Content>
                <List.Header
                  as="a"
                  onClick={() => {
                    setMedia(null, { value: file.url });
                    resetMultiSelect();
                  }}
                >
                  {file.name}
                </List.Header>
                <List.Description>
                  {file.length.toLocaleString()} bytes
                </List.Description>
              </List.Content>
            </List.Item>
          ))}
        </List>
      )}
    </Modal.Content>
  </Modal>
);

const ChatMessage = ({
  id,
  picture,
  timestamp,
  cmd,
  msg,
  nameMap,
  pictureMap,
  formatMessage,
}: any) => {
  return (
    <Comment>
      <Comment.Avatar
        src={pictureMap[id] || getDefaultPicture(nameMap[id], getColorHex(id))}
      />
      <Comment.Content>
        <Comment.Author as="a" className="light">
          {nameMap[id] || id}
        </Comment.Author>
        <Comment.Metadata className="dark">
          <div>{new Date(timestamp).toLocaleTimeString()}</div>
        </Comment.Metadata>
        <Comment.Text className="light system">
          {cmd && formatMessage(cmd, msg)}
        </Comment.Text>
        <Comment.Text className="light">{!cmd && msg}</Comment.Text>
      </Comment.Content>
    </Comment>
  );
};

interface ControlsProps {
  duration: number;
  togglePlay: Function;
  onSeek: Function;
  fullScreen: Function;
  toggleMute: Function;
  toggleSubtitle: Function;
  jumpToLeader: Function;
  paused: boolean;
  muted: boolean;
  subtitled: boolean;
  currentTime: number;
  getVolume: Function;
  setVolume: Function;
}
class Controls extends React.Component<ControlsProps> {
  state = {
    showTimestamp: false,
    currTimestamp: 0,
    posTimestamp: 0,
  };

  onMouseOver = () => {
    // console.log('mouseover');
    this.setState({ showTimestamp: true });
  };

  onMouseOut = () => {
    // console.log('mouseout');
    this.setState({ showTimestamp: false });
  };

  onMouseMove = (e: any) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const max = rect.width;
    const pct = x / max;
    // console.log(x, max);
    const target = pct * this.props.duration;
    // console.log(pct);
    if (pct >= 0) {
      this.setState({ currTimestamp: target, posTimestamp: pct });
    }
  };

  render() {
    const {
      togglePlay,
      onSeek,
      fullScreen,
      toggleMute,
      toggleSubtitle,
      jumpToLeader,
      paused,
      muted,
      subtitled,
      currentTime,
      duration,
    } = this.props;
    return (
      <div className="controls">
        <Icon
          size="large"
          onClick={togglePlay}
          className="control action"
          name={paused ? 'play' : 'pause'}
        />
        <Icon
          size="large"
          onClick={jumpToLeader}
          className="control action"
          name={'angle double right'}
        />
        <div className="control">{formatTimestamp(currentTime)}</div>
        <Progress
          size="tiny"
          color="blue"
          onClick={duration < Infinity ? onSeek : undefined}
          onMouseOver={this.onMouseOver}
          onMouseOut={this.onMouseOut}
          onMouseMove={this.onMouseMove}
          className="control action"
          inverted
          style={{
            flexGrow: 1,
            marginTop: 0,
            marginBottom: 0,
            position: 'relative',
            minWidth: '100px',
          }}
          value={currentTime}
          total={duration}
          active
        >
          {duration < Infinity && this.state.showTimestamp && (
            <div
              style={{
                position: 'absolute',
                bottom: '0px',
                left: `calc(${this.state.posTimestamp * 100 + '% - 27px'})`,
                pointerEvents: 'none',
              }}
            >
              <Label basic color="blue" pointing="below">
                <div style={{ width: '34px' }}>
                  {formatTimestamp(this.state.currTimestamp)}
                </div>
              </Label>
            </div>
          )}
        </Progress>
        <div className="control">{formatTimestamp(duration)}</div>
        <Icon
          size="large"
          onClick={toggleSubtitle}
          className="control action"
          name={subtitled ? 'closed captioning' : 'closed captioning outline'}
        />
        <Icon
          size="large"
          onClick={() => fullScreen(false)}
          className="control action"
          name="window maximize outline"
        />
        <Icon
          size="large"
          onClick={() => fullScreen(true)}
          className="control action"
          name="expand"
        />
        <Icon
          size="large"
          onClick={toggleMute}
          className="control action"
          name={muted ? 'volume off' : 'volume up'}
        />
        <div style={{ width: '100px', marginRight: '10px' }}>
          <Slider
            value={this.props.getVolume()}
            color="blue"
            settings={{
              min: 0,
              max: 1,
              step: 0.01,
              onChange: (value: number) => {
                this.props.setVolume(value);
              },
            }}
          />
        </div>
      </div>
    );
  }
}

class Jeopardy extends React.Component<{ socket: any, nameMap: StringDict, pictureMap: StringDict }> {
  public state = { gameState: null };
  componentDidMount() {
    this.props.socket.emit('JPD:start');
    this.props.socket.on('JPD:state', (gameState: any) => {
      this.setState({ gameState });
    });
  }

  setupJeopardy = async () => {
    // optionally send an episode number
    this.props.socket.emit('JPD:start', null);
  }

  render() {
    // TODO jeopardy intro:
    // This is Jeopardy! Here are today's contestants:
    // A person from somewhere, {name}
    // TODO jeopardy music
    // TODO read out clues
    // TODO board
    // TODO if clue, show that instead
    return <div>
      <pre>{JSON.stringify(this.state.gameState)}</pre>
    </div>
  }
}