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

export interface PlaylistVideo {
  url: string;
  name: string;
  img?: string;
  duration: string;
  channel: string;
}

export interface YoutubeAPIVideoResult {
  kind: string;
  etag: string;
  items: YoutubeListResult[];
  pageInfo: { totalResults: number; resultsPerPage: number };
}

export interface YoutubeResult {
  kind: string;
  etag: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: {
        url: string;
        width: number;
        height: number;
      };
      medium: {
        url: string;
        width: number;
        height: number;
      };
      high: {
        url: string;
        width: number;
        height: number;
      };
      standard: {
        url: string;
        width: number;
        height: number;
      };
    };
    channelTitle: string;
    tags: string[];
    categoryId: string;
    liveBroadcastContent: string;
    localized: {
      title: string;
      description: string;
    };
    defaultAudioLanguage: string;
  };
}

export interface YoutubeSearchResult extends YoutubeResult {
  id: {
    videoId: string;
  };
}

export interface YoutubeListResult extends YoutubeResult {
  id: string;
  contentDetails: {
    duration: string;
    dimension: string;
    definition: string;
    caption: string;
    licensedContent: boolean;
    contentRating: any;
    projection: string;
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    dislikeCount: string;
    favoriteCount: string;
    commentCount: string;
  };
}
