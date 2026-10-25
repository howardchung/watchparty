import React, { useMemo, useState } from "react";
import { Badge, Button, Menu, Progress, Slider } from "@mantine/core";
import { formatTimestamp, softWhite } from "../../utils/utils";
import styles from "./Controls.module.css";
import { MetadataContext } from "../../MetadataContext";
import type { AudioTrackInfo } from "../../utils/clientTranscode";
import {
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconRefresh,
  IconCheck,
  IconRepeat,
  IconBadgeCc,
  IconHeadphones,
  IconVolumeOff,
  IconVolume,
  IconTheater,
  IconMaximize,
  IconPlayerSkipForwardFilled,
} from "@tabler/icons-react";

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
  /** Live streams: start of the seekable window. It runs from here to `duration`, which is the live edge */
  liveStart?: number;
  /** Live streams: the wall clock time (in seconds) that media time 0 corresponds to, if the player knows it exactly */
  liveZeroTime?: number;
  /** Live streams: how far behind the live edge (in seconds) still counts as being live */
  liveThreshold?: number;
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
  /** Audio tracks of the file being converted on this device (only set when there's a choice to make) */
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
  // A live stream only lets you seek within a window that ends at the live edge (and may start long after 0)
  const getStart = () =>
    props.isLiveStream && Number.isFinite(props.liveStart)
      ? Math.min(props.liveStart as number, getEnd())
      : 0;
  const getLength = () => getEnd() - getStart();
  const getCurrent = () => props.currentTime;
  const getPercent = () =>
    Math.min(Math.max((getCurrent() - getStart()) / getLength(), 0), 1);
  // Best guess at the wall clock time that media time 0 corresponds to, for live streams where the duration is the
  // live edge: assume the edge is "now". Used when the player can't tell us exactly (see liveZeroTime).
  // Only computed once the duration is known: an infinite one (e.g. a DASH stream before it has a seekable range)
  // would give a time that is never valid, and the memo wouldn't recompute when the duration later became finite.
  const hasFiniteDuration = Number.isFinite(props.duration);
  const approxZeroTime = useMemo(
    () =>
      hasFiniteDuration
        ? Math.floor(Date.now() / 1000) - props.duration
        : undefined,
    [props.video, hasFiniteDuration],
  );
  const zeroTime = Number.isFinite(props.liveZeroTime)
    ? props.liveZeroTime
    : approxZeroTime;
  // How far the playhead is behind the live edge, and whether that's close enough to call it live.
  // Players deliberately stay a few seconds back from the edge, so being exactly at it isn't possible.
  const liveBehind = Math.max(props.duration - props.currentTime, 0);
  const atLive = liveBehind <= (props.liveThreshold ?? 8);
  // e.g. "-00:35", and the wall clock time at that position when we know it
  const liveLabel = (time: number) => {
    const behind = Math.max(getEnd() - time, 0);
    const offset = behind < 1 ? "LIVE" : formatTimestamp(-behind);
    return zeroTime !== undefined
      ? `${offset} · ${formatTimestamp(time, zeroTime)}`
      : offset;
  };
  const onMouseOver = () => {
    setShowTimestamp(true);
  };
  const onMouseOut = () => {
    setShowTimestamp(false);
  };
  const onMouseMove = (e: any) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const max = rect.width;
    const pct = x / max;
    // console.log(x, max);
    const target = getStart() + pct * getLength();
    // console.log(pct);
    if (pct >= 0) {
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
  // console.log(leaderTime, currentTime);
  const behindThreshold = 10;
  const behindTime =
    !isLiveStream && leaderTime && leaderTime < Infinity
      ? leaderTime - currentTime
      : getEnd() - getCurrent();
  const isBehind = behindTime > behindThreshold;
  const buffers = timeRanges.map(({ start, end }) => {
    // Clamp to the window, a live stream's buffer can start before the part that can still be seeked to
    const clampedStart = Math.max(start, getStart());
    const buffStartPct = ((clampedStart - getStart()) / getLength()) * 100;
    const buffLengthPct = (Math.max(end - clampedStart, 0) / getLength()) * 100;
    return (
      <div
        key={start}
        style={{
          position: "absolute",
          height: "8px",
          backgroundColor: "grey",
          left: buffStartPct + "%",
          width: buffLengthPct + "%",
          bottom: "0em",
          zIndex: 0,
          pointerEvents: "none",
        }}
      ></div>
    );
  });
  const playPauseProps = {
    onClick: () => {
      roomTogglePlay();
    },
    className: ` ${styles.action}`,
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
          title="Skip to next"
          className={styles.action}
          onClick={() => roomPlaylistPlay(0)}
        />
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <Button
          size="compact-xs"
          color={isBehind ? "blue" : "grey"}
          title="Sync"
          onClick={() => {
            if (isLiveStream) {
              // in live case we want to seek the entire room to edge
              roomSeek(props.duration);
            } else {
              localSeek();
            }
          }}
        >
          Sync
        </Button>
        {/* <div style={{ position: 'absolute', fontSize: '6px', zIndex: -1 }}>
            {Math.max(Math.floor(behindTime), 0)}
          </div> */}
      </div>
      <div className={` ${styles.text}`}>
        {isLiveStream
          ? // How far behind live, nothing at all when live (the LIVE badge says so)
            atLive
            ? ""
            : formatTimestamp(-liveBehind)
          : formatTimestamp(getCurrent())}
      </div>
      <Progress.Root
        radius="0px"
        onClick={(e: any) => {
          if (!disabled) {
            // Read the time from the click event
            if (e) {
              const rect = e.target.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const max = rect.width;
              const pct = x / max;
              // roomseek operates on actual media element times, not timestamps
              // the bar spans the seekable window: 0 to the end for a video, the live window for a live stream
              let target = getStart() + getLength() * pct;
              roomSeek(target);
            }
          }
        }}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onMouseMove={onMouseMove}
        style={{
          flexGrow: 1,
          marginTop: 0,
          marginBottom: 0,
          position: "relative",
          minWidth: "50px",
          overflow: "visible",
          cursor: "pointer",
        }}
      >
        <Progress.Section
          style={{ pointerEvents: "none", zIndex: 1 }}
          value={getPercent() * 100}
        ></Progress.Section>
        {buffers}
        {/* {
            <div
              style={{
                position: 'absolute',
                bottom: '0px',
                left: `calc(${this.getPercent() * 100 + '% - 6px'})`,
                pointerEvents: 'none',
                width: '12px',
                height: '12px',
                transform:
                  this.getLength() < Infinity && showTimestamp
                    ? 'scale(1, 1)'
                    : 'scale(0, 0)',
                transition: '0.25s all',
                borderRadius: '50%',
                backgroundColor: '#54c8ff',
              }}
            ></div>
          } */}
        {getLength() < Infinity && showTimestamp && (
          <Badge
            style={{
              position: "absolute",
              bottom: "10px",
              left: `calc(${hoverState.hoverPos * 100 + "%"})`,
              transform: "translate(-50%)",
              display: "inline-block",
            }}
          >
            {isLiveStream
              ? liveLabel(hoverState.hoverTimestamp)
              : formatTimestamp(hoverState.hoverTimestamp)}
          </Badge>
        )}
      </Progress.Root>
      {!isLiveStream && (
        <div className={` ${styles.text}`}>{formatTimestamp(getEnd())}</div>
      )}
      {isLiveStream && (
        // Red when live. When behind it turns grey and takes everyone in the room back to the live edge
        <Badge
          size="xs"
          color={atLive ? "red" : "gray"}
          title={atLive ? "Watching live" : "Jump to live"}
          style={{ cursor: atLive || disabled ? "default" : "pointer" }}
          onClick={() => {
            if (!atLive && !disabled) {
              roomSeek(props.duration);
            }
          }}
        >
          LIVE
        </Badge>
      )}
      {
        <Menu disabled={disabled}>
          <Menu.Target>
            <div
              className={`${styles.text} ${styles.action}`}
              style={{
                backgroundColor: "rgba(100,100,100, 0.6)",
                fontSize: 10,
                borderRadius: "4px",
                padding: "2px",
              }}
            >
              {props.playbackRate?.toFixed(2)}x
            </div>
          </Menu.Target>
          <Menu.Dropdown>
            {[
              { key: "Auto", text: "Auto", value: 0 },
              { key: "0.25", text: "0.25x", value: 0.25 },
              { key: "0.5", text: "0.5x", value: 0.5 },
              // { key: '0.75', text: '0.75x', value: 0.75 },
              { key: "1", text: "1x", value: 1 },
              // { key: '1.25', text: '1.25x', value: 1.25 },
              { key: "1.5", text: "1.5x", value: 1.5 },
              // { key: '1.75', text: '1.75x', value: 1.75 },
              { key: "2", text: "2x", value: 2 },
              { key: "3", text: "3x", value: 3 },
            ].map((item) => (
              <Menu.Item
                key={item.key}
                onClick={() => roomSetPlaybackRate(item.value)}
                rightSection={
                  roomPlaybackRate === item.value ? <IconCheck /> : null
                }
              >
                {item.text}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      }
      <IconRepeat
        onClick={() => {
          if (!disabled) {
            props.roomSetLoop(Boolean(!props.loop));
          }
        }}
        className={` ${styles.action}`}
        title="Loop"
        color={props.loop ? "green" : softWhite}
      />
      {props.isYouTube ? (
        <Menu>
          <Menu.Target>
            <IconBadgeCc className={styles.action} />
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
          onClick={() => {
            localSubtitleModal();
          }}
          className={` ${styles.action}`}
          title="Captions"
          color={subtitled ? "green" : softWhite}
        />
      )}
      {props.audioTracks && props.audioTracks.length > 1 && (
        // Local to this device, so unlike the room controls it isn't affected by the lock
        <Menu>
          <Menu.Target>
            <IconHeadphones
              className={styles.action}
              title="Audio track"
              color={softWhite}
            />
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Audio track</Menu.Label>
            {props.audioTracks.map((track) => (
              <Menu.Item
                key={track.id}
                onClick={() => props.localSetAudioTrack?.(track.id)}
                rightSection={
                  props.audioTrackId === track.id ? <IconCheck /> : null
                }
              >
                {track.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      )}
      <IconTheater
        onClick={() => localFullScreen(false)}
        className={` ${styles.action}`}
        title="Theater Mode"
      />
      <IconMaximize
        onClick={() => localFullScreen(true)}
        className={` ${styles.action}`}
        title="Fullscreen"
      />
      {muted ? (
        <IconVolumeOff
          onClick={() => {
            localToggleMute();
          }}
          className={` ${styles.action}`}
        />
      ) : (
        <IconVolume
          onClick={() => {
            localToggleMute();
          }}
          className={` ${styles.action}`}
        />
      )}
      <div style={{ width: "100px" }}>
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
