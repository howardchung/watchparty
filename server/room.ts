import crypto from 'crypto';
import { gzipSync } from 'zlib';

import axios from 'axios';
import Redis from 'ioredis';
import { Socket } from 'socket.io';

import { validateUserToken } from './utils/firebase';
import { redisCount } from './utils/redis';
import { getCustomerByEmail } from './utils/stripe';
import { AssignedVM, VMManager } from './vm/base';

let redis = (undefined as unknown) as Redis.Redis;
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
}

export class Room {
  public video = '';
  public videoTS = 0;
  public subtitle = '';
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
  private vmManagers: { standard: VMManager; large: VMManager } | undefined;
  public isRoomDirty = false; // Indicates an unattended room needs to be saved, e.g. we unassign a VM from an empty room
  public isAssigningVM = false;
  public lock: string | undefined = ''; // The uid of the user who locked the room

  constructor(
    io: SocketIO.Server,
    vmManagers: { standard: VMManager; large: VMManager },
    roomId: string,
    roomData?: string | null | undefined
  ) {
    this.roomId = roomId;
    this.io = io;
    this.vmManagers = vmManagers;

    if (roomData) {
      this.deserialize(roomData);
    }

    setInterval(() => {
      // console.log(roomId, this.video, this.roster, this.tsMap, this.nameMap);
      if (this.video) {
        io.of(roomId).emit('REC:tsMap', this.tsMap);
      }
    }, 1000);

    io.of(roomId).on('connection', (socket: Socket) => {
      this.roster.push({ id: socket.id });
      redisCount('connectStarts');

      socket.emit('REC:host', this.getHostState());
      socket.emit('REC:nameMap', this.nameMap);
      socket.emit('REC:pictureMap', this.pictureMap);
      socket.emit('REC:tsMap', this.tsMap);
      socket.emit('REC:lock', this.lock);
      socket.emit('chatinit', this.chat);
      io.of(roomId).emit('roster', this.roster);

      socket.on('CMD:name', (data) => this.changeUserName(socket, data));
      socket.on('CMD:picture', (data) => this.changeUserPicture(socket, data));
      socket.on('CMD:uid', (data) => this.assignUserID(socket, data));
      socket.on('CMD:host', (data) => this.startHosting(socket, data));
      socket.on('CMD:play', () => this.playVideo(socket));
      socket.on('CMD:pause', () => this.pauseVideo(socket));
      socket.on('CMD:seek', (data) => this.seekVideo(socket, data));
      socket.on('CMD:ts', (data) => this.setTimestamp(socket, data));
      socket.on('CMD:chat', (data) => this.sendChatMessage(socket, data));
      socket.on('CMD:joinVideo', () => this.joinVideo(socket));
      socket.on('CMD:leaveVideo', () => this.leaveVideo(socket));
      socket.on('CMD:joinScreenShare', (data) =>
        this.joinScreenSharing(socket, data)
      );
      socket.on('CMD:leaveScreenShare', () => this.leaveScreenSharing(socket));
      socket.on('CMD:startVBrowser', (data) =>
        this.startVBrowser(socket, data)
      );
      socket.on('CMD:stopVBrowser', () => this.leaveVBrowser(socket));
      socket.on('CMD:changeController', (data) =>
        this.changeController(socket, data)
      );
      socket.on('CMD:subtitle', (data) => this.addSubtitles(socket, data));
      socket.on('CMD:lock', (data) => this.lockRoom(socket, data));
      socket.on('CMD:askHost', () => {
        socket.emit('REC:host', this.getHostState());
      });
      socket.on('signal', (data) => this.sendSignal(socket, data));
      socket.on('signalSS', (data) => this.signalSS(socket, data));

      socket.on('disconnect', () => this.disconnectUser(socket));
    });
  }

  serialize = () => {
    return JSON.stringify({
      video: this.video,
      videoTS: this.videoTS,
      paused: this.paused,
      nameMap: this.nameMap,
      pictureMap: this.pictureMap,
      chat: this.chat,
      vBrowser: this.vBrowser,
      creationTime: this.creationTime,
      lock: this.lock,
    });
  };

  deserialize = (roomData: string) => {
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
    if (roomObj.lock) {
      this.lock = roomObj.lock;
    }
  };

  getHostState = (): HostState => {
    return {
      video: this.video,
      videoTS: this.videoTS,
      subtitle: this.subtitle,
      paused: this.paused,
      isVBrowserLarge: Boolean(this.vBrowser && this.vBrowser.large),
    };
  };

  stopVBrowser = async () => {
    this.isAssigningVM = false;
    const assignTime = this.vBrowser && this.vBrowser.assignTime;
    const id = this.vBrowser && this.vBrowser.id;
    const isLarge = this.vBrowser?.large;
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
        const vmManager = isLarge
          ? this.vmManagers?.large
          : this.vmManagers?.standard;
        await vmManager?.resetVM(id);
      } catch (e) {
        console.error(e);
      }
    }
  };

  cmdHost = (socket: Socket | undefined, data: string) => {
    this.video = data;
    this.videoTS = 0;
    this.paused = false;
    this.subtitle = '';
    this.tsMap = {};
    this.io.of(this.roomId).emit('REC:tsMap', this.tsMap);
    this.io.of(this.roomId).emit('REC:host', this.getHostState());
    if (socket && data) {
      const chatMsg = { id: socket.id, cmd: 'host', msg: data };
      this.addChatMessage(socket, chatMsg);
    }
  };

  addChatMessage = (socket: Socket | undefined, chatMsg: ChatMessageBase) => {
    const chatWithTime: ChatMessage = {
      ...chatMsg,
      timestamp: new Date().toISOString(),
      videoTS: socket ? this.tsMap[socket.id] : undefined,
    };
    this.chat.push(chatWithTime);
    this.chat = this.chat.splice(-100);
    this.io.of(this.roomId).emit('REC:chat', chatWithTime);
  };

  validateLock = (socketId: string) => {
    if (!this.lock) {
      return true;
    }
    let index = this.roster.findIndex((user) => user.id === socketId);
    const result = this.roster[index]?.uid === this.lock;
    if (!result) {
      console.log('[VALIDATELOCK] failed');
    }
    return result;
  };

  private changeUserName = (socket: Socket, data: string) => {
    if (!data) {
      return;
    }
    if (data && data.length > 50) {
      return;
    }
    this.nameMap[socket.id] = data;
    this.io.of(this.roomId).emit('REC:nameMap', this.nameMap);
  };

  private changeUserPicture = (socket: Socket, data: string) => {
    if (data && data.length > 10000) {
      return;
    }
    this.pictureMap[socket.id] = data;
    this.io.of(this.roomId).emit('REC:pictureMap', this.pictureMap);
  };

  private assignUserID = async (
    socket: Socket,
    data: { uid: string; token: string }
  ) => {
    if (!data) {
      return;
    }
    const decoded = await validateUserToken(data.uid, data.token);
    if (!decoded) {
      return;
    }
    // set it on the matching user socket
    let index = this.roster.findIndex((user) => user.id === socket.id);
    if (index >= 0) {
      this.roster[index].uid = decoded.uid;
    }
    console.log('[CMD:UID]', index, decoded.uid);
    this.io.of(this.roomId).emit('roster', this.roster);
  };

  private startHosting = (socket: Socket, data: string) => {
    if (data && data.length > 20000) {
      return;
    }
    if (!this.validateLock(socket.id)) {
      return;
    }
    const sharer = this.roster.find((user) => user.isScreenShare);
    if (sharer || this.vBrowser) {
      // Can't update the video while someone is screensharing/filesharing or vbrowser is running
      return;
    }
    redisCount('urlStarts');
    this.cmdHost(socket, data);
  };

  private playVideo = (socket: Socket) => {
    if (!this.validateLock(socket.id)) {
      return;
    }
    socket.broadcast.emit('REC:play', this.video);
    const chatMsg = {
      id: socket.id,
      cmd: 'play',
      msg: this.tsMap[socket.id]?.toString(),
    };
    this.paused = false;
    this.addChatMessage(socket, chatMsg);
  };

  private pauseVideo = (socket: Socket) => {
    if (!this.validateLock(socket.id)) {
      return;
    }
    socket.broadcast.emit('REC:pause');
    const chatMsg = {
      id: socket.id,
      cmd: 'pause',
      msg: this.tsMap[socket.id]?.toString(),
    };
    this.paused = true;
    this.addChatMessage(socket, chatMsg);
  };

  private seekVideo = (socket: Socket, data: number) => {
    if (JSON.stringify(data).length > 100) {
      return;
    }
    if (!this.validateLock(socket.id)) {
      return;
    }
    this.videoTS = data;
    socket.broadcast.emit('REC:seek', data);
    const chatMsg = { id: socket.id, cmd: 'seek', msg: data.toString() };
    this.addChatMessage(socket, chatMsg);
  };

  private setTimestamp = (socket: Socket, data: number) => {
    if (JSON.stringify(data).length > 100) {
      return;
    }
    if (data > this.videoTS) {
      this.videoTS = data;
    }
    this.tsMap[socket.id] = data;
  };

  private sendChatMessage = (socket: Socket, data: string) => {
    if (data && data.length > 10000) {
      return;
    }
    if (process.env.NODE_ENV === 'development' && data === '/clear') {
      this.chat.length = 0;
      this.io.of(this.roomId).emit('chatinit', this.chat);
      return;
    }
    redisCount('chatMessages');
    const chatMsg = { id: socket.id, msg: data };
    this.addChatMessage(socket, chatMsg);
  };

  private joinVideo = (socket: Socket) => {
    const match = this.roster.find((user) => user.id === socket.id);
    if (match) {
      match.isVideoChat = true;
      redisCount('videoChatStarts');
    }
    this.io.of(this.roomId).emit('roster', this.roster);
  };

  private leaveVideo = (socket: Socket) => {
    const match = this.roster.find((user) => user.id === socket.id);
    if (match) {
      match.isVideoChat = false;
    }
    this.io.of(this.roomId).emit('roster', this.roster);
  };

  private joinScreenSharing = (socket: Socket, data: { file: boolean }) => {
    if (!this.validateLock(socket.id)) {
      return;
    }
    const sharer = this.roster.find((user) => user.isScreenShare);
    if (sharer) {
      // Someone's already sharing
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
    this.io.of(this.roomId).emit('roster', this.roster);
  };

  private leaveScreenSharing = (socket: Socket) => {
    const sharer = this.roster.find((user) => user.isScreenShare);
    if (!sharer || sharer?.id !== socket.id) {
      return;
    }
    sharer.isScreenShare = false;
    this.cmdHost(socket, '');
    this.io.of(this.roomId).emit('roster', this.roster);
  };

  private startVBrowser = async (
    socket: Socket,
    data: {
      uid: string;
      token: string;
      rcToken: string;
      options: { size: string };
    }
  ) => {
    if (this.vBrowser || this.isAssigningVM) {
      return;
    }
    if (!this.validateLock(socket.id)) {
      return;
    }
    if (!data) {
      return;
    }
    this.isAssigningVM = true;
    let isLarge = false;
    if (process.env.STRIPE_SECRET_KEY && data && data.uid && data.token) {
      const decoded = await validateUserToken(data.uid, data.token);
      // Check if user is subscriber, if so allow isLarge
      if (decoded?.email) {
        const customer = await getCustomerByEmail(decoded.email);
        if (customer?.subscriptions?.data?.[0]?.status === 'active') {
          console.log('found active sub for ', customer?.email);
          isLarge = data.options?.size === 'large';
        }
      }
    }

    if (process.env.RECAPTCHA_SECRET_KEY) {
      try {
        // Validate the request isn't spam/automated
        const validation = await axios({
          url: `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${data.rcToken}`,
          method: 'POST',
        });
        console.log(validation?.data);
        const isLowScore = validation?.data?.score < 0.12;
        const failed = validation?.data?.success === false;
        if (failed || isLowScore) {
          if (isLowScore) {
            redisCount('recaptchaRejectsLowScore');
          } else {
            redisCount('recaptchaRejectsOther');
          }
          return;
        }
      } catch (e) {
        // if Recaptcha is down or other network issues, allow continuing
        console.warn(e);
      }
    }

    redisCount('vBrowserStarts');
    this.cmdHost(socket, 'vbrowser://');
    const vmManager = isLarge
      ? this.vmManagers?.large
      : this.vmManagers?.standard;
    const assignment = await vmManager?.assignVM();
    if (!this.isAssigningVM) {
      // Maybe the user cancelled the request before assignment finished
      return;
    }
    this.isAssigningVM = false;
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
    this.io.of(this.roomId).emit('roster', this.roster);
  };

  private leaveVBrowser = async (socket: Socket) => {
    if (!this.vBrowser && !this.isAssigningVM && this.video !== 'vbrowser://') {
      return;
    }
    if (!this.validateLock(socket.id)) {
      return;
    }
    await this.stopVBrowser();
    redisCount('vBrowserTerminateManual');
  };

  private changeController = (socket: Socket, data: string) => {
    if (!this.validateLock(socket.id)) {
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

  private addSubtitles = async (socket: Socket, data: string) => {
    if (data && data.length > 1000000) {
      return;
    }
    if (!this.validateLock(socket.id)) {
      return;
    }
    if (!redis) {
      return;
    }
    // calculate hash, gzip and save to redis
    const hash = crypto
      .createHash('sha256')
      .update(data, 'utf8')
      .digest()
      .toString('hex');
    const gzip = gzipSync(data);
    await redis.setex('subtitle:' + hash, 3 * 60 * 60, gzip);
    this.subtitle = hash;
    this.io.of(this.roomId).emit('REC:subtitle', this.subtitle);
  };

  private lockRoom = async (
    socket: Socket,
    data: { uid: string; token: string; locked: boolean }
  ) => {
    if (!data) {
      return;
    }
    const decoded = await validateUserToken(data.uid, data.token);
    if (!decoded) {
      return;
    }
    if (!this.validateLock(socket.id)) {
      return;
    }
    this.lock = data.locked ? decoded.uid : '';
    this.io.of(this.roomId).emit('REC:lock', this.lock);
    const chatMsg = {
      id: socket.id,
      cmd: data.locked ? 'lock' : 'unlock',
      msg: '',
    };
    this.addChatMessage(socket, chatMsg);
  };

  private sendSignal = (socket: Socket, data: { to: string; msg: string }) => {
    if (!data) {
      return;
    }
    this.io
      .of(this.roomId)
      .to(data.to)
      .emit('signal', { from: socket.id, msg: data.msg });
  };

  private signalSS = (
    socket: Socket,
    data: { to: string; sharer: boolean; msg: string }
  ) => {
    if (!data) {
      return;
    }
    this.io.of(this.roomId).to(data.to).emit('signalSS', {
      from: socket.id,
      sharer: data.sharer,
      msg: data.msg,
    });
  };

  private disconnectUser = (socket: Socket) => {
    let index = this.roster.findIndex((user) => user.id === socket.id);
    const removed = this.roster.splice(index, 1)[0];
    this.io.of(this.roomId).emit('roster', this.roster);
    if (removed.isScreenShare) {
      // Reset the room state since we lost the screen sharer
      this.cmdHost(socket, '');
    }
    delete this.tsMap[socket.id];
    // delete nameMap[socket.id];
  };
}
