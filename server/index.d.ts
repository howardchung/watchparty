type StringDict = { [key: string]: string };
type NumberDict = { [key: string]: number };
type BooleanDict = { [key: string]: boolean };
type PCDict = { [key: string]: RTCPeerConnection };

interface User {
  id: string;
  isVideoChat?: boolean;
  isScreenShare?: boolean;
  isController?: boolean;
}

interface ChatMessage {
  timestamp: string;
  videoTS?: number;
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

export interface YoutubeResult {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    thumbnails: {
      default: {
        url: string;
      };
    };
  };
}

export interface YoutubeVideo {
  url: string;
  name: string;
  img: string;
}
