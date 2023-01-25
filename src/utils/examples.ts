export const examples = [
  'https://upload.wikimedia.org/wikipedia/commons/7/7a/Charge_-_Blender_Open_Movie-full_movie.webm',
  'https://upload.wikimedia.org/wikipedia/commons/7/76/Sprite_Fright_-_Blender_Open_Movie-full_movie.webm',
  'https://upload.wikimedia.org/wikipedia/commons/a/a5/Spring_-_Blender_Open_Movie.webm',
  'https://upload.wikimedia.org/wikipedia/commons/8/88/Big_Buck_Bunny_alt.webm',
  'https://upload.wikimedia.org/wikipedia/commons/c/cb/Tears_of_Steel_1080p.webm',
].map((url) => ({
  url,
  type: 'file',
  name: url,
  duration: 0,
}));
