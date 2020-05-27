import Redis from 'ioredis';
import { Socket } from 'socket.io';

import Connection from './connection';
import { findPlaylistVideoByUrl } from './utils';
import { redisCount } from './utils/redis';
import { AssignedVM, VMManager } from './vm/base';
import { ChatMessage, NumberDict, PlaylistVideo, StringDict, User } from '.';

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : undefined;

export class Room {
  private vmManager: VMManager;
  public chat: ChatMessage[] = [];
  public connections: Connection[] = [];
  public creationTime: Date = new Date();
  public io: SocketIO.Server;
  public isRoomDirty = false; // Indicates the room needs to be saved, e.g. we unassign a VM from an empty room
  public nameMap: StringDict = {};
  public paused = false;
  public pictureMap: StringDict = {};
  public playlistInterval: NodeJS.Timeout;
  public roomId: string;
  public roster: User[] = [];
  public tsInterval: NodeJS.Timeout;
  public tsMap: NumberDict = {};
  public vBrowser: AssignedVM | undefined = undefined;
  public video?: string;
  public videoDuration?: number;
  public videoPlaylist: PlaylistVideo[] = [];
  public videoTS = 0;

  constructor(
    io: SocketIO.Server,
    vmManager: VMManager,
    roomId: string,
    roomData?: string | null | undefined
  ) {
    this.roomId = roomId;
    this.io = io;
    this.vmManager = vmManager;

    if (roomData) {
      this.deserialize(roomData);
    }

    this.tsInterval = setInterval(() => {
      io.of(roomId).emit('REC:tsMap', this.tsMap);
    }, 1000);

    this.playlistInterval = setInterval(this.checkEndTime, 1000);

    io.of(roomId).on('connection', (socket: Socket) => {
      this.connections.push(new Connection(socket, this));
      redisCount('connectStarts');
    });
  }

  removeConnection = (socketId: string) => {
    this.connections = this.connections.filter(
      (connection) => connection.socket.id !== socketId
    );
  };

  checkEndTime = () => {
    if (
      this.videoDuration !== 0 &&
      this.videoDuration &&
      this.videoTS >= this.videoDuration
    ) {
      setTimeout(this.nextVideo, 1000);
    }
  };

  nextVideo = () => {
    this.video = undefined;

    if (this.videoPlaylist.length > 0) {
      const nextVideo = this.videoPlaylist[0];
      this.startVideo(nextVideo.url, nextVideo.duration);
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
    redisCount('vBrowserStarts');
    this.cmdHost(socket, 'vbrowser://');
    const assignment = await this.vmManager.assignVM();
    if (!assignment) {
      this.cmdHost(socket, '');
      this.vBrowser = undefined;
      return;
    }
    this.vBrowser = assignment;
    this.roster.forEach((user, i) => {
      if (user.id === socket.id) {
        this.roster[i].isController = true;
      } else {
        this.roster[i].isController = false;
      }
    });
    this.cmdHost(
      socket,
      'vbrowser://' + this.vBrowser.pass + '@' + this.vBrowser.host
    );
    this.io.of(this.roomId).emit('roster', this.roster);
  };

  async stopVBrowser(socket: Socket) {
    const assignTime = this.vBrowser && this.vBrowser.assignTime;
    const id = this.vBrowser && this.vBrowser.id;
    this.vBrowser = undefined;
    this.roster.forEach((_USER, i) => {
      this.roster[i].isController = false;
    });
    if (this.videoPlaylist.length > 0) {
      this.nextVideo();
    } else {
      this.cmdHost(socket, '');
      this.isRoomDirty = true;
    }
    if (redis && assignTime) {
      await redis.lpush('vBrowserSessionMS', Number(new Date()) - assignTime);
      await redis.ltrim('vBrowserSessionMS', 0, 24);
    }
    if (id) {
      try {
        await this.vmManager.resetVM(id);
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
      creationTime: this.creationTime,
    });
  }

  deserialize(roomData: string) {
    const roomObj = JSON.parse(roomData);
    this.video = roomObj.video;
    this.videoDuration = roomObj.videoDuration;
    this.videoTS = roomObj.videoTS;
    if (roomObj.paused) {
      this.paused = roomObj.paused;
    }
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
    if (roomObj.creationTime) {
      this.creationTime = new Date(roomObj.creationTime);
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

  startVideo = (data?: string, duration?: number) => {
    if (data) {
      this.removeVideoFromPlaylist(data);
    }

    this.video = data || '';
    this.videoTS = 0;
    this.videoDuration = duration || 0;
    this.paused = false;
    this.tsMap = {};
    this.io.of(this.roomId).emit('REC:tsMap', this.tsMap);
    this.io.of(this.roomId).emit('REC:host', this.getHostState());
  };

  removeVideoFromPlaylist = (url: string) => {
    const videoIndex = this.videoPlaylist.findIndex(
      (video) => video.url === url
    );
    if (videoIndex !== -1) {
      this.videoPlaylist.splice(videoIndex, 1);
      this.io.of(this.roomId).emit('playlistUpdate', this.videoPlaylist);
    }
  };

  moveVideoToIndex = (url: string, index: number) => {
    const videoIndex = this.videoPlaylist.findIndex(
      (video) => video.url === url
    );

    if (videoIndex !== -1) {
      const items = this.videoPlaylist.splice(videoIndex, 1);
      this.videoPlaylist.splice(index, 0, items[0]);
    }

    this.io.of(this.roomId).emit('playlistUpdate', this.videoPlaylist);
  };

  cmdHost(socket: Socket, data?: string, options = { skipMessage: false }) {
    if (!socket) {
      return;
    }

    const playlistVideo = findPlaylistVideoByUrl(this.videoPlaylist, data);
    const duration = playlistVideo ? playlistVideo.duration : 0;
    this.startVideo(data, duration);

    const cmd = playlistVideo ? 'host:video' : 'host';

    if (socket && data && !options.skipMessage) {
      const chatMsg = {
        id: socket.id,
        cmd,
        msg: playlistVideo || data,
      };
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
