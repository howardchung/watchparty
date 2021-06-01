export const examples = [
  'https://upload.wikimedia.org/wikipedia/commons/a/a5/Spring_-_Blender_Open_Movie.webm',
  'https://upload.wikimedia.org/wikipedia/commons/8/88/Big_Buck_Bunny_alt.webm',
  'https://upload.wikimedia.org/wikipedia/commons/7/75/Sintel_movie_720x306.ogv',
  'https://upload.wikimedia.org/wikipedia/commons/c/cb/Tears_of_Steel_1080p.webm',
  'https://upload.wikimedia.org/wikipedia/commons/3/36/Cosmos_Laundromat_-_First_Cycle_-_Official_Blender_Foundation_release.webm',
  'https://upload.wikimedia.org/wikipedia/commons/a/a2/Elephants_Dream_%282006%29.webm',
  'https://upload.wikimedia.org/wikipedia/commons/a/a9/HERO_-_Blender_Open_Movie-full_movie.webm',
  'https://upload.wikimedia.org/wikipedia/commons/0/02/Glass_Half_-_Blender_Open_Movie-full_movie.webm',
  'https://upload.wikimedia.org/wikipedia/commons/d/d0/Caminandes-_Llama_Drama_-_Short_Movie.ogv',
].map((url) => ({
  url,
  type: 'file',
  name: url,
  duration: 0,
}));
