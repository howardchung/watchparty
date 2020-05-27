import React from 'react';

import ChatVideoCard from '../ChatPlaylistCard';
import { LobbyContext } from '../LobbyWrapper/LobbyWrapper';
import { PlaylistContext } from '../PlaylistWrapper/PlaylistWrapper';
import classes from './Playlist.module.css';

const Playlist: React.FC = () => {
  const playlistData = React.useContext(PlaylistContext);
  const lobbyData = React.useContext(LobbyContext);

  const handlePlay = React.useCallback(
    (url: string) => {
      if (lobbyData.io) {
        lobbyData.io.emit('CMD:playPlaylistVideo', url);
      }
    },
    [lobbyData.io]
  );

  const handleRemove = React.useCallback(
    (url: string) => {
      if (lobbyData.io) {
        lobbyData.io.emit('CMD:removePlaylistVideo', url);
      }
    },
    [lobbyData.io]
  );

  const handlePlayNext = React.useCallback(
    (url: string) => {
      if (lobbyData.io) {
        lobbyData.io.emit('CMD:playNextPlaylistVideo', url);
      }
    },
    [lobbyData.io]
  );

  return (
    <div>
      <PlaylistContent
        items={playlistData.playlist}
        onPlay={handlePlay}
        onRemove={handleRemove}
        onPlayNext={handlePlayNext}
      />
    </div>
  );
};

const PlaylistContent: React.FC<{
  items: PlaylistVideo[];
  onPlay: (url: string) => void;
  onRemove: (url: string) => void;
  onPlayNext: (url: string) => void;
}> = (props) => {
  const { items, onPlay, onRemove, onPlayNext } = props;

  return (
    <div>
      <div>
        {items.map((item) => (
          <div className={classes.ItemWrapper}>
            <ChatVideoCard
              onPlay={onPlay}
              onRemove={onRemove}
              onPlayNext={onPlayNext}
              key={item.url}
              video={item}
              controls
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Playlist;
