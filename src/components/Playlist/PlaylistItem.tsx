import React from 'react';
import { Button, ButtonGroup, Icon } from 'semantic-ui-react';

import classes from './PlaylistItem.module.css';

const PlaylistItem: React.FC<{
  video: PlaylistVideo;
  controls?: boolean;
  onPlay: (url: string) => void;
  onRemove: (url: string) => void;
  onPlayNext: (url: string) => void;
}> = (props) => {
  const { video, controls, onPlay, onPlayNext, onRemove } = props;

  const handlePlayClick = React.useCallback(() => {
    onPlay(video.url);
  }, [onPlay, video.url]);

  const handlePlayNextClick = React.useCallback(() => {
    onPlayNext(video.url);
  }, [onPlayNext, video.url]);

  const handleRemoveClick = React.useCallback(() => {
    onRemove(video.url);
  }, [onRemove, video.url]);

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
            <Button
              icon
              color="green"
              title="Play now"
              onClick={handlePlayClick}
            >
              <Icon name="play" />
            </Button>
            <Button icon color="red" title="Remove" onClick={handleRemoveClick}>
              <Icon name="trash" />
            </Button>
            <Button
              icon
              color="black"
              title="Play next"
              onClick={handlePlayNextClick}
            >
              <Icon name="arrow up" />
            </Button>
          </ButtonGroup>
        </div>
      )}
    </div>
  );
};

export default PlaylistItem;
