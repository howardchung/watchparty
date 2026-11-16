import React, { useMemo, useState } from "react";
import { Badge, Button, Menu, Progress, Slider } from "../UI/UI";
import { formatTimestamp } from "../../utils/utils";
import styles from "./Controls.module.css";
import type { AudioTrackInfo } from "../../utils/clientTranscode";
import {
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconCheck,
  IconRepeat,
  IconBadgeCc,
  IconHeadphones,
  IconVolumeOff,
  IconVolume,
  IconTheater,
  IconMaximize,
  IconPlayerSkipForwardFilled,
} from "../Icons/Icons";

interface ControlsProps {
  duration: number;
  video: string;
  paused: boolean;
  muted: boolean;
  volume: number;
  subtitled: boolean;
  currentTime: number;
  disabled?: boolean;
  leaderTime?: number;
  isPauseDisabled?: boolean;
  playbackRate: number;
  roomPlaybackRate: number;
  isYouTube: boolean;
  isLiveStream: boolean;
  timeRanges: { start: number; end: number }[];
  loop: boolean;
  roomTogglePlay: () => void;
  roomSeek: (time: number) => void;
  roomSetPlaybackRate: (rate: number) => void;
  roomSetLoop: (loop: boolean) => void;
  localFullScreen: (fs: boolean) => void;
  localToggleMute: () => void;
  localSubtitleModal: () => void;
  localSeek: () => void;
  localSetVolume: (volume: number) => void;
  localSetSubtitleMode: (mode: TextTrackMode, lang?: string) => void;
  roomPlaylistPlay: (index: number) => void;
  playlist: PlaylistVideo[];
  audioTracks?: AudioTrackInfo[];
  audioTrackId?: number;
  localSetAudioTrack?: (id: number) => void;
}

export const Controls = (props: ControlsProps) => {
  const [hoverState, setHoverState] = useState({
    hoverTimestamp: 0,
    hoverPos: 0,
  });
  const [showTimestamp, setShowTimestamp] = useState(false);
  const getEnd = () => props.duration;
  const getStart = () => 0;
  const getLength = () => getEnd() - getStart();
  const getCurrent = () => props.currentTime;
  const getPercent = () => (getCurrent() - getStart()) / getLength();

  const hasFiniteDuration = Number.isFinite(props.duration);
  const zeroTime = useMemo(
    () =>
      hasFiniteDuration
        ? Math.floor(Date.now() / 1000) - props.duration
        : undefined,
    [props.video, hasFiniteDuration],
  );
  const onMouseOver = () => {
    setShowTimestamp(true);
  };
  const onMouseOut = () => {
    setShowTimestamp(false);
  };
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const max = rect.width;
    const pct = x / max;
    const target = getStart() + pct * getLength();
    if (pct >= 0 && pct <= 1) {
      setHoverState({ hoverTimestamp: target, hoverPos: pct });
    }
  };
  const {
    roomTogglePlay,
    roomSeek,
    localFullScreen,
    localToggleMute,
    localSubtitleModal,
    localSeek,
    currentTime,
    leaderTime,
    isPauseDisabled,
    disabled,
    subtitled,
    paused,
    muted,
    volume,
    isLiveStream,
    playlist,
    roomPlaylistPlay,
    timeRanges,
    roomSetPlaybackRate,
    roomPlaybackRate,
  } = props;

  const behindThreshold = 10;
  const behindTime =
    !isLiveStream && leaderTime && leaderTime < Infinity
      ? leaderTime - currentTime
      : getEnd() - getCurrent();
  const isBehind = behindTime > behindThreshold;

  const buffers = timeRanges.map(({ start, end }) => {
    const buffStartPct = (start / getLength()) * 100;
    const buffLengthPct = ((end - start) / getLength()) * 100;
    return (
      <div
        key={start}
        className={styles.bufferSegment}
        style={{
          left: buffStartPct + "%",
          width: buffLengthPct + "%",
        }}
      />
    );
  });

  const playPauseProps = {
    size: 26,
    onClick: () => {
      roomTogglePlay();
    },
    className: styles.action,
    disabled: disabled || isPauseDisabled,
  };

  return (
    <div className={styles.controls}>
      {paused ? (
        <IconPlayerPlayFilled {...playPauseProps} />
      ) : (
        <IconPlayerPauseFilled {...playPauseProps} />
      )}
      {playlist.length > 0 && (
        <IconPlayerSkipForwardFilled
          size={24}
          title="Skip to next"
          className={styles.action}
          onClick={() => roomPlaylistPlay(0)}
        />
      )}
      <Button
        size="compact-xs"
        color={isBehind ? "blue" : "grey"}
        title="Sync"
        onClick={() => {
          if (isLiveStream) {
            roomSeek(props.duration);
          } else {
            localSeek();
          }
        }}
      >
        Sync
      </Button>
      <div className={styles.text}>
        {formatTimestamp(getCurrent(), isLiveStream ? zeroTime : undefined)}
      </div>
      <Progress.Root
        className={styles.progressWrapper}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          if (!disabled) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const max = rect.width;
            const pct = x / max;
            const target = getLength() * pct;
            roomSeek(target);
          }
        }}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onMouseMove={onMouseMove}
      >
        <Progress.Section
          style={{ pointerEvents: "none", zIndex: 1 }}
          value={getPercent() * 100}
        />
        {buffers}
        {getLength() < Infinity && showTimestamp && (
          <Badge
            className={styles.hoverTimestamp}
            style={{
              left: `${hoverState.hoverPos * 100}%`,
            }}
          >
            {formatTimestamp(
              hoverState.hoverTimestamp,
              isLiveStream ? zeroTime : undefined,
            )}
          </Badge>
        )}
      </Progress.Root>
      <div className={styles.text}>{formatTimestamp(getEnd())}</div>
      {isLiveStream && (
        <Badge size="xs" color="red">
          LIVE
        </Badge>
      )}
      <Menu disabled={disabled}>
        <Menu.Target>
          <div className={`${styles.rateChip} ${styles.action}`}>
            {props.playbackRate?.toFixed(2)}x
          </div>
        </Menu.Target>
        <Menu.Dropdown>
          {[
            { key: "Auto", text: "Auto", value: 0 },
            { key: "0.25", text: "0.25x", value: 0.25 },
            { key: "0.5", text: "0.5x", value: 0.5 },
            { key: "1", text: "1x", value: 1 },
            { key: "1.5", text: "1.5x", value: 1.5 },
            { key: "2", text: "2x", value: 2 },
            { key: "3", text: "3x", value: 3 },
          ].map((item) => (
            <Menu.Item
              key={item.key}
              onClick={() => roomSetPlaybackRate(item.value)}
              rightSection={
                roomPlaybackRate === item.value ? <IconCheck size={15} /> : null
              }
            >
              {item.text}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
      <IconRepeat
        size={26}
        onClick={() => {
          if (!disabled) {
            props.roomSetLoop(Boolean(!props.loop));
          }
        }}
        className={`${styles.action} ${props.loop ? styles.actionActive : ""}`}
        title="Loop"
      />
      {props.isYouTube ? (
        <Menu>
          <Menu.Target>
            <IconBadgeCc size={26} className={styles.action} />
          </Menu.Target>
          <Menu.Dropdown>
            {[
              { key: "hidden", text: "Off", value: "hidden" },
              { key: "en", text: "English", value: "showing" },
              { key: "es", text: "Spanish", value: "showing" },
            ].map((item) => (
              <Menu.Item
                key={item.key}
                onClick={() =>
                  props.localSetSubtitleMode(
                    item.value as TextTrackMode,
                    item.key,
                  )
                }
              >
                {item.text}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      ) : (
        <IconBadgeCc
          size={26}
          onClick={() => {
            localSubtitleModal();
          }}
          className={`${styles.action} ${subtitled ? styles.actionActive : ""}`}
          title="Captions"
        />
      )}
      {props.audioTracks && props.audioTracks.length > 1 && (
        <Menu>
          <Menu.Target>
            <IconHeadphones
              size={26}
              className={styles.action}
              title="Audio track"
            />
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Audio track</Menu.Label>
            {props.audioTracks.map((track) => (
              <Menu.Item
                key={track.id}
                onClick={() => props.localSetAudioTrack?.(track.id)}
                rightSection={
                  props.audioTrackId === track.id ? (
                    <IconCheck size={15} />
                  ) : null
                }
              >
                {track.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      )}
      <IconTheater
        size={26}
        onClick={() => localFullScreen(false)}
        className={styles.action}
        title="Theater Mode"
      />
      <IconMaximize
        size={26}
        onClick={() => localFullScreen(true)}
        className={styles.action}
        title="Fullscreen"
      />
      {muted ? (
        <IconVolumeOff
          size={26}
          onClick={localToggleMute}
          className={styles.action}
        />
      ) : (
        <IconVolume
          size={26}
          onClick={localToggleMute}
          className={styles.action}
        />
      )}
      <div className={styles.volumeSliderWrap}>
        <Slider
          defaultValue={volume}
          disabled={muted}
          min={0}
          max={1}
          step={0.01}
          onChangeEnd={(value: number) => {
            props.localSetVolume(value);
          }}
        />
      </div>
    </div>
  );
};
