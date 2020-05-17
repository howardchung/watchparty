import Youtube from 'youtube-api'
import { mapYoutubeResult, YoutubeVideo } from './mapYoutubeResult';

export const searchYoutube = (query: string): Promise<YoutubeVideo[]> => {
  return new Promise((resolve, reject) => {
    Youtube.search.list(
      { part: 'snippet', type: 'video', maxResults: 25, q: query },
      (err: any, data: any) => {
        console.log(err)
        if (data && data.items) {
          const response = data.items.map(mapYoutubeResult);
          resolve(response)
        } else {
          console.error(data);
          reject()
        }
      }
    );
  })
}