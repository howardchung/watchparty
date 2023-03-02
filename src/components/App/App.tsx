import './App.css';

import querystring from 'querystring';
import axios from 'axios';
import React from 'react';
import {
  Button,
  Dimmer,
  Dropdown,
  DropdownProps,
  Grid,
  Icon,
  Input,
  Loader,
  Message,
  Popup,
  Progress,
  Menu,
  Modal,
  Label,
  SemanticCOLORS,
} from 'semantic-ui-react';
import io, { Socket } from 'socket.io-client';
import { default as toWebVTT } from 'srt-webvtt';
import {
  formatSpeed,
  getMediaType,
  iceServers,
  isMobile,
  serverPath,
  testAutoplay,
  openFileSelector,
  getAndSaveClientId,
  calculateMedian,
  getUserImage,
  getColorForString,
} from '../../utils';
import { generateName } from '../../utils/generateName';
import { Chat } from '../Chat';
import { TopBar } from '../TopBar';
import { VBrowser } from '../VBrowser';
import { VideoChat } from '../VideoChat';
import { getCurrentSettings } from '../Settings';
import { MultiStreamModal } from '../Modal/MultiStreamModal';
import { ComboBox } from '../ComboBox/ComboBox';
import { SearchComponent } from '../SearchComponent/SearchComponent';
import { Controls } from '../Controls/Controls';
import { VBrowserModal } from '../Modal/VBrowserModal';
import { SettingsTab } from '../Settings/SettingsTab';
import { ErrorModal } from '../Modal/ErrorModal';
import { PasswordModal } from '../Modal/PasswordModal';
import { SubscribeButton } from '../SubscribeButton/SubscribeButton';
import { ScreenShareModal } from '../Modal/ScreenShareModal';
import { FileShareModal } from '../Modal/FileShareModal';
import firebase from 'firebase/compat/app';
import { SubtitleModal } from '../Modal/SubtitleModal';
import UploadFile from '../Modal/UploadFile';
import { EmptyTheatre } from '../EmptyTheatre/EmptyTheatre';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: any;
    YT: any;
    FB: any;
    fbAsyncInit: Function;
    Hls: any;
    watchparty: {
      ourStream: MediaStream | undefined;
      videoRefs: HTMLVideoElementDict;
      videoPCs: PCDict;
    };
  }
}

window.watchparty = {
  ourStream: undefined,
  videoRefs: {},
  videoPCs: {},
};

interface AppProps {
  vanity?: string;
  user?: firebase.User;
  isSubscriber: boolean;
  isCustomer: boolean;
  beta: boolean;
  streamPath: string | undefined;
}

interface AppState {
  state: 'init' | 'starting' | 'connected';
  currentMedia: string;
  currentSubtitle: string;
  currentMediaPaused: boolean;
  participants: User[];
  rosterUpdateTS: Number;
  chat: ChatMessage[];
  playlist: PlaylistVideo[];
  tsMap: NumberDict;
  nameMap: StringDict;
  pictureMap: StringDict;
  myName: string;
  myPicture: string;
  loading: boolean;
  scrollTimestamp: number;
  unreadCount: number;
  fullScreen: boolean;
  controlsTimestamp: number;
  watchOptions: SearchResult[];
  isScreenSharing: boolean;
  isScreenSharingFile: boolean;
  isVBrowser: boolean;
  isYouTubeReady: boolean;
  isAutoPlayable: boolean;
  downloaded: number;
  total: number;
  speed: number;
  connections: number;
  multiStreamSelection?: any[];
  error: string;
  isErrorAuth: boolean;
  settings: Settings;
  vBrowserResolution: string;
  isVBrowserLarge: boolean;
  nonPlayableMedia: boolean;
  currentTab: string;
  isSubscribeModalOpen: boolean;
  isVBrowserModalOpen: boolean;
  isScreenShareModalOpen: boolean;
  isFileShareModalOpen: boolean;
  isSubtitleModalOpen: boolean;
  roomLock: string;
  controller?: string;
  savedPasswords: StringDict;
  roomId: string;
  errorMessage: string;
  successMessage: string;
  isChatDisabled: boolean;
  showRightBar: boolean;
  owner: string | undefined;
  vanity: string | undefined;
  password: string | undefined;
  roomLink: string;
  roomTitle: string | undefined;
  roomDescription: string | undefined;
  roomTitleColor: string | undefined;
  mediaPath: string | undefined;
  isUploadPress: boolean;
}

export default class App extends React.Component<AppProps, AppState> {
  state: AppState = {
    state: 'starting',
    currentMedia: '',
    currentMediaPaused: false,
    currentSubtitle: '',
    participants: [],
    rosterUpdateTS: Number(new Date()),
    chat: [],
    playlist: [],
    tsMap: {},
    nameMap: {},
    pictureMap: {},
    myName: '',
    myPicture: '',
    loading: true,
    scrollTimestamp: 0,
    unreadCount: 0,
    fullScreen: false,
    controlsTimestamp: 0,
    watchOptions: [],
    isScreenSharing: false,
    isScreenSharingFile: false,
    isVBrowser: false,
    isYouTubeReady: false,
    isAutoPlayable: true,
    downloaded: 0,
    total: 0,
    speed: 0,
    connections: 0,
    multiStreamSelection: undefined,
    error: '',
    isErrorAuth: false,
    settings: {},
    vBrowserResolution: '1280x720@30',
    isVBrowserLarge: false,
    nonPlayableMedia: false,
    currentTab:
      (querystring.parse(window.location.search.substring(1)).tab as string) ||
      'chat',
    isSubscribeModalOpen: false,
    isVBrowserModalOpen: false,
    isScreenShareModalOpen: false,
    isFileShareModalOpen: false,
    isSubtitleModalOpen: false,
    roomLock: '',
    controller: '',
    roomId: '',
    savedPasswords: {},
    errorMessage: '',
    successMessage: '',
    isChatDisabled: false,
    showRightBar: false,
    owner: undefined,
    vanity: undefined,
    password: undefined,
    roomLink: '',
    roomTitle: '',
    roomDescription: '',
    roomTitleColor: '',
    mediaPath: undefined,
    isUploadPress: false,
  };
  socket: Socket = null as any;
  watchPartyYTPlayer: any = null;
  ytDebounce = true;
  screenShareStream?: MediaStream;
  screenHostPC: PCDict = {};
  screenSharePC?: RTCPeerConnection;
  progressUpdater?: number;
  heartbeat: number | undefined = undefined;

  chatRef = React.createRef<Chat>();

  async componentDidMount() {
    document.onfullscreenchange = this.onFullScreenChange;
    document.onkeydown = this.onKeydown;

    // Send heartbeat to the server
    this.heartbeat = window.setInterval(() => {
      window.fetch(serverPath + '/ping');
    }, 10 * 60 * 1000);

    const canAutoplay = await testAutoplay();
    this.setState({ isAutoPlayable: canAutoplay });
    this.loadSettings();
    this.loadYouTube();
    this.init();
  }

  getRoomLink = (vanity: string) => {
    if (vanity) {
      return `${window.location.origin}/r/${vanity}`;
    }
    return `${window.location.origin}${this.state.roomId.replace('/', '#')}`;
  };

  handleRoomState = (data: any) => {
    this.setOwner(data.owner);
    this.setVanity(data.vanity);
    this.setPassword(data.password);
    this.setRoomLink(this.getRoomLink(data.vanity));
    this.setIsChatDisabled(data.isChatDisabled);
    this.setRoomTitle(data.roomTitle);
    this.setRoomDescription(data.roomDescription);
    this.setRoomTitleColor(data.roomTitleColor);
    this.setMediaPath(data.mediaPath);
    window.history.replaceState('', '', this.getRoomLink(data.vanity));
  };

  componentWillUnmount() {
    document.removeEventListener('fullscreenchange', this.onFullScreenChange);
    document.removeEventListener('keydown', this.onKeydown);
    window.clearInterval(this.heartbeat);
  }

  componentDidUpdate(prevProps: AppProps) {
    if (this.props.user && !prevProps.user) {
      this.loadSignInData();
    }
  }

  loadSettings = async () => {
    // Load settings from localstorage
    let settings = getCurrentSettings();
    this.setState({ settings });
  };

  loadSignInData = async () => {
    const user = this.props.user;
    if (user && this.socket) {
      // NOTE: firebase auth doesn't provide the actual first name data that individual providers (G/FB) do
      // It's accessible at the time the user logs in but not afterward
      // If we want accurate surname/given name we'll need to save that somewhere
      const firstName = user.displayName?.split(' ')[0];
      if (firstName) {
        this.updateName(null, { value: firstName });
      }
      const userImage = await getUserImage(user);
      if (userImage) {
        this.updatePicture(userImage);
      }
      this.updateUid(user);
    }
  };

  loadYouTube = () => {
    // This code loads the IFrame Player API code asynchronously.
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.append(tag);
    window.onYouTubeIframeAPIReady = () => {
      // Note: this fails silently if the element is not available
      const ytPlayer = new window.YT.Player('leftYt', {
        events: {
          onReady: () => {
            console.log('yt onReady');
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
            if (
              getMediaType(this.state.currentMedia) === 'youtube' &&
              e.data === window.YT?.PlayerState?.ENDED
            ) {
              this.onVideoEnded();
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
  toggleIsUploadPress = () => {
    this.setState({ isUploadPress: !this.state.isUploadPress });
  };
  setOwner = (owner: string) => {
    this.setState({ owner });
  };
  setVanity = (vanity: string | undefined) => {
    this.setState({ vanity });
  };
  setPassword = (password: string | undefined) => {
    this.setState({ password });
  };
  setRoomLink = (roomLink: string) => {
    this.setState({ roomLink });
  };
  setRoomTitle = (roomTitle: string | undefined) => {
    this.setState({ roomTitle });
  };
  setRoomDescription = (roomDescription: string | undefined) => {
    this.setState({ roomDescription });
  };
  setRoomTitleColor = (roomTitleColor: string | undefined) => {
    this.setState({ roomTitleColor });
  };
  setMediaPath = (mediaPath: string | undefined) => {
    this.setState({ mediaPath });
  };

  init = async () => {
    // Load room ID from url
    let roomId = '/default';
    let query = window.location.hash.substring(1);
    if (query) {
      roomId = '/' + query;
    }
    // if a vanity name, resolve the url to a room id
    if (this.props.vanity) {
      try {
        const response = await axios.get(
          serverPath + '/resolveRoom/' + this.props.vanity
        );
        if (response.data.roomId) {
          roomId = response.data.roomId;
        } else {
          throw new Error('failed to resolve room name');
        }
      } catch (e) {
        console.error(e);
        this.setState({ error: "There's no room with this name." });
        return;
      }
    }
    this.setState({ roomId }, () => {
      this.join(roomId);
    });
  };

  join = async (roomId: string) => {
    let password = '';
    try {
      const savedPasswordsString = window.localStorage.getItem(
        'watchparty-passwords'
      );
      const savedPasswords = JSON.parse(savedPasswordsString || '{}');
      this.setState({ savedPasswords });
      password = savedPasswords[roomId] || '';
    } catch (e) {
      console.warn('[ALERT] Could not parse saved passwords');
    }
    const response = await axios.get(serverPath + '/resolveShard' + roomId);
    const shard = Number(response.data) ?? '';
    const socket = io(serverPath + roomId, {
      transports: ['websocket'],
      query: {
        clientId: getAndSaveClientId(),
        password,
        shard,
      },
    });
    this.socket = socket;
    socket.on('connect', async () => {
      this.setState({ state: 'connected' });
      // Load username from localstorage
      let userName = window.localStorage.getItem('watchparty-username');
      this.updateName(null, { value: userName || generateName() });
      this.loadSignInData();
    });
    socket.on('connect_error', (err: any) => {
      console.error(err);
      if (err.message === 'Invalid namespace') {
        this.setState({ error: "Couldn't load this room." });
      } else if (err.message === 'not authorized') {
        this.setState({ isErrorAuth: true });
      } else if (err.message === 'room full') {
        this.setState({ error: 'This room is full.' });
      } else {
        this.setState({ error: 'An error occurred.' });
      }
    });
    socket.on('errorMessage', (err: string) => {
      this.setState({ errorMessage: err });
      setTimeout(() => {
        this.setState({ errorMessage: '' });
      }, 3000);
    });
    socket.on('successMessage', (success: string) => {
      this.setState({ successMessage: success });
      setTimeout(() => {
        this.setState({ successMessage: '' });
      }, 3000);
    });
    socket.on('kicked', () => {
      window.location.assign('/');
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
    socket.on('REC:subtitle', (data: string) => {
      this.setState({ currentSubtitle: data }, () => {
        this.loadSubtitles();
      });
    });
    socket.on('REC:changeController', (data: string) => {
      this.setState({ controller: data });
    });
    socket.on('REC:host', async (data: HostState) => {
      let currentMedia = data.video || '';
      if (this.isScreenShare() && !currentMedia.startsWith('screenshare://')) {
        this.stopScreenShare();
      }
      if (this.isFileShare() && !currentMedia.startsWith('fileshare://')) {
        this.stopScreenShare();
      }
      if (this.isScreenShare() && currentMedia.startsWith('screenshare://')) {
        // Ignore, it's probably a reconnection
        return;
      }
      if (this.isFileShare() && currentMedia.startsWith('fileshare://')) {
        // Ignore, it's probably a reconnection
        return;
      }
      if (this.isVBrowser() && !currentMedia.startsWith('vbrowser://')) {
        this.stopVBrowser();
      }
      this.setState(
        {
          currentMedia,
          currentMediaPaused: data.paused,
          currentSubtitle: data.subtitle,
          loading: Boolean(data.video),
          nonPlayableMedia: false,
          isVBrowserLarge: data.isVBrowserLarge,
          vBrowserResolution: data.isVBrowserLarge
            ? '1920x1080@30'
            : '1280x720@30',
          controller: data.controller,
        },
        () => {
          if (
            this.state.isScreenSharingFile ||
            (this.isVBrowser() && this.getVBrowserHost())
          ) {
            console.log(
              'skipping REC:host video since fileshare is using leftVideo or this is a vbrowser'
            );
            this.setLoadingFalse();
            return;
          }
          // Stop all players
          const leftVideo = document.getElementById(
            'leftVideo'
          ) as HTMLMediaElement;
          leftVideo?.pause();
          this.watchPartyYTPlayer?.stopVideo();

          if (this.isYouTube() && !this.watchPartyYTPlayer) {
            console.log(
              'YT player not ready, onReady callback will retry when it is'
            );
          } else if (this.isVBrowser()) {
            console.log(
              'not playing video as this is a vbrowser:// placeholder'
            );
          } else {
            // Start this video
            this.doSrc(data.video, data.videoTS);
            if (!data.paused) {
              this.doPlay();
            }
            if (data.subtitle) {
              this.loadSubtitles();
            }
            // else if (this.isHttp() && !this.isYouTube()) {
            //   const src = data.video;
            //   const subtitlePath = src.slice(0, src.lastIndexOf('/') + 1);
            //   // Expect subtitle name to be file name + .srt
            //   const subtitleSrc = subtitlePath + 'subtitles/' + this.getFileName(src) + '.srt';
            //   this.setState({ currentSubtitle: subtitleSrc }, () => {
            //     this.loadSubtitles();
            //   });
            // }
            // One time, when we're ready to play
            leftVideo?.addEventListener(
              'canplay',
              () => {
                this.setLoadingFalse();
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
      if (
        !getCurrentSettings().disableChatSound &&
        ((document.visibilityState && document.visibilityState !== 'visible') ||
          this.state.currentTab !== 'chat')
      ) {
        new Audio('/clearly.mp3').play();
      }
      this.state.chat.push(data);
      this.setState({
        chat: this.state.chat,
        scrollTimestamp: Number(new Date()),
        unreadCount:
          this.state.currentTab === 'chat'
            ? this.state.unreadCount
            : this.state.unreadCount + 1,
      });
    });
    socket.on('REC:addReaction', (data: Reaction) => {
      const { chat } = this.state;
      const msgIndex = chat.findIndex(
        (m) => m.id === data.msgId && m.timestamp === data.msgTimestamp
      );
      if (msgIndex === -1) {
        return;
      }
      const msg = chat[msgIndex];
      msg.reactions = msg.reactions || {};
      msg.reactions[data.value] = msg.reactions[data.value] || [];
      msg.reactions[data.value].push(data.user);
      this.setState({ chat }, () => {
        // if we add a reaction to the last message we need to scroll down
        // or else the reaction icon might be hidden
        if (
          msgIndex === chat.length - 1 &&
          this.chatRef.current?.state.isNearBottom
        ) {
          this.chatRef.current?.scrollToBottom();
        }
      });
    });
    socket.on('REC:removeReaction', (data: Reaction) => {
      const { chat } = this.state;
      const msg = chat.find(
        (m) => m.id === data.msgId && m.timestamp === data.msgTimestamp
      );
      if (!msg || !msg.reactions?.[data.value]) {
        return;
      }
      msg.reactions[data.value] = msg.reactions[data.value].filter(
        (id) => id !== data.user
      );
      this.setState({ chat });
    });
    socket.on('REC:tsMap', (data: NumberDict) => {
      this.setState({ tsMap: data });
      this.syncSubtitle();
    });
    socket.on('REC:nameMap', (data: StringDict) => {
      this.setState({ nameMap: data });
    });
    socket.on('REC:pictureMap', (data: StringDict) => {
      this.setState({ pictureMap: data });
    });
    socket.on('REC:lock', (data: string) => {
      this.setState({ roomLock: data });
    });
    socket.on('roster', (data: User[]) => {
      this.setState(
        { participants: data, rosterUpdateTS: Number(new Date()) },
        () => {
          this.updateScreenShare();
        }
      );
    });
    socket.on('chatinit', (data: ChatMessage[]) => {
      this.setState({ chat: data, scrollTimestamp: Number(new Date()) });
    });
    socket.on('playlist', (data: PlaylistVideo[]) => {
      this.setState({ playlist: data });
    });
    socket.on('signalSS', async (data: any) => {
      process.env.NODE_ENV === 'development' && console.log(data);
      // Handle messages received from signaling server
      const msg = data.msg;
      const from = data.from;
      // Determine whether the message came from the sharer or the sharee
      const pc = (
        data.sharer ? this.screenSharePC : this.screenHostPC[from]
      ) as RTCPeerConnection;
      if (msg.ice !== undefined) {
        pc.addIceCandidate(new RTCIceCandidate(msg.ice));
      } else if (msg.sdp && msg.sdp.type === 'offer') {
        // console.log('offer');
        // TODO Currently ios/Safari cannot handle this property, so remove it from the offer
        const _sdp = msg.sdp.sdp
          .split('\n')
          .filter((line: string) => {
            return line.trim() !== 'a=extmap-allow-mixed';
          })
          .join('\n');
        msg.sdp.sdp = _sdp;
        await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        const answer = await pc.createAnswer();
        answer.sdp = answer.sdp?.replace(
          'useinbandfec=1',
          'useinbandfec=1; stereo=1; maxaveragebitrate=510000'
        );
        await pc.setLocalDescription(answer);
        this.sendSignalSS(from, { sdp: pc.localDescription }, !data.sharer);
      } else if (msg.sdp && msg.sdp.type === 'answer') {
        pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
      }
    });
    socket.on('REC:getRoomState', this.handleRoomState);
    window.setInterval(() => {
      if (this.state.currentMedia) {
        this.socket.emit('CMD:ts', this.getCurrentTime());
      }
    }, 1000);
  };

  setupFileShare = async () => {
    const files = await openFileSelector();
    if (!files) {
      return;
    }
    const file = files[0];
    const leftVideo = document.getElementById('leftVideo') as HTMLMediaElement;
    leftVideo.srcObject = null;
    leftVideo.src = URL.createObjectURL(file);
    leftVideo.play();
    //@ts-ignore
    const stream = leftVideo.captureStream ? leftVideo.captureStream() : {};
    // Can render video to a canvas to resize it, reduce size
    stream.onaddtrack = () => {
      console.log(stream, stream.getVideoTracks(), stream.getAudioTracks());
      if (
        !this.screenShareStream &&
        stream.getVideoTracks().length &&
        stream.getAudioTracks().length
      ) {
        stream.getVideoTracks()[0].onended = this.stopScreenShare;
        this.screenShareStream = stream;
        this.socket.emit('CMD:joinScreenShare', { file: true });
        this.setState({ isScreenSharing: true, isScreenSharingFile: true });
        stream.onaddtrack = undefined;
      }
    };
  };

  setupScreenShare = async () => {
    if (navigator.mediaDevices.getDisplayMedia) {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        //@ts-ignore
        video: { height: 720, logicalSurface: true },
        audio: {
          autoGainControl: false,
          channelCount: 2,
          echoCancellation: false,
          latency: 0,
          noiseSuppression: false,
          sampleRate: 48000,
          sampleSize: 16,
        },
      });
      stream.getVideoTracks()[0].onended = this.stopScreenShare;
      this.screenShareStream = stream;
      this.socket.emit('CMD:joinScreenShare');
      this.setState({ isScreenSharing: true });
    }
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
      // We don't actually need to unmute if it's a fileshare but this is fine
      this.setMute(false);
    }
    this.setState({ isScreenSharing: false, isScreenSharingFile: false });
  };

  updateScreenShare = async () => {
    if (!this.isScreenShare() && !this.isFileShare()) {
      return;
    }
    const sharer = this.state.participants.find((p) => p.isScreenShare);
    const selfId = getAndSaveClientId();
    if (sharer && sharer.clientId === selfId) {
      // We're the sharer, create a connection to each other member

      // Delete and close any connections that aren't in the current member list (maybe someone disconnected)
      // This allows them to rejoin later
      const clientIds = new Set(this.state.participants.map((p) => p.clientId));
      Object.entries(this.screenHostPC).forEach(([key, value]) => {
        if (!clientIds.has(key)) {
          value.close();
          delete this.screenHostPC[key];
        }
      });

      this.state.participants.forEach((user) => {
        const id = user.clientId;
        if (id === selfId && this.state.isScreenSharingFile) {
          // Don't set up a connection to ourselves if sharing file
          return;
        }
        if (!this.screenHostPC[id]) {
          // Set up the RTCPeerConnection for sharing media to each member
          const pc = new RTCPeerConnection({ iceServers: iceServers() });
          this.screenHostPC[id] = pc;
          this.screenShareStream?.getTracks().forEach((track) => {
            if (this.screenShareStream != null) {
              pc.addTrack(track, this.screenShareStream);
            }
          });
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
      const pc = new RTCPeerConnection({ iceServers: iceServers() });
      this.screenSharePC = pc;
      pc.onicecandidate = (event) => {
        // We generated an ICE candidate, send it to peer
        if (event.candidate) {
          this.sendSignalSS(sharer.clientId, { ice: event.candidate });
        }
      };
      pc.ontrack = (event: RTCTrackEvent) => {
        // Mount the stream from peer
        // console.log(stream);
        const leftVideo = document.getElementById(
          'leftVideo'
        ) as HTMLMediaElement;
        if (leftVideo) {
          leftVideo.src = '';
          leftVideo.srcObject = event.streams[0];
          this.doPlay();
        }
      };
    }
  };

  startVBrowser = async (rcToken: string, options: { size: string }) => {
    // user.uid is the public user identifier
    // user.getIdToken() is the secret access token we can send to the server to prove identity
    const user = this.props.user;
    const uid = user?.uid;
    const token = await user?.getIdToken();
    this.socket.emit('CMD:startVBrowser', { options, uid, token, rcToken });
  };

  stopVBrowser = async () => {
    this.socket.emit('CMD:stopVBrowser');
  };

  changeController = async (_e: any, data: DropdownProps) => {
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

  isHttp = () => {
    return this.state.currentMedia.startsWith('http');
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
      return leftVideo?.currentTime;
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

  isPauseDisabled = () => {
    return this.isScreenShare() || this.isVBrowser();
  };

  isMuted = () => {
    if (this.isVideo()) {
      const leftVideo = document.getElementById(
        'leftVideo'
      ) as HTMLMediaElement;
      return leftVideo?.muted;
    }
    if (this.isYouTube()) {
      return this.watchPartyYTPlayer?.isMuted();
    }
    return false;
  };

  isSubtitled = () => {
    if (this.isVideo()) {
      return Boolean(this.state.currentSubtitle);
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
    const maxTS = this.getLeaderTime();
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
      if (leftVideo) {
        leftVideo.srcObject = null;
        leftVideo.src = src;
        leftVideo.currentTime = time;
        this.setSubtitleMode('hidden');
        leftVideo.innerHTML = '';
      }
    }
    if (this.isYouTube()) {
      let url = new window.URL(src);
      // Standard link https://www.youtube.com/watch?v=ID
      let videoId = querystring.parse(url.search.substring(1))['v'];
      // Link shortener https://youtu.be/ID
      let altVideoId = src.split('/').slice(-1)[0];
      this.watchPartyYTPlayer?.cueVideoById(videoId || altVideoId, time);
    }
  };

  doPlay = async () => {
    const canAutoplay = this.state.isAutoPlayable || (await testAutoplay());
    this.setState(
      { currentMediaPaused: false, isAutoPlayable: canAutoplay },
      async () => {
        if (!this.state.isAutoPlayable || this.state.isScreenSharing) {
          console.log('auto-muting to allow autoplay or screenshare host');
          this.setMute(true);
        } else {
          this.setMute(false);
        }
        if (this.isVideo()) {
          const leftVideo = document.getElementById(
            'leftVideo'
          ) as HTMLMediaElement;
          //check for HLS
          let lv = leftVideo?.src.split('.');
          if (
            lv[lv.length - 1] === 'm3u8' &&
            !leftVideo?.canPlayType('application/vnd.apple.mpegurl')
          ) {
            let hls = new window.Hls();
            hls.loadSource(leftVideo.src);
            hls.attachMedia(leftVideo);
          }
          try {
            await leftVideo?.play();
          } catch (e: any) {
            console.warn(e);
            if (e.name === 'NotSupportedError') {
              this.setState({ loading: false, nonPlayableMedia: true });
            }
          }
        }
        if (this.isYouTube()) {
          setTimeout(() => {
            console.log('play yt');
            this.watchPartyYTPlayer?.playVideo();
          }, 200);
        }
      }
    );
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
    if (this.isPauseDisabled()) {
      return;
    }
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
    let target = time;
    if (e) {
      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const max = rect.width;
      target = (x / max) * this.getDuration();
    }
    target = Math.max(target, 0);
    this.doSeek(target);
    this.socket.emit('CMD:seek', target);
  };

  onFullScreenChange = () => {
    this.setState({ fullScreen: Boolean(document.fullscreenElement) });
  };

  onKeydown = (e: any) => {
    if (!document.activeElement || document.activeElement.tagName === 'BODY') {
      if (e.key === ' ') {
        e.preventDefault();
        this.togglePlay();
      } else if (e.key === 'ArrowRight') {
        this.onSeek(null, this.getCurrentTime() + 15);
      } else if (e.key === 'ArrowLeft') {
        this.onSeek(null, this.getCurrentTime() - 15);
      } else if (e.key === 'c') {
        this.showSubtitle();
      } else if (e.key === 't') {
        this.fullScreen(false);
      } else if (e.key === 'f') {
        this.fullScreen(true);
      } else if (e.key === 'm') {
        this.toggleMute();
      }
    }
  };

  fullScreen = async (bVideoOnly: boolean) => {
    let container = document.getElementById('theaterContainer') as HTMLElement;
    if (bVideoOnly || isMobile()) {
      if (this.isVBrowser() && !isMobile()) {
        // Can't really control the VBrowser on mobile anyway, so just fullscreen the video
        // https://github.com/howardchung/watchparty/issues/208
        container = document.getElementById('leftVideoParent') as HTMLElement;
      } else {
        container = document.getElementById(
          this.isYouTube() ? 'leftYt' : 'leftVideo'
        ) as HTMLElement;
      }
    }
    if (
      !container.requestFullscreen &&
      (container as any).webkitEnterFullScreen
    ) {
      // e.g. iPhone doesn't allow requestFullscreen
      (container as any).webkitEnterFullscreen();
      return;
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
      if (leftVideo) {
        leftVideo.muted = muted;
      }
      const audio = document.getElementById('iPhoneAudio') as HTMLAudioElement;
      if (audio) {
        audio.muted = muted;
      }
    }
    if (this.isYouTube()) {
      if (muted) {
        this.watchPartyYTPlayer?.mute();
      } else {
        this.watchPartyYTPlayer?.unMute();
      }
    }
    this.refreshControls();
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
    this.refreshControls();
  };

  getVolume = (): number => {
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
    return 1;
  };

  loadSubtitles = async () => {
    const leftVideo = document.getElementById('leftVideo') as HTMLMediaElement;
    if (!this.isSubtitled()) {
      leftVideo.innerHTML = '';
    } else {
      // Clear subtitles and put new ones in
      leftVideo.innerHTML = '';
      let subtitleSrc = this.state.currentSubtitle;
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

  syncSubtitle = () => {
    const sharer = this.state.participants.find((p) => p.isScreenShare);
    if (!sharer || sharer.id === this.socket.id) {
      return;
    }
    // When sharing, our timestamp doesn't match the subtitles so adjust them
    // For each cue, subtract the videoTS of the sharer, then add our own
    const leftVideo = document.getElementById('leftVideo') as HTMLMediaElement;
    const track = leftVideo?.textTracks[0];
    let offset = leftVideo.currentTime - this.state.tsMap[sharer.id];
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

  showSubtitle = () => {
    if (this.isVideo()) {
      this.setState({ isSubtitleModalOpen: true });
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
        this.watchPartyYTPlayer?.setOption('captions', 'track', tracks?.[0]);
      }
    }
  };

  setSubtitleMode = (mode?: TextTrackMode) => {
    const leftVideo = document.getElementById('leftVideo') as HTMLMediaElement;
    for (var i = 0; i < leftVideo.textTracks.length; i++) {
      leftVideo.textTracks[i].mode =
        mode ??
        (leftVideo.textTracks[i].mode === 'hidden' ? 'showing' : 'hidden');
    }
  };

  getSubtitleMode = () => {
    const leftVideo = document.getElementById('leftVideo') as HTMLMediaElement;
    return leftVideo.textTracks[0]?.mode;
  };

  setMedia = (_e: any, data: DropdownProps) => {
    this.socket.emit('CMD:host', data.value);
  };

  playlistAdd = (_e: any, data: DropdownProps) => {
    this.socket.emit('CMD:playlistAdd', data.value);
  };

  playlistMove = (index: number, toIndex: number) => {
    this.socket.emit('CMD:playlistMove', { index, toIndex });
  };

  playlistDelete = (index: number) => {
    this.socket.emit('CMD:playlistDelete', index);
  };

  launchMultiSelect = (data: any) => {
    this.setState({ multiStreamSelection: data });
  };

  resetMultiSelect = () => {
    this.setState({ multiStreamSelection: undefined });
  };

  updateName = (_e: any, data: { value: string }) => {
    this.setState({ myName: data.value });
    this.socket.emit('CMD:name', data.value);
    window.localStorage.setItem('watchparty-username', data.value);
  };

  updatePicture = (url: string) => {
    this.setState({ myPicture: url });
    this.socket.emit('CMD:picture', url);
  };

  updateUid = async (user: firebase.User) => {
    const uid = user.uid;
    const token = await user.getIdToken();
    this.socket.emit('CMD:uid', { uid, token });
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
      const sharer = this.state.participants.find((user) => user.isScreenShare);
      return this.state.nameMap[sharer?.id ?? ''] + "'s screen";
    }
    if (input.startsWith('fileshare://')) {
      const sharer = this.state.participants.find((user) => user.isScreenShare);
      return this.state.nameMap[sharer?.id ?? ''] + "'s file";
    }
    if (input.startsWith('vbrowser://')) {
      return 'Virtual Browser' + (this.state.isVBrowserLarge ? '+' : '');
    }
    if (input.includes('/stream?torrent=magnet')) {
      const search = new URL(input).search;
      const magnetUrl = querystring.parse(search.substring(1))
        .torrent as string;
      const magnetParsed = querystring.parse(magnetUrl);
      return magnetParsed.dn;
    }
    // Get the filename out of the URL
    return input;
  };

  getFileName = (input: string) => {
    return input.split('/').slice(-1)[0];
  };

  setLoadingFalse = () => {
    this.setState({ loading: false });
  };

  setRoomLock = async (locked: boolean) => {
    const uid = this.props.user?.uid;
    const token = await this.props.user?.getIdToken();
    this.socket.emit('CMD:lock', { uid, token, locked });
  };

  haveLock = () => {
    if (!this.state.roomLock) {
      return true;
    }
    return this.props.user?.uid === this.state.roomLock;
  };

  setIsChatDisabled = (val: boolean) => this.setState({ isChatDisabled: val });

  clearChat = async () => {
    const uid = this.props.user?.uid;
    const token = await this.props.user?.getIdToken();
    this.socket.emit('CMD:deleteChatMessages', { uid, token });
  };

  getLeaderTime = () => {
    if (this.state.participants.length > 2) {
      return calculateMedian(Object.values(this.state.tsMap));
    }
    return Math.max(...Object.values(this.state.tsMap));
  };

  onVideoEnded = () => {
    this.socket.emit('CMD:playlistNext', this.state.currentMedia);
    // Play next
    if (this.state.currentMedia?.includes('/stream?torrent=magnet')) {
      const url = new URL(this.state.currentMedia);
      const fileIndex = url.searchParams.get('fileIndex');
      if (fileIndex != null) {
        url.searchParams.set('fileIndex', (Number(fileIndex) + 1).toString());
        this.setMedia(null, { value: url.toString() });
      }
    }
  };

  refreshControls = () => {
    this.setState({ controlsTimestamp: Number(new Date()) });
  };

  render() {
    const sharer = this.state.participants.find((p) => p.isScreenShare);
    const controls = (
      <Controls
        key={this.state.controlsTimestamp}
        togglePlay={this.togglePlay}
        onSeek={this.onSeek}
        fullScreen={this.fullScreen}
        toggleMute={this.toggleMute}
        showSubtitle={this.showSubtitle}
        setVolume={this.setVolume}
        jumpToLeader={this.jumpToLeader}
        paused={this.state.currentMediaPaused}
        muted={this.isMuted()}
        volume={this.getVolume()}
        subtitled={this.isSubtitled()}
        currentTime={this.getCurrentTime()}
        duration={this.getDuration()}
        disabled={!this.haveLock()}
        leaderTime={this.isHttp() ? this.getLeaderTime() : undefined}
        isPauseDisabled={this.isPauseDisabled()}
      />
    );
    const subscribeButton = (
      <SubscribeButton
        user={this.props.user}
        isSubscriber={this.props.isSubscriber}
        isCustomer={this.props.isCustomer}
      />
    );
    // console.log({ state: this.state });

    // const displayRightContent =
    //   this.state.showRightBar || this.state.fullScreen;
    // const rightBar = (
    //   <Grid.Column
    //     width={displayRightContent ? 4 : 1}
    //     style={{ display: 'flex', flexDirection: 'column' }}
    //     className={`${
    //       this.state.fullScreen
    //         ? 'fullHeightColumnFullscreen'
    //         : 'fullHeightColumn'
    //     }`}
    //   >
    //     <Input
    //       inverted
    //       fluid
    //       label={'My name is:'}
    //       value={this.state.myName}
    //       onChange={this.updateName}
    //       style={{ visibility: displayRightContent ? '' : 'hidden' }}
    //       icon={
    //         <Icon
    //           onClick={() => this.updateName(null, { value: generateName() })}
    //           name="refresh"
    //           inverted
    //           circular
    //           link
    //         />
    //       }
    //     />
    //     {
    //       <Menu
    //         inverted
    //         widths={3}
    //         style={{
    //           marginTop: '4px',
    //           marginBottom: '4px',
    //           visibility: displayRightContent ? '' : 'hidden',
    //         }}
    //       >
    //         <Menu.Item
    //           name="chat"
    //           active={this.state.currentTab === 'chat'}
    //           onClick={() => {
    //             this.setState({ currentTab: 'chat', unreadCount: 0 });
    //           }}
    //           as="a"
    //         >
    //           Chat
    //           {this.state.unreadCount > 0 && (
    //             <Label circular color="red">
    //               {this.state.unreadCount}
    //             </Label>
    //           )}
    //         </Menu.Item>
    //         <Menu.Item
    //           name="people"
    //           active={this.state.currentTab === 'people'}
    //           onClick={() => this.setState({ currentTab: 'people' })}
    //           as="a"
    //         >
    //           People
    //           <Label
    //             circular
    //             color={
    //               getColorForString(
    //                 this.state.participants.length.toString()
    //               ) as SemanticCOLORS
    //             }
    //           >
    //             {this.state.participants.length}
    //           </Label>
    //         </Menu.Item>
    //         <Menu.Item
    //           name="settings"
    //           active={this.state.currentTab === 'settings'}
    //           onClick={() => this.setState({ currentTab: 'settings' })}
    //           as="a"
    //         >
    //           {/* <Icon name="setting" /> */}
    //           Settings
    //         </Menu.Item>
    //       </Menu>
    //     }
    //     <Chat
    //       chat={this.state.chat}
    //       nameMap={this.state.nameMap}
    //       pictureMap={this.state.pictureMap}
    //       socket={this.socket}
    //       scrollTimestamp={this.state.scrollTimestamp}
    //       getMediaDisplayName={this.getMediaDisplayName}
    //       hide={this.state.currentTab !== 'chat' || !displayRightContent}
    //       isChatDisabled={this.state.isChatDisabled}
    //       owner={this.state.owner}
    //       user={this.props.user}
    //       ref={this.chatRef}
    //     />
    //     {this.state.state === 'connected' && (
    //       <VideoChat
    //         socket={this.socket}
    //         participants={this.state.participants}
    //         nameMap={this.state.nameMap}
    //         pictureMap={this.state.pictureMap}
    //         tsMap={this.state.tsMap}
    //         rosterUpdateTS={this.state.rosterUpdateTS}
    //         hide={this.state.currentTab !== 'people' || !displayRightContent}
    //         owner={this.state.owner}
    //         user={this.props.user}
    //       />
    //     )}
    //     <SettingsTab
    //       hide={this.state.currentTab !== 'settings' || !displayRightContent}
    //       user={this.props.user}
    //       roomLock={this.state.roomLock}
    //       setRoomLock={this.setRoomLock}
    //       socket={this.socket}
    //       isSubscriber={this.props.isSubscriber}
    //       roomId={this.state.roomId}
    //       isChatDisabled={this.state.isChatDisabled}
    //       setIsChatDisabled={this.setIsChatDisabled}
    //       owner={this.state.owner}
    //       setOwner={this.setOwner}
    //       vanity={this.state.vanity}
    //       setVanity={this.setVanity}
    //       roomLink={this.state.roomLink}
    //       password={this.state.password}
    //       setPassword={this.setPassword}
    //       clearChat={this.clearChat}
    //       roomTitle={this.state.roomTitle}
    //       setRoomTitle={this.setRoomTitle}
    //       roomDescription={this.state.roomDescription}
    //       setRoomDescription={this.setRoomDescription}
    //       roomTitleColor={this.state.roomTitleColor}
    //       setRoomTitleColor={this.setRoomTitleColor}
    //       mediaPath={this.state.mediaPath}
    //       setMediaPath={this.setMediaPath}
    //     />
    //   </Grid.Column>
    // );
    return (
      <React.Fragment>
        {!this.state.isAutoPlayable && (
          <Modal inverted basic open>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                primary
                size="large"
                onClick={() => {
                  this.setState({ isAutoPlayable: true });
                  this.setMute(false);
                  this.setVolume(1);
                }}
                icon
                labelPosition="left"
              >
                <Icon name="volume up" />
                Click to unmute
              </Button>
            </div>
          </Modal>
        )}
        {this.state.isUploadPress && (
          <UploadFile toggleIsUploadPress={this.toggleIsUploadPress} />
          // <Modal inverted basic open>
          //   <div style={{ display: 'flex', justifyContent: 'center' }}>
          //     <Button
          //       primary
          //       size="large"
          //       onClick={() => {
          //         this.setState({ isUploadPress: false });
          //       }}
          //       icon
          //       labelPosition="left"
          //     >
          //       <Icon name="volume up" />
          //       Upload File
          //     </Button>
          //   </div>
          // </Modal>
        )}
        {this.state.multiStreamSelection && (
          <MultiStreamModal
            streams={this.state.multiStreamSelection}
            setMedia={this.setMedia}
            resetMultiSelect={this.resetMultiSelect}
          />
        )}
        {this.state.isVBrowserModalOpen && (
          <VBrowserModal
            isSubscriber={this.props.isSubscriber}
            subscribeButton={subscribeButton}
            closeModal={() => this.setState({ isVBrowserModalOpen: false })}
            startVBrowser={this.startVBrowser}
            user={this.props.user}
            beta={this.props.beta}
          />
        )}
        {this.state.isScreenShareModalOpen && (
          <ScreenShareModal
            closeModal={() => this.setState({ isScreenShareModalOpen: false })}
            startScreenShare={this.setupScreenShare}
          />
        )}
        {this.state.isFileShareModalOpen && (
          <FileShareModal
            closeModal={() => this.setState({ isFileShareModalOpen: false })}
            startFileShare={this.setupFileShare}
          />
        )}
        {this.state.isSubtitleModalOpen && (
          <SubtitleModal
            closeModal={() => this.setState({ isSubtitleModalOpen: false })}
            socket={this.socket}
            currentSubtitle={this.state.currentSubtitle}
            src={this.state.currentMedia}
            haveLock={this.haveLock}
            getMediaDisplayName={this.getMediaDisplayName}
            beta={this.props.beta}
            setSubtitleMode={this.setSubtitleMode}
            getSubtitleMode={this.getSubtitleMode}
          />
        )}
        {this.state.error && <ErrorModal error={this.state.error} />}
        {this.state.isErrorAuth && (
          <PasswordModal
            savedPasswords={this.state.savedPasswords}
            roomId={this.state.roomId}
          />
        )}
        {this.state.errorMessage && (
          <Message
            negative
            header="Error"
            content={this.state.errorMessage}
            style={{
              position: 'fixed',
              bottom: '10px',
              right: '10px',
              zIndex: 1000,
            }}
          ></Message>
        )}
        {this.state.successMessage && (
          <Message
            positive
            header="Success"
            content={this.state.successMessage}
            style={{
              position: 'fixed',
              bottom: '10px',
              right: '10px',
              zIndex: 1000,
            }}
          ></Message>
        )}
        {/* ====================== TOP BAR LOGO SECTION ====================== */}
        {/* <TopBar
          user={this.props.user}
          isCustomer={this.props.isCustomer}
          isSubscriber={this.props.isSubscriber}
          roomTitle={this.state.roomTitle}
          roomDescription={this.state.roomDescription}
          roomTitleColor={this.state.roomTitleColor}
        /> */}
        {/* ====================== END SECTION ====================== */}
        {
          <Grid stackable celled="internally">
            <Grid.Row id="theaterContainer">
              <Grid.Column
                width={this.state.showRightBar ? 12 : 16}
                className={
                  this.state.fullScreen
                    ? 'fullHeightColumnFullscreen'
                    : 'fullHeightColumn'
                }
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                  }}
                >
                  {!this.state.fullScreen && (
                    <React.Fragment>
                      <ComboBox
                        toggleIsUploadPress={this.toggleIsUploadPress}
                        setMedia={this.setMedia}
                        playlistAdd={this.playlistAdd}
                        playlistDelete={this.playlistDelete}
                        playlistMove={this.playlistMove}
                        currentMedia={this.state.currentMedia}
                        getMediaDisplayName={this.getMediaDisplayName}
                        launchMultiSelect={this.launchMultiSelect}
                        streamPath={this.props.streamPath}
                        mediaPath={this.state.mediaPath}
                        disabled={!this.haveLock()}
                        playlist={this.state.playlist}
                      />
                      <Separator />
                      <div
                        className="mobileStack"
                        style={{ display: 'flex', gap: '4px' }}
                      >
                        {this.screenShareStream && (
                          <Button
                            fluid
                            className="toolButton"
                            icon
                            labelPosition="left"
                            color="red"
                            onClick={this.stopScreenShare}
                            disabled={sharer?.id !== this.socket?.id}
                          >
                            <Icon name="cancel" />
                            Stop Share
                          </Button>
                        )}
                        {/*{!this.screenShareStream &&*/}
                        {/*  !sharer &&*/}
                        {/*  !this.isVBrowser() && (*/}
                        {/*    <Popup*/}
                        {/*      content={`Share a tab or an application.`}*/}
                        {/*      trigger={*/}
                        {/*        <Button*/}
                        {/*          fluid*/}
                        {/*          className="toolButton"*/}
                        {/*          disabled={!this.haveLock()}*/}
                        {/*          icon*/}
                        {/*          labelPosition="left"*/}
                        {/*          color={'instagram'}*/}
                        {/*          onClick={() => {*/}
                        {/*            this.setState({*/}
                        {/*              isScreenShareModalOpen: true,*/}
                        {/*            });*/}
                        {/*          }}*/}
                        {/*        >*/}
                        {/*          <Icon name={'slideshare'} />*/}
                        {/*          Screenshare*/}
                        {/*        </Button>*/}
                        {/*      }*/}
                        {/*    />*/}
                        {/*  )}*/}
                        {/*{!this.screenShareStream &&*/}
                        {/*  !sharer &&*/}
                        {/*  !this.isVBrowser() && (*/}
                        {/*    <Popup*/}
                        {/*      content="Launch a shared virtual browser"*/}
                        {/*      trigger={*/}
                        {/*        <Button*/}
                        {/*          fluid*/}
                        {/*          className="toolButton"*/}
                        {/*          disabled={!this.haveLock()}*/}
                        {/*          icon*/}
                        {/*          labelPosition="left"*/}
                        {/*          color="green"*/}
                        {/*          onClick={() => {*/}
                        {/*            this.setState({*/}
                        {/*              isVBrowserModalOpen: true,*/}
                        {/*            });*/}
                        {/*          }}*/}
                        {/*        >*/}
                        {/*          <Icon name="desktop" />*/}
                        {/*          VBrowsers*/}
                        {/*        </Button>*/}
                        {/*      }*/}
                        {/*    />*/}
                        {/*  )}*/}
                        {this.isVBrowser() && (
                          <Popup
                            content="Choose the person controlling the VBrowser"
                            trigger={
                              <Dropdown
                                icon="keyboard"
                                labeled
                                className="icon"
                                style={{ height: '36px' }}
                                button
                                value={this.state.controller}
                                placeholder="No controller"
                                clearable
                                onChange={this.changeController}
                                selection
                                disabled={!this.haveLock()}
                                options={this.state.participants.map((p) => ({
                                  text: this.state.nameMap[p.id] || p.id,
                                  value: p.id,
                                }))}
                              ></Dropdown>
                            }
                          />
                        )}
                        {this.isVBrowser() && (
                          <Dropdown
                            icon="desktop"
                            labeled
                            className="icon"
                            style={{ height: '36px' }}
                            button
                            disabled={!this.haveLock()}
                            value={this.state.vBrowserResolution}
                            onChange={(_e, data) =>
                              this.setState({
                                vBrowserResolution: data.value as string,
                              })
                            }
                            selection
                            options={[
                              {
                                text: '1080p (Plus only)',
                                value: '1920x1080@30',
                                disabled: !this.state.isVBrowserLarge,
                              },
                              {
                                text: '720p',
                                value: '1280x720@30',
                              },
                              {
                                text: '576p',
                                value: '1024x576@60',
                              },
                              {
                                text: '486p',
                                value: '864x486@60',
                              },
                              {
                                text: '360p',
                                value: '640x360@60',
                              },
                            ]}
                          ></Dropdown>
                        )}
                        {this.isVBrowser() && (
                          <Button
                            fluid
                            className="toolButton"
                            icon
                            labelPosition="left"
                            color="red"
                            disabled={!this.haveLock()}
                            onClick={this.stopVBrowser}
                          >
                            <Icon name="cancel" />
                            Stop VBrowser
                          </Button>
                        )}
                        {/*{!this.screenShareStream &&*/}
                        {/*  !sharer &&*/}
                        {/*  !this.isVBrowser() && (*/}
                        {/*    <Popup*/}
                        {/*      content="Stream your own video file"*/}
                        {/*      trigger={*/}
                        {/*        <Button*/}
                        {/*          fluid*/}
                        {/*          className="toolButton"*/}
                        {/*          disabled={!this.haveLock()}*/}
                        {/*          icon*/}
                        {/*          labelPosition="left"*/}
                        {/*          onClick={() => {*/}
                        {/*            this.setState({*/}
                        {/*              isFileShareModalOpen: true,*/}
                        {/*            });*/}
                        {/*          }}*/}
                        {/*        >*/}
                        {/*          <Icon name="file" />*/}
                        {/*          File*/}
                        {/*        </Button>*/}
                        {/*      }*/}
                        {/*    />*/}
                        {/*  )}*/}
                        {Boolean(this.props.streamPath) && (
                          <SearchComponent
                            setMedia={this.setMedia}
                            playlistAdd={this.playlistAdd}
                            type={'stream'}
                            streamPath={this.props.streamPath}
                            launchMultiSelect={this.launchMultiSelect}
                            disabled={!this.haveLock()}
                          />
                        )}
                      </div>
                      <Separator />
                    </React.Fragment>
                  )}
                  <div style={{ flexGrow: 2 }}>
                    <div id="playerContainer">
                      {(this.state.loading ||
                        !this.state.currentMedia ||
                        this.state.nonPlayableMedia) && (
                        <div
                          id="loader"
                          className="videoContent"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {this.state.loading && (
                            <Dimmer active>
                              <Loader>
                                {this.isVBrowser()
                                  ? 'Launching virtual browser. This can take up to a minute.'
                                  : ''}
                              </Loader>
                            </Dimmer>
                          )}
                          {/*{!this.state.loading && !this.state.currentMedia && (*/}
                          {/*  <Message*/}
                          {/*    color="yellow"*/}
                          {/*    icon="hand point up"*/}
                          {/*    header="You're not watching anything!"*/}
                          {/*    content="Pick something to watch above."*/}
                          {/*  />*/}
                          {/*)}*/}
                          {/*{!this.state.loading &&*/}
                          {/*  this.state.nonPlayableMedia && (*/}
                          {/*    <Message*/}
                          {/*      color="red"*/}
                          {/*      icon="frown"*/}
                          {/*      header="It doesn't look like this is a media file!"*/}
                          {/*      content="Maybe you meant to launch a VBrowser if you're trying to visit a web page?"*/}
                          {/*    />*/}
                          {/*  )}*/}
                        </div>
                      )}
                      {!this.isYouTube() && !this.state.loading && (
                        <EmptyTheatre
                          toggleIsUploadPress={this.toggleIsUploadPress}
                        />
                      )}
                      <iframe
                        style={{
                          display:
                            this.isYouTube() && !this.state.loading
                              ? 'block'
                              : 'none',
                        }}
                        title="YouTube"
                        id="leftYt"
                        className="videoContent"
                        allowFullScreen
                        frameBorder="0"
                        allow="autoplay"
                        src="https://www.youtube.com/embed/?enablejsapi=1&controls=0&rel=0"
                      />
                      {this.isVBrowser() &&
                      this.getVBrowserPass() &&
                      this.getVBrowserHost() ? (
                        <VBrowser
                          username={this.socket.id}
                          password={this.getVBrowserPass()}
                          hostname={this.getVBrowserHost()}
                          controlling={this.state.controller === this.socket.id}
                          setLoadingFalse={this.setLoadingFalse}
                          resolution={this.state.vBrowserResolution}
                          doPlay={this.doPlay}
                          setResolution={(data: string) =>
                            this.setState({ vBrowserResolution: data })
                          }
                        />
                      ) : (
                        <video
                          style={{
                            display:
                              (this.isVideo() && !this.state.loading) ||
                              this.state.fullScreen
                                ? 'block'
                                : 'none',
                            width: '100%',
                            maxHeight:
                              'calc(100vh - 62px - 36px - 36px - 8px - 41px - 16px)',
                          }}
                          id="leftVideo"
                          onEnded={this.onVideoEnded}
                          playsInline
                          onClick={this.togglePlay}
                        ></video>
                      )}
                    </div>
                  </div>
                  {this.state.currentMedia && controls}
                  {Boolean(this.state.total) && (
                    <div>
                      <Progress
                        size="tiny"
                        color="green"
                        inverted
                        value={this.state.downloaded}
                        total={this.state.total}
                        // indicating
                        label={
                          Math.min(
                            (this.state.downloaded / this.state.total) * 100,
                            100
                          ).toFixed(2) +
                          '% - ' +
                          formatSpeed(this.state.speed) +
                          ' - ' +
                          this.state.connections +
                          ' connections'
                        }
                      ></Progress>
                    </div>
                  )}
                </div>
                {/*<Button*/}
                {/*  style={{*/}
                {/*    position: 'absolute',*/}
                {/*    top: '50%',*/}
                {/*    right: 'calc(0% - 18px)',*/}
                {/*    zIndex: 900,*/}
                {/*  }}*/}
                {/*  circular*/}
                {/*  size="mini"*/}
                {/*  icon={this.state.showRightBar ? 'angle right' : 'angle left'}*/}
                {/*  onClick={() =>*/}
                {/*    this.setState({ showRightBar: !this.state.showRightBar })*/}
                {/*  }*/}
                {/*/>*/}
              </Grid.Column>
              {/*{rightBar}*/}
            </Grid.Row>
          </Grid>
        }
      </React.Fragment>
    );
  }
}

export const Separator = () => <div style={{ height: '4px', flexShrink: 0 }} />;
