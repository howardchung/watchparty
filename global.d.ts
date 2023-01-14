declare module 'youtube-api';
declare module 'react-semantic-ui-range';
declare module 'srt-webvtt';

type StringDict = { [key: string]: string };
type NumberDict = { [key: string]: number };
type BooleanDict = { [key: string]: boolean };
type AnyDict = { [key: string]: any };
type PCDict = { [key: string]: RTCPeerConnection };
type HTMLVideoElementDict = { [key: string]: HTMLVideoElement };
type MediaType = 'vbrowser' | 'screenshare' | 'video' | 'youtube';

interface User {
  id: string;
  isVideoChat?: boolean;
  isMuted?: boolean;
  isScreenShare?: boolean;
  isSub?: boolean;
  clientId: string;
}

interface Reaction {
  user: string;
  value: string;
  msgId: string;
  msgTimestamp: string;
}

interface ChatMessageBase {
  id: string;
  cmd?: string;
  msg: string;
  system?: boolean;
  isSub?: boolean;
}

interface ChatMessage extends ChatMessageBase {
  timestamp: string;
  videoTS?: number;
  reactions?: { [value: string]: string[] };
}

interface Settings {
  disableChatSound?: boolean;
}

interface PlaylistVideo {
  url: string;
  name: string;
  img?: string;
  channel?: string;
  duration: number;
}

interface SearchResult extends PlaylistVideo {
  size?: string;
  seeders?: string;
  magnet?: string;
  type: string;
  url: string;
  name: string;
  duration: number;
}

interface HostState {
  video: string;
  videoTS: number;
  subtitle: string;
  paused: boolean;
  isVBrowserLarge: boolean;
  controller?: string;
}

interface PersistentRoom {
  roomId: string;
  password: string;
  owner: string;
  vanity: string;
  isChatDisabled: boolean;
  isSubRoom: boolean;
  data: any;
}
