import React from 'react';
import { Button, ButtonGroup, Icon } from 'semantic-ui-react';

import classes from './PlaylistItem.module.css';

const PlaylistItem: React.FC<{
  video: PlaylistVideo;
  controls?: boolean;
}> = (props) => {
  const { video, controls } = props;

  return (
    <div className={classes.Wrapper}>
      <div className={classes.ThumbnailWrapper}>
        <div className={classes.DurationLabel}>{video.duration}</div>
        <img className={classes.Thumbnail} src={video.img} alt={video.name} />
      </div>
      <div className={classes.Content}>
        <a
          className={classes.Title}
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {video.name}
        </a>
        <div className={classes.ChannelName}>{video.channel}</div>
      </div>
      {controls && (
        <div className={classes.Controls}>
          <ButtonGroup size="mini">
            <Button icon color="green" title="Play now">
              <Icon name="play" />
            </Button>
            <Button icon color="red" title="Remove">
              <Icon name="trash" />
            </Button>
            <Button icon color="black" title="Play next">
              <Icon name="arrow up" />
            </Button>
          </ButtonGroup>
        </div>
      )}
    </div>
  );
};

export default PlaylistItem;
