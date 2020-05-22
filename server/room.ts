import { Socket } from 'socket.io';

import Connection from './connection';
import { assignVM, resetVM } from './vm';
import { ChatMessage, NumberDict, PlaylistVideo, StringDict, User } from '.';

export class Room {
  public tsInterval: NodeJS.Timeout;
  public playlistInterval: NodeJS.Timeout;
  public io: SocketIO.Server;
  public nameMap: StringDict = {};
  public pictureMap: StringDict = {};
  public roster: User[] = [];
  public roomId: string;
  public video?: string;
  public videoDuration?: number;
  public videoTS = 0;
  public videoPlaylist: PlaylistVideo[] = [];
  public paused = false;
  public chat: ChatMessage[] = [];
  public tsMap: NumberDict = {};
  public vBrowser:
    | { assignTime?: number; pass?: string; host?: string; id?: string }
    | undefined = undefined;
  public connections: Connection[] = [];

  constructor(
    io: SocketIO.Server,
    roomId: string,
    roomData?: string | null | undefined
  ) {
    this.roomId = roomId;
    this.io = io;

    if (roomData) {
      this.deserialize(roomData);
    }

    this.tsInterval = setInterval(() => {
      io.of(roomId).emit('REC:tsMap', this.tsMap);
    }, 1000);

    this.playlistInterval = setInterval(() => {
      if (
        this.videoDuration !== 0 &&
        this.videoDuration &&
        this.videoTS >= this.videoDuration
      ) {
        setTimeout(() => {
          this.nextVideo();
        }, 1000);
      }
    }, 1000);

    io.of(roomId).on('connection', (socket: Socket) => {
      this.connections.push(new Connection(socket, this));
    });
  }

  removeConnection = (socketId: string) => {
    this.connections = this.connections.filter(
      (connection) => connection.socket.id !== socketId
    );
  };

  nextVideo = () => {
    this.video = undefined;

    if (this.videoPlaylist.length > 0) {
      const nextVideo = this.videoPlaylist[0];
      this.startVideo(nextVideo);
    }
  };

  sendChatMessage = (socket: Socket, message: string) => {
    if ((message && message.length > 65536) || !socket) {
      // TODO add some validation on client side too so we don't just drop long messages
      return;
    }
    if (process.env.NODE_ENV === 'development' && message === '/clear') {
      this.chat.length = 0;
      this.io.of(this.roomId).emit('chatinit', this.chat);
      return;
    }
    const chatMsg = { id: socket.id, msg: message };
    this.addChatMessage(socket, chatMsg);
  };

  startVBrowser = async (socket: Socket) => {
    if (this.vBrowser || !socket) {
      // Maybe terminate the existing instance and spawn a new one
      return;
    }
    this.cmdHost(socket, {
      url: 'vbrowser://',
      channel: '',
      duration: 0,
      durationObject: { h: 0, m: 0, s: 0 },
      name: 'Virtual Browser',
      img: undefined,
    });
    this.vBrowser = {};
    const assignment = await assignVM();
    if (!assignment) {
      this.cmdHost(socket);
      this.vBrowser = undefined;
      return;
    }
    const { pass, host, id } = assignment;
    this.vBrowser.assignTime = Number(new Date());
    this.vBrowser.pass = pass;
    this.vBrowser.host = host;
    this.vBrowser.id = id;
    this.roster.forEach((user, i) => {
      if (socket ? user.id === socket.id : false) {
        this.roster[i].isController = true;
      } else {
        this.roster[i].isController = false;
      }
    });
    this.cmdHost(socket, {
      url: 'vbrowser://' + this.vBrowser.pass + '@' + this.vBrowser.host,
      channel: '',
      duration: 0,
      durationObject: { h: 0, m: 0, s: 0 },
      name: 'Screenshare',
      img: undefined,
    });
    this.io.of(this.roomId).emit('roster', this.roster);
  };

  async stopVBrowser(socket: Socket) {
    const id = this.vBrowser && this.vBrowser.id;
    this.vBrowser = undefined;
    this.roster.forEach((user, i) => {
      this.roster[i].isController = false;
    });
    if (this.videoPlaylist.length > 0) {
      this.nextVideo();
    } else {
      this.cmdHost(socket);
    }
    if (id) {
      try {
        await resetVM(id);
      } catch (e) {
        console.error(e);
      }
    }
  }

  serialize() {
    return JSON.stringify({
      video: this.video,
      videoDuration: this.videoDuration,
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
    this.videoDuration = roomObj.videoDuration;
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
      videoDuration: this.videoDuration,
      videoTS: this.videoTS,
      paused: this.paused,
    };
  }

  startVideo = (data?: PlaylistVideo) => {
    // remove next hosted video from the playlist
    if (data) {
      const videoIndex = this.videoPlaylist.findIndex(
        (video) => video.url === data.url
      );
      if (videoIndex !== -1) {
        this.videoPlaylist.splice(videoIndex, 1);
        this.io.of(this.roomId).emit('playlistUpdate', this.videoPlaylist);
      }
    }

    this.video = data ? data.url : '';
    this.videoTS = 0;
    this.videoDuration = data ? data.duration : 0;
    this.paused = false;
    this.tsMap = {};
    this.io.of(this.roomId).emit('REC:tsMap', this.tsMap);
    this.io.of(this.roomId).emit('REC:host', this.getHostState());
  };

  cmdHost(
    socket: Socket,
    data?: PlaylistVideo,
    options = { skipMessage: false }
  ) {
    if (!socket) {
      return;
    }

    this.startVideo(data);

    if (socket && data && !options.skipMessage) {
      const chatMsg = { id: socket.id, cmd: 'host', msg: data };
      this.addChatMessage(socket, chatMsg);
    }
  }

  addChatMessage(socket: Socket, chatMsg: any) {
    if (!socket) {
      return;
    }

    const chatWithTime: ChatMessage = {
      ...chatMsg,
      timestamp: new Date().toISOString(),
      videoTS: this.tsMap[socket.id],
    };
    this.chat.push(chatWithTime);
    this.chat = this.chat.splice(-100);
    this.io.of(this.roomId).emit('REC:chat', chatWithTime);
  }
}
