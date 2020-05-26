import React, { useEffect } from 'react';
import { Socket } from 'socket.io';

export const PlaylistContext = React.createContext<{
  playlist: PlaylistVideo[];
  setPlaylist: (newPlaylist: PlaylistVideo[]) => void;
  showPlaylist: boolean;
  setPlaylistVisibility: (state: boolean) => void;
}>({
  playlist: [],
  setPlaylist: () => undefined,
  showPlaylist: false,
  setPlaylistVisibility: () => undefined,
});

// Placeholder component to hold the Playlist data later

const PlaylistWrapper: React.FC<{
  socket: Socket;
}> = (props) => {
  const { children, socket } = props;
  const [playlist, setPlaylist] = React.useState<PlaylistVideo[]>([]);
  const [showPlaylist, setShowPlaylist] = React.useState(false);

  const handlePlaylistUpdate = React.useCallback(
    (data: PlaylistVideo[]) => {
      setPlaylist(data);
    },
    [setPlaylist]
  );

  useEffect(() => {
    socket.on('playlistUpdate', handlePlaylistUpdate);

    return () => {
      socket.off('playlistUpdate', handlePlaylistUpdate);
    };
  }, [socket, handlePlaylistUpdate]);

  return (
    <PlaylistContext.Provider
      value={{
        playlist,
        setPlaylist,
        showPlaylist,
        setPlaylistVisibility: setShowPlaylist,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};

export default PlaylistWrapper;
