type StringDict = { [key: string]: string };
type NumberDict = { [key: string]: number };
type PCDict = { [key: string]: RTCPeerConnection };
type MediaType = 'vbrowser' | 'screenshare' | 'video' | 'youtube';

interface User {
  id: string;
  isVideoChat: boolean;
  isScreenShare: boolean;
  isController: boolean;
}

interface ChatMessage {
  timestamp: string;
  videoTS: number;
  id: string;
  cmd: string;
  msg: string;
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
}

interface PlaylistVideo {
  url: string;
  name: string;
  img?: string;
  channel: string;
  duration: string;
}
