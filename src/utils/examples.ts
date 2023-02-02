export const examples: SearchResult[] = [
  'https://upload.wikimedia.org/wikipedia/commons/7/7a/Charge_-_Blender_Open_Movie-full_movie.webm',
  {
    url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    type: 'youtube',
    name: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    img: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/default.jpg',
    duration: 0,
  },
  'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent',
  'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
  'https://upload.wikimedia.org/wikipedia/commons/7/76/Sprite_Fright_-_Blender_Open_Movie-full_movie.webm',
  'https://upload.wikimedia.org/wikipedia/commons/a/a5/Spring_-_Blender_Open_Movie.webm',
  'https://upload.wikimedia.org/wikipedia/commons/8/88/Big_Buck_Bunny_alt.webm',
  'https://upload.wikimedia.org/wikipedia/commons/c/cb/Tears_of_Steel_1080p.webm',
].map((url) => {
  if (typeof url === 'object') {
    return url;
  }
  return {
    url,
    type: url.startsWith('http') ? 'file' : 'magnet',
    name: url,
    duration: 0,
  };
});
