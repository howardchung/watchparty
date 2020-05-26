import React from 'react';

import { PlaylistContext } from '../PlaylistWrapper/PlaylistWrapper';
import PlaylistItem from './PlaylistItem';

const Playlist: React.FC = () => {
  const playlistData = React.useContext(PlaylistContext);

  return (
    <div>
      <h3>Playlist</h3>
      <PlaylistContent items={playlistData.playlist} />
    </div>
  );
};

const PlaylistContent: React.FC<{
  items: PlaylistVideo[];
}> = (props) => {
  const { items } = props;

  return (
    <div>
      {items.map((item) => (
        <PlaylistItem video={item} />
      ))}
    </div>
  );
};

export default Playlist;
