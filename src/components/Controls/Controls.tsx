import React from 'react';
import { Icon, Progress, Label, Popup } from 'semantic-ui-react';
import { Slider } from 'react-semantic-ui-range';
import { formatTimestamp } from '../../utils';

interface ControlsProps {
  duration: number;
  togglePlay: Function;
  onSeek: Function;
  fullScreen: Function;
  toggleMute: Function;
  showSubtitle: Function;
  jumpToLeader: Function;
  paused: boolean;
  muted: boolean;
  volume: number;
  subtitled: boolean;
  currentTime: number;
  setVolume: Function;
  disabled?: boolean;
  leaderTime?: number;
  isPauseDisabled?: boolean;
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
          content={
            (isBehind ? "We've detected that your stream is behind. " : '') +
            'Click to sync to leader.'
          }
          trigger={
            <Icon
              size="large"
              onClick={jumpToLeader}
              className={`control action ${isBehind ? 'glowing' : ''}`}
              name={'angle double right'}
            />
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
