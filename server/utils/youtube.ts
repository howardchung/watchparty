import config from '../config';
import Youtube from 'youtube-api';
import {
  YoutubeAPIVideoResult,
  YoutubeListResult,
  YoutubeSearchResult,
} from '../index.d';
import {
  PT_HOURS_REGEX,
  PT_MINUTES_REGEX,
  PT_SECONDS_REGEX,
  YOUTUBE_VIDEO_ID_REGEX,
} from './regex';

if (config.YOUTUBE_API_KEY) {
  Youtube.authenticate({
    type: 'key',
    key: config.YOUTUBE_API_KEY,
  });
}

export const mapYoutubeSearchResult = (
  video: YoutubeSearchResult
): PlaylistVideo => {
  return {
    channel: video.snippet.channelTitle,
    url: 'https://www.youtube.com/watch?v=' + video.id.videoId,
    name: video.snippet.title,
    img: video.snippet.thumbnails.default.url,
    duration: 0,
  };
};

export const mapYoutubeListResult = (
  video: YoutubeSearchResult
): PlaylistVideo => {
  const videoId = video.id;
  return {
    url: 'https://www.youtube.com/watch?v=' + videoId,
    name: video.snippet.title,
    img: video.snippet.thumbnails.default.url,
    channel: video.snippet.channelTitle,
    duration: 0,
  };
};

export const searchYoutube = (query: string): Promise<PlaylistVideo[]> => {
  return new Promise((resolve, reject) => {
    Youtube.search.list(
      { part: 'snippet', type: 'video', maxResults: 25, q: query },
      (err: any, data: any) => {
        if (data && data.items) {
          const response = data.items.map(mapYoutubeSearchResult);
          resolve(response);
        } else {
          console.warn(data);
          reject();
        }
      }
    );
  });
};

export const getYtTrendings = async (
  region: string | undefined
): Promise<PlaylistVideo[]> => {
  const apiKey = config.YOUTUBE_API_KEY;
  // console.log({ region });
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=${
    region ?? 'US'
  }&maxResults=20&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  const finalRes = data?.items ? data.items.map(mapYoutubeListResult) : [];
  return finalRes;
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
      { part: 'snippet,contentDetails', id },
      (err: any, data: YoutubeAPIVideoResult) => {
        if (data) {
          const video = data.items[0];
          resolve(mapYoutubeListResult(video));
        } else {
          console.warn(err);
          reject('unknown youtube api error');
        }
      }
    );
  });
};

export const getVideoDuration = (string: string) => {
  const hoursParts = PT_HOURS_REGEX.exec(string);
  const minutesParts = PT_MINUTES_REGEX.exec(string);
  const secondsParts = PT_SECONDS_REGEX.exec(string);

  const hours = hoursParts ? parseInt(hoursParts[1]) : 0;
  const minutes = minutesParts ? parseInt(minutesParts[1]) : 0;
  const seconds = secondsParts ? parseInt(secondsParts[1]) : 0;

  const totalSeconds = seconds + minutes * 60 + hours * 60 * 60;
  return totalSeconds;
};
