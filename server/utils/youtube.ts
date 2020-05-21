import Youtube from 'youtube-api';

import {
  PlaylistVideo,
  YoutubeAPIVideoResult,
  YoutubeResult,
} from '../index.d';
import { YOUTUBE_VIDEO_ID_REGEX } from './regex';

if (process.env.YOUTUBE_API_KEY) {
  Youtube.authenticate({
    type: 'key',
    key: process.env.YOUTUBE_API_KEY,
  });
}

export const mapYoutubeResult = (video: YoutubeResult): PlaylistVideo => {
  const videoId = typeof video.id === 'string' ? video.id : video.id.videoId;
  return {
    url: 'https://www.youtube.com/watch?v=' + videoId,
    name: video.snippet.title,
    img: video.snippet.thumbnails.default.url,
  };
};

export const searchYoutube = (query: string): Promise<PlaylistVideo[]> => {
  return new Promise((resolve, reject) => {
    Youtube.search.list(
      { part: 'snippet', type: 'video', maxResults: 25, q: query },
      (err: any, data: any) => {
        if (data && data.items) {
          const response = data.items.map(mapYoutubeResult);
          resolve(response);
        } else {
          console.error(data);
          reject();
        }
      }
    );
  });
};

export const getYoutubeVideoID = (url: string) => {
  const idParts = YOUTUBE_VIDEO_ID_REGEX.exec(url);
  if (!idParts) {
    return;
  }

  const id = idParts[1];
  if (!id) {
    return;
  }

  return id;
};

export const fetchYoutubeVideo = (id: string): Promise<PlaylistVideo> => {
  return new Promise((resolve, reject) => {
    Youtube.videos.list(
      { part: 'snippet,contentDetails,statistics', id },
      (err: any, data: YoutubeAPIVideoResult) => {
        if (data) {
          const video = data.items[0];
          resolve(mapYoutubeResult(video));
        } else {
          console.error(data);
          reject('unknown youtube api error');
        }
      }
    );
  });
};
