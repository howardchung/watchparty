import React, { createRef } from 'react';
import { Button, ButtonGroup, DropdownProps, Icon } from 'semantic-ui-react';
import { decodeEntities, formatTimestamp } from '../../utils';

import classes from './ChatVideoCard.module.css';
import ReactPlayer from 'react-player';

const ChatVideoCard: React.FC<{
  video: PlaylistVideo;
  index: number;
  controls?: boolean;
  onPlay?: (index: number) => void;
  onRemove?: (index: number) => void;
  onPlayNext?: (index: number) => void;
  onSetMedia?: (e: any, data: DropdownProps) => void;
  onPlaylistAdd?: (e: any, data: DropdownProps) => void;
  isYoutube?: boolean;
  disabled?: boolean;
  fromHome?: boolean;
  toggleHome?: Function;
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
    isYoutube,
    fromHome,
    toggleHome,
  } = props;
  const thumbPlayer = React.createRef<ReactPlayer>();
  const handlePlayClick = React.useCallback(
    (e) => {
      if (onPlay) {
        onPlay(index);
      }
      fromHome && toggleHome && toggleHome();
    },
    [onPlay, index]
  );

  const handlePlayNextClick = React.useCallback(
    (e) => {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      if (onPlayNext) {
        onPlayNext(index);
      }
    },
    [onPlayNext, index]
  );

  const handleRemoveClick = React.useCallback(
    (e) => {
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
      if (onRemove) {
        onRemove(index);
      }
    },
    [onRemove, index]
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
        {isYoutube && (
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
        )}
        {!isYoutube && (
          <div className={classes.ThumbnailWrapper}>
            <div className={classes.DurationLabel}>
              {formatTimestamp(thumbPlayer.current?.getDuration())}
            </div>
            <ReactPlayer
              height="100%"
              width="100%"
              ref={thumbPlayer}
              light
              url={video.url}
              playing={false}
              muted
            />
          </div>
        )}
        {/* <Icon
          color={isYoutube ? 'red' : 'black'}
          size="large"
          name={isYoutube ? 'youtube' : 'linkify'}
        /> */}
        <div className={classes.Content}>
          <div className={classes.Title}>
            {/* {video.name} */}
            {video.name.split('').length > 100
              ? decodeEntities(video.name.slice(0, 100) + '...')
              : decodeEntities(video.name)}
          </div>
          {/* <div className={classes.ChannelName}>{video.channel}</div> */}
          {onPlaylistAdd && (
            <div>
              <div>
                <button
                  className={classes.PlaylistAddButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                    onPlaylistAdd(e, { value: video.url });
                  }}
                >
                  Add To Playlist
                </button>
              </div>
            </div>
          )}
        </div>

        {controls && (
          <div className={classes.Controls}>
            <ButtonGroup size="medium">
              <Button
                icon
                style={{ color: 'white' }}
                // color="olive"

                title="Play now"
                onClick={handlePlayClick}
                disabled={disabled}
              >
                <Icon name="play" color="black" />
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
