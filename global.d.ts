declare module 'youtube-api';
declare module 'moniker';
declare module 'react-semantic-ui-range';
declare module 'xml2js';
declare module 'srt-webvtt';

type StringDict = { [key: string]: string };
type NumberDict = { [key: string]: number };
type BooleanDict = { [key: string]: boolean };
type PCDict = { [key: string]: RTCPeerConnection };
type MediaType = 'vbrowser' | 'screenshare' | 'video' | 'youtube';

interface User {
  id: string;
  isVideoChat?: boolean;
  isScreenShare?: boolean;
}

interface ChatMessageBase {
  id: string;
  cmd?: string;
  msg: string;
  system?: boolean;
}

interface ChatMessage extends ChatMessageBase {
  timestamp: string;
  videoTS?: number;
}

interface SearchResult {
  name: string;
  url: string;
  size?: string;
  seeders?: string;
  magnet?: string;
  img?: string;
}

interface Settings {
  mediaPath?: string;
  streamPath?: string;
  disableChatSound?: boolean;
}

interface PlaylistVideo {
  url: string;
  name: string;
  img?: string;
  channel: string;
  duration: string;
}

interface HostState {
  video: string;
  videoTS: number;
  subtitle: string;
  paused: boolean;
  isVBrowserLarge: boolean;
  controller?: string;
}

interface PermanentRoom {
  roomId: string;
  creationTime: string;
  password: string;
  owner: string;
  vanity: string;
  isChatDisabled: boolean;
  isSubRoom: boolean;
  lastUpdateTime: string;
  data: any;
}
