import React from "react";
import { ActionIcon, Button } from "../UI/UI";
import { Socket } from "socket.io-client";

import {
  formatTimestamp,
  getOrCreateClientId,
  getColorForStringHex,
  getDefaultPicture,
  iceServers,
  softWhite,
} from "../../utils/utils";
import { UserMenu } from "../UserMenu/UserMenu";
import { MetadataContext } from "../../MetadataContext";
import {
  IconDotsVertical,
  IconMicrophone,
  IconScreenShare,
  IconVideo,
  IconX,
} from "../Icons/Icons";

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
    this.socket.on("signal", this.handleSignal);
  }

  componentWillUnmount() {
    this.socket.off("signal", this.handleSignal);
  }

  componentDidUpdate(prevProps: VideoChatProps) {
    if (this.props.rosterUpdateTS !== prevProps.rosterUpdateTS) {
      this.updateWebRTC();
    }
  }

  emitUserMute = () => {
    this.socket.emit("CMD:userMute", { isMuted: !this.getAudioWebRTC() });
  };

  handleSignal = async (data: any) => {
    const msg = data.msg;
    const from = data.from;
    let pc = window.watchparty.videoPCs[from];
    if (!pc) {
      return;
    }
    console.log("recv", from, data);
    if (msg.ice !== undefined) {
      pc.addIceCandidate(new RTCIceCandidate(msg.ice));
    } else if (msg.sdp && msg.sdp.type === "offer") {
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        pc.close();
        delete window.watchparty.videoPCs[from];
        this.updateWebRTC();
        pc = window.watchparty.videoPCs[from];
        if (!pc) {
          return;
        }
      }
      await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      this.sendSignal(from, { sdp: pc.localDescription });
    } else if (msg.sdp && msg.sdp.type === "answer") {
      pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    }
  };

  setupWebRTC = async () => {
    const black = ({ width = 640, height = 480 } = {}) => {
      const canvas: any = Object.assign(document.createElement("canvas"), {
        width,
        height,
      });
      canvas.getContext("2d")?.fillRect(0, 0, width, height);
      const stream = canvas.captureStream();
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
        console.log("attempt audio only stream");
        stream = await navigator?.mediaDevices?.getUserMedia({
          audio: true,
          video: false,
        });
      } catch (e) {
        console.warn(e);
      }
    }
    window.watchparty.ourStream = stream;
    this.socket.emit("CMD:joinVideo");
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
    this.socket.emit("CMD:leaveVideo");
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
      return;
    }
    const selfId = getOrCreateClientId();

    const clientIds = new Set(
      this.props.participants.filter((p) => p.isVideoChat).map((p) => p.id),
    );
    Object.entries(videoPCs).forEach(([key, value]) => {
      if (!clientIds.has(key)) {
        value.close();
        delete videoPCs[key];
      }
    });

    this.props.participants.forEach((user) => {
      const id = user.id;
      if (!user.isVideoChat || videoPCs[id]) {
        return;
      }
      if (id === selfId) {
        videoPCs[id] = new RTCPeerConnection();
        videoRefs[id].srcObject = ourStream;
      } else {
        const pc = new RTCPeerConnection({ iceServers: iceServers() });
        videoPCs[id] = pc;
        ourStream?.getTracks().forEach((track) => {
          if (ourStream) {
            pc.addTrack(track, ourStream);
          }
        });
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            this.sendSignal(id, { ice: event.candidate });
          }
        };
        pc.ontrack = (event: RTCTrackEvent) => {
          videoRefs[id].srcObject = event.streams[0];
        };
        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === "failed") {
            pc.close();
            delete videoPCs[id];
            this.updateWebRTC();
          }
        };
        const isOfferer = selfId < id;
        if (isOfferer) {
          pc.onnegotiationneeded = async () => {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            this.sendSignal(id, { sdp: pc.localDescription });
          };
        }
      }
    });
  };

  sendSignal = async (to: string, data: any) => {
    console.log("send", to, data);
    this.socket.emit("signal", { to, msg: data });
  };

  render() {
    const { participants, pictureMap, nameMap, tsMap, socket, owner } =
      this.props;
    const ourStream = window.watchparty.ourStream;
    const videoRefs = window.watchparty.videoRefs;
    const videoChatSize = participants.length > 2 ? 175 : 230;
    const videoChatContentStyle: React.CSSProperties = {
      height: videoChatSize,
      width: videoChatSize,
      objectFit: "cover",
      position: "relative",
      borderRadius: "var(--radius-md)",
      border: "1px solid var(--border-default)",
      display: "block",
    };
    const selfId = getOrCreateClientId();
    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "8px",
          padding: "8px",
        }}
      >
        {participants.map((p) => {
          return (
            <div key={p.id}>
              <div
                style={{
                  position: "relative",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
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
                          position: "absolute",
                          right: 6,
                          top: 6,
                          cursor: "pointer",
                          zIndex: 2,
                          visibility: Boolean(
                            owner && owner === this.context.user?.uid,
                          )
                            ? "visible"
                            : "hidden",
                        }}
                      />
                    }
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "4px",
                      position: "absolute",
                      top: 6,
                      left: 6,
                      zIndex: 2,
                    }}
                  >
                    {!ourStream && p.id === selfId && (
                      <Button
                        size="xs"
                        color="purple"
                        onClick={this.setupWebRTC}
                        leftSection={<IconVideo size={14} />}
                      >
                        Join
                      </Button>
                    )}
                    {ourStream && p.id === selfId && (
                      <Button
                        size="xs"
                        color="red"
                        onClick={this.stopWebRTC}
                        leftSection={<IconX size={14} />}
                      >
                        Leave
                      </Button>
                    )}
                    {ourStream && p.id === selfId && (
                      <>
                        <ActionIcon
                          size="sm"
                          color={this.getVideoWebRTC() ? "green" : "red"}
                          onClick={this.toggleVideoWebRTC}
                        >
                          <IconVideo size={15} />
                        </ActionIcon>
                        <ActionIcon
                          size="sm"
                          color={this.getAudioWebRTC() ? "green" : "red"}
                          onClick={this.toggleAudioWebRTC}
                        >
                          <IconMicrophone size={15} />
                        </ActionIcon>
                      </>
                    )}
                    {p.id !== selfId && (
                      <>
                        {p.isVideoChat && <IconVideo color={softWhite} />}
                        {p.isVideoChat && (
                          <IconMicrophone
                            color={p.isMuted ? "var(--accent-danger)" : softWhite}
                          />
                        )}
                      </>
                    )}
                    {p.isScreenShare && <IconScreenShare color={softWhite} />}
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: "6px",
                      left: "6px",
                      right: "6px",
                      color: softWhite,
                      borderRadius: "var(--radius-sm)",
                      overflow: "hidden",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "flex",
                      zIndex: 2,
                    }}
                  >
                    <div
                      title={nameMap[p.id] || p.id}
                      style={{
                        background: "rgba(9, 11, 16, 0.78)",
                        backdropFilter: "blur(6px)",
                        padding: "4px 6px",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        display: "inline-block",
                      }}
                    >
                      {nameMap[p.id] || p.id}
                    </div>
                    <div
                      style={{
                        background: "rgba(17, 21, 30, 0.88)",
                        backdropFilter: "blur(6px)",
                        padding: "4px 6px",
                        flexGrow: 1,
                        display: "flex",
                        justifyContent: "center",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {formatTimestamp(tsMap[p.id] || 0)}
                    </div>
                  </div>
                  {ourStream && p.isVideoChat ? (
                    <video
                      ref={(el) => {
                        if (el) {
                          videoRefs[p.id] = el;
                        }
                      }}
                      style={{
                        ...videoChatContentStyle,
                        transform: `scaleX(${p.id === selfId ? "-1" : "1"})`,
                      }}
                      autoPlay
                      muted={p.id === selfId}
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
                      alt=""
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
