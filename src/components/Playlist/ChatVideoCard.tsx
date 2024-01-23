import React from 'react';
import { Button, ButtonGroup, DropdownProps, Icon } from 'semantic-ui-react';
import { decodeEntities, formatTimestamp } from '../../utils';

import classes from './ChatVideoCard.module.css';

const ChatVideoCard: React.FC<{
  video: PlaylistVideo;
  index: number;
  controls?: boolean;
  onPlay?: (index: number) => void;
  onRemove?: (index: number) => void;
  onPlayNext?: (index: number) => void;
  onSetMedia?: (e: any, data: DropdownProps) => void;
  onPlaylistAdd?: (e: any, data: DropdownProps) => void;
  disabled?: boolean;
}> = (props) => {
  const {
    video,
    index,
    controls,
    onPlay,
    onPlayNext,
    onRemove,
    onSetMedia,
    disabled,
    onPlaylistAdd,
  } = props;

  const handlePlayClick = React.useCallback(
    (e: any) => {
      if (onPlay) {
        onPlay(index);
      }
    },
    [onPlay, index],
  );

  const handlePlayNextClick = React.useCallback(
    (e: any) => {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      if (onPlayNext) {
        onPlayNext(index);
      }
    },
    [onPlayNext, index],
  );

  const handleRemoveClick = React.useCallback(
    (e: any) => {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      if (onRemove) {
        onRemove(index);
      }
    },
    [onRemove, index],
  );

  const Element = 'div';

  return (
    <Element
      title={video.name}
      className={classes.Card}
      onClick={
        onSetMedia
          ? (e) => {
              onSetMedia(e, { value: video.url });
            }
          : undefined
      }
    >
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
        {video.type === 'youtube' && (
          <Icon color="red" size="large" name="youtube" />
        )}
        {video.type === 'file' && (
          <Icon color="black" size="large" name="linkify" />
        )}
        {video.type === 'magnet' && (
          <Icon color="red" size="large" name="magnet" />
        )}
        <div className={classes.Content}>
          <div className={classes.Title}>{decodeEntities(video.name)}</div>
          <div className={classes.ChannelName}>{video.channel}</div>
        </div>
        {onPlaylistAdd && (
          <div className={classes.Controls}>
            <div style={{ marginLeft: 'auto' }}>
              <Button
                className="playlistAddButton"
                onClick={(e) => {
                  e.stopPropagation();
                  e.nativeEvent.stopImmediatePropagation();
                  onPlaylistAdd(e, { value: video.url });
                }}
              >
                Add To Playlist
              </Button>
            </div>
          </div>
        )}
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
