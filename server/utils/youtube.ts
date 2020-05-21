import Youtube from 'youtube-api';

import {
  PlaylistVideo,
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

if (process.env.YOUTUBE_API_KEY) {
  Youtube.authenticate({
    type: 'key',
    key: process.env.YOUTUBE_API_KEY,
  });
}

export const resolveYoutubeVideoID = (
  video: YoutubeListResult | YoutubeSearchResult
) => (typeof video.id === 'string' ? video.id : video.id.videoId);

export const mapYoutubeSearchResult = (
  video: YoutubeSearchResult
): PlaylistVideo => {
  const videoId = resolveYoutubeVideoID(video);
  return {
    url: 'https://www.youtube.com/watch?v=' + videoId,
    name: video.snippet.title,
    img: video.snippet.thumbnails.default.url,
    channel: video.snippet.channelTitle,
    duration: 0,
    durationObject: { h: 0, m: 0, s: 0 },
  };
};

export const mapYoutubeListResult = (
  video: YoutubeListResult
): PlaylistVideo => {
  const videoId = resolveYoutubeVideoID(video);
  return {
    url: 'https://www.youtube.com/watch?v=' + videoId,
    name: video.snippet.title,
    img: video.snippet.thumbnails.default.url,
    channel: video.snippet.channelTitle,
    duration: getVideoDuration(video.contentDetails.duration),
    durationObject: getVideoDurationObject(video.contentDetails.duration),
  };
};

export const searchYoutube = (query: string): Promise<PlaylistVideo[]> => {
  return new Promise((resolve, reject) => {
    Youtube.search.list(
      {
        part: 'snippet',
        type: 'video',
        maxResults: 25,
        q: query,
      },
      (err: any, data: any) => {
        if (data && data.items) {
          const response = data.items.map(mapYoutubeSearchResult);
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
      { part: 'snippet,contentDetails', id },
      (err: any, data: YoutubeAPIVideoResult) => {
        if (data) {
          const video = data.items[0];
          resolve(mapYoutubeListResult(video));
        } else {
          console.error(data);
          reject('unknown youtube api error');
        }
      }
    );
  });
};

export const getVideoDurationObject = (string: string) => {
  const hoursParts = PT_HOURS_REGEX.exec(string);
  const minutesParts = PT_MINUTES_REGEX.exec(string);
  const secondsParts = PT_SECONDS_REGEX.exec(string);

  const hours = hoursParts ? parseInt(hoursParts[1]) : 0;
  const minutes = minutesParts ? parseInt(minutesParts[1]) : 0;
  const seconds = secondsParts ? parseInt(secondsParts[1]) : 0;

  return {
    h: hours,
    m: minutes,
    s: seconds,
  };
};

export const getVideoDuration = (string: string) => {
  const durationObject = getVideoDurationObject(string);
  if (!durationObject) {
    return 0;
  }

  const totalSeconds =
    durationObject.s + durationObject.m * 60 + durationObject.h * 60 * 60;
  return totalSeconds;
};
