import React from 'react';
import { Slider } from 'react-semantic-ui-range';
import { Icon, Label, Progress } from 'semantic-ui-react';

import { formatTimestamp } from '../../utils';

interface ControlsProps {
  duration: number;
  togglePlay: Function;
  onSeek: Function;
  fullScreen: Function;
  toggleMute: Function;
  toggleSubtitle: Function;
  jumpToLeader: Function;
  paused: boolean;
  muted: boolean;
  subtitled: boolean;
  currentTime: number;
  getVolume: Function;
  setVolume: Function;
}

class Controls extends React.Component<ControlsProps> {
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
      toggleSubtitle,
      jumpToLeader,
      paused,
      muted,
      subtitled,
      currentTime,
      duration,
    } = this.props;
    return (
      <div className="controls">
        <Icon
          size="large"
          onClick={togglePlay}
          className="control action"
          name={paused ? 'play' : 'pause'}
        />
        <Icon
          size="large"
          onClick={jumpToLeader}
          className="control action"
          name={'angle double right'}
        />
        <div className="control">{formatTimestamp(currentTime)}</div>
        <Progress
          size="tiny"
          color="blue"
          onClick={duration < Infinity ? onSeek : undefined}
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
            minWidth: '100px',
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
          onClick={toggleSubtitle}
          className="control action"
          name={subtitled ? 'closed captioning' : 'closed captioning outline'}
        />
        <Icon
          size="large"
          onClick={() => fullScreen(false)}
          className="control action"
          name="window maximize outline"
        />
        <Icon
          size="large"
          onClick={() => fullScreen(true)}
          className="control action"
          name="expand"
        />
        <Icon
          size="large"
          onClick={toggleMute}
          className="control action"
          name={muted ? 'volume off' : 'volume up'}
        />
        <div style={{ width: '100px', marginRight: '10px' }}>
          <Slider
            value={this.props.getVolume()}
            color="blue"
            settings={{
              min: 0,
              max: 1,
              step: 0.01,
              onChange: (value: number) => {
                this.props.setVolume(value);
              },
            }}
          />
        </div>
      </div>
    );
  }
}

export default Controls;
