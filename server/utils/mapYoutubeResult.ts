import { YoutubeResult, YoutubeVideo } from "..";

export const mapYoutubeResult = (video: YoutubeResult): YoutubeVideo => {
  return {
    url: "https://www.youtube.com/watch?v=" + video.id.videoId,
    name: video.snippet.title,
    img: video.snippet.thumbnails.default.url,
  };
};
