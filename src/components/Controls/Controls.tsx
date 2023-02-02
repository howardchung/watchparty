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
}

export class Controls extends React.Component<ControlsProps> {
  state = {
    showTimestamp: false,
    currTimestamp: 0,
    posTimestamp: 0,
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
      this.setState({ currTimestamp: target, posTimestamp: pct });
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
    const isBehind = leaderTime && leaderTime - currentTime > 5;
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
          content={'Skip to the live stream position'}
          trigger={
            <div
              onClick={() => jumpToLeader()}
              className="control action"
              style={{
                color: isBehind ? 'gray' : 'red',
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              <Icon size="small" name={'circle'} />
              LIVE
            </div>
          }
        />
        <div className="control">{formatTimestamp(currentTime)}</div>
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
          {duration < Infinity && this.state.showTimestamp && (
            <div
              style={{
                position: 'absolute',
                bottom: '0px',
                left: `calc(${this.state.posTimestamp * 100 + '% - 27px'})`,
                pointerEvents: 'none',
              }}
            >
              <Label basic color="blue" pointing="below">
                <div style={{ width: '34px' }}>
                  {formatTimestamp(this.state.currTimestamp)}
                </div>
              </Label>
            </div>
          )}
        </Progress>
        <div className="control">{formatTimestamp(duration)}</div>
        <div style={{ fontSize: '10px', fontWeight: 700 }}>
          {this.props.roomPlaybackRate === 0 && (
            <Popup
              content="WatchParty is using a dynamic rate to keep you in sync"
              trigger={<Icon name="cog" loading />}
            />
          )}
          {this.props.playbackRate?.toFixed(2)}x
        </div>
        {
          <Dropdown className="control" compact>
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
                />
              ))}
            </Dropdown.Menu>
          </Dropdown>
        }
        <Icon
          size="large"
          onClick={() => {
            showSubtitle();
          }}
          className="control action"
          name={subtitled ? 'closed captioning' : 'closed captioning outline'}
          title="Captions"
        />
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
