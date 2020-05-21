import { Socket } from 'socket.io';

import Connection from './connection';
import { ChatMessage, NumberDict, PlaylistVideo, StringDict, User } from '.';

export class Room {
  public io: SocketIO.Server;
  public nameMap: StringDict = {};
  public pictureMap: StringDict = {};
  public roster: User[] = [];
  public roomId: string;
  public video?: PlaylistVideo | string;
  public videoTS = 0;
  public videoPlaylist: PlaylistVideo[] = [];
  public paused = false;
  public chat: ChatMessage[] = [];
  public tsMap: NumberDict = {};
  public vBrowser:
    | { assignTime?: number; pass?: string; host?: string; id?: string }
    | undefined = undefined;

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

    setInterval(() => {
      io.of(roomId).emit('REC:tsMap', this.tsMap);
    }, 1000);

    io.of(roomId).on('connection', (socket: Socket) => {
      new Connection(socket, this);
      socket.emit('REC:host', this.getHostState());
      socket.emit('REC:nameMap', this.nameMap);
      socket.emit('REC:pictureMap', this.pictureMap);
      socket.emit('REC:tsMap', this.tsMap);
      socket.emit('chatinit', this.chat);
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

  cmdHost(socket: Socket, data: string | PlaylistVideo) {
    if (!socket) {
      return;
    }

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
