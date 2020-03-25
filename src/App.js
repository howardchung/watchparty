import React from 'react';
import { Button, Grid, Segment, Divider, Select, Dimmer, Loader, Header, Label, Card } from 'semantic-ui-react'
import './App.css';

export default class App extends React.Component { 
  state = {
    watchPartyActive: false,
    state: 'init',
    watchOptions: [
      'The.Legend.Of.Korra.S01e01-E02.720P.Hdtv.X264-Hwe-1.m4v',
      'The.Legend.Of.Korra.S01e03.720P.Hdtv.X264-Hwe-2.m4v',
      'The.Legend.Of.Korra.S01e04.720P.Hdtv.X264-Hwe-3.m4v',
      'The.Legend.Of.Korra.S01e05.720P.Hdtv.X264-Hwe-4.m4v',
      'The.Legend.Of.Korra.S01e06.720P.Hdtv.X264-Hwe-5.m4v',
      'The.Legend.Of.Korra.S01e07.The.Aftermath.720P.Hdtv.H264-Ooo-6.m4v',
      'The.Legend.Of.Korra.S01e08.720P.Hdtv.X264-Hwe-7.m4v',
      'The.Legend.Of.Korra.S01e09.720P.Hdtv.X264-Hwe-8.m4v',
      'The.Legend.Of.Korra.S01e10.Turning.The.Tides.720P.Hdtv.H264-Ooo-9.m4v',
      'The.Legend.Of.Korra.S01e11.Skeletons.In.The.Closet.720P.Hdtv.H264-Ooo-10.m4v',
      'The.Legend.Of.Korra.S01e12.Endgame.720P.Hdtv.H264-Ooo-11.m4v',
     'The.Legend.Of.Korra.S02e01-E02.Rebel.Spirit Southern.Lights.720P.Hdtv.X264-W4f-2.m4v',
     'The.Legend.Of.Korra.S02e03.Civil.Wars.Part.1.720P.Hdtv.X264-W4f-1.m4v',
     'The.Legend.Of.Korra.S02e04.Civil.Wars.Part.2.720P.Hdtv.X264-W4f-4.m4v',
     'The.Legend.Of.Korra.S02e05.Peacekeepers.720P.Hdtv.X264-Ooo-5.m4v',
     'The.Legend.Of.Korra.S02e06.The.Sting.720P.Hdtv.X264-W4f-6.m4v',
     'The.Legend.Of.Korra.S02e07e08.Beginnings.720P.Hdtv.X264-Ooo-1.m4v',
     'The.Legend.Of.Korra.S02e09.The.Guide.720P.Hdtv.X264-Ooo-1.m4v',
     'The.Legend.Of.Korra.S02e10.A.New.Spiritual.Age.720P.Hdtv.X264-Ooo-1.m4v',
     'The.Legend.Of.Korra.S02e11-E12.Night.Of.A.Thousand.Stars Harmonic.Convergence.720P.Hdtv.X264-W4f-1.m4v',
     'The.Legend.Of.Korra.S02e13-E14.720P.Hdtv.H264.Aac-Secludedly-1.m4v',
     'The.Legend.of.Korra.S03E01.A.Breath.of.Fresh.Air.REPACK.720p.WEBRip.x264.AAC.mp4',
     'The.Legend.of.Korra.S03E02.Rebirth.REPACK.720p.WEBRip.x264.AAC.mp4',
     'The.Legend.of.Korra.S03E03.The.Earth.Queen.REPACK.720p.WEBRip.x264.AAC.mp4',
     'The.Legend.of.Korra.S03E04.In.Harms.Way.720p.WEBRip.x264.AAC.mp4',
     'The.Legend.of.Korra.S03E05.The.Metal.Clan.720p.WEBRip.x264.AAC.mp4',
     'The.Legend.of.Korra.S03E06.Old.Wounds.720p.WEBRip.x264.AAC.mp4',
     'The.Legend.of.Korra.S03E07.Original.Airbenders.720p.WEBRip.x264.AAC.mp4',
     'The.Legend.of.Korra.S03E08.The.Terror.Within.720p.WEBRip.x264.AAC.mp4',
     'The.Legend.of.Korra.S03E09.The.Stakeout.720p.WEBRip.x264.AAC.mp4',
     'The.Legend.of.Korra.S03E10.Long.Live.the.Queen.720p.WEBRip.x264.AAC.mp4',
     'The.Legend.of.Korra.S03E11.The.Ultimatum.720p.WEBRip.x264.AAC.mp4',
     'The.Legend.of.Korra.S03E12.Enter.the.Void.720p.WEBRip.x264.AAC.mp4',
     'The.Legend.of.Korra.S03E13.Venom.of.the.Red.Lotus.720p.WEBRip.x264.AAC.mp4',
     'The.Legend.Of.Korra.S04E01.mp4',
     'The.Legend.Of.Korra.S04E11.mp4',
     'The.Legend.Of.Korra.S04E12-13.mp4',
     'The.Legend.Of.Korra.S04E02.mp4',
     'The.Legend.Of.Korra.S04E03.mp4',
     'The.Legend.Of.Korra.S04E04.mp4',
     'The.Legend.Of.Korra.S04E05.mp4',
     'The.Legend.Of.Korra.S04E06.mp4',
     'The.Legend.Of.Korra.S04E07.mp4',
     'The.Legend.Of.Korra.S04E08.mp4',
     'The.Legend.Of.Korra.S04E09.mp4',
     'The.Legend.Of.Korra.S04E10.mp4',
    ],
    participants: {},
  };
  videoRefs = {};
  hostPeer = null;

  async componentDidMount() {
    // video chat
    // "bring your own file"
    // now playing
    // remove from participant on disconnect
    // group/shared controls
  }

  host = () => {
    this.setState({ currentMedia: this.state.watchOptions[0] }, () => {
      this.setMedia(null, { value: this.state.currentMedia });
      const host = new window.Peer('watchparty-host');
      this.hostPeer = host;
      // console.log(stream, stream.getAudioTracks(), stream.getVideoTracks());
      this.setState({ isHost: true }, () => {
        host.on('call', (call) => {
          const leftVideo = document.getElementById('leftVideo');
          let stream = leftVideo.captureStream();
          call.answer(stream)
          call.on('stream', (remoteStream) => {
            this.state.participants[call.peer] = remoteStream;
            this.setState(this.state.participants);
            console.log(this.state.participants);
            // this.videoRefs[call.peer].srcObject = remoteStream;
            // Render all incoming streams to canvas and rebroadcast?
            // https://stackoverflow.com/questions/4429440/html5-display-video-inside-canvas
          });
        });
        host.on('open', () => {
          this.join();
        });
      });
    });
  }

  setMedia = async (e, data) => {
    const leftVideo = document.getElementById('leftVideo');
    this.playerElement.src = '/media/' + data.value;
    leftVideo.muted = true;
    leftVideo.load();
    const replaceVideo = () => {
      let stream = leftVideo.captureStream();
      // console.log(stream, stream.getAudioTracks(), stream.getVideoTracks());
      if (this.hostPeer && this.hostPeer.connections) {
        Object.keys(this.hostPeer.connections).forEach(key => {
          const connection = this.hostPeer.connections[key][0];
          connection.peerConnection.getSenders().forEach(sender => {
            if (sender.track && sender.track.kind === 'audio') {
              sender.track.stop();
              sender.replaceTrack(stream.getAudioTracks()[0]);
            }
            else if (sender.track && sender.track.kind === 'video') {
              sender.track.stop();
              sender.replaceTrack(stream.getVideoTracks()[0]);
            }
          });
        });  
      }
      this.setState({currentMedia: data.value });
      leftVideo.removeEventListener('loadeddata', replaceVideo);
    };
    leftVideo.addEventListener('loadeddata', replaceVideo);
  }

  start = () => {
    const leftVideo = document.getElementById('leftVideo');
    leftVideo.play();
  }

  stop = () => {
    const leftVideo = document.getElementById('leftVideo');
    leftVideo.pause();    
  }

  join = async () => {
    this.setState({ state: 'joining' }, async () => {
      const peer = new window.Peer();
      const rightVideo = document.getElementById('rightVideo');
      // let stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
      let silence = () => {
        let ctx = new AudioContext(), oscillator = ctx.createOscillator();
        let dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        return Object.assign(dst.stream.getAudioTracks()[0], {enabled: false});
      }
      
      let black = ({width = 640, height = 480} = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), {width, height});
        canvas.getContext('2d').fillRect(0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], {enabled: false});
      }
      
      let blackSilence = (...args) => new MediaStream([black(...args), silence()]);

      var call = peer.call('watchparty-host', blackSilence());
      // console.log(call);
      call.on('stream', (remoteStream) => {
        window.testStream = remoteStream;
        rightVideo.srcObject = remoteStream;
        this.setState({ watchPartyActive: true });
      });
    });
  }

  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', maxWidth: '1024px' }}>
        <Header as='h1'>Watch Party</Header>
        { this.state.state === 'init' &&
        <Segment>
          <Grid columns={2} relaxed='very'>
          <Grid.Column>
          <Button onClick={this.host} primary>Host</Button>
          </Grid.Column>
          <Grid.Column>
            <Button onClick={this.join} secondary>Join</Button>
          </Grid.Column>
          </Grid>
          <Divider vertical>OR</Divider>
        </Segment>
        }
        <video
            style={{ display: 'none' }}
            id="leftVideo"
            playsInline
            controls
            ref={el => {this.playerElement = el}}
            type="video/mp4"
          >
        </video>
        
        {
          this.state.state !== 'init' &&
          <Segment style={{ width: '100%', minHeight: '400px' }}>
          <video style={ { width: '100%', height: '100%' } } id="rightVideo" playsInline autoPlay controls>
          </video>
          {!this.state.watchPartyActive && <Dimmer active>
              <Loader />
            </Dimmer>}
          </Segment>
        }
        
        {this.state.watchPartyActive && this.state.isHost && <Segment>
          <Header as='h2'>Controls</Header>
          <Select onChange={this.setMedia} value={this.state.currentMedia} options={this.state.watchOptions.map(option => ({ key: option, text: option, value: option }))}>
          </Select>
          <Button onClick={this.start} primary>Start</Button>
          <Button onClick={this.stop} secondary>Stop</Button>
        </Segment>}

        {this.state.watchPartyActive && <div>
          <Header as='h3'>Participants</Header>
          <div style={ { display: 'flex'}}>
            {Object.keys(this.state.participants).map((participant) => {
              return <div>
                <Label as='a' image>
                  <img src='/logo192.png' alt="" />
                  {participant}
                </Label>
                {/* <video ref={el => {this.videoRefs[participant] = el}} style={{ width: '100%', height: '100%' }} autoPlay playsInline></video> */}
                </div>;
            })}
          </div>
        </div> }
      </div>
    );
  }
}
