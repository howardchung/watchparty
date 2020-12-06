import config from './config';
import crypto from 'crypto';
import zlib from 'zlib';
import util from 'util';

import axios from 'axios';
import Redis from 'ioredis';
import { Socket } from 'socket.io';
import { Client } from 'pg';

import { validateUserToken } from './utils/firebase';
import { redisCount, redisCountDistinct } from './utils/redis';
import { getCustomerByEmail } from './utils/stripe';
import { AssignedVM, VMManager } from './vm/base';
import { getStartOfDay } from './utils/time';

const gzip = util.promisify(zlib.gzip);

let redis: Redis.Redis | undefined = undefined;
if (config.REDIS_URL) {
  redis = new Redis(config.REDIS_URL);
}
let postgres: Client | undefined = undefined;
if (config.DATABASE_URL) {
  postgres = new Client({
    connectionString: config.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  postgres.connect();
}

export class Room {
  // Serialized state
  public video = '';
  public videoTS = 0;
  public subtitle = '';
  private paused = false;
  private chat: ChatMessage[] = [];
  private nameMap: StringDict = {};
  private pictureMap: StringDict = {};
  public vBrowser: AssignedVM | undefined = undefined;
  public creationTime: Date = new Date();
  public lock: string | undefined = undefined; // uid of the user who locked the room
  public isChatEnabled: boolean = true;

  // Non-serialized state
  public roomId: string;
  public roster: User[] = [];
  private tsMap: NumberDict = {};
  private io: SocketIO.Server;
  private vmManagers: { standard: VMManager; large: VMManager } | undefined;
  public isAssigningVM = false;
  private clientIdMap: StringDict = {};
  private uidMap: StringDict = {};

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

    io.of(roomId).use(async (socket, next) => {
      // Validate the connector has the room password
      const password = socket.handshake.query?.password;
      // console.log(this.roomId, this.password, password);
      if (postgres) {
        const result = await postgres.query(
          `SELECT password FROM room where roomId = $1`,
          [this.roomId]
        );
        const roomPassword = result.rows[0]?.password;
        if (roomPassword && password !== roomPassword) {
          next(new Error('not authorized'));
          return;
        }
      }
      next();
    });
    io.of(roomId).on('connection', (socket: Socket) => {
      const clientId = socket.handshake.query?.clientId;
      this.roster.push({ id: socket.id });
      this.clientIdMap[socket.id] = clientId;
      redisCount('connectStarts');
      redisCountDistinct('connectStartsDistinct', clientId);

      socket.emit('REC:host', this.getHostState());
      socket.emit('REC:nameMap', this.nameMap);
      socket.emit('REC:pictureMap', this.pictureMap);
      socket.emit('REC:tsMap', this.tsMap);
      socket.emit('REC:lock', this.lock);
      socket.emit('REC:isChatEnabled', this.isChatEnabled);
      socket.emit('chatinit', this.chat);
      io.of(roomId).emit('roster', this.roster);

      socket.on('CMD:name', (data) => this.changeUserName(socket, data));
      socket.on('CMD:picture', (data) => this.changeUserPicture(socket, data));
      socket.on('CMD:uid', (data) => this.changeUserID(socket, data));
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
      socket.on('CMD:toggleChat', (data) => this.toggleChat(socket, data));
      socket.on('CMD:askHost', () => {
        socket.emit('REC:host', this.getHostState());
      });
      socket.on('CMD:getRoomState', (data) => this.getRoomState(socket));
      socket.on('CMD:setRoomState', (data) => this.setRoomState(socket, data));
      socket.on('CMD:setRoomOwner', (data) => this.setRoomOwner(socket, data));
      socket.on('signal', (data) => this.sendSignal(socket, data));
      socket.on('signalSS', (data) => this.signalSS(socket, data));

      socket.on('disconnect', () => this.disconnectUser(socket));
    });
  }

  serialize = () => {
    // Get the set of IDs with messages in chat
    // Only serialize roster and picture ID for those people, to save space
    const chatIDs = new Set(this.chat.map((msg) => msg.id));
    const abbrNameMap: StringDict = {};
    Object.keys(this.nameMap).forEach((id) => {
      if (chatIDs.has(id)) {
        abbrNameMap[id] = this.nameMap[id];
      }
    });
    const abbrPictureMap: StringDict = {};
    Object.keys(this.pictureMap).forEach((id) => {
      if (chatIDs.has(id)) {
        abbrPictureMap[id] = this.pictureMap[id];
      }
    });
    return JSON.stringify({
      video: this.video,
      videoTS: this.videoTS,
      subtitle: this.subtitle,
      paused: this.paused,
      chat: this.chat,
      nameMap: abbrNameMap,
      pictureMap: abbrPictureMap,
      vBrowser: this.vBrowser,
      creationTime: this.creationTime,
      lock: this.lock,
    });
  };

  deserialize = (roomData: string) => {
    const roomObj = JSON.parse(roomData);
    this.video = roomObj.video;
    this.videoTS = roomObj.videoTS;
    if (roomObj.subtitle) {
      this.subtitle = roomObj.subtitle;
    }
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

  saveToRedis = async () => {
    try {
      const roomString = this.serialize();
      const key = this.roomId;
      let permanent = false;
      if (postgres) {
        const result = await postgres.query(
          `SELECT owner FROM room where roomId = $1`,
          [this.roomId]
        );
        const owner = result.rows[0]?.owner;
        permanent = Boolean(owner);
      }
      if (permanent) {
        await redis?.set(key, roomString);
        await redis?.persist(key);
      } else {
        await redis?.setex(key, 24 * 60 * 60, roomString);
      }
    } catch (e) {
      console.error(e);
    }
  };

  getHostState = (): HostState => {
    // Reverse lookup the clientid to the socket id
    const match = this.roster.find(
      (user) => this.clientIdMap[user.id] === this.vBrowser?.controllerClient
    );
    return {
      video: this.video,
      videoTS: this.videoTS,
      subtitle: this.subtitle,
      paused: this.paused,
      isVBrowserLarge: Boolean(this.vBrowser && this.vBrowser.large),
      controller: match?.id,
    };
  };

  stopVBrowser = async () => {
    this.isAssigningVM = false;
    const assignTime = this.vBrowser && this.vBrowser.assignTime;
    const id = this.vBrowser && this.vBrowser.id;
    const isLarge = this.vBrowser?.large;
    this.vBrowser = undefined;
    this.cmdHost(undefined, '');
    this.saveToRedis();
    if (redis && assignTime) {
      await redis.lpush('vBrowserSessionMS', Number(new Date()) - assignTime);
      await redis.ltrim('vBrowserSessionMS', 0, 49);
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
    if (!this.isChatEnabled) {
      return;
    }
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
    const result = this.uidMap[socketId] === this.lock;
    if (!result) {
      console.log('[VALIDATELOCK] failed', socketId);
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

  private changeUserID = async (
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
    this.uidMap[socket.id] = decoded.uid;
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
    if (String(data).length > 100) {
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
    if (String(data).length > 100) {
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
    if (config.NODE_ENV === 'development' && data === '/clear') {
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
    const clientId = this.clientIdMap[socket.id];
    const uid = this.uidMap[socket.id];
    // Log the vbrowser creation by uid and clientid
    if (redis) {
      const expireTime = getStartOfDay() / 1000 + 86400;
      if (clientId) {
        const clientCount = await redis.zincrby(
          'vBrowserClientIDs',
          1,
          clientId
        );
        redis.expireat('vBrowserClientIDs', expireTime);
        const clientMinutes = await redis.zincrby(
          'vBrowserClientIDMinutes',
          1,
          clientId
        );
        redis.expireat('vBrowserClientIDMinutes', expireTime);
      }
      if (uid) {
        const uidCount = await redis.zincrby('vBrowserUIDs', 1, uid);
        redis.expireat('vBrowserUIDs', expireTime);
        const uidMinutes = await redis.zincrby('vBrowserUIDMinutes', 1, uid);
        redis.expireat('vBrowserUIDMinutes', expireTime);
      }
      // TODO limit users based on these counts
    }
    this.isAssigningVM = true;
    let isLarge = false;
    if (config.STRIPE_SECRET_KEY && data && data.uid && data.token) {
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

    if (config.RECAPTCHA_SECRET_KEY) {
      try {
        // Validate the request isn't spam/automated
        const validation = await axios({
          url: `https://www.google.com/recaptcha/api/siteverify?secret=${config.RECAPTCHA_SECRET_KEY}&response=${data.rcToken}`,
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
      socket.emit(
        'errorMessage',
        'Failed to assign VBrowser. Please try again later.'
      );
      return;
    }
    this.vBrowser = assignment;
    this.vBrowser.controllerClient = clientId;
    this.vBrowser.creatorUID = uid;
    this.vBrowser.creatorClientID = clientId;
    this.cmdHost(
      undefined,
      'vbrowser://' + this.vBrowser.pass + '@' + this.vBrowser.host
    );
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
    if (data && data.length > 100) {
      return;
    }
    if (!this.validateLock(socket.id)) {
      return;
    }
    if (this.vBrowser) {
      this.vBrowser.controllerClient = this.clientIdMap[data];
      this.io.of(this.roomId).emit('REC:changeController', data);
    }
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
    const gzipData = (await gzip(data)) as Buffer;
    // console.log(data.length, gzipData.length);
    await redis.setex('subtitle:' + hash, 3 * 60 * 60, gzipData);
    this.subtitle = hash;
    this.io.of(this.roomId).emit('REC:subtitle', this.subtitle);
    redisCount('subUploads');
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
    if (!this.isChatEnabled && !data.locked) {
      this.isChatEnabled = true;
      this.io.of(this.roomId).emit('REC:isChatEnabled', this.isChatEnabled);
    }
    this.io.of(this.roomId).emit('REC:lock', this.lock);
    const chatMsg = {
      id: socket.id,
      cmd: data.locked ? 'lock' : 'unlock',
      msg: '',
    };
    this.addChatMessage(socket, chatMsg);
  };

  private toggleChat = async (
    socket: Socket,
    data: { uid: string; token: string; toggleChat: boolean }
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
    this.isChatEnabled = data.toggleChat;
    this.io.of(this.roomId).emit('REC:isChatEnabled', this.isChatEnabled);
  };

  private setRoomOwner = async (
    socket: Socket,
    data: {
      uid: string;
      token: string;
      undo: boolean;
    }
  ) => {
    if (!postgres) {
      socket.emit('errorMessage', 'Database is not available');
      return;
    }
    const decoded = await validateUserToken(
      data?.uid as string,
      data?.token as string
    );
    if (!decoded) {
      socket.emit('errorMessage', 'Failed to authenticate user');
      return;
    }
    const customer = await getCustomerByEmail(decoded.email as string);
    const isSubscriber = Boolean(
      customer?.subscriptions?.data?.[0]?.status === 'active'
    );
    const owner = decoded.uid;
    if (data.undo) {
      await postgres.query('DELETE from room where roomId = $1', [this.roomId]);
      socket.emit('REC:getRoomState', {});
    } else {
      // validate room count
      const roomCount = (
        await postgres.query(
          'SELECT count(1) from room where owner = $1 AND roomId != $2',
          [owner, this.roomId]
        )
      ).rows[0].count;
      const limit = isSubscriber ? 10 : 1;
      // console.log(roomCount, limit, isSubscriber);
      if (roomCount >= limit) {
        socket.emit('errorMessage', 'Room limit exceeded');
        return;
      }
      // Only keep the rows for which we have a postgres column
      const roomObj: any = {
        roomId: this.roomId,
        creationTime: this.creationTime,
        owner: owner,
      };
      const columns = Object.keys(roomObj);
      const values = Object.values(roomObj);
      const query = `INSERT INTO room(${columns.join(',')})
    VALUES (${values.map((_, i) => '$' + (i + 1)).join(',')})
    RETURNING *`;
      // console.log(columns, values, query);
      const result = await postgres.query(query, values);
      const row = result.rows[0];
      socket.emit('REC:getRoomState', {
        password: row?.password,
        vanity: row?.vanity,
        owner: row?.owner,
      });
    }
  };

  private getRoomState = async (socket: Socket) => {
    if (!postgres) {
      return;
    }
    const result = await postgres.query(
      `SELECT password, vanity, owner FROM room where roomId = $1`,
      [this.roomId]
    );
    const first = result.rows[0];
    socket.emit('REC:getRoomState', {
      password: first?.password,
      vanity: first?.vanity,
      owner: first?.owner,
    });
  };

  private setRoomState = async (
    socket: Socket,
    data: {
      uid: string;
      token: string;
      password: string;
      vanity: string;
    }
  ) => {
    if (!postgres) {
      socket.emit('errorMessage', 'Database is not available');
      return;
    }
    const decoded = await validateUserToken(
      data?.uid as string,
      data?.token as string
    );
    if (!decoded) {
      socket.emit('errorMessage', 'Failed to authenticate user');
      return;
    }
    const customer = await getCustomerByEmail(decoded.email as string);
    const isSubscriber = Boolean(
      customer?.subscriptions?.data?.[0]?.status === 'active'
    );
    const { password, vanity } = data;
    if (password) {
      if (password.length > 100) {
        socket.emit('errorMessage', 'Password too long');
        return;
      }
    }
    if (vanity) {
      if (vanity.length > 100) {
        socket.emit('errorMessage', 'Custom URL too long');
        return;
      }
    }
    // console.log(owner, vanity, password);
    const roomObj: any = {
      roomId: this.roomId,
      password: password,
    };
    if (isSubscriber) {
      // user must be sub to set vanity
      roomObj.vanity = vanity;
    }
    try {
      const query = `UPDATE room
        SET ${Object.keys(roomObj).map((k, i) => `${k} = $${i + 1}`)}
        WHERE roomId = $${Object.keys(roomObj).length + 1}
        AND owner = $${Object.keys(roomObj).length + 2}
        RETURNING *`;
      const result = await postgres.query(query, [
        ...Object.values(roomObj),
        this.roomId,
        decoded.uid,
      ]);
      const row = result.rows[0];
      socket.emit('REC:getRoomState', {
        password: row?.password,
        vanity: row?.vanity,
        owner: row?.owner,
      });
      socket.emit('successMessage', 'Saved admin settings');
    } catch (e) {
      console.error(e);
    }
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
