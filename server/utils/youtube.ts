import Youtube from 'youtube-api';
import { YoutubeVideo, YoutubeResult } from '../index.d';

if (process.env.YOUTUBE_API_KEY) {
  Youtube.authenticate({
    type: 'key',
    key: process.env.YOUTUBE_API_KEY,
  });
}

export const mapYoutubeResult = (video: YoutubeResult): YoutubeVideo => {
  return {
    url: 'https://www.youtube.com/watch?v=' + video.id.videoId,
    name: video.snippet.title,
    img: video.snippet.thumbnails.default.url,
  };
};

export const searchYoutube = (query: string): Promise<YoutubeVideo[]> => {
  return new Promise((resolve, reject) => {
    Youtube.search.list(
      { part: 'snippet', type: 'video', maxResults: 25, q: query },
      (err: any, data: any) => {
        console.log(err);
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
