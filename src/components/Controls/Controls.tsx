import React from 'react';
import { Badge, Menu, Progress, Slider } from '@mantine/core';
import { formatTimestamp, softWhite } from '../../utils/utils';
import styles from './Controls.module.css';
import { MetadataContext } from '../../MetadataContext';
import {
  IconPlayerPlayFilled,
  IconPlayerPauseFilled,
  IconRefresh,
  IconCheck,
  IconRepeat,
  IconBadgeCc,
  IconVolumeOff,
  IconVolume,
  IconTheater,
  IconMaximize,
  IconPlayerSkipForwardFilled,
} from '@tabler/icons-react';

interface ControlsProps {
  duration: number;
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
}

export class Controls extends React.Component<ControlsProps> {
  static contextType = MetadataContext;
  declare context: React.ContextType<typeof MetadataContext>;
  state = {
    showTimestamp: false,
    hoverTimestamp: 0,
    hoverPos: 0,
  };

  onMouseOver = () => {
    // console.log('mouseover');
    this.setState({ showTimestamp: true });
  };

  onMouseOut = () => {
    // console.log('mouseout');
    this.setState({ showTimestamp: false });
  };

  onMouseMove = (e: any) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const max = rect.width;
    const pct = x / max;
    // console.log(x, max);
    const target = this.getStart() + pct * this.getLength();
    // console.log(pct);
    if (pct >= 0) {
      this.setState({ hoverTimestamp: target, hoverPos: pct });
    }
  };

  getEnd = () => this.props.duration;
  getStart = () => 0;
  getLength = () => this.getEnd() - this.getStart();
  getCurrent = () => this.props.currentTime;
  getPercent = () => (this.getCurrent() - this.getStart()) / this.getLength();

  render() {
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
    } = this.props;
    // console.log(leaderTime, currentTime);
    const behindThreshold = 10;
    const behindTime =
      leaderTime && leaderTime < Infinity
        ? leaderTime - currentTime
        : this.getEnd() - this.getCurrent();
    const isBehind = behindTime > behindThreshold;
    const buffers = timeRanges.map(({ start, end }) => {
      const buffStartPct = (start / this.getLength()) * 100;
      const buffLengthPct = ((end - start) / this.getLength()) * 100;
      return (
        <div
          key={start}
          style={{
            position: 'absolute',
            height: '8px',
            backgroundColor: 'grey',
            left: buffStartPct + '%',
            width: buffLengthPct + '%',
            bottom: '0em',
            zIndex: 0,
            pointerEvents: 'none',
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          <IconRefresh
            color={isBehind ? 'orange' : softWhite}
            className={`${styles.action}`}
            onClick={() => {
              if (isLiveStream) {
                // in live case we want to seek the entire room to edge
                roomSeek(this.props.duration)
              } else {
                localSeek();
              }
            }}
          />
          <div style={{ position: 'absolute', fontSize: '6px', zIndex: -1 }}>
            {Math.max(Math.floor(behindTime), 0)}
          </div>
        </div>
        <div className={` ${styles.text}`}>
          {formatTimestamp(this.getCurrent())}
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
                // for DASH we set getStart() value to when stream started, so left side is 0 video time
                // even though it's not all seekable this makes the click to seek simple
                let target = this.getLength() * pct;
                roomSeek(target);
              }
            }
          }}
          onMouseOver={this.onMouseOver}
          onMouseOut={this.onMouseOut}
          onMouseMove={this.onMouseMove}
          style={{
            flexGrow: 1,
            marginTop: 0,
            marginBottom: 0,
            position: 'relative',
            minWidth: '50px',
            overflow: 'visible',
            cursor: 'pointer',
          }}
        >
          <Progress.Section
            style={{ pointerEvents: 'none', zIndex: 1 }}
            value={this.getPercent() * 100}
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
                  this.getLength() < Infinity && this.state.showTimestamp
                    ? 'scale(1, 1)'
                    : 'scale(0, 0)',
                transition: '0.25s all',
                borderRadius: '50%',
                backgroundColor: '#54c8ff',
              }}
            ></div>
          } */}
          {this.getLength() < Infinity && this.state.showTimestamp && (
            <Badge
              style={{
                position: 'absolute',
                bottom: '10px',
                left: `calc(${this.state.hoverPos * 100 + '%'})`,
                transform: 'translate(-50%)',
                // whiteSpace: 'nowrap',
                // pointerEvents: 'none',
                minWidth: '60px',
                // textOverflow: 'initial',
              }}
            >
              {formatTimestamp(this.state.hoverTimestamp)}
            </Badge>
          )}
        </Progress.Root>
        <div className={` ${styles.text}`}>
          {formatTimestamp(this.getEnd())}
        </div>
        {
          <Menu disabled={disabled}>
            <Menu.Target>
              <div
                className={`${styles.text} ${styles.action}`}
                style={{
                  backgroundColor: 'rgba(100,100,100, 0.6)',
                  fontSize: 10,
                  borderRadius: '4px',
                  padding: '2px',
                }}
              >
                {this.props.playbackRate?.toFixed(2)}x
              </div>
            </Menu.Target>
            <Menu.Dropdown>
              {[
                { key: 'Auto', text: 'Auto', value: 0 },
                { key: '0.25', text: '0.25x', value: 0.25 },
                { key: '0.5', text: '0.5x', value: 0.5 },
                // { key: '0.75', text: '0.75x', value: 0.75 },
                { key: '1', text: '1x', value: 1 },
                // { key: '1.25', text: '1.25x', value: 1.25 },
                { key: '1.5', text: '1.5x', value: 1.5 },
                // { key: '1.75', text: '1.75x', value: 1.75 },
                { key: '2', text: '2x', value: 2 },
                { key: '3', text: '3x', value: 3 },
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
              this.props.roomSetLoop(Boolean(!this.props.loop));
            }
          }}
          className={` ${styles.action}`}
          title="Loop"
          color={this.props.loop ? 'green' : softWhite}
        />
        {this.props.isYouTube ? (
          <Menu>
            <Menu.Target>
              <IconBadgeCc className={styles.action} />
            </Menu.Target>
            <Menu.Dropdown>
              {[
                { key: 'hidden', text: 'Off', value: 'hidden' },
                { key: 'en', text: 'English', value: 'showing' },
                { key: 'es', text: 'Spanish', value: 'showing' },
              ].map((item) => (
                <Menu.Item
                  key={item.key}
                  onClick={() =>
                    this.props.localSetSubtitleMode(
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
            color={subtitled ? 'green' : softWhite}
          />
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
        <div style={{ width: '100px' }}>
          <Slider
            defaultValue={volume}
            disabled={muted}
            min={0}
            max={1}
            step={0.01}
            onChangeEnd={(value: number) => {
              this.props.localSetVolume(value);
            }}
          />
        </div>
      </div>
    );
  }
}
