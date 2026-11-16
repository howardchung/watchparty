import React from "react";
import { ActionIcon } from "../UI/UI";
import { decodeEntities, formatTimestamp } from "../../utils/utils";

import classes from "./ChatVideoCard.module.css";
import {
  IconArrowUp,
  IconBrandYoutubeFilled,
  IconFile,
  IconMagnetFilled,
  IconPlayerPlayFilled,
  IconPlaylistAdd,
  IconTrash,
} from "../Icons/Icons";

const ChatVideoCard: React.FC<{
  video: PlaylistVideo;
  index: number;
  controls?: boolean;
  onPlay?: (index: number) => void;
  onRemove?: (index: number) => void;
  onPlayNext?: (index: number) => void;
  onSetMedia?: (value: string) => void;
  onPlaylistAdd?: (value: string) => void;
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

  const handlePlayClick = React.useCallback(() => {
    if (onPlay) {
      onPlay(index);
    }
  }, [onPlay, index]);

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

  return (
    <div
      title={video.name}
      className={classes.Card}
      onClick={
        onSetMedia
          ? () => {
              onSetMedia(video.url);
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
        <div style={{ flexShrink: 0 }}>
          {video.type === "youtube" && (
            <IconBrandYoutubeFilled color="var(--accent-danger)" size={20} />
          )}
          {video.type === "file" && <IconFile size={18} />}
          {video.type === "magnet" && <IconMagnetFilled size={18} />}
        </div>
        <div className={classes.Content}>
          <div className={classes.Title}>{decodeEntities(video.name)}</div>
          <div className={classes.ChannelName}>{video.channel}</div>
        </div>
        {onPlaylistAdd && (
          <div className={classes.Controls}>
            <ActionIcon
              title="Add to Playlist"
              onClick={(e) => {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
                onPlaylistAdd(video.url);
              }}
            >
              <IconPlaylistAdd size={18} />
            </ActionIcon>
          </div>
        )}
        {controls && (
          <div className={classes.Controls}>
            <ActionIcon
              color="green"
              title="Play now"
              onClick={handlePlayClick}
              disabled={disabled}
            >
              <IconPlayerPlayFilled size={15} />
            </ActionIcon>
            <ActionIcon
              color="black"
              title="Play next"
              onClick={handlePlayNextClick}
              disabled={disabled}
            >
              <IconArrowUp size={15} />
            </ActionIcon>
            <ActionIcon
              color="red"
              title="Remove"
              onClick={handleRemoveClick}
              disabled={disabled}
            >
              <IconTrash size={15} />
            </ActionIcon>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatVideoCard;
