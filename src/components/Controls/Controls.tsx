import React from 'react';
import { Icon, Progress, Label, Popup } from 'semantic-ui-react';
// import { Slider } from 'react-semantic-ui-range';
import { formatTimestamp } from '../../utils';
import styles from './Controls.module.css';
import Slider from 'rc-slider';
import MetaButton from '../../atoms/MetaButton';
import BackwardIcon from '../../../src/assets/icons/backward.svg';
import ForwardIcon from '../../../src/assets/icons/forward.svg';
import PlayIcon from '../../../src/assets/icons/play-btn.svg';
import PauseIcon from '../../../src/assets/icons/pause.png';
import fullScreenIcon from '../../../src/assets/icons/full-screen.svg';
import quiteFScreenIcon from '../../../src/assets/icons/quit-full-screen.svg';
import SyncIcon from '../../../src/assets/icons/sync.svg';
import SyncInfoIcon from '../../../src/assets/icons/ion_sync-info.svg';
import ccIcon from '../../../src/assets/icons/caption.svg';
import vlmIcon from '../../../src/assets/icons/volume.svg';
import muteIcon from '../../../src/assets/icons/mute.png';
import rightArrowIcon from '../../../src/assets/icons/Arrow - Left.svg';
import leftArrowIcon from '../../../src/assets/icons/Arrow - Left2.svg';
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
  isCollapsed: boolean;
  isShowTheatreTopbar: boolean;
}

interface ControlState {
  showTimestamp: boolean;
  currTimestamp: number;
  posTimestamp: number;
  isFullScreen: boolean;
  isShowAllControls: boolean;
}

export class Controls extends React.Component<ControlsProps> {
  state: ControlState = {
    showTimestamp: false,
    currTimestamp: 0,
    posTimestamp: 0,
    isFullScreen: false,
    isShowAllControls: false,
  };
  toggleShowAllControls = () => {
    this.setState({ isShowAllControls: !this.state.isShowAllControls });
  };
  toggleFScreen = (): void => {
    this.setState({ isFullScreen: !this.state.isFullScreen });
    this.handleFullView();
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
  getSliderStyles = () => {
    return {
      background: this.props.muted
        ? '#ccc'
        : `linear-gradient(to right, #54C8FF, #54C8FF ${
            this.props.volume * 100
          }%, #ccc ${this.props.volume * 100}%, #ccc 100%)`,
    };
  };
  handleFullView = () => {
    try {
      if (window?.vuplex) {
        // console.log('vuplex: ', { vuplex });
        window?.vuplex.postMessage({
          type: 'playerInfo',
          message: JSON.stringify({
            volume: this.props.volume,
            duration: this.props.duration,
            currentTime: this.props.currentTime,
            isMuted: this.props.muted,
            isPaused: this.props.paused,
          }),
        });
        // The window.vuplex object already exists, so go ahead and send the message.
        // sendMessageToCSharp();
      } else {
        // The window.vuplex object hasn't been initialized yet because the page is still
        // loading, so add an event listener to send the message once it's initialized.
        window.addEventListener(
          'vuplexready',
          window?.vuplex.postMessage({
            type: 'playerInfo',
            message: {
              type: 'playerInfo',
              message: {
                volume: this.props.volume,
                duration: this.props.duration,
                currentTime: this.props.currentTime,
                isMuted: this.props.muted,
                isPaused: this.props.paused,
              },
            },
          })
        );
      }
    } catch (error) {
      console.error('Something went wrong!');
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
      isCollapsed,
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
              justifyContent: 'center',
            }}
            className="absolute top-[46%] left-[38%] lg:left-[44vw]"
          >
            <MetaButton
              onClick={() => onSeek(null, currentTime - 10)}
              img={BackwardIcon}
              className="bg-transparent"
              imgClass="h-16"
            ></MetaButton>
            <MetaButton
              onClick={() => togglePlay()}
              img={paused ? PlayIcon : PauseIcon}
              className="bg-transparent"
              imgClass="h-16"
            ></MetaButton>
            <MetaButton
              onClick={() => onSeek(null, currentTime + 10)}
              img={ForwardIcon}
              className="bg-transparent"
              imgClass="h-16"
            ></MetaButton>
          </div>

          <div className="controls -mb-2">
            {/* ====================== Progress ====================== */}
            <div className="control">{formatTimestamp(currentTime)}</div>
            <Progress
              size="small"
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
                    <div style={{ width: '24px' }}>
                      {formatTimestamp(this.state.currTimestamp)}
                    </div>
                  </Label>
                </div>
              )}
            </Progress>
            <div className={`control `}>{formatTimestamp(duration)}</div>
            {/* ====================== Progress END ====================== */}
          </div>

          <section className=" flex justify-between items-center">
            <div>
              <MetaButton
                onClick={() => this.toggleFScreen()}
                img={
                  this.state.isFullScreen ? quiteFScreenIcon : fullScreenIcon
                }
                className="bg-transparent"
                imgClass="h-16"
              ></MetaButton>
            </div>
            <div>
              <div className="controls gap-3">
                {/* <Popup
                  content={
                    (isBehind
                      ? "We've detected that your stream is behind. "
                      : '') + 'Click to sync with leader.'
                  }
                  trigger={
                    <Icon
                      size="huge"
                      onClick={jumpToLeader}
                      disabled={!isBehind}
                      className={`${styles.Btn} control action ${isBehind ? 'glowing' : ''
                        }`}
                      name={'sync alternate'}
                      title="Click to sync with leader."
                    />
                  }
                /> */}
                <MetaButton
                  onClick={() => (isBehind ? jumpToLeader() : null)}
                  img={isBehind ? SyncInfoIcon : SyncIcon}
                  className="bg-transparent"
                  imgClass="h-14"
                />
                <MetaButton
                  onClick={() => this.toggleShowAllControls()}
                  img={
                    this.state.isShowAllControls
                      ? rightArrowIcon
                      : leftArrowIcon
                  }
                  className="bg-transparent"
                  imgClass="h-14"
                />
                {/* <Icon
                size="big"
                onClick={() => fullScreen(false)}
                className="control action"
                style={{ transform: 'rotate(90deg)' }}
                name="window maximize outline"
                title="Theater Mode"
              /> */}
                {/* <Icon
                  size="huge"
                  onClick={() => {
                    showSubtitle();
                  }}
                  className="control action"
                  name={
                    subtitled ? 'closed captioning' : 'closed captioning outline'
                  }
                  title="Captions"
                /> */}
                {/* <Icon
                  size="huge"
                  onClick={() => fullScreen(true)}
                  className="control action"
                  name="expand"
                  title="Fullscreen"
                /> */}

                {/* <Icon
                  size="huge"
                  onClick={() => {
                    toggleMute();
                  }}
                  className="control action"
                  name={muted ? 'volume off' : 'volume up'}
                  title="Mute"
                /> */}
                {this.state.isShowAllControls && (
                  <>
                    {' '}
                    {/* <MetaButton
                      onClick={() => showSubtitle()}
                      img={ccIcon}
                      className={`bg-transparent ${subtitled ? 'opacity-100' : 'opacity-50'
                        }`}
                      imgClass="h-14"
                    /> */}
                    <MetaButton
                      onClick={() => toggleMute()}
                      img={muted ? muteIcon : vlmIcon}
                      className="bg-transparent"
                      imgClass="h-12"
                    />
                    <div style={{ width: '150px', marginRight: '10px' }}>
                      <input
                        type="range"
                        style={this.getSliderStyles()}
                        className="rounded-lg w-full cursor-pointer"
                        min="0"
                        max="100"
                        value={volume * 100}
                        step={1}
                        onChange={(e: any) => {
                          const value = e.target.value;
                          if (value !== this.props.volume && !isNaN(value)) {
                            this.props.setVolume(value / 100);
                          }
                        }}
                      />
                    </div>
                  </>
                )}
                {/* <Slider
                    value={volume}
                    railStyle={{ height: 15 }}
                    trackStyle={{ height: 15 }}
                    handleStyle={{
                      height: 32,
                      width: 32,
                      marginLeft: -14,
                      marginTop: -9,
                    }}
                    min={0}
                    max={1}
                    step={0.01}
                    disabled={muted}
                    onChange={(value: any) => {
                      if (value !== this.props.volume && !isNaN(value)) {
                        this.props.setVolume(value);
                      }
                    }}
                 
                  /> */}
              </div>
            </div>
          </section>
        </div>
      </>
    );
  }
}
