import React from 'react';
import { Button, Icon } from 'semantic-ui-react';

import { PlaylistContext } from '../PlaylistWrapper/PlaylistWrapper';
import classes from './Footer.module.css';

const TogglePlaylistButton: React.FC = () => {
  const playlistContext = React.useContext(PlaylistContext);

  const onButtonClick = React.useCallback(() => {
    playlistContext.setPlaylistVisibility(!playlistContext.showPlaylist);
  }, [playlistContext.showPlaylist, playlistContext.setPlaylistVisibility]);

  const label = `${playlistContext.playlist.length}`;

  return (
    <Button onClick={onButtonClick} color="black">
      <Icon name="th list" />
      {label}
    </Button>
  );
};

const Footer: React.FC = (props) => {
  const { children } = props;
  return (
    <div className={classes.Wrapper}>
      <div className={classes.Content}>{children}</div>
      <div className={classes.Buttons}>
        <TogglePlaylistButton />
      </div>
    </div>
  );
};

export default Footer;
