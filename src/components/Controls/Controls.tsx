import React from 'react';
import { Icon, Progress, Label, Popup, Dropdown } from 'semantic-ui-react';
import { Slider } from 'react-semantic-ui-range';
import { formatTimestamp } from '../../utils';
import styles from './Controls.module.css';

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
  beta: boolean;
  roomPlaybackRate: number;
  isYouTube: boolean;
  isLiveHls: boolean;
  timeRanges: { start: number; end: number }[];
  loop: boolean;
  roomTogglePlay: () => void;
  roomSeek: (e: any, time: number) => void;
  roomSetPlaybackRate: (rate: number) => void;
  roomSetLoop: (loop: boolean) => void;
  localFullScreen: (fs: boolean) => void;
  localToggleMute: () => void;
  localSubtitleModal: () => void;
  localSeek: () => void;
  localSetVolume: (volume: number) => void;
  localSetSubtitleMode: (mode: TextTrackMode, lang?: string) => void;
}

export class Controls extends React.Component<ControlsProps> {
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
    const target = pct * this.props.duration;
    // console.log(pct);
    if (pct >= 0) {
      this.setState({ hoverTimestamp: target, hoverPos: pct });
    }
  };

  render() {
    const {
      roomTogglePlay,
      roomSeek,
      localFullScreen,
      localToggleMute,
      localSubtitleModal,
      localSeek,
      currentTime,
      duration,
      leaderTime,
      isPauseDisabled,
      disabled,
      subtitled,
      paused,
      muted,
      volume,
    } = this.props;
    const isBehind = leaderTime && leaderTime - currentTime > 5;
    const buffers = this.props.timeRanges.map(({ start, end }) => {
      const buffStartPct = (start / duration) * 100;
      const buffLengthPct = ((end - start) / duration) * 100;
      return (
        <div
          key={start}
          style={{
            position: 'absolute',
            height: '6px',
            backgroundColor: 'grey',
            left: buffStartPct + '%',
            width: buffLengthPct + '%',
            bottom: '0.2em',
            zIndex: -1,
          }}
        ></div>
      );
    });
    return (
      <div className={styles.controls}>
        <Icon
          size="large"
          onClick={() => {
            roomTogglePlay();
          }}
          className={`${styles.control} ${styles.action}`}
          disabled={disabled || isPauseDisabled}
          name={paused ? 'play' : 'pause'}
        />
        <Popup
          content={
            isBehind
              ? 'Skip to the live stream position'
              : "You're at the live stream position"
          }
          trigger={
            <div
              onClick={() => {
                if (this.props.isLiveHls) {
                  // do a regular seek rather than sync self if it's HLS since we're basically seeking to the live position
                  // Also, clear the room TS since we want to start at live again on refresh
                  this.props.roomSeek(null, Number.MAX_SAFE_INTEGER);
                } else {
                  localSeek();
                }
              }}
              className={`${styles.control} ${styles.action} ${styles.text}`}
              style={{
                color: isBehind ? 'gray' : 'red',
              }}
            >
              <Icon size="small" name={'circle'} />
              LIVE
            </div>
          }
        />
        <div className={`${styles.control} ${styles.text}`}>
          {formatTimestamp(currentTime)}
        </div>
        <Progress
          size="tiny"
          color="blue"
          onClick={
            duration < Infinity && !this.props.disabled ? roomSeek : undefined
          }
          onMouseOver={this.onMouseOver}
          onMouseOut={this.onMouseOut}
          onMouseMove={this.onMouseMove}
          className={`${styles.control} ${styles.action}`}
          inverted
          style={{
            flexGrow: 1,
            marginTop: 0,
            marginBottom: 0,
            position: 'relative',
            minWidth: '50px',
          }}
          value={currentTime}
          total={duration}
        >
          {buffers}
          {
            <div
              style={{
                position: 'absolute',
                bottom: '0px',
                left: `calc(${
                  (this.props.currentTime / this.props.duration) * 100 +
                  '% - 6px'
                })`,
                pointerEvents: 'none',
                width: '12px',
                height: '12px',
                transform:
                  duration < Infinity && this.state.showTimestamp
                    ? 'scale(1, 1)'
                    : 'scale(0, 0)',
                transition: '0.25s all',
                borderRadius: '50%',
                backgroundColor: '#54c8ff',
              }}
            ></div>
          }
          {duration < Infinity && this.state.showTimestamp && (
            <div
              style={{
                position: 'absolute',
                bottom: '0px',
                left: `calc(${this.state.hoverPos * 100 + '% - 27px'})`,
                pointerEvents: 'none',
              }}
            >
              <Label basic color="blue" pointing="below">
                <div>{formatTimestamp(this.state.hoverTimestamp)}</div>
              </Label>
            </div>
          )}
        </Progress>
        <div className={`${styles.control} ${styles.text}`}>
          {formatTimestamp(duration)}
        </div>
        <div style={{ fontSize: '10px', fontWeight: 700 }}>
          <Popup
            content={
              this.props.roomPlaybackRate === 0
                ? 'Playing at a dynamic rate to keep you in sync'
                : 'Playing at a manually selected rate'
            }
            trigger={
              <Icon
                name="sync alternate"
                loading={this.props.roomPlaybackRate === 0}
              />
            }
          />
          {this.props.playbackRate?.toFixed(2)}x
        </div>
        {
          <Dropdown
            style={{ marginLeft: -8 }}
            className={`${styles.control}`}
            disabled={this.props.disabled}
          >
            <Dropdown.Menu>
              {[
                { key: 'Auto', text: 'Auto', value: 0 },
                { key: '0.25', text: '0.25x', value: 0.25 },
                { key: '0.5', text: '0.5x', value: 0.5 },
                { key: '0.75', text: '0.75x', value: 0.75 },
                { key: '1', text: '1x', value: 1 },
                { key: '1.25', text: '1.25x', value: 1.25 },
                { key: '1.5', text: '1.5x', value: 1.5 },
                { key: '1.75', text: '1.75x', value: 1.75 },
                { key: '2', text: '2x', value: 2 },
                { key: '3', text: '3x', value: 3 },
              ].map((item) => (
                <Dropdown.Item
                  key={item.key}
                  text={item.text}
                  onClick={() => this.props.roomSetPlaybackRate(item.value)}
                  active={this.props.roomPlaybackRate === item.value}
                />
              ))}
            </Dropdown.Menu>
          </Dropdown>
        }
        <Icon
          onClick={() => {
            this.props.roomSetLoop(Boolean(!this.props.loop));
          }}
          className={`${styles.control} ${styles.action}`}
          name={'repeat'}
          title="Loop"
          loading={this.props.loop}
          disabled={this.props.disabled}
        />
        {this.props.isYouTube ? (
          <Dropdown
            icon="closed captioning outline large"
            className={`${styles.control}`}
          >
            <Dropdown.Menu>
              {[
                { key: 'hidden', text: 'Off', value: 'hidden' },
                { key: 'en', text: 'English', value: 'showing' },
                { key: 'es', text: 'Spanish', value: 'showing' },
              ].map((item) => (
                <Dropdown.Item
                  key={item.key}
                  text={item.text}
                  onClick={() =>
                    this.props.localSetSubtitleMode(
                      item.value as TextTrackMode,
                      item.key
                    )
                  }
                />
              ))}
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          <Icon
            size="large"
            onClick={() => {
              localSubtitleModal();
            }}
            className={`${styles.control} ${styles.action}`}
            name={subtitled ? 'closed captioning' : 'closed captioning outline'}
            title="Captions"
          />
        )}
        <Icon
          size="large"
          onClick={() => localFullScreen(false)}
          className={`${styles.control} ${styles.action}`}
          style={{ transform: 'rotate(90deg)' }}
          name="window maximize outline"
          title="Theater Mode"
        />
        <Icon
          size="large"
          onClick={() => localFullScreen(true)}
          className={`${styles.control} ${styles.action}`}
          name="expand"
          title="Fullscreen"
        />
        <Icon
          size="large"
          onClick={() => {
            localToggleMute();
          }}
          className={`${styles.control} ${styles.action}`}
          name={muted ? 'volume off' : 'volume up'}
          title="Mute"
        />
        <div style={{ width: '100px', marginRight: '10px' }}>
          <Slider
            value={volume}
            color={'blue'}
            disabled={muted}
            settings={{
              min: 0,
              max: 1,
              step: 0.01,
              onChange: (value: number) => {
                if (value !== this.props.volume && !isNaN(value)) {
                  this.props.localSetVolume(value);
                }
              },
            }}
          />
        </div>
      </div>
    );
  }
}
