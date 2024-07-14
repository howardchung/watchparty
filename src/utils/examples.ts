import { isMagnet, isYouTube } from '.';

export const examples: SearchResult[] = [
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Charge_-_Blender_Open_Movie-full_movie.webm',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Charge_-_Blender_Open_Movie-YouTube_thumbnail.jpg/320px-Charge_-_Blender_Open_Movie-YouTube_thumbnail.jpg',
  },
  {
    url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    img: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/default.jpg',
  },
  {
    url: 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Sintel-screenshot-1.jpg/320px-Sintel-screenshot-1.jpg',
  },
  {
    url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Tears_of_Steel_frame_09_1a.jpg/320px-Tears_of_Steel_frame_09_1a.jpg',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Spring_-_Blender_Open_Movie.webm',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/SpringOpenMovie-desend.jpg/320px-SpringOpenMovie-desend.jpg',
  },
  {
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Big_Buck_Bunny_alt.webm',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Big_Buck_Bunny_-_forest.jpg/320px-Big_Buck_Bunny_-_forest.jpg',
  },
].map((urlOrObject: { url: string; img: string } | string) => {
  const url = typeof urlOrObject === 'object' ? urlOrObject.url : urlOrObject;
  let type: SearchResult['type'] = 'file';
  if (isYouTube(url)) {
    type = 'youtube';
  } else if (isMagnet(url)) {
    type = 'magnet';
  }
  const img = typeof urlOrObject === 'object' ? urlOrObject.img : '';
  return {
    url,
    type,
    img,
    name: url,
    duration: 0,
  };
});
