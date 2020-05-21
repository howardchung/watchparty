import { Socket } from 'socket.io';

import { assignVM, resetVM } from './vm';
import { ChatMessage, NumberDict, StringDict, User } from '.';

module.exports = class Room {
  private video = '';
  private videoTS = 0;
  private videoPlaylist: string[] = [];
  private paused = false;
  private roster: User[] = [];
  private chat: ChatMessage[] = [];
  private tsMap: NumberDict = {};
  private nameMap: StringDict = {};
  private pictureMap: StringDict = {};
  private vBrowser:
    | { assignTime?: number; pass?: string; host?: string; id?: string }
    | undefined = undefined;
  private io: SocketIO.Server;
  private socket?: Socket;
  public roomId: string;

  constructor(io: SocketIO.Server, roomId: string, roomData: string) {
    this.roomId = roomId;
    this.io = io;

    if (roomData) {
      this.deserialize(roomData);
    }

    setInterval(() => {
      io.of(roomId).emit('REC:tsMap', this.tsMap);
    }, 1000);

    io.of(roomId).on('connection', (socket: Socket) => {
      this.socket = socket;
      this.roster.push({ id: this.socket.id });

      socket.emit('REC:host', this.getHostState());
      socket.emit('REC:nameMap', this.nameMap);
      socket.emit('REC:pictureMap', this.pictureMap);
      socket.emit('REC:tsMap', this.tsMap);
      socket.emit('chatinit', this.chat);
      io.of(roomId).emit('roster', this.roster);

      socket.on('CMD:name', this.setName);
      socket.on('CMD:picture', this.addPicture);
      socket.on('CMD:host', this.host);
      socket.on('CMD:addVideoToPlaylist', this.addVideoToPlaylist);
      socket.on('CMD:play', this.playVideo);
      socket.on('CMD:pause', this.pauseVideo);
      socket.on('CMD:seek', this.seekVideo);
      socket.on('CMD:ts', this.sendVideoTimestamp);
      socket.on('CMD:chat', this.sendChatMessage);
      socket.on('CMD:joinVideo', this.joinVideo);
      socket.on('CMD:leaveVideo', this.leaveVideo);
      socket.on('CMD:joinScreenShare', this.joinScreenShare);
      socket.on('CMD:leaveScreenShare', this.leaveScreenShare);
      socket.on('CMD:startVBrowser', this.startVBrowser);
      socket.on('CMD:stopVBrowser', this.stopVBrowser);
      socket.on('CMD:changeController', this.changeController);
      socket.on('CMD:askHost', this.askHost);
      socket.on('signal', this.emitSignal);
      socket.on('signalSS', this.emitSSSignal);
      socket.on('disconnect', this.disconnect);
    });
  }

  setName = (data: string) => {
    if (!data || !this.socket) {
      return;
    }
    if (data && data.length > 100) {
      return;
    }
    this.nameMap[this.socket.id] = data;
    this.io.of(this.roomId).emit('REC:nameMap', this.nameMap);
  };

  addPicture = (data: string) => {
    if (!this.socket) {
      return;
    }

    if (data && data.length > 10000) {
      return;
    }
    this.pictureMap[this.socket.id] = data;
    this.io.of(this.roomId).emit('REC:pictureMap', this.pictureMap);
  };

  host = (data: string) => {
    if (!this.socket) {
      return;
    }

    if (data && data.length > 20000) {
      return;
    }
    const sharer = this.roster.find((user) => user.isScreenShare);
    if (sharer) {
      // Can't update the video while someone is screensharing
      return;
    }
    this.cmdHost(this.socket, data);
  };

  addVideoToPlaylist = (data: string) => {
    console.log(data);
    if (!this.socket || !data) {
      return;
    }

    this.videoPlaylist.push(data);
    console.log(this.videoPlaylist);

    if (!this.video) {
      this.video = this.videoPlaylist[0] || '';
    }

    const chatMsg = {
      id: this.socket.id,
      cmd: 'addToPlaylist',
      msg: this.tsMap[this.socket.id],
    };

    this.addChatMessage(chatMsg);
  };

  playVideo = () => {
    if (!this.socket) {
      return;
    }

    this.socket.broadcast.emit('REC:play', this.video);
    const chatMsg = {
      id: this.socket.id,
      cmd: 'play',
      msg: this.tsMap[this.socket.id],
    };
    this.paused = false;
    this.addChatMessage(chatMsg);
  };

  pauseVideo = () => {
    if (!this.socket) {
      return;
    }

    this.socket.broadcast.emit('REC:pause');
    const chatMsg = {
      id: this.socket.id,
      cmd: 'pause',
      msg: this.tsMap[this.socket.id],
    };
    this.paused = true;
    this.addChatMessage(chatMsg);
  };

  seekVideo = (time: number) => {
    if (!this.socket) {
      return;
    }

    this.videoTS = time;
    this.socket.broadcast.emit('REC:seek', time);
    const chatMsg = { id: this.socket.id, cmd: 'seek', msg: time };
    this.addChatMessage(chatMsg);
  };

  sendVideoTimestamp = (time: number) => {
    if (!this.socket) {
      return;
    }

    if (time > this.videoTS) {
      this.videoTS = time;
    }
    this.tsMap[this.socket.id] = time;
  };

  sendChatMessage = (message: string) => {
    if ((message && message.length > 65536) || !this.socket) {
      // TODO add some validation on client side too so we don't just drop long messages
      return;
    }
    if (process.env.NODE_ENV === 'development' && message === '/clear') {
      this.chat.length = 0;
      this.io.of(this.roomId).emit('chatinit', this.chat);
      return;
    }
    const chatMsg = { id: this.socket.id, msg: message };
    this.addChatMessage(chatMsg);
  };

  joinVideo = () => {
    if (!this.socket) {
      return;
    }

    const match = this.roster.find((user) =>
      this.socket ? user.id === this.socket.id : false
    );
    if (match) {
      match.isVideoChat = true;
    }
    this.io.of(this.roomId).emit('roster', this.roster);
  };

  leaveVideo = () => {
    if (!this.socket) {
      return;
    }

    const match = this.roster.find((user) =>
      this.socket ? user.id === this.socket.id : false
    );
    if (match) {
      match.isVideoChat = false;
    }
    this.io.of(this.roomId).emit('roster', this.roster);
  };

  joinScreenShare = (data: { file: boolean }) => {
    if (!this.socket) {
      return;
    }

    const sharer = this.roster.find((user) => user.isScreenShare);
    if (sharer) {
      return;
    }
    if (data && data.file) {
      this.cmdHost(this.socket, 'fileshare://' + this.socket.id);
    } else {
      this.cmdHost(this.socket, 'screenshare://' + this.socket.id);
    }
    const match = this.roster.find((user) =>
      this.socket ? user.id === this.socket.id : false
    );
    if (match) {
      match.isScreenShare = true;
    }
    this.io.of(this.roomId).emit('roster', this.roster);
  };

  leaveScreenShare = () => {
    if (!this.socket) {
      return;
    }

    const match = this.roster.find((user) =>
      this.socket ? user.id === this.socket.id : false
    );
    if (match) {
      match.isScreenShare = false;
    }
    this.cmdHost(this.socket, '');
    this.io.of(this.roomId).emit('roster', this.roster);
  };

  startVBrowser = async () => {
    if (this.vBrowser || !this.socket) {
      // Maybe terminate the existing instance and spawn a new one
      return;
    }
    this.cmdHost(this.socket, 'vbrowser://');
    this.vBrowser = {};
    const assignment = await assignVM();
    if (!assignment) {
      this.cmdHost(this.socket, '');
      this.vBrowser = undefined;
      return;
    }
    const { pass, host, id } = assignment;
    this.vBrowser.assignTime = Number(new Date());
    this.vBrowser.pass = pass;
    this.vBrowser.host = host;
    this.vBrowser.id = id;
    this.roster.forEach((user, i) => {
      if (this.socket ? user.id === this.socket.id : false) {
        this.roster[i].isController = true;
      } else {
        this.roster[i].isController = false;
      }
    });
    this.cmdHost(
      undefined,
      'vbrowser://' + this.vBrowser.pass + '@' + this.vBrowser.host
    );
    this.io.of(this.roomId).emit('roster', this.roster);
  };

  changeController = (data: string) => {
    if (!this.socket) {
      return;
    }

    this.roster.forEach((user, i) => {
      if (user.id === data) {
        this.roster[i].isController = true;
      } else {
        this.roster[i].isController = false;
      }
    });
    this.io.of(this.roomId).emit('roster', this.roster);
  };

  askHost = () => {
    if (!this.socket) {
      return;
    }

    this.socket.emit('REC:host', this.getHostState());
  };

  emitSignal = (data: { to: string; msg: string }) => {
    if (!this.socket) {
      return;
    }

    this.io
      .of(this.roomId)
      .to(data.to)
      .emit('signal', { from: this.socket.id, msg: data.msg });
  };

  emitSSSignal = (data: { to: string; sharer: boolean; msg: string }) => {
    if (!this.socket) {
      return;
    }

    this.io.of(this.roomId).to(data.to).emit('signalSS', {
      from: this.socket.id,
      sharer: data.sharer,
      msg: data.msg,
    });
  };

  disconnect = () => {
    if (!this.socket) {
      return;
    }

    let index = this.roster.findIndex((user) =>
      this.socket ? user.id === this.socket.id : false
    );
    const removed = this.roster.splice(index, 1)[0];
    this.io.of(this.roomId).emit('roster', this.roster);
    if (removed.isScreenShare) {
      // Reset the room state since we lost the screen sharer
      this.cmdHost(this.socket, '');
    }
    delete this.tsMap[this.socket.id];
    // delete nameMap[socket.id];
  };

  serialize() {
    return JSON.stringify({
      video: this.video,
      videoTS: this.videoTS,
      paused: this.paused,
      nameMap: this.nameMap,
      pictureMap: this.pictureMap,
      chat: this.chat,
      vBrowser: this.vBrowser,
    });
  }

  deserialize(roomData: string) {
    const roomObj = JSON.parse(roomData);
    this.video = roomObj.video;
    this.videoTS = roomObj.videoTS;
    this.paused = roomObj.paused;
    if (roomObj.chat) {
      this.chat = roomObj.chat;
    }
    if (roomObj.nameMap) {
      this.nameMap = roomObj.nameMap;
    }
    if (roomObj.pictureMap) {
      this.pictureMap = roomObj.pictureMap;
    }
    if (roomObj.vBrowser) {
      this.vBrowser = roomObj.vBrowser;
    }
  }

  getHostState() {
    return {
      video: this.video,
      videoTS: this.videoTS,
      paused: this.paused,
    };
  }

  async stopVBrowser() {
    const id = this.vBrowser && this.vBrowser.id;
    this.vBrowser = undefined;
    this.roster.forEach((user, i) => {
      this.roster[i].isController = false;
    });
    this.cmdHost(undefined, '');
    if (id) {
      try {
        await resetVM(id);
      } catch (e) {
        console.error(e);
      }
    }
  }

  cmdHost(socket: Socket | undefined, data: string) {
    this.video = data;
    this.videoTS = 0;
    this.paused = false;
    this.tsMap = {};
    this.io.of(this.roomId).emit('REC:tsMap', this.tsMap);
    this.io.of(this.roomId).emit('REC:host', this.getHostState());
    if (socket && data) {
      const chatMsg = { id: socket.id, cmd: 'host', msg: data };
      this.addChatMessage(chatMsg);
    }
  }

  addChatMessage(chatMsg: any) {
    if (!this.socket) {
      return;
    }

    const chatWithTime: ChatMessage = {
      ...chatMsg,
      timestamp: new Date().toISOString(),
      videoTS: this.tsMap[this.socket.id],
    };
    this.chat.push(chatWithTime);
    this.chat = this.chat.splice(-100);
    this.io.of(this.roomId).emit('REC:chat', chatWithTime);
  }
};
