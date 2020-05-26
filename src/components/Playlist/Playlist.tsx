import React from 'react';

import { PlaylistContext } from '../PlaylistWrapper/PlaylistWrapper';
import classes from './Playlist.module.css';
import PlaylistItem from './PlaylistItem';

const Playlist: React.FC = () => {
  const playlistData = React.useContext(PlaylistContext);

  return (
    <div>
      <PlaylistContent items={playlistData.playlist} />
    </div>
  );
};

const PlaylistContent: React.FC<{
  items: PlaylistVideo[];
  currentVideo?: PlaylistVideo;
}> = (props) => {
  const { items } = props;

  return (
    <div>
      <div>
        {items.map((item) => (
          <div className={classes.ItemWrapper}>
            <PlaylistItem key={item.url} video={item} controls />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Playlist;
