import { Socket } from 'socket.io';
import { User, ChatMessage, NumberDict, StringDict } from '.';
import Redis from 'ioredis';
import { redisCount } from './utils/redis';
import { VMManager, AssignedVM } from './vm/base';

let redis = (undefined as unknown) as Redis.Redis;
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
}

export class Room {
  public video = '';
  public videoTS = 0;
  private paused = false;
  public roster: User[] = [];
  private chat: ChatMessage[] = [];
  private tsMap: NumberDict = {};
  private nameMap: StringDict = {};
  private pictureMap: StringDict = {};
  public vBrowser: AssignedVM | undefined = undefined;
  private io: SocketIO.Server;
  public roomId: string;
  public creationTime: Date = new Date();
  private vmManager: VMManager;
  public isRoomDirty = false; // Indicates the room needs to be saved, e.g. we unassign a VM from an empty room

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

    setInterval(() => {
      // console.log(roomId, this.video, this.roster, this.tsMap, this.nameMap);
      io.of(roomId).emit('REC:tsMap', this.tsMap);
    }, 1000);

    io.of(roomId).on('connection', (socket: Socket) => {
      // console.log(socket.id);
      this.roster.push({ id: socket.id });
      redisCount('connectStarts');

      socket.emit('REC:host', this.getHostState());
      socket.emit('REC:nameMap', this.nameMap);
      socket.emit('REC:pictureMap', this.pictureMap);
      socket.emit('REC:tsMap', this.tsMap);
      socket.emit('chatinit', this.chat);
      io.of(roomId).emit('roster', this.roster);

      socket.on('CMD:name', (data: string) => {
        if (!data) {
          return;
        }
        if (data && data.length > 100) {
          return;
        }
        this.nameMap[socket.id] = data;
        io.of(roomId).emit('REC:nameMap', this.nameMap);
      });
      socket.on('CMD:picture', (data: string) => {
        if (data && data.length > 10000) {
          return;
        }
        this.pictureMap[socket.id] = data;
        io.of(roomId).emit('REC:pictureMap', this.pictureMap);
      });
      socket.on('CMD:host', (data: string) => {
        if (data && data.length > 20000) {
          return;
        }
        const sharer = this.roster.find((user) => user.isScreenShare);
        if (sharer) {
          // Can't update the video while someone is screensharing/filesharing
          return;
        }
        redisCount('urlStarts');
        this.cmdHost(socket, data);
      });
      socket.on('CMD:play', () => {
        socket.broadcast.emit('REC:play', this.video);
        const chatMsg = {
          id: socket.id,
          cmd: 'play',
          msg: this.tsMap[socket.id],
        };
        this.paused = false;
        this.addChatMessage(socket, chatMsg);
      });
      socket.on('CMD:pause', () => {
        socket.broadcast.emit('REC:pause');
        const chatMsg = {
          id: socket.id,
          cmd: 'pause',
          msg: this.tsMap[socket.id],
        };
        this.paused = true;
        this.addChatMessage(socket, chatMsg);
      });
      socket.on('CMD:seek', (data: number) => {
        this.videoTS = data;
        socket.broadcast.emit('REC:seek', data);
        const chatMsg = { id: socket.id, cmd: 'seek', msg: data };
        this.addChatMessage(socket, chatMsg);
      });
      socket.on('CMD:ts', (data: number) => {
        if (data > this.videoTS) {
          this.videoTS = data;
        }
        this.tsMap[socket.id] = data;
      });
      socket.on('CMD:chat', (data: string) => {
        if (data && data.length > 65536) {
          // TODO add some validation on client side too so we don't just drop long messages
          return;
        }
        if (process.env.NODE_ENV === 'development' && data === '/clear') {
          this.chat.length = 0;
          io.of(roomId).emit('chatinit', this.chat);
          return;
        }
        redisCount('chatMessages');
        const chatMsg = { id: socket.id, msg: data };
        this.addChatMessage(socket, chatMsg);
      });
      socket.on('CMD:joinVideo', () => {
        const match = this.roster.find((user) => user.id === socket.id);
        if (match) {
          match.isVideoChat = true;
          redisCount('videoChatStarts');
        }
        io.of(roomId).emit('roster', this.roster);
      });
      socket.on('CMD:leaveVideo', () => {
        const match = this.roster.find((user) => user.id === socket.id);
        if (match) {
          match.isVideoChat = false;
        }
        io.of(roomId).emit('roster', this.roster);
      });
      socket.on('CMD:joinScreenShare', (data: { file: boolean }) => {
        const sharer = this.roster.find((user) => user.isScreenShare);
        if (sharer) {
          return;
        }
        if (data && data.file) {
          this.cmdHost(socket, 'fileshare://' + socket.id);
          redisCount('fileShareStarts');
        } else {
          this.cmdHost(socket, 'screenshare://' + socket.id);
          redisCount('screenShareStarts');
        }
        const match = this.roster.find((user) => user.id === socket.id);
        if (match) {
          match.isScreenShare = true;
        }
        io.of(roomId).emit('roster', this.roster);
      });
      socket.on('CMD:leaveScreenShare', () => {
        // console.log('CMD:leaveScreenShare');
        const match = this.roster.find((user) => user.id === socket.id);
        if (match) {
          match.isScreenShare = false;
        }
        this.cmdHost(socket, '');
        io.of(roomId).emit('roster', this.roster);
      });
      socket.on('CMD:startVBrowser', async () => {
        if (this.vBrowser) {
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
          undefined,
          'vbrowser://' + this.vBrowser.pass + '@' + this.vBrowser.host
        );
        io.of(roomId).emit('roster', this.roster);
      });
      socket.on('CMD:stopVBrowser', () => this.resetRoomVM());
      socket.on('CMD:changeController', (data: string) => {
        this.roster.forEach((user, i) => {
          if (user.id === data) {
            this.roster[i].isController = true;
          } else {
            this.roster[i].isController = false;
          }
        });
        io.of(roomId).emit('roster', this.roster);
      });
      socket.on('CMD:askHost', () => {
        socket.emit('REC:host', this.getHostState());
      });
      socket.on('signal', (data: { to: string; msg: string }) => {
        io.of(roomId)
          .to(data.to)
          .emit('signal', { from: socket.id, msg: data.msg });
      });
      socket.on(
        'signalSS',
        (data: { to: string; sharer: boolean; msg: string }) => {
          io.of(roomId).to(data.to).emit('signalSS', {
            from: socket.id,
            sharer: data.sharer,
            msg: data.msg,
          });
        }
      );

      socket.on('disconnect', () => {
        let index = this.roster.findIndex((user) => user.id === socket.id);
        const removed = this.roster.splice(index, 1)[0];
        io.of(roomId).emit('roster', this.roster);
        if (removed.isScreenShare) {
          // Reset the room state since we lost the screen sharer
          this.cmdHost(socket, '');
        }
        delete this.tsMap[socket.id];
        // delete nameMap[socket.id];
      });
    });
  }

  serialize() {
    return JSON.stringify({
      video: this.video,
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
      videoTS: this.videoTS,
      paused: this.paused,
    };
  }

  async resetRoomVM() {
    const assignTime = this.vBrowser && this.vBrowser.assignTime;
    const id = this.vBrowser && this.vBrowser.id;
    this.vBrowser = undefined;
    this.roster.forEach((user, i) => {
      this.roster[i].isController = false;
    });
    this.cmdHost(undefined, '');
    this.isRoomDirty = true;
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

  cmdHost(socket: Socket | undefined, data: string) {
    this.video = data;
    this.videoTS = 0;
    this.paused = false;
    this.tsMap = {};
    this.io.of(this.roomId).emit('REC:tsMap', this.tsMap);
    this.io.of(this.roomId).emit('REC:host', this.getHostState());
    if (socket && data) {
      const chatMsg = { id: socket.id, cmd: 'host', msg: data };
      this.addChatMessage(socket, chatMsg);
    }
  }

  addChatMessage(socket: Socket | undefined, chatMsg: any) {
    const chatWithTime: ChatMessage = {
      ...chatMsg,
      timestamp: new Date().toISOString(),
      videoTS: socket ? this.tsMap[socket.id] : undefined,
    };
    this.chat.push(chatWithTime);
    this.chat = this.chat.splice(-100);
    this.io.of(this.roomId).emit('REC:chat', chatWithTime);
  }
}
