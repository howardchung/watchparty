import { Socket } from 'socket.io';

import Connection from './connection';
import { getVideoDuration } from './utils/youtube';
import { assignVM, resetVM } from './vm';
import { ChatMessage, NumberDict, PlaylistVideo, StringDict, User } from '.';

export class Room {
  public roomInterval: NodeJS.Timeout;
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

    this.roomInterval = setInterval(() => {
      io.of(roomId).emit('REC:tsMap', this.tsMap);
      console.log(this.videoDuration, this.videoTS);
      if (this.videoDuration && this.videoTS >= this.videoDuration) {
        setTimeout(() => {
          this.nextVideo();
        }, 1000);
      }
    }, 1000);

    io.of(roomId).on('connection', (socket: Socket) => {
      this.connections.push(new Connection(socket, this));
    });
  }

  nextVideo() {
    this.video = undefined;

    if (this.videoPlaylist.length > 0) {
      const nextVideo = this.videoPlaylist.splice(0, 1);
      this.video = nextVideo[0].url;
      for (const connection of this.connections) {
        connection.socket.emit('playlistUpdate', this.videoPlaylist);
        this.cmdHost(connection.socket, nextVideo[0]);
      }
    }
  }

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
      duration: '',
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
      duration: '',
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
    this.cmdHost(socket);
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

  cmdHost(socket: Socket, data?: PlaylistVideo) {
    if (!socket) {
      return;
    }

    if (data) {
      // remove next hosted video from the playlist
      this.videoPlaylist = this.videoPlaylist.filter(
        (video) => video.url !== data.url
      );
      socket.emit('playlistUpdate', this.videoPlaylist);
    }

    this.video = data ? data.url : '';
    this.videoTS = 0;
    this.videoDuration = data ? getVideoDuration(data.duration) : 0;
    this.paused = false;
    this.tsMap = {};
    this.io.of(this.roomId).emit('REC:tsMap', this.tsMap);
    this.io.of(this.roomId).emit('REC:host', this.getHostState());
    if (socket && data) {
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
