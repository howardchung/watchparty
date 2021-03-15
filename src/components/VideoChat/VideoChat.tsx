import React from 'react';
import { Button, Icon } from 'semantic-ui-react';

import {
  formatTimestamp,
  getColorForStringHex,
  getDefaultPicture,
  iceServers,
} from '../../utils';

interface VideoChatProps {
  socket: SocketIOClient.Socket;
  participants: User[];
  pictureMap: StringDict;
  nameMap: StringDict;
  tsMap: NumberDict;
  rosterUpdateTS: Number;
  hide?: boolean;
}

export class VideoChat extends React.Component<VideoChatProps> {
  ourStream?: MediaStream;
  videoRefs: any = {};
  videoPCs: PCDict = {};
  socket = this.props.socket;

  componentDidMount() {
    this.socket.on('signal', this.handleSignal);
  }

  componentWillUnmount() {
    this.socket.off('signal', this.handleSignal);
  }

  componentDidUpdate(prevProps: VideoChatProps) {
    if (this.props.rosterUpdateTS !== prevProps.rosterUpdateTS) {
      this.updateWebRTC();
    }
  }

  handleSignal = async (data: any) => {
    // Handle messages received from signaling server
    const msg = data.msg;
    const from = data.from;
    const pc = this.videoPCs[from];
    console.log('recv', from, data);
    if (msg.ice !== undefined) {
      pc.addIceCandidate(new RTCIceCandidate(msg.ice));
    } else if (msg.sdp && msg.sdp.type === 'offer') {
      // console.log('offer');
      await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      this.sendSignal(from, { sdp: pc.localDescription });
    } else if (msg.sdp && msg.sdp.type === 'answer') {
      pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    }
  };

  setupWebRTC = async () => {
    // Set up our own video
    // Create default stream
    let black = ({ width = 640, height = 480 } = {}) => {
      let canvas: any = Object.assign(document.createElement('canvas'), {
        width,
        height,
      });
      canvas.getContext('2d')?.fillRect(0, 0, width, height);
      let stream = canvas.captureStream();
      return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    };
    let stream = new MediaStream([black()]);

    try {
      stream = await navigator?.mediaDevices?.getUserMedia({
        audio: true,
        video: true,
      });
    } catch (e) {
      console.warn(e);
      try {
        console.log('attempt audio only stream');
        stream = await navigator?.mediaDevices?.getUserMedia({
          audio: true,
          video: false,
        });
      } catch (e) {
        console.warn(e);
      }
    }
    this.ourStream = stream;
    // alert server we've joined video chat
    this.socket.emit('CMD:joinVideo');
  };

  stopWebRTC = () => {
    this.ourStream &&
      this.ourStream.getTracks().forEach((track) => {
        track.stop();
      });
    this.ourStream = undefined;
    Object.keys(this.videoPCs).forEach((key) => {
      this.videoPCs[key].close();
      delete this.videoPCs[key];
    });
    this.socket.emit('CMD:leaveVideo');
  };

  toggleVideoWebRTC = () => {
    if (this.ourStream && this.ourStream.getVideoTracks()[0]) {
      this.ourStream.getVideoTracks()[0].enabled = !this.ourStream.getVideoTracks()[0]
        ?.enabled;
    }
    this.forceUpdate();
  };

  getVideoWebRTC = () => {
    return this.ourStream && this.ourStream.getVideoTracks()[0]?.enabled;
  };

  toggleAudioWebRTC = () => {
    if (this.ourStream && this.ourStream.getAudioTracks()[0]) {
      this.ourStream.getAudioTracks()[0].enabled = !this.ourStream.getAudioTracks()[0]
        ?.enabled;
    }
    this.forceUpdate();
  };

  getAudioWebRTC = () => {
    return (
      this.ourStream &&
      this.ourStream.getAudioTracks()[0] &&
      this.ourStream.getAudioTracks()[0].enabled
    );
  };

  updateWebRTC = () => {
    if (!this.ourStream) {
      // We haven't started video chat, exit
      return;
    }
    this.props.participants.forEach((user) => {
      const id = user.id;
      if (!user.isVideoChat && this.videoPCs[id]) {
        // User isn't in video chat but we have a connection, close it
        this.videoPCs[id].close();
        delete this.videoPCs[id];
      }
      if (!user.isVideoChat || this.videoPCs[id]) {
        // User isn't in video chat, or we already have a connection to them
        return;
      }
      if (id === this.socket.id) {
        this.videoPCs[id] = new RTCPeerConnection();
        this.videoRefs[id].srcObject = this.ourStream;
      } else {
        const pc = new RTCPeerConnection({ iceServers: iceServers() });
        this.videoPCs[id] = pc;
        // Add our own video as outgoing stream
        //@ts-ignore
        pc.addStream(this.ourStream);
        pc.onicecandidate = (event) => {
          // We generated an ICE candidate, send it to peer
          if (event.candidate) {
            this.sendSignal(id, { ice: event.candidate });
          }
        };
        //@ts-ignore
        pc.onaddstream = (event: any) => {
          // Mount the stream from peer
          const stream = event.stream;
          // console.log(stream);
          this.videoRefs[id].srcObject = stream;
        };
        // For each pair, have the lexicographically smaller ID be the offerer
        const isOfferer = this.socket.id < id;
        if (isOfferer) {
          pc.onnegotiationneeded = async () => {
            // Start connection for peer's video
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            this.sendSignal(id, { sdp: pc.localDescription });
          };
        }
      }
    });
  };

  sendSignal = async (to: string, data: any) => {
    console.log('send', to, data);
    this.socket.emit('signal', { to, msg: data });
  };

  render() {
    const { participants, pictureMap, nameMap, tsMap, socket } = this.props;
    const videoChatContentStyle = {
      height: participants.length < 3 ? 220 : 110,
      borderRadius: '4px',
      objectFit: 'contain',
    };
    return (
      <div
        style={{
          display: this.props.hide ? 'none' : 'flex',
          width: '100%',
          flexDirection: 'column',
          overflow: 'auto',
        }}
      >
        {!this.ourStream && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              marginTop: '8px',
            }}
          >
            <Button
              fluid
              title="Join Video Chat"
              color={'purple'}
              size="medium"
              icon
              labelPosition="left"
              onClick={this.setupWebRTC}
            >
              <Icon name="video" />
              {`Join Video Chat`}
            </Button>
          </div>
        )}
        {this.ourStream && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
            }}
          >
            <Button
              fluid
              color={'red'}
              size="medium"
              icon
              labelPosition="left"
              onClick={this.stopWebRTC}
            >
              <Icon name="external" />
              {`Leave Video Chat`}
            </Button>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '8px',
                width: '100%',
              }}
            >
              <Button
                color={this.getVideoWebRTC() ? 'green' : 'red'}
                fluid
                size="medium"
                icon
                labelPosition="left"
                onClick={this.toggleVideoWebRTC}
              >
                <Icon name="video" />
                {this.getVideoWebRTC() ? 'On' : 'Off'}
              </Button>
              <Button
                color={this.getAudioWebRTC() ? 'green' : 'red'}
                fluid
                size="medium"
                icon
                labelPosition="left"
                onClick={this.toggleAudioWebRTC}
              >
                <Icon
                  name={
                    this.getAudioWebRTC() ? 'microphone' : 'microphone slash'
                  }
                />
                {this.getAudioWebRTC() ? 'On' : 'Off'}
              </Button>
            </div>
          </div>
        )}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: '8px',
          }}
        >
          {participants.map((p) => {
            return (
              <div key={p.id}>
                <div
                  style={{
                    position: 'relative',
                    //marginLeft: '4px',
                  }}
                >
                  <div>
                    {this.ourStream && p.isVideoChat ? (
                      <video
                        ref={(el) => {
                          this.videoRefs[p.id] = el;
                        }}
                        style={videoChatContentStyle as any}
                        autoPlay
                        muted={p.id === socket.id}
                        data-id={p.id}
                      />
                    ) : (
                      <img
                        style={videoChatContentStyle as any}
                        // broken image: https://ui-avatars.com/api/?name=haidee&background=B03060&size=256&color=ffffff
                        src={
                          pictureMap[p.id] ||
                          getDefaultPicture(
                            nameMap[p.id],
                            getColorForStringHex(p.id)
                          )
                        }
                        alt=""
                      />
                    )}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '4px',
                        left: '0px',
                        width: '100%',
                        backgroundColor: 'rgba(0,0,0,0)',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 700,
                        display: 'flex',
                      }}
                    >
                      <div
                        title={nameMap[p.id] || p.id}
                        style={{
                          width: '80px',
                          backdropFilter: 'brightness(80%)',
                          padding: '4px',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          display: 'inline-block',
                        }}
                      >
                        {p.isVideoChat && <Icon size="small" name="video" />}
                        {nameMap[p.id] || p.id}
                      </div>
                      <div
                        style={{
                          backdropFilter: 'brightness(60%)',
                          padding: '4px',
                          flexGrow: 1,
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        {formatTimestamp(tsMap[p.id] || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
