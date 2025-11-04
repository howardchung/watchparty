import React from 'react';
import { ActionIcon, Button } from '@mantine/core';
import { Socket } from 'socket.io-client';

import {
  formatTimestamp,
  getOrCreateClientId,
  getColorForStringHex,
  getDefaultPicture,
  iceServers,
} from '../../utils';
import { UserMenu } from '../UserMenu/UserMenu';
import { MetadataContext } from '../../MetadataContext';
import {
  IconDotsVertical,
  IconMicrophone,
  IconScreenShare,
  IconVideo,
  IconX,
} from '@tabler/icons-react';

interface VideoChatProps {
  socket: Socket;
  participants: User[];
  pictureMap: StringDict;
  nameMap: StringDict;
  tsMap: NumberDict;
  rosterUpdateTS: Number;
  hide?: boolean;
  owner: string | undefined;
  getLeaderTime: () => number;
}

export class VideoChat extends React.Component<VideoChatProps> {
  static contextType = MetadataContext;
  declare context: React.ContextType<typeof MetadataContext>;

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

  emitUserMute = () => {
    this.socket.emit('CMD:userMute', { isMuted: !this.getAudioWebRTC() });
  };

  handleSignal = async (data: any) => {
    // Handle messages received from signaling server
    const msg = data.msg;
    const from = data.from;
    const pc = window.watchparty.videoPCs[from];
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
      stream = await navigator?.mediaDevices.getUserMedia({
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
    window.watchparty.ourStream = stream;
    // alert server we've joined video chat
    this.socket.emit('CMD:joinVideo');
    this.emitUserMute();
  };

  stopWebRTC = () => {
    const ourStream = window.watchparty.ourStream;
    const videoPCs = window.watchparty.videoPCs;
    ourStream &&
      ourStream.getTracks().forEach((track) => {
        track.stop();
      });
    window.watchparty.ourStream = undefined;
    Object.keys(videoPCs).forEach((key) => {
      videoPCs[key].close();
      delete videoPCs[key];
    });
    this.socket.emit('CMD:leaveVideo');
  };

  toggleVideoWebRTC = () => {
    const ourStream = window.watchparty.ourStream;
    if (ourStream && ourStream.getVideoTracks()[0]) {
      ourStream.getVideoTracks()[0].enabled =
        !ourStream.getVideoTracks()[0]?.enabled;
    }
    this.forceUpdate();
  };

  getVideoWebRTC = () => {
    const ourStream = window.watchparty.ourStream;
    return ourStream && ourStream.getVideoTracks()[0]?.enabled;
  };

  toggleAudioWebRTC = () => {
    const ourStream = window.watchparty.ourStream;
    if (ourStream && ourStream.getAudioTracks()[0]) {
      ourStream.getAudioTracks()[0].enabled =
        !ourStream.getAudioTracks()[0]?.enabled;
    }
    this.emitUserMute();
    this.forceUpdate();
  };

  getAudioWebRTC = () => {
    const ourStream = window.watchparty.ourStream;
    return (
      ourStream &&
      ourStream.getAudioTracks()[0] &&
      ourStream.getAudioTracks()[0].enabled
    );
  };

  updateWebRTC = () => {
    const ourStream = window.watchparty.ourStream;
    const videoPCs = window.watchparty.videoPCs;
    const videoRefs = window.watchparty.videoRefs;
    if (!ourStream) {
      // We haven't started video chat, exit
      return;
    }
    const selfId = getOrCreateClientId();

    // Delete and close any connections that aren't in the current member list (maybe someone disconnected)
    // This allows them to rejoin later
    const clientIds = new Set(
      this.props.participants
        .filter((p) => p.isVideoChat)
        .map((p) => p.clientId),
    );
    Object.entries(videoPCs).forEach(([key, value]) => {
      if (!clientIds.has(key)) {
        value.close();
        delete videoPCs[key];
      }
    });

    this.props.participants.forEach((user) => {
      const id = user.clientId;
      if (!user.isVideoChat || videoPCs[id]) {
        // User isn't in video chat, or we already have a connection to them
        return;
      }
      if (id === selfId) {
        videoPCs[id] = new RTCPeerConnection();
        videoRefs[id].srcObject = ourStream;
      } else {
        const pc = new RTCPeerConnection({ iceServers: iceServers() });
        videoPCs[id] = pc;
        // Add our own video as outgoing stream
        ourStream?.getTracks().forEach((track) => {
          if (ourStream) {
            pc.addTrack(track, ourStream);
          }
        });
        pc.onicecandidate = (event) => {
          // We generated an ICE candidate, send it to peer
          if (event.candidate) {
            this.sendSignal(id, { ice: event.candidate });
          }
        };
        pc.ontrack = (event: RTCTrackEvent) => {
          // Mount the stream from peer
          // console.log(stream);
          videoRefs[id].srcObject = event.streams[0];
        };
        // For each pair, have the lexicographically smaller ID be the offerer
        const isOfferer = selfId < id;
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
    const { participants, pictureMap, nameMap, tsMap, socket, owner } =
      this.props;
    const ourStream = window.watchparty.ourStream;
    const videoRefs = window.watchparty.videoRefs;
    const videoChatContentStyle: React.CSSProperties = {
      height: 190,
      width: 190,
      objectFit: 'cover',
      position: 'relative',
    };
    const selfId = getOrCreateClientId();
    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '4px',
          padding: '4px',
        }}
      >
        {participants.map((p) => {
          return (
            <div key={p.id}>
              <div
                style={{
                  position: 'relative',
                }}
              >
                <div>
                  <UserMenu
                    displayName={nameMap[p.id] || p.id}
                    disabled={
                      !Boolean(owner && owner === this.context.user?.uid)
                    }
                    socket={socket}
                    userToManage={p.id}
                    trigger={
                      <IconDotsVertical
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: 0,
                          cursor: 'pointer',
                          visibility: Boolean(
                            owner && owner === this.context.user?.uid,
                          )
                            ? 'visible'
                            : 'hidden',
                        }}
                      />
                    }
                  />
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '4px',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      zIndex: 1,
                    }}
                  >
                    {!ourStream && p.clientId === selfId && (
                      <Button
                        size="xs"
                        color={'purple'}
                        onClick={this.setupWebRTC}
                        leftSection={<IconVideo />}
                      >
                        Join
                      </Button>
                    )}
                    {ourStream && p.clientId === selfId && (
                      <Button
                        size="xs"
                        color={'red'}
                        onClick={this.stopWebRTC}
                        leftSection={<IconX />}
                      >
                        Leave
                      </Button>
                    )}
                    {ourStream && p.clientId === selfId && (
                      <>
                        <ActionIcon
                          color={this.getVideoWebRTC() ? 'green' : 'red'}
                          onClick={this.toggleVideoWebRTC}
                        >
                          <IconVideo />
                        </ActionIcon>
                        <ActionIcon
                          color={this.getAudioWebRTC() ? 'green' : 'red'}
                          onClick={this.toggleAudioWebRTC}
                        >
                          <IconMicrophone />
                        </ActionIcon>
                      </>
                    )}
                    {p.clientId !== selfId && (
                      <>
                        {p.isVideoChat && <IconVideo color="white" />}
                        {p.isVideoChat && (
                          <IconMicrophone color={p.isMuted ? 'red' : 'white'} />
                        )}
                      </>
                    )}
                    {p.isScreenShare && <IconScreenShare color="white" />}
                  </div>
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
                      zIndex: 1,
                    }}
                  >
                    <div
                      title={nameMap[p.id] || p.id}
                      style={{
                        backdropFilter: 'brightness(80%)',
                        padding: '4px',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        display: 'inline-block',
                      }}
                    >
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
                      {formatTimestamp(tsMap[p.id] || 0)}{' '}
                      {/* {this.context.beta &&
                          `(${(
                            (tsMap[p.id] - this.props.getLeaderTime()) *
                            1000
                          ).toFixed(0)}ms)`} */}
                    </div>
                  </div>
                  {ourStream && p.isVideoChat ? (
                    <video
                      ref={(el) => {
                        if (el) {
                          videoRefs[p.clientId] = el;
                        }
                      }}
                      style={{
                        ...videoChatContentStyle,
                        // mirror the video if it's our stream. this style mimics Zoom where your
                        // video is mirrored only for you)
                        transform: `scaleX(${
                          p.clientId === selfId ? '-1' : '1'
                        })`,
                      }}
                      autoPlay
                      muted={p.clientId === selfId}
                      data-id={p.id}
                    />
                  ) : (
                    <img
                      style={videoChatContentStyle}
                      src={
                        pictureMap[p.id] ||
                        getDefaultPicture(
                          nameMap[p.id],
                          getColorForStringHex(p.id),
                        )
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}
