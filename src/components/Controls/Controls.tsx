import React from 'react';
import { Icon, Progress, Label, Popup } from 'semantic-ui-react';
import { Slider } from 'react-semantic-ui-range';
import { formatTimestamp } from '../../utils';
import styles from './Controls.module.css';
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
      <>
        <div className={styles.ControlsWrapper}>
          <div
            style={{
              marginLeft: '10px',
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              background: '#2222',
            }}
          >
            <Icon
              size="big"
              onClick={() => onSeek(null, currentTime - 10)}
              className={styles.Btn}
              name="angle double left"
              // style={{ transform: 'rotate(180deg)' }}
              title="Backward 10 seconds"
            />
            <Icon
              size="big"
              onClick={() => {
                togglePlay();
              }}
              className={styles.Btn}
              disabled={disabled || isPauseDisabled}
              name={paused ? 'play circle outline' : 'pause circle outline'}
            />
            <Icon
              size="big"
              onClick={() => onSeek(null, currentTime + 10)}
              className={styles.Btn}
              name="angle double right"
              title="Forward 10 seconds"
            />
          </div>

          <div>
            <div className="controls">
              <Popup
                content={
                  (isBehind
                    ? "We've detected that your stream is behind. "
                    : '') + 'Click to sync with leader.'
                }
                trigger={
                  <Icon
                    size="large"
                    onClick={jumpToLeader}
                    disabled={!isBehind}
                    className={`${styles.Btn} control action ${
                      isBehind ? 'glowing' : ''
                    }`}
                    name={'sync alternate'}
                    title="Click to sync with leader."
                  />
                }
              />
              {/* <Icon
                size="big"
                onClick={() => fullScreen(false)}
                className="control action"
                style={{ transform: 'rotate(90deg)' }}
                name="window maximize outline"
                title="Theater Mode"
              /> */}
              <Icon
                size="big"
                onClick={() => fullScreen(true)}
                className="control action"
                name="expand"
                title="Fullscreen"
              />
              <Icon
                size="big"
                onClick={() => {
                  showSubtitle();
                }}
                className="control action"
                name={
                  subtitled ? 'closed captioning' : 'closed captioning outline'
                }
                title="Captions"
              />
              <Icon
                size="big"
                onClick={() => {
                  toggleMute();
                }}
                className="control action"
                name={muted ? 'volume off' : 'volume up'}
                title="Mute"
              />
              <div style={{ width: '150px', marginRight: '0px' }}>
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
          </div>
        </div>

        <div className="controls">
          {/* ====================== Progress ====================== */}
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
          {/* ====================== Progress END ====================== */}
        </div>
      </>
    );
  }
}
