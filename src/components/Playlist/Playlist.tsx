import React from 'react';

import { PlaylistContext } from '../PlaylistWrapper/PlaylistWrapper';

const Playlist: React.FC = () => {
  const playlistData = React.useContext(PlaylistContext);

  return (
    <div>
      <div>
        <PlaylistContent items={playlistData.playlist} />
      </div>
    </div>
  );
};

const PlaylistContent: React.FC<{
  items: PlaylistVideo[];
}> = (props) => {
  const { items } = props;

  return <div>{JSON.stringify(items)}</div>;
};

export default Playlist;
