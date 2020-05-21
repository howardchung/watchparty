import { Socket } from 'socket.io';

import { Room } from './room';
import { fetchYoutubeVideo, getYoutubeVideoID } from './utils/youtube';
import { PlaylistVideo } from '.';

class Connection {
  public socket: Socket;
  public room: Room;

  constructor(socket: Socket, room: Room) {
    this.socket = socket;
    this.room = room;
    this.room.roster.push({ id: socket.id });
    this.room.io.emit('roster', this.room.roster);
    this.emitInitEvents();
    this.setupSocketListeners();
  }

  emitInitEvents() {
    this.socket.emit('REC:host', this.room.getHostState());
    this.socket.emit('REC:nameMap', this.room.nameMap);
    this.socket.emit('REC:pictureMap', this.room.pictureMap);
    this.socket.emit('REC:tsMap', this.room.tsMap);
    this.socket.emit('chatinit', this.room.chat);
    this.socket.emit('playlistUpdate', this.room.videoPlaylist);
  }

  setupSocketListeners() {
    this.socket.on('CMD:name', this.setName);
    this.socket.on('CMD:picture', this.addPicture);
    this.socket.on('CMD:host', this.host);
    this.socket.on('CMD:addVideoToPlaylist', this.addVideoToPlaylist);
    this.socket.on('CMD:play', this.playVideo);
    this.socket.on('CMD:pause', this.pauseVideo);
    this.socket.on('CMD:seek', this.seekVideo);
    this.socket.on('CMD:ts', this.sendVideoTimestamp);
    this.socket.on('CMD:chat', this.sendChatMessage);
    this.socket.on('CMD:joinVideo', this.joinVideo);
    this.socket.on('CMD:leaveVideo', this.leaveVideo);
    this.socket.on('CMD:joinScreenShare', this.joinScreenShare);
    this.socket.on('CMD:leaveScreenShare', this.leaveScreenShare);
    this.socket.on('CMD:startVBrowser', this.startVBrowser);
    this.socket.on('CMD:stopVBrowser', this.stopVBrowser);
    this.socket.on('CMD:changeController', this.changeController);
    this.socket.on('CMD:askHost', this.askHost);
    this.socket.on('signal', this.emitSignal);
    this.socket.on('signalSS', this.emitSSSignal);
    this.socket.on('disconnect', this.disconnect);
  }

  setName = (data: string) => {
    if (!data || !this.socket) {
      return;
    }
    if (data && data.length > 100) {
      return;
    }
    this.room.nameMap[this.socket.id] = data;
    this.room.io.of(this.room.roomId).emit('REC:nameMap', this.room.nameMap);
  };

  addPicture = (data: string) => {
    if (data && data.length > 10000) {
      return;
    }
    this.room.pictureMap[this.socket.id] = data;
    this.room.io
      .of(this.room.roomId)
      .emit('REC:pictureMap', this.room.pictureMap);
  };

  host = (data: PlaylistVideo) => {
    const sharer = this.room.roster.find((user) => user.isScreenShare);
    if (sharer) {
      // Can't update the video while someone is screensharing
      return;
    }

    this.room.cmdHost(this.socket, data);
  };

  addVideoToPlaylist = async (data: string) => {
    if (!data) {
      return;
    }

    const youtubeVideoID = getYoutubeVideoID(data);
    let video: PlaylistVideo;

    if (youtubeVideoID) {
      video = await fetchYoutubeVideo(youtubeVideoID);
    } else {
      video = {
        name: data,
        url: data,
        img: undefined,
        duration: '',
        channel: '',
      };
    }

    if (!this.room.video) {
      this.room.cmdHost(this.socket, video);
    } else {
      this.room.videoPlaylist.push(video);
      this.socket.emit('playlistUpdate', this.room.videoPlaylist);
    }

    const chatMsg = {
      id: this.socket.id,
      cmd: 'addToPlaylist',
      msg: video,
    };

    this.room.addChatMessage(this.socket, chatMsg);
  };

  playVideo = () => {
    this.socket.broadcast.emit('REC:play', this.room.video);
    const chatMsg = {
      id: this.socket.id,
      cmd: 'play',
      msg: this.room.tsMap[this.socket.id],
    };
    this.room.paused = false;
    this.room.addChatMessage(this.socket, chatMsg);
  };

  pauseVideo = () => {
    this.socket.broadcast.emit('REC:pause');
    const chatMsg = {
      id: this.socket.id,
      cmd: 'pause',
      msg: this.room.tsMap[this.socket.id],
    };
    this.room.paused = true;
    this.room.addChatMessage(this.socket, chatMsg);
  };

  seekVideo = (time: number) => {
    this.room.videoTS = Math.ceil(time);
    this.socket.broadcast.emit('REC:seek', time);
    const chatMsg = { id: this.socket.id, cmd: 'seek', msg: time };
    this.room.addChatMessage(this.socket, chatMsg);
  };

  sendVideoTimestamp = (time: number) => {
    if (time > this.room.videoTS) {
      this.room.videoTS = Math.ceil(time);
    }
    this.room.tsMap[this.socket.id] = time;
  };

  sendChatMessage = (message: string) => {
    this.room.sendChatMessage(this.socket, message);
  };

  joinVideo = () => {
    const match = this.room.roster.find((user) =>
      this.socket ? user.id === this.socket.id : false
    );
    if (match) {
      match.isVideoChat = true;
    }
    this.room.io.of(this.room.roomId).emit('roster', this.room.roster);
  };

  leaveVideo = () => {
    const match = this.room.roster.find((user) =>
      this.socket ? user.id === this.socket.id : false
    );
    if (match) {
      match.isVideoChat = false;
    }
    this.room.io.of(this.room.roomId).emit('roster', this.room.roster);
  };

  joinScreenShare = (data: { file: boolean }) => {
    const sharer = this.room.roster.find((user) => user.isScreenShare);
    if (sharer) {
      return;
    }
    if (data && data.file) {
      this.room.cmdHost(this.socket, {
        url: 'fileshare://' + this.socket.id,
        channel: '',
        duration: '',
        name: 'Fileshare',
        img: undefined,
      });
    } else {
      this.room.cmdHost(this.socket, {
        url: 'screenshare://' + this.socket.id,
        channel: '',
        duration: '',
        name: 'Screenshare',
        img: undefined,
      });
    }
    const match = this.room.roster.find((user) =>
      this.socket ? user.id === this.socket.id : false
    );
    if (match) {
      match.isScreenShare = true;
    }
    this.room.io.of(this.room.roomId).emit('roster', this.room.roster);
  };

  leaveScreenShare = () => {
    const match = this.room.roster.find((user) =>
      this.socket ? user.id === this.socket.id : false
    );
    if (match) {
      match.isScreenShare = false;
    }
    this.room.cmdHost(this.socket);
    this.room.io.of(this.room.roomId).emit('roster', this.room.roster);
  };

  startVBrowser = () => {
    this.room.startVBrowser(this.socket);
  };

  stopVBrowser = () => {
    this.room.stopVBrowser(this.socket);
  };

  changeController = (data: string) => {
    this.room.roster.forEach((user, i) => {
      if (user.id === data) {
        this.room.roster[i].isController = true;
      } else {
        this.room.roster[i].isController = false;
      }
    });
    this.room.io.of(this.room.roomId).emit('roster', this.room.roster);
  };

  askHost = () => {
    this.socket.emit('REC:host', this.room.getHostState());
  };

  emitSignal = (data: { to: string; msg: string }) => {
    this.room.io
      .of(this.room.roomId)
      .to(data.to)
      .emit('signal', { from: this.socket.id, msg: data.msg });
  };

  emitSSSignal = (data: { to: string; sharer: boolean; msg: string }) => {
    this.room.io.of(this.room.roomId).to(data.to).emit('signalSS', {
      from: this.socket.id,
      sharer: data.sharer,
      msg: data.msg,
    });
  };

  disconnect = () => {
    let index = this.room.roster.findIndex((user) =>
      this.socket ? user.id === this.socket.id : false
    );
    const removed = this.room.roster.splice(index, 1)[0];
    this.room.io.of(this.room.roomId).emit('roster', this.room.roster);
    if (removed.isScreenShare) {
      // Reset the room state since we lost the screen sharer
      this.room.cmdHost(this.socket);
    }
    delete this.room.tsMap[this.socket.id];
    // delete nameMap[socket.id];
  };
}

export default Connection;
