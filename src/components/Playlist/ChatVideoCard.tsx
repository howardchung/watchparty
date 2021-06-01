import React from 'react';
import { Button, ButtonGroup, Icon } from 'semantic-ui-react';
import { formatTimestamp } from '../../utils';

import classes from './ChatVideoCard.module.css';

const ChatVideoCard: React.FC<{
  video: PlaylistVideo;
  index: number;
  controls?: boolean;
  onPlay?: (index: number) => void;
  onRemove?: (index: number) => void;
  onPlayNext?: (index: number) => void;
  disabled?: boolean;
}> = (props) => {
  const {
    video,
    index,
    controls,
    onPlay,
    onPlayNext,
    onRemove,
    disabled,
  } = props;

  const handlePlayClick = React.useCallback(() => {
    if (onPlay) {
      onPlay(index);
    }
  }, [onPlay, index]);

  const handlePlayNextClick = React.useCallback(() => {
    if (onPlayNext) {
      onPlayNext(index);
    }
  }, [onPlayNext, index]);

  const handleRemoveClick = React.useCallback(() => {
    if (onRemove) {
      onRemove(index);
    }
  }, [onRemove, index]);

  const Element = 'div';

  return (
    <Element title={video.name} className={classes.Card}>
      <div className={classes.Wrapper}>
        <div className={classes.ThumbnailWrapper}>
          {!!video.duration && (
            <div className={classes.DurationLabel}>
              {formatTimestamp(video.duration)}
            </div>
          )}
          {!!video.img && (
            <img
              className={classes.Thumbnail}
              src={video.img}
              alt={video.name}
            />
          )}
        </div>
        <div className={classes.Content}>
          <div className={classes.Title}>{video.name}</div>
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
                disabled={disabled}
              >
                <Icon name="play" />
              </Button>
              <Button
                icon
                color="black"
                title="Play next"
                onClick={handlePlayNextClick}
                disabled={disabled}
              >
                <Icon name="arrow up" />
              </Button>
              <Button
                icon
                color="red"
                title="Remove"
                onClick={handleRemoveClick}
                disabled={disabled}
              >
                <Icon name="trash" />
              </Button>
            </ButtonGroup>
          </div>
        )}
      </div>
    </Element>
  );
};

export default ChatVideoCard;
