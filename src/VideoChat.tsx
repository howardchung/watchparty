import React from 'react';
import { Button, Icon } from 'semantic-ui-react';
import {
  getDefaultPicture,
  getColorHex,
  formatTimestamp,
  iceServers,
} from './utils';

interface VideoChatProps {
  socket: any;
  participants: User[];
  pictureMap: StringDict;
  nameMap: StringDict;
  tsMap: NumberDict;
  rosterUpdateTS: Number;
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
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
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
    Object.values(this.videoPCs).forEach((pc) => {
      pc.close();
    });
    this.videoPCs = {};
    this.socket.emit('CMD:leaveVideo');
  };

  toggleVideoWebRTC = () => {
    if (this.ourStream) {
      this.ourStream.getVideoTracks()[0].enabled = !this.ourStream.getVideoTracks()[0]
        .enabled;
    }
  };

  getVideoWebRTC = () => {
    return this.ourStream && this.ourStream.getVideoTracks()[0].enabled;
  };

  toggleAudioWebRTC = () => {
    if (this.ourStream) {
      this.ourStream.getAudioTracks()[0].enabled = !this.ourStream.getAudioTracks()[0]
        .enabled;
    }
  };

  getAudioWebRTC = () => {
    return (
      this.ourStream &&
      this.ourStream.getAudioTracks()[0] &&
      this.ourStream.getAudioTracks()[0].enabled
    );
  };

  updateWebRTC = () => {
    // TODO teardown connections to people who leave
    if (!this.ourStream) {
      // We haven't started video chat, exit
      return;
    }
    this.props.participants.forEach((user) => {
      const id = user.id;
      if (!user.isVideoChat || this.videoPCs[id]) {
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
    return (
      <div
        style={{
          display: 'flex',
          width: '100%',
          paddingLeft: '1em',
          overflowX: 'scroll',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '140px',
            justifyContent: 'center',
          }}
        >
          {!this.ourStream && (
            <Button
              //fluid
              color={'purple'}
              circular
              size="big"
              icon
              //labelPosition="left"
              onClick={this.setupWebRTC}
            >
              <Icon name="video" />
              {/* {`Join`} */}
            </Button>
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
                size="tiny"
                icon
                labelPosition="left"
                onClick={this.stopWebRTC}
              >
                <Icon name="external" />
                {`Leave`}
              </Button>
              <Button
                fluid
                color={this.getVideoWebRTC() ? 'green' : 'red'}
                size="tiny"
                icon
                labelPosition="left"
                onClick={this.toggleVideoWebRTC}
              >
                <Icon name="video" />
                {this.getVideoWebRTC() ? 'On' : 'Off'}
              </Button>
              <Button
                fluid
                color={this.getAudioWebRTC() ? 'green' : 'red'}
                size="tiny"
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
          )}
        </div>
        <div style={{ display: 'flex' }}>
          {participants.map((p) => {
            return (
              <div key={p.id}>
                <div
                  style={{
                    position: 'relative',
                    marginLeft: '4px',
                  }}
                >
                  <div>
                    {this.ourStream && p.isVideoChat ? (
                      <video
                        ref={(el) => {
                          this.videoRefs[p.id] = el;
                        }}
                        className="videoChatContent"
                        autoPlay
                        muted={p.id === socket.id}
                        data-id={p.id}
                      />
                    ) : (
                      <img
                        className="videoChatContent"
                        src={
                          pictureMap[p.id] ||
                          getDefaultPicture(nameMap[p.id], getColorHex(p.id))
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
                        backgroundColor: '#' + getColorHex(p.id),
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
