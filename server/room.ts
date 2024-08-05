import config from './config';

import axios from 'axios';
import { Server, Socket } from 'socket.io';

import { getUser, validateUserToken } from './utils/firebase';
import { redis, redisCount, redisCountDistinct } from './utils/redis';
import { getIsSubscriberByEmail } from './utils/stripe';
import { AssignedVM } from './vm/base';
import { getStartOfDay } from './utils/time';
import { postgres, updateObject, upsertObject } from './utils/postgres';
import { fetchYoutubeVideo, getYoutubeVideoID } from './utils/youtube';
import { v4 as uuidv4 } from 'uuid';
//@ts-ignore
import twitch from 'twitch-m3u8';
import { QueryResult } from 'pg';
import { Docker } from './vm/docker';

// Stateless pool instance to use for VMs if full management isn't needed
let stateless: Docker | undefined = undefined;
if (!config.VM_MANAGER_CONFIG) {
  stateless = new Docker({
    provider: 'Docker',
    isLarge: false,
    region: 'US',
    limitSize: 0,
    minSize: 0,
    hostname: config.DOCKER_VM_HOST,
  });
}

export class Room {
  // Serialized state
  public video: string | null = '';
  public videoTS = 0;
  public subtitle = '';
  public playbackRate = 0;
  public paused = false;
  public loop = false;
  private chat: ChatMessage[] = [];
  private nameMap: StringDict = {};
  private pictureMap: StringDict = {};
  public vBrowser: AssignedVM | undefined = undefined;
  public creator: string | undefined = undefined;
  public lock: string | undefined = undefined; // uid of the user who locked the room
  public playlist: PlaylistVideo[] = [];

  // Non-serialized state
  public roomId: string;
  public roster: User[] = [];
  private lastTsMap = Date.now();
  private tsMap: NumberDict = {};
  private nextVotes: StringDict = {};
  private io: Server;
  private clientIdMap: StringDict = {};
  private uidMap: StringDict = {};
  private tsInterval: NodeJS.Timeout | undefined = undefined;
  public isChatDisabled: boolean | undefined = undefined;
  public lastUpdateTime: Date = new Date();
  private preventTSUpdate = false;
  // Not really a queue since there's no ordering, we just retry as long as this is set
  // If we want a real queue then we need external processing of the jobs and a way to update the room from outside
  public vBrowserQueue:
    | {
        roomId: string;
        queueTime: Date;
        isLarge: boolean;
        region: string;
        uid: string;
        clientId: string;
      }
    | undefined = undefined;

  constructor(
    io: Server,
    roomId: string,
    roomData?: string | null | undefined,
  ) {
    this.roomId = roomId;
    this.io = io;

    if (roomData) {
      this.deserialize(roomData);
    }

    this.tsInterval = setInterval(async () => {
      // console.log(roomId, this.video, this.roster, this.tsMap, this.nameMap);
      // Clean up the data of users who aren't in the room anymore
      const memberIds = this.roster.map((p) => p.id);
      Object.keys(this.tsMap).forEach((key) => {
        if (!memberIds.includes(key)) {
          delete this.tsMap[key];
        }
      });
      if (this.video) {
        this.lastTsMap = Date.now();
        io.of(roomId).emit('REC:tsMap', this.tsMap);
      }
    }, 1000);

    io.of(roomId).use(async (socket, next) => {
      // Validate the connector has the room password
      const password = socket.handshake.query?.password;
      // console.log(this.roomId, this.password, password);
      if (postgres) {
        const result = await postgres.query(
          `SELECT password, "isSubRoom" FROM room where "roomId" = $1`,
          [this.roomId],
        );
        const roomPassword = result.rows[0]?.password;
        if (roomPassword && password !== roomPassword) {
          next(new Error('not authorized'));
          return;
        }
        const isSubRoom = result.rows[0]?.isSubRoom;
        const roomCapacity = isSubRoom
          ? config.ROOM_CAPACITY_SUB
          : config.ROOM_CAPACITY;
        if (roomCapacity && this.roster.length >= roomCapacity) {
          next(new Error('room full'));
          return;
        }
      }
      next();
    });
    io.of(roomId).on('connection', (socket: Socket) => {
      const clientId = socket.handshake.query?.clientId as string;
      this.clientIdMap[socket.id] = clientId;
      this.roster.push({ id: socket.id, clientId });
      redisCount('connectStarts');
      redisCountDistinct('connectStartsDistinct', clientId);

      socket.emit('REC:host', this.getHostState());
      socket.emit('REC:nameMap', this.nameMap);
      socket.emit('REC:pictureMap', this.pictureMap);
      socket.emit('REC:tsMap', this.tsMap);
      socket.emit('REC:lock', this.lock);
      socket.emit('chatinit', this.chat);
      socket.emit('playlist', this.playlist);
      this.getRoomState(socket);
      io.of(roomId).emit('roster', this.getRosterForApp());

      socket.on('CMD:name', (data) => this.changeUserName(socket, data));
      socket.on('CMD:picture', (data) => this.changeUserPicture(socket, data));
      socket.on('CMD:uid', (data) => this.changeUserID(socket, data));
      socket.on('CMD:host', (data) => this.startHosting(socket, data));
      socket.on('CMD:play', () => this.playVideo(socket));
      socket.on('CMD:pause', () => this.pauseVideo(socket));
      socket.on('CMD:seek', (data) => this.seekVideo(socket, data));
      socket.on('CMD:playbackRate', (data) =>
        this.setPlaybackRate(socket, data),
      );
      socket.on('CMD:loop', (data) => this.setLoop(socket, data));
      socket.on('CMD:ts', (data) => this.setTimestamp(socket, data));
      socket.on('CMD:chat', (data) => this.sendChatMessage(socket, data));
      socket.on('CMD:addReaction', (data) => this.addReaction(socket, data));
      socket.on('CMD:removeReaction', (data) =>
        this.removeReaction(socket, data),
      );
      socket.on('CMD:joinVideo', () => this.joinVideo(socket));
      socket.on('CMD:leaveVideo', () => this.leaveVideo(socket));
      socket.on('CMD:joinScreenShare', (data) =>
        this.joinScreenSharing(socket, data),
      );
      socket.on('CMD:userMute', (data) => this.setUserMute(socket, data));
      socket.on('CMD:leaveScreenShare', () => this.leaveScreenSharing(socket));
      socket.on('CMD:startVBrowser', (data) =>
        this.startVBrowser(socket, data),
      );
      socket.on('CMD:stopVBrowser', () => this.stopVBrowser(socket));
      socket.on('CMD:changeController', (data) =>
        this.changeController(socket, data),
      );
      socket.on('CMD:subtitle', (data) => this.addSubtitles(socket, data));
      socket.on('CMD:lock', (data) => this.lockRoom(socket, data));
      socket.on('CMD:askHost', () => {
        socket.emit('REC:host', this.getHostState());
      });
      socket.on('CMD:getRoomState', () => this.getRoomState(socket));
      socket.on('CMD:setRoomState', (data) => this.setRoomState(socket, data));
      socket.on('CMD:setRoomOwner', (data) => this.setRoomOwner(socket, data));
      socket.on('CMD:playlistNext', (data) => this.playlistNext(socket, data));
      socket.on('CMD:playlistAdd', (data) => this.playlistAdd(socket, data));
      socket.on('CMD:playlistMove', (data) => this.playlistMove(socket, data));
      socket.on('CMD:playlistDelete', (data) =>
        this.playlistDelete(socket, data),
      );

      socket.on('signal', (data) => this.sendSignal(socket, data));
      socket.on('signalSS', (data) => this.signalSS(socket, data));

      socket.on('kickUser', (data) => this.kickUser(socket, data));
      socket.on('CMD:deleteChatMessages', (data) =>
        this.deleteChatMessages(socket, data),
      );

      socket.on('disconnect', () => this.disconnectUser(socket));
    });
  }

  public serialize = () => {
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
      playbackRate: this.playbackRate,
      paused: this.paused,
      chat: this.chat,
      nameMap: abbrNameMap,
      pictureMap: abbrPictureMap,
      vBrowser: this.vBrowser,
      lock: this.lock,
      creator: this.creator,
      playlist: this.playlist,
      loop: this.loop,
    });
  };

  private deserialize = (roomData: string) => {
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
    if (roomObj.lock) {
      this.lock = roomObj.lock;
    }
    if (roomObj.creator) {
      this.creator = roomObj.creator;
    }
    if (roomObj.playlist) {
      this.playlist = roomObj.playlist;
    }
    if (roomObj.playbackRate) {
      this.playbackRate = roomObj.playbackRate;
    }
    if (roomObj.loop) {
      this.loop = roomObj.loop;
    }
  };

  public saveRoom = async () => {
    this.lastUpdateTime = new Date();
    if (postgres) {
      try {
        const roomString = this.serialize();
        await postgres.query(
          `UPDATE room SET "lastUpdateTime" = $1, data = $2 WHERE "roomId" = $3`,
          [this.lastUpdateTime, roomString, this.roomId],
        );
      } catch (e) {
        console.warn(e);
      }
    }
  };

  public destroy = () => {
    if (this.tsInterval) {
      clearInterval(this.tsInterval);
    }
  };

  public getRosterForStats = () => {
    return this.roster.map((p) => ({
      name: this.nameMap[p.id] || p.id,
      uid: this.uidMap[p.id],
      ts: this.tsMap[p.id],
      clientId: this.clientIdMap[p.id],
      // TODO this will not work behind nginx reverse proxy, pass it and read from X-Real-IP instead
      // socket.handshake.headers["x-real-ip"]
      ip: this.io.of(this.roomId).sockets.get(p.id)?.request?.socket
        ?.remoteAddress,
    }));
  };

  protected getSharerId = (): string => {
    let sharerId = '';
    if (this.video?.startsWith('screenshare://')) {
      sharerId = this.video?.slice('screenshare://'.length).split('@')[0];
    } else if (this.video?.startsWith('fileshare://')) {
      sharerId = this.video?.slice('fileshare://'.length).split('@')[0];
    }
    return sharerId;
  };

  protected getRosterForApp = (): User[] => {
    return this.roster.map((p) => {
      return {
        ...p,
        isScreenShare: p.clientId === this.getSharerId(),
      };
    });
  };

  private getHostState = (): HostState => {
    // Reverse lookup the clientid to the socket id
    const match = this.roster.find(
      (user) => this.clientIdMap[user.id] === this.vBrowser?.controllerClient,
    );
    return {
      video: this.video ?? '',
      videoTS: this.videoTS,
      subtitle: this.subtitle,
      playbackRate: this.playbackRate,
      paused: this.paused,
      isVBrowserLarge: Boolean(this.vBrowser && this.vBrowser.large),
      controller: match?.id,
      loop: this.loop,
    };
  };

  public stopVBrowserInternal = async () => {
    const assignTime = this.vBrowser && this.vBrowser.assignTime;
    const id = this.vBrowser?.id;
    const provider = this.vBrowser?.provider;
    const isLarge = this.vBrowser?.large ?? false;
    const region = this.vBrowser?.region ?? '';
    const uid = this.vBrowser?.creatorUID ?? '';
    this.vBrowser = undefined;
    this.cmdHost(null, '');
    // Force a save because this might change in unattended rooms
    this.saveRoom();
    if (redis && assignTime) {
      await redis.lpush('vBrowserSessionMS', Number(new Date()) - assignTime);
      await redis.ltrim('vBrowserSessionMS', 0, 24);
    }

    if (id) {
      try {
        if (stateless) {
          await stateless.terminateVM(id);
        } else {
          await axios.post(
            'http://localhost:' + config.VMWORKER_PORT + '/releaseVM',
            {
              provider,
              isLarge,
              region,
              id,
              roomId: this.roomId,
            },
          );
        }
      } catch (e) {
        console.warn(e);
      }
    }
  };

  private cmdHost = (socket: Socket | null, data: string) => {
    this.video = data;
    this.videoTS = 0;
    this.paused = false;
    this.subtitle = '';
    this.loop = false;
    this.playbackRate = 0;
    this.tsMap = {};
    this.nextVotes = {};
    this.preventTSUpdate = true;
    setTimeout(() => (this.preventTSUpdate = false), 1000);
    this.io.of(this.roomId).emit('REC:tsMap', this.tsMap);
    this.io.of(this.roomId).emit('REC:host', this.getHostState());
    if (socket && data) {
      const chatMsg = { id: socket.id, cmd: 'host', msg: data };
      this.addChatMessage(socket, chatMsg);
    }
    if (data === '') {
      this.playlistNext(null);
    }
    // The room video is changing so remove room from vbrowser queue
    this.vBrowserQueue = undefined;
  };

  public addChatMessage = (socket: Socket | null, chatMsg: ChatMessageBase) => {
    if (this.isChatDisabled && !chatMsg.cmd) {
      return;
    }
    const user = this.roster.find((user) => user.id === socket?.id);
    chatMsg.isSub = user?.isSub;
    const chatWithTime: ChatMessage = {
      ...chatMsg,
      timestamp: new Date().toISOString(),
      videoTS: socket ? this.tsMap[socket.id] : undefined,
    };
    this.chat.push(chatWithTime);
    this.chat = this.chat.splice(-100);
    this.io.of(this.roomId).emit('REC:chat', chatWithTime);
  };

  private validateLock = (socketId: string) => {
    if (!this.lock) {
      return true;
    }
    const result = this.uidMap[socketId] === this.lock;
    if (!result) {
      console.log('[VALIDATELOCK] failed', socketId);
    }
    return result;
  };

  private validateOwner = async (uid: string) => {
    const result = await postgres?.query(
      'SELECT owner FROM room where "roomId" = $1',
      [this.roomId],
    );
    const owner = result?.rows[0]?.owner;
    return !owner || uid === owner;
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
    data: { uid: string; token: string },
  ) => {
    if (!data) {
      return;
    }
    const decoded = await validateUserToken(data.uid, data.token);
    if (decoded?.uid) {
      this.uidMap[socket.id] = decoded.uid;
    }
    const isSubscriber = await getIsSubscriberByEmail(decoded?.email);
    if (isSubscriber) {
      const user = this.roster.find((user) => user.id === socket.id);
      if (user) {
        user.isSub = true;
      }
    }
  };

  private startHosting = async (socket: Socket, data: string) => {
    if (data && data.length > 20000) {
      return;
    }
    if (!this.validateLock(socket.id)) {
      return;
    }
    const sharer = this.getRosterForApp().find((user) => user.isScreenShare);
    if (sharer || this.vBrowser) {
      // Can't update the video while someone is screensharing/filesharing or vbrowser is running
      return;
    }
    redisCount('urlStarts');
    // If a reddit URL, extract video URL
    if (
      data?.startsWith('https://www.reddit.com') ||
      data?.startsWith('https://old.reddit.com') ||
      data?.startsWith('https://reddit.com')
    ) {
      if (data.endsWith('/')) {
        // Remove trailing slash
        data = data.slice(0, -1);
      }
      data = data + '.json';
      // Extract fallback_url
      const resp = await axios.get(data);
      const json = resp.data;
      let reddit_m3u8 =
        json?.[0]?.data?.children?.[0]?.data?.secure_media?.reddit_video
          ?.hls_url;
      let reddit_mp4 =
        json?.[0]?.data?.children?.[0]?.data?.secure_media?.reddit_video
          ?.fallback_url;
      // prefer reddit m3u8 streams over the mp4 links as the m3u8 streams contain audio.
      data = reddit_m3u8 || reddit_mp4 || data;
    } else if (
      data?.startsWith('https://www.twitch.tv') ||
      data?.startsWith('https://twitch.tv')
    ) {
      try {
        // Extract m3u8 data
        // Note this won't work directly since Twitch will reject requests from the wrong origin--need to proxy the m3u8 playlist
        const channel = data.split('/').slice(-1)[0];
        const isStream = isNaN(Number(channel));
        let streams = [];
        if (isStream) {
          streams = await twitch.getStream(channel);
        } else {
          streams = await twitch.getVod(channel);
        }
        const parsed = new URL(streams?.[0].url);
        data =
          config.TWITCH_PROXY_PATH +
          '/proxy' +
          parsed.pathname +
          '?host=' +
          parsed.host +
          '&displayName=' +
          data;
      } catch (e) {
        console.warn(e);
      }
    }
    this.cmdHost(socket, data);
  };

  private playlistNext = (socket: Socket | null, data?: string) => {
    if (data && data.length > 20000) {
      return;
    }
    if (
      socket &&
      data &&
      this.video &&
      (data === this.video ||
        getYoutubeVideoID(data) === getYoutubeVideoID(this.video))
    ) {
      this.nextVotes[socket.id] = data;
    }
    const votes = this.roster.filter((user) => this.nextVotes[user.id]).length;
    if (!socket || votes >= Math.floor(this.roster.length / 2)) {
      const next = this.playlist.shift();
      this.io.of(this.roomId).emit('playlist', this.playlist);
      if (next) {
        this.cmdHost(null, next.url);
      }
    }
  };

  public playlistAdd = async (socket: Socket | null, data: string) => {
    if (data && data.length > 20000) {
      return;
    }
    redisCount('playlistAdds');
    const youtubeVideoId = getYoutubeVideoID(data);
    if (youtubeVideoId) {
      const video = await fetchYoutubeVideo(youtubeVideoId);
      if (video) {
        this.playlist.push(video);
      }
    } else {
      this.playlist.push({
        name: data,
        channel: 'Video URL',
        duration: 0,
        url: data,
        type: data.startsWith('magnet:') ? 'magnet' : 'file',
      });
    }
    this.io.of(this.roomId).emit('playlist', this.playlist);
    if (socket) {
      const chatMsg = {
        id: socket.id,
        cmd: 'playlistAdd',
        msg: data,
      };
      this.addChatMessage(socket, chatMsg);
    }
    if (!this.video) {
      this.playlistNext(null);
    }
  };

  private playlistDelete = (socket: Socket, index: number) => {
    if (index !== -1) {
      this.playlist.splice(index, 1);
      this.io.of(this.roomId).emit('playlist', this.playlist);
    }
  };

  private playlistMove = (
    socket: Socket,
    data: { index: number; toIndex: number },
  ) => {
    if (data.index !== -1) {
      const items = this.playlist.splice(data.index, 1);
      this.playlist.splice(data.toIndex, 0, items[0]);
      this.io.of(this.roomId).emit('playlist', this.playlist);
    }
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
    const chatMsg = { id: socket.id, cmd: 'seek', msg: data?.toString() };
    this.addChatMessage(socket, chatMsg);
  };

  private setPlaybackRate = (socket: Socket, data: number) => {
    if (String(data).length > 100) {
      return;
    }
    if (!this.validateLock(socket.id)) {
      return;
    }
    this.playbackRate = Number(data);
    this.io.of(this.roomId).emit('REC:playbackRate', Number(data));
    const chatMsg = {
      id: socket.id,
      cmd: 'playbackRate',
      msg: data?.toString(),
    };
    this.addChatMessage(socket, chatMsg);
  };

  private setLoop = (socket: Socket, data: boolean) => {
    if (String(data).length > 100) {
      return;
    }
    if (!this.validateLock(socket.id)) {
      return;
    }
    this.loop = data;
    this.io.of(this.roomId).emit('REC:loop', data);
  };

  private setTimestamp = (socket: Socket, data: number) => {
    if (String(data).length > 100) {
      return;
    }
    // Prevent lagging TS updates from the old video from messing up our timestamps
    if (this.preventTSUpdate) {
      return;
    }
    if (data > this.videoTS) {
      this.videoTS = data;
    }
    // Normalize the received TS based on how long since the last tsMap emit
    // Later sends will have higher values so subtract the difference
    // Add 1 as we will emit 1 second from the last one
    const timeSinceTsMap = Date.now() - this.lastTsMap;
    // console.log(socket.id, 'offset', offset, 'ms');
    this.tsMap[socket.id] = data - timeSinceTsMap / 1000 + 1;

    // Calculate and update the zero time for each person (wall time - reported ts)
    // const zeroTimeMs = Date.now() - Math.floor(data * 1000);
    // this.zeroTimeMap[socket.id] = zeroTimeMs;
  };

  private sendChatMessage = (socket: Socket, data: string) => {
    if (data && data.length > 10000) {
      return;
    }
    redisCount('chatMessages');
    const chatMsg = { id: socket.id, msg: data };
    this.addChatMessage(socket, chatMsg);
  };

  private addReaction = (
    socket: Socket,
    data: { value: string; msgId: string; msgTimestamp: string },
  ) => {
    // Emojis can be multiple bytes
    if (data.value.length > 8) {
      return;
    }
    const msg = this.chat.find(
      (m) => m.id === data.msgId && m.timestamp === data.msgTimestamp,
    );
    if (!msg) {
      return;
    }
    msg.reactions = msg.reactions || {};
    msg.reactions[data.value] = msg.reactions[data.value] || [];

    if (!msg.reactions[data.value].includes(socket.id)) {
      msg.reactions[data.value].push(socket.id);
      const reaction: Reaction = { user: socket.id, ...data };
      redisCount('addReaction');
      this.io.of(this.roomId).emit('REC:addReaction', reaction);
    }
  };

  private removeReaction = (
    socket: Socket,
    data: { value: string; msgId: string; msgTimestamp: string },
  ) => {
    // Emojis can be multiple bytes
    if (data.value.length > 8) {
      return;
    }
    const msg = this.chat.find(
      (m) => m.id === data.msgId && m.timestamp === data.msgTimestamp,
    );
    if (!msg || !msg.reactions?.[data.value]) {
      return;
    }
    msg.reactions[data.value] = msg.reactions[data.value].filter(
      (id) => id !== socket.id,
    );
    const reaction: Reaction = { user: socket.id, ...data };
    this.io.of(this.roomId).emit('REC:removeReaction', reaction);
  };

  private joinVideo = (socket: Socket) => {
    const match = this.roster.find((user) => user.id === socket.id);
    if (match) {
      match.isVideoChat = true;
      redisCount('videoChatStarts');
    }
    this.io.of(this.roomId).emit('roster', this.getRosterForApp());
  };

  private leaveVideo = (socket: Socket) => {
    const match = this.roster.find((user) => user.id === socket.id);
    if (match) {
      match.isVideoChat = false;
    }
    this.io.of(this.roomId).emit('roster', this.getRosterForApp());
  };

  private setUserMute = (socket: Socket, data: { isMuted: boolean }) => {
    const match = this.roster.find((user) => user.id === socket.id);
    if (match) {
      match.isMuted = data.isMuted;
    }
    this.io.of(this.roomId).emit('roster', this.getRosterForApp());
  };

  private joinScreenSharing = (
    socket: Socket,
    data: { file: boolean; mediasoup?: boolean },
  ) => {
    if (!this.validateLock(socket.id)) {
      return;
    }
    const sharer = this.getRosterForApp().find((user) => user.isScreenShare);
    if (sharer) {
      // Someone's already sharing
      return;
    }
    let mediasoupSuffix = '';
    if (data?.mediasoup) {
      // TODO validate the user has permissions to ask for a mediasoup
      // TODO set up the room on the remote server rather than letting the remote server create
      mediasoupSuffix = '@' + config.MEDIASOUP_SERVER + '/' + uuidv4();
      redisCount('mediasoupStarts');
    }
    if (data && data.file) {
      this.cmdHost(
        socket,
        'fileshare://' + this.clientIdMap[socket.id] + mediasoupSuffix,
      );
      redisCount('fileShareStarts');
    } else {
      this.cmdHost(
        socket,
        'screenshare://' + this.clientIdMap[socket.id] + mediasoupSuffix,
      );
      redisCount('screenShareStarts');
    }
    this.io.of(this.roomId).emit('roster', this.getRosterForApp());
  };

  private leaveScreenSharing = (socket: Socket) => {
    const sharer = this.getRosterForApp().find((user) => user.isScreenShare);
    if (!sharer || sharer?.id !== socket.id) {
      return;
    }
    this.cmdHost(socket, '');
    this.io.of(this.roomId).emit('roster', this.getRosterForApp());
  };

  private startVBrowser = async (
    socket: Socket,
    data: {
      uid: string;
      token: string;
      rcToken: string;
      options: { size: string; region: string; provider: string };
    },
  ) => {
    if (!this.validateLock(socket.id)) {
      socket.emit('errorMessage', 'Room is locked.');
      return;
    }
    if (!data) {
      socket.emit('errorMessage', 'Invalid input.');
      return;
    }

    const clientId = this.clientIdMap[socket.id];
    let uid: string = '';

    // these checks are skipped if firebase not provided
    if (config.FIREBASE_ADMIN_SDK_CONFIG) {
      const decoded = await validateUserToken(data.uid, data.token);
      if (!decoded || !decoded.uid) {
        socket.emit('errorMessage', 'Invalid user token.');
        return;
      }

      const user = await getUser(decoded.uid);
      // Validate verified email if not a third-party auth provider
      if (
        user?.providerData[0].providerId === 'password' &&
        !user?.emailVerified
      ) {
        socket.emit(
          'errorMessage',
          'A verified email is required to start a VBrowser.',
        );
        return;
      }

      uid = decoded.uid;

      // Log the vbrowser creation by uid and clientid
      if (redis) {
        const expireTime = getStartOfDay() / 1000 + 86400;
        if (clientId) {
          const clientCount = await redis.zincrby(
            'vBrowserClientIDs',
            1,
            clientId,
          );
          redis.expireat('vBrowserClientIDs', expireTime);
          const clientMinutes = await redis.zincrby(
            'vBrowserClientIDMinutes',
            1,
            clientId,
          );
          redis.expireat('vBrowserClientIDMinutes', expireTime);
        }
        if (uid) {
          const uidCount = await redis.zincrby('vBrowserUIDs', 1, uid);
          redis.expireat('vBrowserUIDs', expireTime);
          const uidMinutes = await redis.zincrby('vBrowserUIDMinutes', 1, uid);
          redis.expireat('vBrowserUIDMinutes', expireTime);
          // TODO limit users based on client or uid usage
        }
      }
      // check if the user already has a VM already in postgres
      if (postgres) {
        const { rows } = await postgres.query(
          'SELECT count(1) from vbrowser WHERE uid = $1',
          [decoded.uid],
        );
        if (rows[0].count >= 2) {
          socket.emit(
            'errorMessage',
            'There is already an active vBrowser for this user.',
          );
          return;
        }
      }
    }
    let isLarge = false;
    let region = config.DEFAULT_VM_REGION;
    let isSubscriber = false;
    if (data && data.uid && data.token) {
      const decoded = await validateUserToken(data.uid, data.token);
      isSubscriber = await getIsSubscriberByEmail(decoded?.email);
    }
    // Check if user is subscriber or firebase not configured, if so allow sub options
    if (isSubscriber || !config.FIREBASE_ADMIN_SDK_CONFIG) {
      isLarge = data.options?.size === 'large';
      if (data.options?.region) {
        region = data.options?.region;
      }
    }

    if (config.RECAPTCHA_SECRET_KEY) {
      try {
        // Validate the request isn't spam/automated
        const validation = await axios({
          url: `https://www.google.com/recaptcha/api/siteverify?secret=${config.RECAPTCHA_SECRET_KEY}&response=${data.rcToken}`,
          method: 'POST',
        });
        // console.log(validation?.data);
        const isLowScore = validation?.data?.score < 0.1;
        const failed = validation?.data?.success === false;
        if (failed || isLowScore) {
          if (isLowScore) {
            redisCount('recaptchaRejectsLowScore');
          } else {
            console.log('[RECAPTCHA] score: ', validation?.data);
            redisCount('recaptchaRejectsOther');
          }
          socket.emit('errorMessage', 'Invalid ReCAPTCHA.');
          return;
        }
      } catch (e) {
        // if Recaptcha is down or other network issues, allow continuing
        console.warn(e);
      }
    }

    redisCount('vBrowserStarts');
    this.cmdHost(socket, 'vbrowser://');
    // Put the room in the vbrowser queue
    this.vBrowserQueue = {
      roomId: this.roomId,
      queueTime: new Date(),
      isLarge,
      region,
      uid,
      clientId,
    };
    // Check if a vbrowser is available
    while (this.vBrowserQueue) {
      const { queueTime, isLarge, region, uid, roomId, clientId } =
        this.vBrowserQueue;
      let assignment: AssignedVM | undefined = undefined;
      try {
        if (stateless) {
          const pass = uuidv4();
          const id = await stateless.startVM(pass);
          assignment = {
            ...(await stateless.getVM(id)),
            pass,
            assignTime: Date.now(),
          };
        } else {
          const { data } = await axios.post<AssignedVM>(
            'http://localhost:' + config.VMWORKER_PORT + '/assignVM',
            {
              isLarge,
              region,
              uid,
              roomId,
            },
          );
          assignment = data;
        }
      } catch (e) {
        console.warn(e);
      }
      if (assignment) {
        this.vBrowser = assignment;
        this.vBrowser.controllerClient = clientId;
        this.vBrowser.creatorUID = uid;
        this.vBrowser.creatorClientID = clientId;
        const assignEnd = Number(new Date());
        const assignElapsed = assignEnd - Number(queueTime);
        await redis?.lpush('vBrowserStartMS', assignElapsed);
        await redis?.ltrim('vBrowserStartMS', 0, 24);
        console.log(
          '[ASSIGN] %s to %s in %s',
          assignment.provider + ':' + assignment.id,
          roomId,
          assignElapsed + 'ms',
        );
        this.cmdHost(
          null,
          'vbrowser://' + this.vBrowser.pass + '@' + this.vBrowser.host,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  };

  private stopVBrowser = async (socket: Socket) => {
    if (!this.vBrowser && this.video !== 'vbrowser://') {
      return;
    }
    if (!this.validateLock(socket.id)) {
      return;
    }
    await this.stopVBrowserInternal();
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
    if (data && data.length > 10000) {
      return;
    }
    if (!this.validateLock(socket.id)) {
      return;
    }
    this.subtitle = data;
    this.io.of(this.roomId).emit('REC:subtitle', this.subtitle);
  };

  private lockRoom = async (
    socket: Socket,
    data: { uid: string; token: string; locked: boolean },
  ) => {
    if (!data) {
      return;
    }
    const decoded = await validateUserToken(data.uid, data.token);
    if (!decoded) {
      return;
    }
    if (!this.validateLock(socket.id) && !this.validateOwner(decoded.uid)) {
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

  private setRoomOwner = async (
    socket: Socket,
    data: {
      uid: string;
      token: string;
      undo: boolean;
    },
  ) => {
    if (!postgres) {
      socket.emit('errorMessage', 'Database is not available');
      return;
    }
    const decoded = await validateUserToken(
      data?.uid as string,
      data?.token as string,
    );
    if (!decoded) {
      socket.emit('errorMessage', 'Failed to authenticate user');
      return;
    }
    const owner = decoded.uid;
    const isOwner = await this.validateOwner(decoded.uid);
    if (!isOwner) {
      socket.emit('errorMessage', 'Not current room owner');
      return;
    }
    const isSubscriber = await getIsSubscriberByEmail(decoded?.email);
    if (data.undo) {
      await updateObject(
        postgres,
        'room',
        {
          password: null,
          owner: null,
          vanity: null,
          isChatDisabled: null,
          isSubRoom: null,
          roomTitle: null,
          roomDescription: null,
          roomTitleColor: null,
          mediaPath: null,
        },
        { roomId: this.roomId },
      );
      socket.emit('REC:getRoomState', {});
    } else {
      // validate room count
      const roomCount = (
        await postgres.query(
          'SELECT count(1) from room where owner = $1 AND "roomId" != $2',
          [owner, this.roomId],
        )
      ).rows[0].count;
      const limit = isSubscriber
        ? config.SUBSCRIBER_ROOM_LIMIT
        : config.FREE_ROOM_LIMIT;
      if (roomCount >= limit) {
        socket.emit(
          'errorMessage',
          `You've exceeded the permanent room limit. Subscribe for additional permanent rooms.`,
        );
        return;
      }
      const roomObj = {
        roomId: this.roomId,
        owner: owner,
        isSubRoom: isSubscriber,
      };
      let result: QueryResult | null = null;
      result = await upsertObject(postgres, 'room', roomObj, {
        roomId: true,
      });
      const row = result?.rows?.[0];
      // console.log(result, row);
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
      `SELECT password, vanity, owner, "isChatDisabled", "roomTitle", "roomDescription", "roomTitleColor", "mediaPath" FROM room where "roomId" = $1`,
      [this.roomId],
    );
    const first = result.rows[0];
    if (this.isChatDisabled === undefined) {
      this.isChatDisabled = Boolean(first?.isChatDisabled);
    }
    // TODO only send the password if this is current owner
    socket.emit('REC:getRoomState', {
      password: first?.password,
      vanity: first?.vanity,
      owner: first?.owner,
      isChatDisabled: first?.isChatDisabled,
      roomTitle: first?.roomTitle,
      roomDescription: first?.roomDescription,
      roomTitleColor: first?.roomTitleColor,
      mediaPath: first?.mediaPath,
    });
  };

  private setRoomState = async (
    socket: Socket,
    data: {
      uid: string;
      token: string;
      password: string;
      vanity: string;
      isChatDisabled: boolean;
      roomTitle: string;
      roomDescription: string;
      roomTitleColor: string;
      mediaPath: string;
    },
  ) => {
    if (!postgres) {
      socket.emit('errorMessage', 'Database is not available');
      return;
    }
    const decoded = await validateUserToken(
      data?.uid as string,
      data?.token as string,
    );
    if (!decoded) {
      socket.emit('errorMessage', 'Failed to authenticate user');
      return;
    }
    const isOwner = await this.validateOwner(decoded.uid);
    if (!isOwner) {
      socket.emit('errorMessage', 'Not current room owner');
      return;
    }
    const isSubscriber = await getIsSubscriberByEmail(decoded?.email);
    const {
      password,
      vanity,
      isChatDisabled,
      roomTitle,
      roomDescription,
      roomTitleColor,
      mediaPath,
    } = data;
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
    if (roomTitle && roomTitle.length > 50) {
      socket.emit('errorMessage', 'Room title too long');
      return;
    }
    if (roomDescription && roomDescription.length > 120) {
      socket.emit('errorMessage', 'Room description too long');
      return;
    }
    // check if is valid hex color representation
    if (!/^#([0-9a-f]{3}){1,2}$/i.test(roomTitleColor)) {
      socket.emit('errorMessage', 'Invalid color code');
      return;
    }
    if (mediaPath && mediaPath.length > 1000) {
      socket.emit('errorMessage', 'Media source too long');
      return;
    }
    // console.log(owner, vanity, password);
    const roomObj: any = {
      roomId: this.roomId,
      password: password,
      isChatDisabled: isChatDisabled,
      mediaPath: mediaPath,
    };
    if (isSubscriber) {
      // user must be sub to set certain properties
      roomObj.vanity = vanity;
      roomObj.roomTitle = roomTitle;
      roomObj.roomDescription = roomDescription;
      roomObj.roomTitleColor = roomTitleColor;
    }
    try {
      const query = `UPDATE room
        SET ${Object.keys(roomObj).map((k, i) => `"${k}" = $${i + 1}`)}
        WHERE "roomId" = $${Object.keys(roomObj).length + 1}
        AND owner = $${Object.keys(roomObj).length + 2}
        RETURNING *`;
      const result = await postgres.query(query, [
        ...Object.values(roomObj),
        this.roomId,
        decoded.uid,
      ]);
      const row = result.rows[0];
      this.isChatDisabled = Boolean(row?.isChatDisabled);
      // TODO only send password if current owner
      this.io.of(this.roomId).emit('REC:getRoomState', {
        password: row?.password,
        vanity: row?.vanity,
        owner: row?.owner,
        isChatDisabled: row?.isChatDisabled,
        roomTitle: row?.roomTitle,
        roomDescription: row?.roomDescription,
        roomTitleColor: row?.roomTitleColor,
        mediaPath: row?.mediaPath,
      });
      socket.emit('successMessage', 'Saved admin settings');
    } catch (e) {
      console.warn(e);
    }
  };

  private sendSignal = (socket: Socket, data: { to: string; msg: string }) => {
    if (!data) {
      return;
    }
    const fromClientId = this.clientIdMap[socket.id];
    const toId = this.roster.find((p) => p.clientId === data.to)?.id;
    this.io
      .of(this.roomId)
      .to(toId ?? '')
      .emit('signal', { from: fromClientId, msg: data.msg });
  };

  private signalSS = (
    socket: Socket,
    data: { to: string; sharer: boolean; msg: string },
  ) => {
    if (!data) {
      return;
    }
    const fromClientId = this.clientIdMap[socket.id];
    const toId = this.roster.find((p) => p.clientId === data.to)?.id;
    this.io
      .of(this.roomId)
      .to(toId ?? '')
      .emit('signalSS', {
        from: fromClientId,
        sharer: data.sharer,
        msg: data.msg,
      });
  };

  private disconnectUser = (socket: Socket) => {
    let index = this.roster.findIndex((user) => user.id === socket.id);
    const removed = this.roster.splice(index, 1)[0];
    this.io.of(this.roomId).emit('roster', this.getRosterForApp());
    const wasSharer = removed.clientId === this.getSharerId();
    if (wasSharer) {
      // Reset the room state since we lost the screen sharer
      this.cmdHost(socket, '');
    }
    delete this.tsMap[socket.id];
    // delete nameMap[socket.id];
  };

  private kickUser = async (
    socket: Socket,
    data: {
      uid: string;
      token: string;
      userToBeKicked: string;
    },
  ) => {
    const decoded = await validateUserToken(
      data?.uid as string,
      data?.token as string,
    );
    if (!decoded) {
      socket.emit('errorMessage', 'Failed to authenticate user');
      return;
    }
    const isOwner = await this.validateOwner(decoded.uid);
    if (!isOwner) {
      socket.emit('errorMessage', 'Not current room owner');
      return;
    }
    const userToBeKickedSocket = this.io
      .of(this.roomId)
      .sockets.get(data.userToBeKicked);
    if (userToBeKickedSocket) {
      try {
        userToBeKickedSocket.emit('kicked');
        userToBeKickedSocket.disconnect();
      } catch (e) {
        console.warn(e);
      }
    }
  };

  private deleteChatMessages = async (
    socket: Socket,
    data: {
      author: string;
      timestamp: string | undefined;
      uid: string;
      token: string;
    },
  ) => {
    const decoded = await validateUserToken(
      data?.uid as string,
      data?.token as string,
    );
    if (!decoded) {
      socket.emit('errorMessage', 'Failed to authenticate user');
      return;
    }
    const isOwner = await this.validateOwner(decoded.uid);
    if (!isOwner) {
      socket.emit('errorMessage', 'Not current room owner');
      return;
    }
    if (!data.timestamp && !data.author) {
      this.chat.length = 0;
    } else {
      this.chat = this.chat.filter((msg) => {
        if (data.timestamp) {
          return msg.id !== data.author || msg.timestamp !== data.timestamp;
        }
        return msg.id !== data.author;
      });
    }
    this.io.of(this.roomId).emit('chatinit', this.chat);
    return;
  };
}
