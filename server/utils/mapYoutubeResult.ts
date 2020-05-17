export interface YoutubeResult {
  id: {
    videoId: string
  }
  snippet: {
    title: string
    thumbnails: {
      default: {
        url: string
      }
    }
  }
}

export interface YoutubeVideo {
  url: string
  name: string
  img: string
}

export const mapYoutubeResult = (video: YoutubeResult): YoutubeVideo => {
  return {
    url: 'https://www.youtube.com/watch?v=' + video.id.videoId,
    name: video.snippet.title,
    img: video.snippet.thumbnails.default.url,
  };
};