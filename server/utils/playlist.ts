export const findPlaylistVideoByUrl = (
  playlist: PlaylistVideo[],
  url?: string,
) => {
  if (!url) return;
  return playlist.find((video) => video.url === url);
};
