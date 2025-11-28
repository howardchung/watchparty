import type MediasoupClient from 'mediasoup-client';
import React from 'react';
import {
  Alert,
  Divider,
  Loader,
  Menu,
  Overlay,
  Select,
  Title,
} from '@mantine/core';
import io, { Socket } from 'socket.io-client';
import {
  formatSpeed,
  iceServers,
  isMobile,
  serverPath,
  testAutoplay,
  openFileSelector,
  getOrCreateClientId,
  calculateMedian,
  getUserImage,
  getColorForString,
  isYouTube,
  isMagnet,
  isHttp,
  isHls,
  isScreenShare,
  isFileShare,
  isVBrowser,
  isDash,
  VIDEO_MAX_HEIGHT_CSS,
  createUuid,
  isMpegTs,
  softWhite,
} from '../../utils/utils';
import { generateName } from '../../utils/generateName';
import { Chat } from '../Chat/Chat';
import { TopBar } from '../TopBar/TopBar';
import { VBrowser } from '../VBrowser/VBrowser';
import { VideoChat } from '../VideoChat/VideoChat';
import { getCurrentSettings } from '../Settings/LocalSettings';
import { MultiStreamModal } from '../Modal/MultiStreamModal';
import { ComboBox } from '../ComboBox/ComboBox';
import { SearchComponent } from '../SearchComponent/SearchComponent';
import { Controls } from '../Controls/Controls';
import { VBrowserModal } from '../Modal/VBrowserModal';
import { SettingsModal } from '../Settings/SettingsModal';
import { ErrorModal } from '../Modal/ErrorModal';
import { PasswordModal } from '../Modal/PasswordModal';
import { ScreenShareModal } from '../Modal/ScreenShareModal';
import { FileShareModal } from '../Modal/FileShareModal';
import firebase from 'firebase/compat/app';
import { SubtitleModal } from '../Modal/SubtitleModal';
import { HTML } from './HTML';
import { YouTube } from './YouTube';
import styles from './App.module.css';
import config from '../../config';
import { MetadataContext } from '../../MetadataContext';
import ChatVideoCard from '../ChatVideoCard/ChatVideoCard';
import { ActionIcon, Badge, TextInput, Button } from '@mantine/core';
import {
  IconAntennaBars5,
  IconArrowsShuffle,
  IconBrowser,
  IconChevronLeft,
  IconChevronRight,
  IconFile,
  IconKeyboardFilled,
  IconList,
  IconScreenShare,
  IconSettings,
  IconUser,
  IconUserScreen,
  IconUsersGroup,
  IconVolume,
  IconX,
} from '@tabler/icons-react';
import { InviteButton } from '../InviteButton/InviteButton';
import type WebTorrent from 'webtorrent';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: any;
    YT: YT.JsApi;
    watchparty: {
      ourStream: MediaStream | undefined;
      videoRefs: HTMLVideoElementDict;
      videoPCs: PCDict;
      webtorrent: WebTorrent.Instance | null;
    };
  }
}

window.watchparty = {
  ourStream: undefined,
  videoRefs: {},
  videoPCs: {},
  webtorrent: null,
};

interface AppProps {
  vanity?: string;
  urlRoomId?: string;
}

interface AppState {
  state: 'starting' | 'connected';
  roomMedia: string;
  roomSubtitle: string;
  roomPaused: boolean;
  roomLoop: boolean;
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
  isVBrowser: boolean;
  isAutoPlayable: boolean;
  downloaded: number;
  total: number;
  speed: number;
  connections: number;
  multiStreamSelection?: {
    name: string;
    url: string;
    length: number;
    playFn?: () => void;
  }[];
  overlayMsg: string;
  isErrorAuth: boolean;
  settings: Settings;
  vBrowserResolution: string;
  vBrowserQuality: string;
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
  warningMessage: string;
  isChatDisabled: boolean;
  showChatColumn: boolean;
  showPeopleColumn: boolean;
  owner: string | undefined;
  vanity: string | undefined;
  password: string | undefined;
  inviteLink: string;
  roomTitle: string | undefined;
  roomDescription: string | undefined;
  roomTitleColor: string | undefined;
  mediaPath: string | undefined;
  roomPlaybackRate: number;
  isLiveStream: boolean;
  settingsModalOpen: boolean;
  uploadController: AbortController | undefined;
}

export class App extends React.Component<AppProps, AppState> {
  static contextType = MetadataContext;
  declare context: React.ContextType<typeof MetadataContext>;
  state: AppState = {
    state: 'starting',
    roomMedia: '',
    roomPaused: false,
    roomSubtitle: '',
    roomLoop: false,
    participants: [],
    rosterUpdateTS: Date.now(),
    chat: [],
    playlist: [],
    tsMap: {},
    nameMap: {},
    pictureMap: {},
    myName: window.localStorage.getItem('watchparty-username') ?? '',
    myPicture: '',
    loading: true,
    scrollTimestamp: 0,
    unreadCount: 0,
    fullScreen: false,
    controlsTimestamp: 0,
    watchOptions: [],
    isVBrowser: false,
    isAutoPlayable: true,
    downloaded: 0,
    total: 0,
    speed: 0,
    connections: 0,
    multiStreamSelection: undefined,
    overlayMsg: '',
    isErrorAuth: false,
    settings: {},
    vBrowserResolution: '1280x720@30',
    vBrowserQuality: '1',
    isVBrowserLarge: false,
    nonPlayableMedia: false,
    currentTab:
      new URLSearchParams(window.location.search).get('tab') ?? 'chat',
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
    warningMessage: '',
    isChatDisabled: false,
    showChatColumn: isMobile()
      ? true
      : Boolean(
          Number(
            window.localStorage.getItem('watchparty-showchatcolumn') ?? '1',
          ),
        ),
    showPeopleColumn: false,
    // Boolean(
    //       Number(
    //         window.localStorage.getItem('watchparty-showpeoplecolumn') ?? '0',
    //       ),
    //     ),
    owner: undefined,
    vanity: undefined,
    password: undefined,
    inviteLink: '',
    roomTitle: '',
    roomDescription: '',
    roomTitleColor: '',
    mediaPath: undefined,
    roomPlaybackRate: 0,
    isLiveStream: false,
    settingsModalOpen: false,
    uploadController: undefined,
  };
  socket: Socket = null as any;
  mediasoupPubSocket: Socket | null = null;
  mediasoupSubSocket: Socket | null = null;
  ytDebounce = true;
  localStreamToPublish?: MediaStream;
  isLocalStreamAFile = false;
  publisherConns: PCDict = {};
  consumerConn?: RTCPeerConnection;
  progressUpdater?: number;
  heartbeat: number | undefined = undefined;
  YouTubeInterface: YouTube = new YouTube(null);
  HTMLInterface: HTML = new HTML('leftVideo');
  Player = () => {
    if (this.usingYoutube()) {
      return this.YouTubeInterface;
    } else {
      return this.HTMLInterface;
    }
  };

  chatRef = React.createRef<Chat>();

  async componentDidMount() {
    document.onfullscreenchange = this.onFullScreenChange;
    document.onkeydown = this.onKeydown;

    // Send heartbeat to the server
    this.heartbeat = window.setInterval(
      () => {
        fetch(serverPath + '/ping');
      },
      10 * 60 * 1000,
    );

    const canAutoplay = await testAutoplay();
    this.setState({ isAutoPlayable: canAutoplay });
    this.loadSettings();
    this.loadYouTube();
    this.init();
    if (config.VITE_FIREBASE_CONFIG) {
      firebase.auth().onAuthStateChanged(async (user: firebase.User | null) => {
        if (user) {
          this.loadSignInData(user);
        }
      });
    }
  }

  componentWillUnmount() {
    document.removeEventListener('fullscreenchange', this.onFullScreenChange);
    document.removeEventListener('keydown', this.onKeydown);
    window.clearInterval(this.heartbeat);
  }

  init = async () => {
    let roomId = '/' + this.props.urlRoomId;
    // if a vanity name, resolve the url to a room id
    if (this.props.vanity) {
      try {
        const response = await fetch(
          serverPath + '/resolveRoom/' + this.props.vanity,
        );
        const data = await response.json();
        if (data.roomId) {
          roomId = data.roomId;
        } else {
          this.setState({ overlayMsg: "Couldn't load this room." });
        }
      } catch (e) {
        console.error(e);
        this.setState({ overlayMsg: "Couldn't load this room." });
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
        'watchparty-passwords',
      );
      const savedPasswords = JSON.parse(savedPasswordsString || '{}');
      this.setState({ savedPasswords });
      password = savedPasswords[roomId] || '';
    } catch (e) {
      console.warn('[ALERT] Could not parse saved passwords');
    }
    const response = await fetch(serverPath + '/resolveShard' + roomId);
    const shard = Number(await response.text()) || '';
    const socket = io(serverPath + roomId, {
      transports: ['websocket'],
      query: {
        clientId: getOrCreateClientId(),
        password,
        uid: this.context.user?.uid,
        token: await this.context.user?.getIdToken(),
        shard,
        roomId: roomId.slice(1),
      },
    });
    this.socket = socket;
    socket.on('connect', async () => {
      this.setState({
        state: 'connected',
        overlayMsg: '',
        errorMessage: '',
        successMessage: '',
        warningMessage: '',
      });
      // Use the name in our state, generate one if empty
      this.updateName(this.state.myName || (await generateName()));
      this.loadSignInData(this.context.user);
    });
    socket.on('connect_error', (err: any) => {
      console.error(err);
      if (err.message === 'Invalid namespace') {
        this.setState({ overlayMsg: "Couldn't load this room." });
      } else if (err.message === 'not authorized') {
        this.setState({ isErrorAuth: true });
      } else if (err.message === 'room full') {
        this.setState({ overlayMsg: 'This room is full.' });
      }
    });
    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, you need to reconnect manually
        this.setState({ overlayMsg: 'Disconnected from server.' });
      } else {
        // else the socket will automatically try to reconnect
        // Use the alert pill since it's less disruptive
        this.setState({ warningMessage: 'Reconnecting...' });
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
      this.localPlay();
    });
    socket.on('REC:pause', () => {
      this.localPause();
    });
    socket.on('REC:seek', (data: number) => {
      this.localSeek(data);
    });
    socket.on('REC:playbackRate', (data: number) => {
      this.setState({ roomPlaybackRate: data });
      if (data > 0) {
        this.Player().setPlaybackRate(data);
      }
    });
    socket.on('REC:subtitle', (data: string) => {
      this.setState({ roomSubtitle: data }, () => {
        this.Player().loadSubtitles(data);
      });
    });
    socket.on('REC:loop', (data: boolean) => {
      this.setState({ roomLoop: data });
    });
    socket.on('REC:changeController', (data: string) => {
      this.setState({ controller: data });
    });
    socket.on('REC:host', async (data: HostState) => {
      let currentMedia = data.video || '';
      if (this.playingScreenShare() && !isScreenShare(currentMedia)) {
        this.stopPublishingLocalStream();
      }
      if (this.playingFileShare() && !isFileShare(currentMedia)) {
        this.stopPublishingLocalStream();
      }
      if (this.playingVBrowser() && !isVBrowser(currentMedia)) {
        this.stopVBrowser();
      }
      if (this.playingScreenShare() && isScreenShare(currentMedia)) {
        // Ignore, it's probably a reconnection
        return;
      }
      if (this.playingFileShare() && isFileShare(currentMedia)) {
        // Ignore, it's probably a reconnection
        return;
      }
      if (
        this.playingVBrowser() &&
        this.getVBrowserHost() &&
        isVBrowser(currentMedia)
      ) {
        // Ignore, it's probably a reconnection
        return;
      }
      this.setState(
        {
          roomMedia: currentMedia,
          roomPaused: data.paused,
          roomSubtitle: data.subtitle,
          roomLoop: data.loop,
          roomPlaybackRate: data.playbackRate,
          loading: Boolean(data.video),
          nonPlayableMedia: false,
          isVBrowserLarge: data.isVBrowserLarge,
          vBrowserResolution: '1280x720@30',
          vBrowserQuality: '1',
          controller: data.controller,
          isLiveStream: false,
        },
        async () => {
          const leftVideo = this.HTMLInterface.getVideoEl();

          // Stop all players
          // Unless the user is sharing a file, because we play it in leftVideo and capture stream
          if (!this.isLocalStreamAFile) {
            this.HTMLInterface.pauseVideo();
          }
          this.YouTubeInterface.stopVideo();

          if (!this.isLocalStreamAFile) {
            this.Player().clearState();
          }
          if (data.subtitle) {
            this.Player().loadSubtitles(data.subtitle);
          }
          if (data.playbackRate) {
            this.Player().setPlaybackRate(data.playbackRate);
          }

          if (
            this.playingScreenShare() ||
            this.playingFileShare() ||
            this.playingVBrowser()
          ) {
            console.log(
              'exiting REC:host since we are using webRTC (fileshare, screenshare, or vbrowser). Check setupRTCConnections()',
            );
            if (!(this.playingVBrowser() && !this.getVBrowserHost())) {
              // Remove the loader unless we're waiting for a vbrowser
              this.setLoadingFalse();
            }
            return;
          }
          if (this.usingYoutube() && !this.YouTubeInterface.isReady()) {
            console.log(
              'YT player not ready, onReady callback will retry when it is',
            );
            return;
          }
          const src = data.video;
          const time = data.videoTS;
          if (isMagnet(src)) {
            // WebTorrent
            // magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent
            const WebTorrent = //@ts-expect-error
              (await import('webtorrent/dist/webtorrent.min.js')).default;
            window.watchparty.webtorrent?.destroy();
            window.watchparty.webtorrent = new WebTorrent();
            await navigator.serviceWorker?.register('/sw.min.js');
            const controller = await navigator.serviceWorker.ready;
            window.watchparty.webtorrent?.createServer({ controller });
            await new Promise((resolve) => {
              window.watchparty.webtorrent?.add(
                src,
                {
                  announce: [
                    'wss://tracker.btorrent.xyz',
                    'wss://tracker.openwebtorrent.com',
                  ],
                  destroyStoreOnDestroy: true,
                  maxWebConns: 4,
                  path: '/tmp/webtorrent/',
                  storeCacheSlots: 20,
                  strategy: 'sequential',
                  // noPeersIntervalTime: 30,
                },
                async (torrent) => {
                  // Got torrent metadata!
                  console.log('Client is downloading:', torrent.infoHash);

                  // Torrents can contain many files.
                  const files = torrent.files;
                  const filtered = files.filter(
                    (f: WebTorrent.TorrentFile) => f.length >= 10 * 1024 * 1024,
                  );
                  const fileIndex = new URLSearchParams(src).get('fileIndex');
                  // Try to find a single large file to play
                  let target;
                  if (fileIndex != null && fileIndex !== '') {
                    target = files[Number(fileIndex)];
                  } else if (filtered.length === 1) {
                    target = filtered[0];
                  }
                  if (!target) {
                    // Open the selector
                    this.launchMultiSelect(
                      files.map((f: WebTorrent.TorrentFile, i: number) => ({
                        name: f.name as string,
                        url: src + `&fileIndex=${i}`,
                        length: f.length as number,
                      })),
                    );
                  } else {
                    //@ts-expect-error
                    target.streamTo(leftVideo);
                  }
                  resolve(undefined);
                },
              );
            });
          } else if (isDash(src)) {
            const Dash = await import('dashjs');
            const dashPlayer = Dash.MediaPlayer().create();
            dashPlayer.initialize(leftVideo, src);
            dashPlayer.on('streamInitialized', (e) => {
              console.log(e);
              // for a live stream:
              // html.currenttime is time since stream start
              // html.duration is infinite
              // player.duration is the seekable range
              this.setState({
                isLiveStream: this.Player().getDuration() >= Infinity,
              });
              dashPlayer.off('streamInitialized', () => {});
            });
          } else if (isHls(src) && window.MediaSource) {
            // Prefer using hls.js if MediaSource Extensions are supported
            // otherwise fallback to native HLS support using video tag (i.e. iPhones)
            // https://moctobpltc-i.akamaihd.net/hls/live/571329/eight/playlist.m3u8
            const Hls = (await import('hls.js')).default;
            let hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(leftVideo);
            hls.once(Hls.Events.LEVEL_LOADED, (_, data) => {
              this.setState({ isLiveStream: data.details.live });
            });
          } else if (isMpegTs(src)) {
            const mpegts = (await import('mpegts.js')).default;
            let player = mpegts.createPlayer({
              type: 'mse', // could also be mpegts, m2ts, flv
              // isLive: true,
              url: src,
            });
            player.attachMediaElement(leftVideo);
            player.load();
            player.play();
          } else {
            await this.Player().setSrcAndTime(src, time);
          }
          // Start this video
          if (!data.paused) {
            this.localPlay();
          }
          // Do right before playing
          leftVideo?.addEventListener(
            'canplay',
            () => {
              this.setLoadingFalse();
              let ts = undefined;
              // WebTorrent and Hls and Dash reset position back to 0 so set it back here
              if (
                isMagnet(src) ||
                isHls(src) ||
                isDash(src) ||
                this.state.isLiveStream
              ) {
                ts = time;
              }
              // Resync to leader since the loading might have taken some time
              this.localSeek(ts);
              if (data.playbackRate) {
                // Set playback rate again since it might have been lost
                console.log('setting playback rate again', data.playbackRate);
                this.Player().setPlaybackRate(data.playbackRate);
              }
            },
            { once: true },
          );

          // Progress updater
          window.clearInterval(this.progressUpdater);
          this.setState({ downloaded: 0, total: 0, speed: 0 });
          if (currentMedia.includes('/stream?torrent=magnet')) {
            this.progressUpdater = window.setInterval(async () => {
              const response = await window.fetch(
                currentMedia.replace('/stream', '/progress'),
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
          if (isMagnet(currentMedia)) {
            this.progressUpdater = window.setInterval(async () => {
              const client = window.watchparty.webtorrent;
              if (client) {
                this.setState({
                  downloaded: client.torrents[0]?.downloaded,
                  total: client.torrents[0]?.length,
                  speed: client.torrents[0]?.downloadSpeed,
                  connections: client.torrents[0]?.numPeers,
                });
              }
            }, 1000);
          }
        },
      );
    });
    socket.on('REC:chat', (data: ChatMessage) => {
      if (
        !getCurrentSettings().disableChatSound &&
        !data.system &&
        ((document.visibilityState && document.visibilityState !== 'visible') ||
          this.state.currentTab !== 'chat')
      ) {
        new Audio('/clearly.mp3').play();
      }
      this.state.chat.push(data);
      if (this.state.chat.length > 100) {
        this.state.chat.shift();
      }
      this.setState({
        chat: this.state.chat,
        scrollTimestamp: Date.now(),
        unreadCount:
          this.state.currentTab === 'chat'
            ? this.state.unreadCount
            : this.state.unreadCount + 1,
      });
    });
    socket.on('REC:addReaction', (data: Reaction) => {
      const { chat } = this.state;
      const msgIndex = chat.findIndex(
        (m) => m.id === data.msgId && m.timestamp === data.msgTimestamp,
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
        (m) => m.id === data.msgId && m.timestamp === data.msgTimestamp,
      );
      if (!msg || !msg.reactions?.[data.value]) {
        return;
      }
      msg.reactions[data.value] = msg.reactions[data.value].filter(
        (id) => id !== data.user,
      );
      this.setState({ chat });
    });
    socket.on('REC:tsMap', (data: NumberDict) => {
      this.setState({ tsMap: data }, () => {
        // Dynamic playback rate based on timestamps
        // Disable for sharing types where the users can have different timestamps
        // e.g. screenshare, fileshare, .m3u8 HLS streams
        // Also not necessary for WebRTC sharing since it should be close to realtime
        if (
          !this.state.roomPaused &&
          !this.state.isLiveStream &&
          this.hasDuration() &&
          this.state.roomPlaybackRate === 0
        ) {
          const leader = this.getLeaderTime();
          const delta = leader - data[this.socket.id!];
          // Set leader pbr to 1
          let pbr = 1;
          // Add .01 pbr for each 100ms delay
          if (delta > 0.5) {
            pbr += Number((delta / 10).toFixed(2));
            pbr = Math.min(pbr, 1.1);
          }
          // console.log(delta, pbr);
          if (this.Player().getPlaybackRate() !== pbr) {
            this.Player().setPlaybackRate(pbr);
          }
        }
        if (this.state.roomSubtitle) {
          const sharer = this.state.participants.find((p) => p.isScreenShare);
          if (sharer && sharer.id !== this.socket.id) {
            // Sync only if someone is sharing and it's not us
            const sharerTime = this.state.tsMap[sharer.id];
            this.Player().syncSubtitles(sharerTime);
          }
        }
      });
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
      this.setState({ participants: data, rosterUpdateTS: Date.now() }, () => {
        this.setupRTCConnections();
      });
    });
    socket.on('chatinit', (data: ChatMessage[]) => {
      this.setState({ chat: data, scrollTimestamp: Date.now() });
    });
    socket.on('playlist', (data: PlaylistVideo[]) => {
      this.setState({ playlist: data });
    });
    socket.on(
      'signalSS',
      async (data: {
        msg: { ice: any; sdp: any };
        from: string;
        sharer: boolean;
      }) => {
        config.NODE_ENV === 'development' && console.log(data);
        // Handle messages received from signaling server
        const msg = data.msg;
        const from = data.from;
        // Determine whether the message came from the sharer or the sharee
        const pc = (
          data.sharer ? this.consumerConn : this.publisherConns[from]
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
          // Allow stereo audio
          answer.sdp = answer.sdp?.replace(
            'useinbandfec=1',
            'useinbandfec=1; stereo=1; maxaveragebitrate=510000',
          );
          // console.log(answer.sdp);
          // Allow multichannel audio if Chromium
          const isChromium = Boolean((window as any).chrome);
          if (isChromium) {
            answer.sdp = answer.sdp
              ?.replace('opus/48000/2', 'multiopus/48000/6')
              .replace(
                'useinbandfec=1',
                'channel_mapping=0,4,1,2,3,5; num_streams=4; coupled_streams=2;maxaveragebitrate=510000;minptime=10;useinbandfec=1',
              );
          }
          await pc.setLocalDescription(answer);
          this.sendSignalSS(from, { sdp: pc.localDescription }, !data.sharer);
        } else if (msg.sdp && msg.sdp.type === 'answer') {
          pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        }
      },
    );
    socket.on('REC:getRoomState', this.handleRoomState);
    window.setInterval(() => {
      if (this.state.roomMedia) {
        const target = this.getRoomTSToSet(this.Player().getCurrentTime());
        this.socket.emit('CMD:ts', target);
      }
    }, 1000);
  };

  launchMultiSelect = (
    data?: { name: string; url: string; length: number; playFn?: () => void }[],
  ) => {
    this.setState({ multiStreamSelection: data });
  };

  resetMultiSelect = () => {
    this.setState({ multiStreamSelection: undefined });
  };

  loadSettings = async () => {
    // Load settings from localstorage
    let settings = getCurrentSettings();
    this.setState({ settings });
  };

  loadSignInData = async (user: firebase.User | undefined) => {
    if (user && this.socket) {
      // NOTE: firebase auth doesn't provide the actual first name data that individual providers (G/FB) do
      // It's accessible at the time the user logs in but not afterward
      // If we want accurate surname/given name we'll need to save that somewhere
      const firstName = user.displayName?.split(' ')[0];
      if (firstName) {
        // Don't update the username if the user wants to customize their own
        // Set a flag in localstorage so we only update this once, if the user changes name manually later we won't overwrite
        // Clear the flag on logout
        if (!window.localStorage.getItem('watchparty-loginname')) {
          this.updateName(firstName);
          window.localStorage.setItem(
            'watchparty-loginname',
            Date.now().toString(),
          );
        }
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
            this.YouTubeInterface = new YouTube(ytPlayer);
            this.setState({ loading: false });
            // We might have failed to play YT originally, ask for the current video again
            if (this.usingYoutube()) {
              console.log('requesting host data again after ytReady');
              this.socket.emit('CMD:askHost');
            }
          },
          onStateChange: (e) => {
            if (
              this.usingYoutube() &&
              e.data === window.YT?.PlayerState?.CUED
            ) {
              this.setState({ loading: false });
            }
            if (
              this.usingYoutube() &&
              e.data === window.YT?.PlayerState?.ENDED
            ) {
              console.log(e.data, e.target.getVideoUrl());
              this.onVideoEnded(e.target.getVideoUrl());
            }
            if (
              this.ytDebounce &&
              ((e.data === window.YT?.PlayerState?.PLAYING &&
                this.state.roomPaused) ||
                (e.data === window.YT?.PlayerState?.PAUSED &&
                  !this.state.roomPaused))
            ) {
              this.ytDebounce = false;
              if (e.data === window.YT?.PlayerState?.PLAYING) {
                this.socket.emit('CMD:play');
                this.localPlay();
              } else {
                this.socket.emit('CMD:pause');
                this.localPause();
              }
              window.setTimeout(() => (this.ytDebounce = true), 500);
            }
          },
        },
      });
    };
  };

  // Functions for managing room settings
  getInviteLink = (vanity: string) => {
    if (vanity) {
      return `${window.location.origin}/r/${vanity}`;
    }
    return `${window.location.origin}/watch${this.state.roomId}`;
  };

  handleRoomState = (data: any) => {
    this.setOwner(data.owner);
    this.setVanity(data.vanity);
    this.setPassword(data.password);
    this.setInviteLink(this.getInviteLink(data.vanity));
    this.setIsChatDisabled(data.isChatDisabled);
    this.setRoomTitle(data.roomTitle);
    this.setRoomDescription(data.roomDescription);
    this.setRoomTitleColor(data.roomTitleColor);
    this.setMediaPath(data.mediaPath);
    window.history.replaceState('', '', this.getInviteLink(data.vanity));
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
  setInviteLink = (inviteLink: string) => {
    this.setState({ inviteLink });
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

  setRoomLock = async (locked: boolean) => {
    const uid = this.context.user?.uid;
    const token = await this.context.user?.getIdToken();
    this.socket.emit('CMD:lock', { uid, token, locked });
  };

  haveLock = () => {
    if (!this.state.roomLock) {
      return true;
    }
    return this.context.user?.uid === this.state.roomLock;
  };

  setIsChatDisabled = (val: boolean) => this.setState({ isChatDisabled: val });

  clearChat = async () => {
    const uid = this.context.user?.uid;
    const token = await this.context.user?.getIdToken();
    this.socket.emit('CMD:deleteChatMessages', { uid, token });
  };

  startConvert = async () => {
    const files = await openFileSelector();
    if (!files) {
      return;
    }
    const file = files[0];
    // Start uploading stream
    const stream = file.stream();
    const uuid = createUuid();
    // const convertUrl = 'https://azure.howardchung.net:5001/' + uuid + '.mpegts';
    const convertUrl = 'https://azure.howardchung.net:5001/' + uuid + '.m3u8';
    const controller = new AbortController();
    this.setState({
      uploadController: controller,
    });
    // Note: Can't read response logs as a stream as fetch will buffer it until upload is complete
    // Would need to implement using Server Sent Events and a separate call?
    // Wait for the playlist to get generated 
    const poll = async () => {
      let ok = false;
      let i = 0;
      while (!ok && i < 30) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const resp = await fetch(convertUrl);
        ok = resp.ok;
        i += 1;
      }
      // Same URL but GET
      this.roomSetMedia(convertUrl);
    };
    poll();
    await fetch(convertUrl, {
      method: 'POST',
      body: stream,
      signal: controller.signal,
      //@ts-expect-error
      duplex: 'half',
    });
    // Upload complete
    this.setState({ uploadController: undefined });
  };
  
  startFileShare = async (useMediaSoup: boolean) => {
    const files = await openFileSelector();
    if (!files) {
      return;
    }
    const file = files[0];
    this.Player().clearState();
    const leftVideo = this.HTMLInterface.getVideoEl();
    leftVideo.src = URL.createObjectURL(file);
    leftVideo.play();
    //@ts-expect-error
    this.localStreamToPublish = leftVideo?.captureStream();
    this.isLocalStreamAFile = true;
    if (this.localStreamToPublish) {
      this.socket.emit('CMD:joinScreenShare', {
        file: true,
        mediasoup: useMediaSoup,
      });
    }
  };

  startScreenShare = async (useMediaSoup: boolean) => {
    if (navigator.mediaDevices.getDisplayMedia) {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        //@ts-expect-error
        video: { height: 720, logicalSurface: true },
        audio: {
          autoGainControl: false,
          channelCount: 2,
          echoCancellation: false,
          noiseSuppression: false,
          sampleRate: 48000,
          sampleSize: 16,
        },
      });
      this.localStreamToPublish = stream;
      this.isLocalStreamAFile = false;
      this.socket.emit('CMD:joinScreenShare', {
        file: false,
        mediasoup: useMediaSoup,
      });
    }
  };

  // Share the video to mediasoup
  publishMediasoup = async (mediasoupURL: string) => {
    const localStream = this.localStreamToPublish;
    let device: MediasoupClient.types.Device = null as any;
    let producerTransport: MediasoupClient.types.Transport = null as any;

    // =========== socket.io ==========
    const connectSocket = (mediasoupURL: string) => {
      return new Promise<void>((resolve, reject) => {
        this.mediasoupPubSocket = io(mediasoupURL, {
          transports: ['websocket'],
        });

        const socket = this.mediasoupPubSocket;
        socket?.on('connect', function () {
          console.log('PUBLISH: connected to socket.io');
          resolve();
        });
        socket?.on('error', function (err) {
          console.error('PUBLISH: socket.io ERROR:', err);
          reject(err);
        });
      });
    };

    const sendRequest = (type: string, data: any) => {
      return new Promise<any>((resolve, reject) => {
        const socket = this.mediasoupPubSocket;
        socket?.emit(type, data, (err: any, response: any) => {
          if (!err) {
            // Success response, so pass the mediasoup response to the local Room.
            resolve(response);
          } else {
            reject(err);
          }
        });
      });
    };

    async function publish() {
      // --- get transport info ---
      console.log('PUBLISH: --- createProducerTransport --');
      const params = await sendRequest('createProducerTransport', {});
      console.log('PUBLISH: transport params:', params);
      producerTransport = device.createSendTransport(params);
      console.log('PUBLISH: createSendTransport:', producerTransport);

      // --- join & start publish --
      producerTransport.on(
        'connect',
        async (
          {
            dtlsParameters,
          }: { dtlsParameters: MediasoupClient.types.DtlsParameters },
          callback: () => void,
          errback: (error: Error) => void,
        ) => {
          console.log('PUBLISH: --transport connect');
          sendRequest('connectProducerTransport', {
            dtlsParameters: dtlsParameters,
          })
            .then(callback)
            .catch(errback);
        },
      );

      producerTransport.on(
        'produce',
        async (
          {
            kind,
            rtpParameters,
          }: {
            kind: string;
            rtpParameters: MediasoupClient.types.RtpParameters;
          },
          callback: ({ id }: { id: string }) => void,
          errback: (error: Error) => void,
        ) => {
          console.log('PUBLISH: --transport produce');
          try {
            const { id } = await sendRequest('produce', {
              transportId: producerTransport.id,
              kind,
              rtpParameters,
            });
            callback({ id });
          } catch (err: any) {
            errback(err);
          }
        },
      );

      // producerTransport.on('connectionstatechange', (state: string) => {
      //   switch (state) {
      //     case 'connecting':
      //       console.log('PUBLISH: connecting');
      //       break;

      //     case 'connected':
      //       console.log('PUBLISH: connected');
      //       break;

      //     case 'failed':
      //       console.log('PUBLISH: failed');
      //       producerTransport.close();
      //       break;

      //     default:
      //       break;
      //   }
      // });

      const videoTrack = localStream?.getVideoTracks()[0];
      if (videoTrack) {
        const trackParams = { track: videoTrack };
        await producerTransport.produce(trackParams);
      }
      const audioTrack = localStream?.getAudioTracks()[0];
      if (audioTrack) {
        const trackParams = { track: audioTrack };
        await producerTransport.produce(trackParams);
      }
    }

    async function loadDevice(
      routerRtpCapabilities: MediasoupClient.types.RtpCapabilities,
    ) {
      const { Device } = await import('mediasoup-client');
      device = new Device();
      await device.load({ routerRtpCapabilities });
    }

    await connectSocket(mediasoupURL);
    // --- get capabilities --
    const data = await sendRequest('getRouterRtpCapabilities', {});
    console.log('PUBLISH: getRouterRtpCapabilities:', data);
    await loadDevice(data);
    await publish();
  };

  // Play the video from MediaSoup
  subscribeMediasoup = async (mediaSoupURL: string) => {
    let device: MediasoupClient.types.Device = null as any;
    let consumerTransport: MediasoupClient.types.Transport = null as any;
    // =========== socket.io ==========

    const connectSocket = () => {
      return new Promise<void>((resolve, reject) => {
        this.mediasoupSubSocket = io(mediaSoupURL, {
          transports: ['websocket'],
        });
        const socket = this.mediasoupSubSocket;
        socket?.on('connect', function () {
          console.log('SUBSCRIBE: connected to socket.io');
          resolve();
        });
        socket?.on('error', function (err) {
          console.error('SUBSCRIBE: socket.io ERROR:', err);
          reject(err);
        });
        socket?.on('newProducer', async function (message) {
          console.log('SUBSCRIBE: socket.io newProducer:', message);
          if (consumerTransport) {
            // start consume
            if (message.kind === 'video') {
              await consumeAndResume(message.kind);
            } else if (message.kind === 'audio') {
              await consumeAndResume(message.kind);
            }
          }
        });

        // socket?.on('producerClosed', function (message) {
        //   console.log('socket.io producerClosed:', message);
        //   const localId = message.localId;
        //   const remoteId = message.remoteId;
        //   const kind = message.kind;
        //   if (kind === 'video') {
        //     if (videoConsumer) {
        //       videoConsumer.close();
        //       videoConsumer = null;
        //     }
        //   } else if (kind === 'audio') {
        //     if (audioConsumer) {
        //       audioConsumer.close();
        //       audioConsumer = null;
        //     }
        //   }
        // });
      });
    };

    const sendRequest = (type: string, data: any) => {
      return new Promise<any>((resolve, reject) => {
        const socket = this.mediasoupSubSocket;
        socket?.emit(type, data, (err: Error, response: any) => {
          if (!err) {
            // Success response, so pass the mediasoup response to the local Room.
            resolve(response);
          } else {
            reject(err);
          }
        });
      });
    };

    // =========== media handling ==========
    const addRemoteTrack = (track: MediaStreamTrack) => {
      let video = this.HTMLInterface.getVideoEl();
      if (video.srcObject) {
        // Track already exists, add it
        (video.srcObject as MediaStream).addTrack(track);
      } else {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(track);
        video.srcObject = mediaStream;
      }
      this.localPlay();
    };

    async function consumeAndResume(kind: string) {
      const consumer = await consume(consumerTransport, kind);
      if (consumer) {
        console.log('SUBSCRIBE: -- track exist, consumer ready. kind=' + kind);
        if (kind === 'video') {
          console.log('SUBSCRIBE: -- resume kind=' + kind);
          sendRequest('resume', { kind: kind })
            .then(() => {
              console.log('SUBSCRIBE: resume OK');
              return consumer;
            })
            .catch((err) => {
              console.error('SUBSCRIBE: resume ERROR:', err);
              return consumer;
            });
        } else {
          console.log('SUBSCRIBE: -- do not resume kind=' + kind);
        }
      } else {
        console.log('SUBSCRIBE: -- no consumer yet. kind=' + kind);
        return null;
      }
    }

    async function loadDevice(
      routerRtpCapabilities: MediasoupClient.types.RtpCapabilities,
    ) {
      try {
        const { Device } = await import('mediasoup-client');
        device = new Device();
        await device.load({ routerRtpCapabilities });
      } catch (error: any) {
        if (error.name === 'UnsupportedError') {
          console.error('browser not supported');
        }
      }
    }

    async function consume(
      transport: MediasoupClient.types.Transport,
      trackKind: string,
    ) {
      console.log('SUBSCRIBE: --start of consume --kind=' + trackKind);
      const { rtpCapabilities } = device;
      const data = await sendRequest('consume', {
        rtpCapabilities: rtpCapabilities,
        kind: trackKind,
      }).catch((err) => {
        console.error('SUBSCRIBE: ERROR:', err);
      });
      const { producerId, id, kind, rtpParameters } = data;

      if (producerId) {
        let codecOptions = {};
        const consumer = await transport.consume({
          id,
          producerId,
          kind,
          rtpParameters,
          //@ts-expect-error
          codecOptions,
        });

        addRemoteTrack(consumer.track);
        console.log('SUBSCRIBE: --end of consume');
        return consumer;
      } else {
        console.warn('SUBSCRIBE: ---remote producer NOT READY');
        return null;
      }
    }

    async function subscribe() {
      console.log('SUBSCRIBE: ---createConsumerTransport --');
      const params = await sendRequest('createConsumerTransport', {});
      console.log('SUBSCRIBE: transport params:', params);
      consumerTransport = device.createRecvTransport(params);
      console.log('SUBSCRIBE: createConsumerTransport:', consumerTransport);

      // --- join & start watching
      consumerTransport.on(
        'connect',
        async (
          {
            dtlsParameters,
          }: { dtlsParameters: MediasoupClient.types.DtlsParameters },
          callback: () => void,
          errback: (err: Error) => void,
        ) => {
          console.log('SUBSCRIBE: ---consumer transport connect');
          sendRequest('connectConsumerTransport', {
            dtlsParameters: dtlsParameters,
          })
            .then(callback)
            .catch(errback);
        },
      );

      // consumerTransport.on('connectionstatechange', (state: string) => {
      //   switch (state) {
      //     case 'connecting':
      //       console.log('SUBSCRIBE: connecting');
      //       break;

      //     case 'connected':
      //       console.log('SUBSCRIBE: connected');
      //       break;

      //     case 'failed':
      //       console.log('SUBSCRIBE: failed');
      //       consumerTransport.close();
      //       break;

      //     default:
      //       break;
      //   }
      // });

      await consumeAndResume('video');
      await consumeAndResume('audio');
    }

    // Clear the srcobject so we load our stream when received
    const leftVideo = this.HTMLInterface.getVideoEl();
    leftVideo.srcObject = null;
    await connectSocket();
    // --- get capabilities --
    const data = await sendRequest('getRouterRtpCapabilities', {});
    console.log('getRouterRtpCapabilities:', data);
    await loadDevice(data);
    await subscribe();
  };

  stopPublishingLocalStream = async () => {
    if (this.localStreamToPublish) {
      this.socket.emit('CMD:leaveScreenShare');
      // We don't actually need to unmute if it's a fileshare but this is fine
      this.localSetMute(false);
    }
    this.localStreamToPublish &&
      this.localStreamToPublish.getTracks().forEach((track) => {
        track.stop();
      });
    this.localStreamToPublish = undefined;
    if (this.consumerConn) {
      this.consumerConn.close();
      this.consumerConn = undefined;
    }
    Object.values(this.publisherConns).forEach((pc) => {
      pc.close();
    });
    this.publisherConns = {};
    this.isLocalStreamAFile = false;
    if (this.mediasoupPubSocket) {
      this.mediasoupPubSocket.close();
      this.mediasoupPubSocket = null;
    }
    if (this.mediasoupSubSocket) {
      this.mediasoupSubSocket.close();
      this.mediasoupSubSocket = null;
    }
  };

  setupRTCConnections = async () => {
    if (!this.playingScreenShare() && !this.playingFileShare()) {
      return;
    }
    const sharer = this.state.participants.find((p) => p.isScreenShare);
    const selfId = getOrCreateClientId();
    const localTrack = this.localStreamToPublish?.getVideoTracks()[0];
    if (localTrack && !localTrack.onended) {
      // Stop sharing if the local stream stops
      localTrack.onended = () => this.stopPublishingLocalStream();
    }
    if (this.state.roomMedia.includes('@')) {
      let prefix = 'screenshare://';
      if (this.playingFileShare()) {
        prefix = 'fileshare://';
      }
      const unprefixed = this.state.roomMedia.replace(prefix, '');
      const mediasoupURL = unprefixed.split('@')[1];
      if (sharer?.clientId === selfId && this.mediasoupPubSocket == null) {
        await this.publishMediasoup(mediasoupURL);
      }
      // If we're not sharing a file, also start watching
      // avoid duplicate watching if the socket already exists
      if (!this.isLocalStreamAFile && this.mediasoupSubSocket == null) {
        await this.subscribeMediasoup(mediasoupURL);
      }
      return;
    }

    // We're the sharer, create a connection to each other member
    if (sharer?.clientId === selfId) {
      // Delete and close any connections that aren't in the current member list (maybe someone disconnected)
      // This allows them to rejoin later
      const clientIds = new Set(this.state.participants.map((p) => p.clientId));
      Object.entries(this.publisherConns).forEach(([key, value]) => {
        if (!clientIds.has(key)) {
          value.close();
          delete this.publisherConns[key];
        }
      });

      this.state.participants.forEach((user) => {
        const id = user.clientId;
        if (id === selfId && this.isLocalStreamAFile) {
          // Don't set up a connection to ourselves if sharing file
          return;
        }
        if (!this.publisherConns[id]) {
          // Set up the RTCPeerConnection for sharing media to each member
          const pc = new RTCPeerConnection({ iceServers: iceServers() });
          this.publisherConns[id] = pc;
          this.localStreamToPublish?.getTracks().forEach((track) => {
            if (this.localStreamToPublish != null) {
              pc.addTrack(track, this.localStreamToPublish);
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
    if (sharer && !this.consumerConn && !this.isLocalStreamAFile) {
      const pc = new RTCPeerConnection({ iceServers: iceServers() });
      this.consumerConn = pc;
      pc.onicecandidate = (event) => {
        // We generated an ICE candidate, send it to sharer
        if (event.candidate) {
          this.sendSignalSS(sharer.clientId, { ice: event.candidate });
        }
      };
      pc.ontrack = (event: RTCTrackEvent) => {
        // Mount the stream from sharer
        // console.log(stream);
        const leftVideo = this.HTMLInterface.getVideoEl();
        if (leftVideo) {
          leftVideo.src = '';
          leftVideo.srcObject = event.streams[0];
          this.localPlay();
        }
      };
    }
  };

  startVBrowser = async (rcToken: string, options: { size: string }) => {
    // user.uid is the public user identifier
    // user.getIdToken() is the secret access token we can send to the server to prove identity
    const user = this.context.user;
    const uid = user?.uid;
    const token = await user?.getIdToken();
    this.socket.emit('CMD:startVBrowser', { options, uid, token, rcToken });
  };

  stopVBrowser = async () => {
    this.socket.emit('CMD:stopVBrowser');
  };

  changeController = async (value: string | null) => {
    // console.log(data);
    this.socket.emit('CMD:changeController', value);
  };

  sendSignalSS = async (to: string, data: any, sharer?: boolean) => {
    // console.log('sendSS', to, data);
    this.socket.emit('signalSS', { to, msg: data, sharer });
  };

  usingYoutube = () => {
    return isYouTube(this.state.roomMedia);
  };

  usingNative = () => {
    // Anything that uses HTML Video (e.g. not YouTube, Vimeo, or other embedded JS player)
    return !this.usingYoutube();
  };

  hasDuration = () => {
    // Youtube, link, or magnet, etc. Has a defined runtime (not WebRTC)
    return isHttp(this.state.roomMedia) || isMagnet(this.state.roomMedia);
  };

  playingScreenShare = () => {
    return isScreenShare(this.state.roomMedia);
  };

  playingFileShare = () => {
    return isFileShare(this.state.roomMedia);
  };

  playingVBrowser = () => {
    return isVBrowser(this.state.roomMedia);
  };

  getVBrowserPass = () => {
    return this.state.roomMedia.replace('vbrowser://', '').split('@')[0];
  };

  getVBrowserHost = () => {
    return this.state.roomMedia.replace('vbrowser://', '').split('@')[1];
  };

  isPauseDisabled = () => {
    return this.playingScreenShare() || this.playingVBrowser();
  };

  localSeek = (customTime?: number) => {
    // Jump to the leader's position, or a custom one
    let target = customTime ?? this.getLeaderTime();
    // For live this is the offset from the leading edge (negative)
    if (this.state.isLiveStream) {
      target = this.Player().getDuration() + (customTime ?? 0);
    }
    if (target >= 0 && target < Infinity) {
      console.log('syncing self to leader or custom:', target);
      this.Player().seekVideo(target);
    }
  };

  localPlay = async () => {
    if (!this.state.roomMedia) {
      return;
    }
    const canAutoplay = this.state.isAutoPlayable || (await testAutoplay());
    this.setState(
      { roomPaused: false, isAutoPlayable: canAutoplay },
      async () => {
        if (
          !this.state.isAutoPlayable ||
          (this.localStreamToPublish && !this.isLocalStreamAFile)
        ) {
          console.log('auto-muting to allow autoplay or screenshare host');
          this.localSetMute(true);
        } else {
          this.localSetMute(false);
        }
        try {
          await this.Player().playVideo();
        } catch (e: any) {
          console.warn(e, e.name);
          if (e.name === 'NotSupportedError' && this.usingNative()) {
            this.setState({ loading: false, nonPlayableMedia: true });
          }
        }
      },
    );
  };

  localPause = () => {
    this.setState({ roomPaused: true }, async () => {
      this.Player().pauseVideo();
    });
  };

  localSetMute = (muted: boolean) => {
    this.Player().setMute(muted);
    this.refreshControls();
  };

  localSetVolume = (volume: number) => {
    this.Player().setVolume(volume);
    this.refreshControls();
  };

  localSubtitleModal = () => {
    // Native player uses subtitle modal.
    if (this.usingNative()) {
      this.setState({ isSubtitleModalOpen: true });
    }
  };

  roomSetPlaybackRate = (rate: number) => {
    // emit an event to the server
    this.socket.emit('CMD:playbackRate', rate);
  };

  roomSetLoop = (loop: boolean) => {
    this.socket.emit('CMD:loop', loop);
  };

  roomTogglePlay = () => {
    if (!this.haveLock()) {
      return;
    }
    if (this.isPauseDisabled()) {
      return;
    }
    const shouldPlay = this.Player().shouldPlay();
    if (shouldPlay) {
      this.socket.emit('CMD:play');
      this.localPlay();
    } else {
      this.socket.emit('CMD:pause');
      this.localPause();
    }
  };

  roomSeek = (time: number) => {
    let target = time;
    target = Math.max(target, 0);
    this.Player().seekVideo(target);
    this.socket.emit('CMD:seek', target);
  };

  getRoomTSToSet = (time: number) => {
    let target = time;
    // In live case, can't just send video time because clients may have different durations
    // Take the passed time and compute the offset from the end time (negative)
    // Each client should use this value to compute the time to set when starting playback
    if (this.state.isLiveStream) {
      target = time - this.Player().getDuration();
    }
    // Otherwise just return the time
    return target;
  };

  onFullScreenChange = () => {
    this.setState({ fullScreen: Boolean(document.fullscreenElement) });
    setTimeout(() => this.chatRef.current?.scrollToBottom(), 100);
  };

  onKeydown = (e: any) => {
    if (!document.activeElement || document.activeElement.tagName === 'BODY') {
      if (e.key === ' ') {
        e.preventDefault();
        this.roomTogglePlay();
      } else if (e.key === 'ArrowRight') {
        this.roomSeek(this.Player().getCurrentTime() + 10);
      } else if (e.key === 'ArrowLeft') {
        this.roomSeek(this.Player().getCurrentTime() - 10);
      } else if (e.key === 't') {
        this.localFullScreen(false);
      } else if (e.key === 'f') {
        this.localFullScreen(true);
      } else if (e.key === 'm') {
        this.localToggleMute();
      }
    }
  };

  localFullScreen = async (bVideoOnly: boolean) => {
    // Default: fullscreen the body (theater mode)
    let container = document.body as HTMLElement;
    if (bVideoOnly || isMobile()) {
      if (this.playingVBrowser() && !isMobile()) {
        // vbrowser needs to fullscreen the control wrapper div
        // Can't really control the VBrowser on mobile anyway, so just fullscreen the video
        container = document.getElementById('leftVideoParent') as HTMLElement;
      } else {
        // fullscreen just the video
        container = this.Player().getVideoEl();
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
      // not currently in fullscreen
      await container.requestFullscreen();
    } else {
      // e.g. switching from video fullscreen to theater mode
      const bChangeElements = document.fullscreenElement !== container;
      await document.exitFullscreen();
      if (bChangeElements) {
        await container.requestFullscreen();
      }
    }
  };

  localToggleMute = () => {
    this.localSetMute(!this.Player().isMuted());
  };

  roomSetMedia = (value: string) => {
    this.socket.emit('CMD:host', value);
  };

  roomPlaylistPlay = (index: number) => {
    this.roomSetMedia(this.state.playlist[index]?.url);
    this.roomPlaylistDelete(index);
  };

  roomPlaylistAdd = (value: string) => {
    this.socket.emit('CMD:playlistAdd', value);
  };

  roomPlaylistMove = (index: number, toIndex: number) => {
    this.socket.emit('CMD:playlistMove', { index, toIndex });
  };

  roomPlaylistDelete = (index: number) => {
    this.socket.emit('CMD:playlistDelete', index);
  };

  updateName = (name: string) => {
    this.setState({ myName: name });
    this.socket.emit('CMD:name', name);
    window.localStorage.setItem('watchparty-username', name);
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

  getMediaDisplayName = (input?: string) => {
    if (!input) {
      return '';
    }
    // Show the whole URL for youtube
    if (this.usingYoutube()) {
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
    if (isMagnet(input)) {
      const magnetParsed = new URLSearchParams(input);
      const index = magnetParsed.get('fileIndex');
      return magnetParsed.get('dn') + (index != null ? ` (file ${index})` : '');
    }
    if (input.includes('/stream?torrent=magnet')) {
      const search = new URL(input).search;
      const searchParsed = new URLSearchParams(search);
      const magnetUrl = searchParsed.get('torrent') ?? '';
      const magnetParsed = new URLSearchParams(magnetUrl);
      const index = searchParsed.get('fileIndex');
      return (
        (magnetParsed.get('dn') ?? searchParsed.get('dn')) +
        (index != null ? ` (file ${index})` : '')
      );
    }
    if (input.includes('/proxy')) {
      const urlParsed = new URLSearchParams(input);
      const displayName = urlParsed.get('displayName');
      if (displayName) {
        return displayName;
      }
    }
    return input;
  };

  setLoadingFalse = () => {
    this.setState({ loading: false });
  };

  getLeaderTime = () => {
    if (this.state.participants.length > 2) {
      return calculateMedian(Object.values(this.state.tsMap));
    }
    return Math.max(...Object.values(this.state.tsMap));
  };

  onVideoEnded = (url: string) => {
    this.localPause();
    // check if looping is on, if so set time back to 0 and restart
    if (this.state.roomLoop) {
      this.localSeek(0);
      this.localPlay();
      return;
    }
    if (this.state.playlist.length) {
      // Pass the url of the video at the time this video was started
      this.socket.emit('CMD:playlistNext', url);
      return;
    }
    // Play next fileIndex
    const re = /&fileIndex=(\d+)$/;
    const match = re.exec(this.state.roomMedia);
    if (match) {
      const fileIndex = match[1];
      const nextNum = Number(fileIndex) + 1;
      const nextUrl = this.state.roomMedia.replace(
        /&fileIndex=(\d+)$/,
        `&fileIndex=${nextNum}`,
      );
      this.roomSetMedia(nextUrl);
    }
  };

  refreshControls = () => {
    this.setState({ controlsTimestamp: Date.now() });
  };

  setSettingsModalOpen = (settingsModalOpen: boolean) => {
    this.setState({ settingsModalOpen });
  };

  render() {
    const sharer = this.state.participants.find((p) => p.isScreenShare);
    const playlist = this.state.playlist;
    const controls = (
      <Controls
        key={this.state.controlsTimestamp}
        paused={this.state.roomPaused}
        roomPlaybackRate={this.state.roomPlaybackRate}
        isLiveStream={this.state.isLiveStream}
        muted={this.Player().isMuted()}
        volume={this.Player().getVolume()}
        subtitled={this.Player().isSubtitled()}
        currentTime={this.Player().getCurrentTime()}
        duration={this.Player().getDuration()}
        disabled={!this.haveLock()}
        leaderTime={this.hasDuration() ? this.getLeaderTime() : undefined}
        isPauseDisabled={this.isPauseDisabled()}
        playbackRate={this.Player().getPlaybackRate()}
        isYouTube={this.usingYoutube()}
        timeRanges={this.Player().getTimeRanges()}
        loop={this.state.roomLoop}
        roomSetLoop={this.roomSetLoop}
        roomTogglePlay={this.roomTogglePlay}
        roomSeek={this.roomSeek}
        roomSetPlaybackRate={this.roomSetPlaybackRate}
        localFullScreen={this.localFullScreen}
        localToggleMute={this.localToggleMute}
        localSubtitleModal={this.localSubtitleModal}
        localSetVolume={this.localSetVolume}
        localSeek={this.localSeek}
        localSetSubtitleMode={this.Player().setSubtitleMode}
        roomPlaylistPlay={this.roomPlaylistPlay}
        playlist={this.state.playlist}
      />
    );
    return (
      <React.Fragment>
        {this.state.multiStreamSelection && (
          <MultiStreamModal
            streams={this.state.multiStreamSelection}
            setMedia={this.roomSetMedia}
            resetMultiSelect={this.resetMultiSelect}
          />
        )}
        {this.state.isVBrowserModalOpen && (
          <VBrowserModal
            closeModal={() => this.setState({ isVBrowserModalOpen: false })}
            startVBrowser={this.startVBrowser}
          />
        )}
        {this.state.isScreenShareModalOpen && (
          <ScreenShareModal
            closeModal={() => this.setState({ isScreenShareModalOpen: false })}
            startScreenShare={this.startScreenShare}
          />
        )}
        {this.state.isFileShareModalOpen && (
          <FileShareModal
            closeModal={() => this.setState({ isFileShareModalOpen: false })}
            startFileShare={this.startFileShare}
            startConvert={this.startConvert}
          />
        )}
        {this.state.isSubtitleModalOpen && (
          <SubtitleModal
            closeModal={() => this.setState({ isSubtitleModalOpen: false })}
            socket={this.socket}
            roomSubtitle={this.state.roomSubtitle}
            roomMedia={this.state.roomMedia}
            haveLock={this.haveLock}
            getMediaDisplayName={this.getMediaDisplayName}
            setSubtitleMode={this.Player().setSubtitleMode}
            getSubtitleMode={this.Player().getSubtitleMode}
          />
        )}
        {this.state.state === 'starting' && (
          <Overlay className={styles.flexCenter}>
            <Title order={2}>Loading...</Title>
          </Overlay>
        )}
        {this.state.overlayMsg && <ErrorModal error={this.state.overlayMsg} />}
        {this.state.isErrorAuth && (
          <PasswordModal
            savedPasswords={this.state.savedPasswords}
            roomId={this.state.roomId}
          />
        )}
        <SettingsModal
          modalOpen={this.state.settingsModalOpen}
          setModalOpen={this.setSettingsModalOpen}
          roomLock={this.state.roomLock}
          setRoomLock={this.setRoomLock}
          socket={this.socket}
          roomId={this.state.roomId}
          isChatDisabled={this.state.isChatDisabled}
          setIsChatDisabled={this.setIsChatDisabled}
          owner={this.state.owner}
          setOwner={this.setOwner}
          vanity={this.state.vanity}
          setVanity={this.setVanity}
          inviteLink={this.state.inviteLink}
          password={this.state.password}
          setPassword={this.setPassword}
          clearChat={this.clearChat}
          roomTitle={this.state.roomTitle}
          setRoomTitle={this.setRoomTitle}
          roomDescription={this.state.roomDescription}
          setRoomDescription={this.setRoomDescription}
          roomTitleColor={this.state.roomTitleColor}
          setRoomTitleColor={this.setRoomTitleColor}
          mediaPath={this.state.mediaPath}
          setMediaPath={this.setMediaPath}
        />
        {this.state.errorMessage && (
          <Alert
            title="Error"
            color="red"
            style={{
              position: 'fixed',
              bottom: '10px',
              right: '10px',
              zIndex: 1000,
            }}
          >
            {this.state.errorMessage}
          </Alert>
        )}
        {this.state.successMessage && (
          <Alert
            title="Success"
            color="green"
            style={{
              position: 'fixed',
              bottom: '10px',
              right: '10px',
              zIndex: 1000,
            }}
          >
            {this.state.successMessage}
          </Alert>
        )}
        {this.state.warningMessage && (
          <Alert
            color="yellow"
            // header={this.state.warningMessage}
            style={{
              position: 'fixed',
              top: '10px',
              left: '50%',
              transform: 'translate(-50%, 0)',
              zIndex: 1000,
            }}
          >
            {this.state.warningMessage}
          </Alert>
        )}
        {!this.state.fullScreen && (
          <TopBar
            roomTitle={this.state.roomTitle}
            roomDescription={this.state.roomDescription}
            roomTitleColor={this.state.roomTitleColor}
          />
        )}
        {
          <div
            className={styles.mobileStack}
            style={{ margin: '0 8px', display: 'flex', columnGap: '32px' }}
          >
            <div
              className={
                (this.state.fullScreen
                  ? styles.fullHeightColumnFullscreen
                  : styles.fullHeightColumn) +
                ' ' +
                styles.leftColumn
              }
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  position: 'relative',
                  gap: '4px',
                }}
              >
                {!this.state.fullScreen && (
                  <React.Fragment>
                    <div className={styles.mobileStack}>
                      <ComboBox
                        roomSetMedia={this.roomSetMedia}
                        playlistAdd={this.roomPlaylistAdd}
                        roomMedia={this.state.roomMedia}
                        getMediaDisplayName={this.getMediaDisplayName}
                        launchMultiSelect={this.launchMultiSelect}
                        mediaPath={this.state.mediaPath}
                        disabled={!this.haveLock()}
                      />
                    </div>
                    <div className={styles.mobileStack}>
                      {this.localStreamToPublish && (
                        <Button
                          color="red"
                          onClick={this.stopPublishingLocalStream}
                          disabled={sharer?.id !== this.socket?.id}
                          leftSection={<IconX />}
                        >
                          Stop Share
                        </Button>
                      )}
                      {!this.localStreamToPublish &&
                        !sharer &&
                        !this.playingVBrowser() && (
                          <Button
                            className={styles.shareButton}
                            color="blue"
                            disabled={!this.haveLock()}
                            onClick={() => {
                              this.setState({
                                isScreenShareModalOpen: true,
                              });
                            }}
                            leftSection={<IconScreenShare />}
                          >
                            Screenshare
                          </Button>
                        )}
                      {!this.localStreamToPublish &&
                        !sharer &&
                        !this.playingVBrowser() && (
                          <Button
                            className={styles.shareButton}
                            disabled={!this.haveLock()}
                            color="green"
                            onClick={() => {
                              this.setState({
                                isVBrowserModalOpen: true,
                              });
                            }}
                            leftSection={<IconBrowser />}
                          >
                            VBrowser
                          </Button>
                        )}
                      {this.playingVBrowser() && (
                        <>
                          <Button
                            color="red"
                            disabled={!this.haveLock()}
                            onClick={this.stopVBrowser}
                            leftSection={<IconX />}
                          >
                            Stop VBrowser
                          </Button>
                          <Select
                            leftSection={<IconKeyboardFilled />}
                            value={this.state.controller}
                            placeholder="No controller"
                            clearable
                            onChange={this.changeController}
                            disabled={!this.haveLock()}
                            data={this.state.participants.map((p) => ({
                              label: this.state.nameMap[p.id] || p.id,
                              value: p.id,
                            }))}
                          ></Select>
                          <Select
                            leftSection={<IconUserScreen />}
                            disabled={!this.haveLock()}
                            value={this.state.vBrowserResolution}
                            onChange={(value) =>
                              this.setState({
                                vBrowserResolution: value as string,
                              })
                            }
                            data={[
                              {
                                label: '1080p (Plus only)',
                                value: '1920x1080@30',
                                disabled: !this.state.isVBrowserLarge,
                              },
                              {
                                label: '720p',
                                value: '1280x720@30',
                              },
                              {
                                label: '576p',
                                value: '1024x576@60',
                              },
                              {
                                label: '486p',
                                value: '864x486@60',
                              },
                              {
                                label: '360p',
                                value: '640x360@60',
                              },
                            ]}
                          ></Select>
                          <Select
                            leftSection={<IconAntennaBars5 />}
                            disabled={!this.haveLock()}
                            value={this.state.vBrowserQuality}
                            onChange={(value) => {
                              this.setState({
                                vBrowserQuality: value as string,
                              });
                            }}
                            data={[
                              {
                                label: 'Eco (0.25x)',
                                value: '0.25',
                              },
                              {
                                label: 'Low (0.5x)',
                                value: '0.5',
                              },
                              {
                                label: 'Standard (1x)',
                                value: '1',
                              },
                              {
                                label: 'High (1.5x)',
                                value: '1.5',
                              },
                              {
                                label: 'Ultra (2x)',
                                value: '2',
                              },
                            ]}
                          ></Select>
                        </>
                      )}
                      {!this.localStreamToPublish &&
                        !sharer &&
                        !this.playingVBrowser() && (
                          <Button
                            className={styles.shareButton}
                            color="violet"
                            disabled={!this.haveLock()}
                            onClick={() => {
                              this.setState({
                                isFileShareModalOpen: true,
                              });
                            }}
                            leftSection={<IconFile />}
                          >
                            File
                          </Button>
                        )}
                      {this.state.uploadController && (
                        <Button
                          color="red"
                          onClick={() => {
                            this.state.uploadController?.abort();
                            this.setState({ uploadController: undefined });
                          }}
                          leftSection={<IconX />}
                        >
                          Stop Upload
                        </Button>
                      )}
                      {false && (
                        <SearchComponent
                          setMedia={this.roomSetMedia}
                          playlistAdd={this.roomPlaylistAdd}
                          type={'youtube'}
                          disabled={!this.haveLock()}
                        />
                      )}
                      {Boolean(this.context.streamPath) && (
                        <SearchComponent
                          setMedia={this.roomSetMedia}
                          playlistAdd={this.roomPlaylistAdd}
                          type={'stream'}
                          launchMultiSelect={this.launchMultiSelect}
                          disabled={!this.haveLock()}
                        />
                      )}
                    </div>
                  </React.Fragment>
                )}
                <div style={{ flexGrow: 1, position: 'relative' }}>
                  <div className={styles.playerContainer}>
                    {!this.state.isAutoPlayable && this.state.roomMedia && (
                      <Overlay className={styles.flexCenter}>
                        <Button
                          onClick={() => {
                            this.setState({ isAutoPlayable: true });
                            this.localSetMute(false);
                            this.localSetVolume(1);
                          }}
                          leftSection={<IconVolume />}
                          size="xl"
                        >
                          Unmute
                        </Button>
                      </Overlay>
                    )}
                    {(this.state.loading ||
                      !this.state.roomMedia ||
                      this.state.nonPlayableMedia) &&
                      !this.state.isLiveStream && (
                        <div
                          id="loader"
                          className={`${styles.videoContent} ${styles.flexCenter}`}
                        >
                          {this.state.loading && (
                            <div
                              className={styles.flexCenter}
                              style={{
                                flexDirection: 'column',
                              }}
                            >
                              <Loader />
                              <div>
                                {this.playingVBrowser()
                                  ? 'Launching virtual browser. This can take up to a minute.'
                                  : ''}
                              </div>
                            </div>
                          )}
                          {!this.state.loading && !this.state.roomMedia && (
                            <Alert
                              color="yellow"
                              title="You're not watching anything!"
                            >
                              Pick something to watch above.
                            </Alert>
                          )}
                          {!this.state.loading &&
                            this.state.nonPlayableMedia && (
                              <Alert
                                color="red"
                                title="It doesn't look like this is a media file!"
                              >
                                Maybe you meant to launch a VBrowser if you're
                                trying to visit a web page?
                              </Alert>
                            )}
                        </div>
                      )}
                    <iframe
                      style={{
                        display:
                          this.usingYoutube() && !this.state.loading
                            ? 'block'
                            : 'none',
                      }}
                      title="YouTube"
                      id="leftYt"
                      className={styles.videoContent}
                      allowFullScreen
                      frameBorder="0"
                      allow="autoplay"
                      src="https://www.youtube.com/embed/?enablejsapi=1&controls=0&rel=0"
                    />
                    {this.playingVBrowser() &&
                    this.getVBrowserPass() &&
                    this.getVBrowserHost() ? (
                      <VBrowser
                        username={this.socket.id!}
                        password={this.getVBrowserPass()}
                        hostname={this.getVBrowserHost()}
                        controlling={this.state.controller === this.socket.id}
                        resolution={this.state.vBrowserResolution}
                        quality={this.state.vBrowserQuality}
                        doPlay={this.localPlay}
                        setResolution={(data: string) =>
                          this.setState({ vBrowserResolution: data })
                        }
                        setQuality={(data: string) => {
                          this.setState({ vBrowserQuality: data });
                        }}
                        isMobile={isMobile()}
                      />
                    ) : (
                      <video
                        style={{
                          display:
                            (this.usingNative() && !this.state.loading) ||
                            this.state.fullScreen
                              ? 'block'
                              : 'none',
                          width: '100%',
                          maxHeight: VIDEO_MAX_HEIGHT_CSS,
                        }}
                        id="leftVideo"
                        onEnded={(e) => this.onVideoEnded(e.currentTarget.src)}
                        playsInline
                        onClick={this.roomTogglePlay}
                      ></video>
                    )}
                    {Boolean(this.state.total) && (
                  <div
                    style={{
                      color: softWhite,
                      fontWeight: 400,
                      fontSize: 10,
                      lineHeight: '8px',
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      zIndex: 1,
                    }}
                  >
                    {Math.min(
                      (this.state.downloaded / this.state.total) * 100,
                      100,
                    ).toFixed(2) +
                      '% - ' +
                      formatSpeed(this.state.speed) +
                      ' - ' +
                      this.state.connections +
                      ' connections'}
                  </div>
                )}
                  </div>
                </div>
                {this.state.roomMedia && controls}
                {!isMobile() && (
                  <div className={styles.expandButton}>
                    <ActionIcon
                      onClick={() => {
                        const newVal = !this.state.showChatColumn;
                        this.setState({
                          showChatColumn: newVal,
                        });
                        window.localStorage.setItem(
                          'watchparty-showchatcolumn',
                          Number(newVal).toString(),
                        );
                      }}
                    >
                      {this.state.showChatColumn ? (
                        <IconChevronRight size={16} />
                      ) : (
                        <IconChevronLeft size={16} />
                      )}
                    </ActionIcon>
                  </div>
                )}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                width: this.state.showChatColumn ? 400 : 0,
                maxWidth: 400,
                overflow: 'hidden',
                gap: '4px',
              }}
              className={`${
                (this.state.fullScreen
                  ? styles.fullHeightColumnFullscreen
                  : styles.fullHeightColumn) +
                ' ' +
                styles.rightColumn
              }`}
            >
              <div style={{ display: 'flex', width: '100%', gap: '4px' }}>
                <TextInput
                  // description="Name"
                  style={{
                    visibility: this.state.showChatColumn
                      ? undefined
                      : 'hidden',
                    flexGrow: 1,
                  }}
                  value={this.state.myName}
                  onChange={(e) => {
                    this.updateName(e.target.value);
                  }}
                  onFocus={(e) => e.target.select()}
                  leftSection={<IconUser />}
                  rightSection={
                    <ActionIcon
                      color="gray"
                      onClick={async () => {
                        const randName = await generateName();
                        this.updateName(randName);
                      }}
                      title="Generate a random name"
                    >
                      <IconArrowsShuffle size={16} />
                    </ActionIcon>
                  }
                />
                <InviteButton />
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <Button
                  className={styles.shareButton}
                  color="grey"
                  onClick={() =>
                    this.setState({
                      showPeopleColumn: !this.state.showPeopleColumn,
                    })
                  }
                  leftSection={<IconUsersGroup />}
                  rightSection={
                    <Badge circle>{this.state.participants.length}</Badge>
                  }
                >
                  People
                </Button>
                <Menu>
                  <Menu.Target>
                    <Button
                      color="grey"
                      className={styles.shareButton}
                      leftSection={<IconList />}
                      rightSection={<Badge circle>{playlist.length}</Badge>}
                    >
                      Playlist
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown
                    style={{
                      overflowY: playlist.length > 0 ? 'scroll' : undefined,
                      maxHeight: 400,
                      maxWidth: isMobile() ? 400 : 600,
                    }}
                  >
                    {playlist.length === 0 && (
                      <Menu.Item disabled>
                        There are no items in the playlist.
                      </Menu.Item>
                    )}
                    {playlist.map((item: PlaylistVideo, index: number) => {
                      if (Boolean(item.img)) {
                        item.type = 'youtube';
                      }
                      return (
                        <Menu.Item key={index}>
                          <ChatVideoCard
                            video={item}
                            index={index}
                            controls
                            onPlay={this.roomPlaylistPlay}
                            onPlayNext={(index) => {
                              this.roomPlaylistMove(index, 0);
                            }}
                            onRemove={(index) => {
                              this.roomPlaylistDelete(index);
                            }}
                            disabled={!this.haveLock()}
                          />
                        </Menu.Item>
                      );
                    })}
                  </Menu.Dropdown>
                </Menu>
                <Button
                  style={{ flexGrow: 1 }}
                  color="grey"
                  title="Settings"
                  // className={styles.shareButton}
                  onClick={() => {
                    this.setSettingsModalOpen(true);
                  }}
                >
                  <IconSettings />
                </Button>
              </div>
              {this.state.state === 'connected' && (
                <div
                  style={{
                    position: 'absolute',
                    background: 'rgba(10, 10, 10, 0.6)',
                    zIndex: 200,
                    left: 0,
                    top: 76,
                    height: this.state.showPeopleColumn
                      ? 'calc(100% - 120px)'
                      : '0%',
                    width: '100%',
                    overflowY: 'auto',
                    // visibility: this.state.showPeopleColumn ? 'visible' : 'hidden',
                    transition: 'height ease-out 0.5s',
                  }}
                >
                  <VideoChat
                    socket={this.socket}
                    participants={this.state.participants}
                    nameMap={this.state.nameMap}
                    pictureMap={this.state.pictureMap}
                    tsMap={this.state.tsMap}
                    rosterUpdateTS={this.state.rosterUpdateTS}
                    owner={this.state.owner}
                    getLeaderTime={this.getLeaderTime}
                  />
                </div>
              )}
              <Chat
                chat={this.state.chat}
                nameMap={this.state.nameMap}
                pictureMap={this.state.pictureMap}
                socket={this.socket}
                scrollTimestamp={this.state.scrollTimestamp}
                getMediaDisplayName={this.getMediaDisplayName}
                isChatDisabled={this.state.isChatDisabled}
                owner={this.state.owner}
                ref={this.chatRef}
                hide={!this.state.showChatColumn}
              />
            </div>
          </div>
        }
      </React.Fragment>
    );
  }
}
