import { Socket } from 'socket.io';

import { Room } from './room';
import { fetchYoutubeVideo, getYoutubeVideoID } from './utils/youtube';
import { assignVM, resetVM } from './vm';
import { PlaylistVideo } from '.';

class Connection {
  private socket: Socket;
  private room: Room;

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
    if (!this.socket) {
      return;
    }

    if (data && data.length > 10000) {
      return;
    }
    this.room.pictureMap[this.socket.id] = data;
    this.room.io
      .of(this.room.roomId)
      .emit('REC:pictureMap', this.room.pictureMap);
  };

  host = (data: string | PlaylistVideo) => {
    if (!this.socket) {
      return;
    }

    if (data && typeof data === 'string' && data.length > 20000) {
      return;
    }

    const sharer = this.room.roster.find((user) => user.isScreenShare);
    if (sharer) {
      // Can't update the video while someone is screensharing
      return;
    }
    this.room.cmdHost(this.socket, data);
  };

  addVideoToPlaylist = async (data: string) => {
    if (!this.socket || !data) {
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
      };
    }

    this.room.videoPlaylist.push(video);
    console.log(this.room.videoPlaylist);

    if (!this.room.video) {
      this.room.video = this.room.videoPlaylist[0] || '';
      this.room.cmdHost(this.socket, this.room.video);
    }

    const chatMsg = {
      id: this.socket.id,
      cmd: 'addToPlaylist',
      msg: video,
    };

    this.room.addChatMessage(this.socket, chatMsg);
  };

  playVideo = () => {
    if (!this.socket) {
      return;
    }

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
    if (!this.socket) {
      return;
    }

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
    if (!this.socket) {
      return;
    }

    this.room.videoTS = time;
    this.socket.broadcast.emit('REC:seek', time);
    const chatMsg = { id: this.socket.id, cmd: 'seek', msg: time };
    this.room.addChatMessage(this.socket, chatMsg);
  };

  sendVideoTimestamp = (time: number) => {
    if (!this.socket) {
      return;
    }

    if (time > this.room.videoTS) {
      this.room.videoTS = time;
    }
    this.room.tsMap[this.socket.id] = time;
  };

  sendChatMessage = (message: string) => {
    if ((message && message.length > 65536) || !this.socket) {
      // TODO add some validation on client side too so we don't just drop long messages
      return;
    }
    if (process.env.NODE_ENV === 'development' && message === '/clear') {
      this.room.chat.length = 0;
      this.room.io.of(this.room.roomId).emit('chatinit', this.room.chat);
      return;
    }
    const chatMsg = { id: this.socket.id, msg: message };
    this.room.addChatMessage(this.socket, chatMsg);
  };

  joinVideo = () => {
    if (!this.socket) {
      return;
    }

    const match = this.room.roster.find((user) =>
      this.socket ? user.id === this.socket.id : false
    );
    if (match) {
      match.isVideoChat = true;
    }
    this.room.io.of(this.room.roomId).emit('roster', this.room.roster);
  };

  leaveVideo = () => {
    if (!this.socket) {
      return;
    }

    const match = this.room.roster.find((user) =>
      this.socket ? user.id === this.socket.id : false
    );
    if (match) {
      match.isVideoChat = false;
    }
    this.room.io.of(this.room.roomId).emit('roster', this.room.roster);
  };

  joinScreenShare = (data: { file: boolean }) => {
    if (!this.socket) {
      return;
    }

    const sharer = this.room.roster.find((user) => user.isScreenShare);
    if (sharer) {
      return;
    }
    if (data && data.file) {
      this.room.cmdHost(this.socket, 'fileshare://' + this.socket.id);
    } else {
      this.room.cmdHost(this.socket, 'screenshare://' + this.socket.id);
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
    if (!this.socket) {
      return;
    }

    const match = this.room.roster.find((user) =>
      this.socket ? user.id === this.socket.id : false
    );
    if (match) {
      match.isScreenShare = false;
    }
    this.room.cmdHost(this.socket, '');
    this.room.io.of(this.room.roomId).emit('roster', this.room.roster);
  };

  startVBrowser = async () => {
    if (this.room.vBrowser || !this.socket) {
      // Maybe terminate the existing instance and spawn a new one
      return;
    }
    this.room.cmdHost(this.socket, 'vbrowser://');
    this.room.vBrowser = {};
    const assignment = await assignVM();
    if (!assignment) {
      this.room.cmdHost(this.socket, '');
      this.room.vBrowser = undefined;
      return;
    }
    const { pass, host, id } = assignment;
    this.room.vBrowser.assignTime = Number(new Date());
    this.room.vBrowser.pass = pass;
    this.room.vBrowser.host = host;
    this.room.vBrowser.id = id;
    this.room.roster.forEach((user, i) => {
      if (this.socket ? user.id === this.socket.id : false) {
        this.room.roster[i].isController = true;
      } else {
        this.room.roster[i].isController = false;
      }
    });
    this.room.cmdHost(
      this.socket,
      'vbrowser://' + this.room.vBrowser.pass + '@' + this.room.vBrowser.host
    );
    this.room.io.of(this.room.roomId).emit('roster', this.room.roster);
  };

  async stopVBrowser() {
    const id = this.room.vBrowser && this.room.vBrowser.id;
    this.room.vBrowser = undefined;
    this.room.roster.forEach((user, i) => {
      this.room.roster[i].isController = false;
    });
    this.room.cmdHost(this.socket, '');
    if (id) {
      try {
        await resetVM(id);
      } catch (e) {
        console.error(e);
      }
    }
  }

  changeController = (data: string) => {
    if (!this.socket) {
      return;
    }

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
    if (!this.socket) {
      return;
    }

    this.socket.emit('REC:host', this.room.getHostState());
  };

  emitSignal = (data: { to: string; msg: string }) => {
    if (!this.socket) {
      return;
    }

    this.room.io
      .of(this.room.roomId)
      .to(data.to)
      .emit('signal', { from: this.socket.id, msg: data.msg });
  };

  emitSSSignal = (data: { to: string; sharer: boolean; msg: string }) => {
    if (!this.socket) {
      return;
    }

    this.room.io.of(this.room.roomId).to(data.to).emit('signalSS', {
      from: this.socket.id,
      sharer: data.sharer,
      msg: data.msg,
    });
  };

  disconnect = () => {
    if (!this.socket) {
      return;
    }

    let index = this.room.roster.findIndex((user) =>
      this.socket ? user.id === this.socket.id : false
    );
    const removed = this.room.roster.splice(index, 1)[0];
    this.room.io.of(this.room.roomId).emit('roster', this.room.roster);
    if (removed.isScreenShare) {
      // Reset the room state since we lost the screen sharer
      this.room.cmdHost(this.socket, '');
    }
    delete this.room.tsMap[this.socket.id];
    // delete nameMap[socket.id];
  };
}

export default Connection;
