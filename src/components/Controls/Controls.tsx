import React from 'react';
import { Icon, Progress, Label, Popup, Dropdown } from 'semantic-ui-react';
import { Slider } from 'react-semantic-ui-range';
import { formatTimestamp } from '../../utils';

interface ControlsProps {
  duration: number;
  togglePlay: () => void;
  onSeek: (e: any, time: number) => void;
  fullScreen: (fs: boolean) => void;
  toggleMute: () => void;
  showSubtitle: () => void;
  jumpToLeader: () => void;
  paused: boolean;
  muted: boolean;
  volume: number;
  subtitled: boolean;
  currentTime: number;
  setVolume: (volume: number) => void;
  disabled?: boolean;
  leaderTime?: number;
  isPauseDisabled?: boolean;
  playbackRate: number;
  setPlaybackRate: (rate: number) => void;
  beta: boolean;
  roomPlaybackRate: number;
  isYouTube: boolean;
  setSubtitleMode: (mode: TextTrackMode, lang?: string) => void;
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
      togglePlay,
      onSeek,
      fullScreen,
      toggleMute,
      showSubtitle,
      jumpToLeader,
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
    const isBehind = leaderTime && leaderTime - currentTime > 3;
    return (
      <div className="controls">
        <Icon
          size="large"
          onClick={() => {
            togglePlay();
          }}
          className="control action"
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
              onClick={() => jumpToLeader()}
              className="control action text"
              style={{
                color: isBehind ? 'gray' : 'red',
              }}
            >
              <Icon size="small" name={'circle'} />
              LIVE
            </div>
          }
        />
        <div className="control text">{formatTimestamp(currentTime)}</div>
        <Progress
          size="tiny"
          color="blue"
          onClick={
            duration < Infinity && !this.props.disabled ? onSeek : undefined
          }
          onMouseOver={this.onMouseOver}
          onMouseOut={this.onMouseOut}
          onMouseMove={this.onMouseMove}
          className="control action"
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
        <div className="control text">{formatTimestamp(duration)}</div>
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
          <Dropdown style={{ marginLeft: -8 }} className="control">
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
              ].map((item) => (
                <Dropdown.Item
                  key={item.key}
                  text={item.text}
                  onClick={() => this.props.setPlaybackRate(item.value)}
                  active={this.props.roomPlaybackRate === item.value}
                />
              ))}
            </Dropdown.Menu>
          </Dropdown>
        }
        {this.props.isYouTube ? (
          <Dropdown icon="closed captioning outline large" className="control">
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
                    this.props.setSubtitleMode(
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
              showSubtitle();
            }}
            className="control action"
            name={subtitled ? 'closed captioning' : 'closed captioning outline'}
            title="Captions"
          />
        )}
        <Icon
          size="large"
          onClick={() => fullScreen(false)}
          className="control action"
          style={{ transform: 'rotate(90deg)' }}
          name="window maximize outline"
          title="Theater Mode"
        />
        <Icon
          size="large"
          onClick={() => fullScreen(true)}
          className="control action"
          name="expand"
          title="Fullscreen"
        />
        <Icon
          size="large"
          onClick={() => {
            toggleMute();
          }}
          className="control action"
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
                  this.props.setVolume(value);
                }
              },
            }}
          />
        </div>
      </div>
    );
  }
}
