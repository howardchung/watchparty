import { Socket } from 'socket.io';

import { Room } from './room';
import { validateUserToken } from './utils/firebase';
import { redisCount } from './utils/redis';

class Connection {
  private room: Room;
  private socket: Socket;
  public id: string;
  public uid?: string;

  constructor(options: { room: Room; socket: Socket }) {
    this.room = options.room;
    this.socket = options.socket;
    this.id = options.socket.id;
    this.setupEvents();
  }

  private setupEvents = () => {
    this.socket.on('CMD:name', this.changeUserName);
    this.socket.on('CMD:picture', this.changeUserPicture);
    this.socket.on('CMD:uid', this.assignUserID);
    this.socket.on('disconnect', this.disconnect);
    this.socket.on('CMD:joinVideo', this.joinVideo);
    this.socket.on('CMD:leaveVideo', this.leaveVideo);
  };

  /** Change this connections user name in the room */
  public changeUserName = (data: string) => {
    if (!data) {
      return;
    }
    if (data && data.length > 50) {
      return;
    }

    this.room.nameMap[this.socket.id] = data;
    this.room.io.of(this.room.roomId).emit('REC:nameMap', this.room.nameMap);
  };

  /** Change this connections user profile picture in this room */
  public changeUserPicture = (data: string) => {
    if (data && data.length > 10000) {
      return;
    }
    this.room.pictureMap[this.socket.id] = data;
    this.room.io
      .of(this.room.roomId)
      .emit('REC:pictureMap', this.room.pictureMap);
  };

  /** Assign a UID to this connection */
  private assignUserID = async (data: { uid: string; token: string }) => {
    if (!data) {
      return;
    }
    this.uid = data.uid;
    const decoded = await validateUserToken(data.uid, data.token);
    if (!decoded) {
      return;
    }
    // set it on the matching user socket
    let index = this.room.roster.findIndex(
      (user) => user.id === this.socket.id
    );
    if (index >= 0) {
      this.room.roster[index].uid = decoded.uid;
    }
    console.log('[CMD:UID]', index, decoded.uid);
    this.room.io.of(this.room.roomId).emit('roster', this.room.roster);
  };

  private disconnect = () => {
    let index = this.room.roster.findIndex(
      (user) => user.id === this.socket.id
    );
    const removed = this.room.roster.splice(index, 1)[0];
    this.room.io.of(this.room.roomId).emit('roster', this.room.roster);

    // Reset the room state since we lost the screen sharer
    if (removed.isScreenShare) {
      this.room.cmdHost(this.socket, '');
    }

    delete this.room.tsMap[this.socket.id];
    this.room.removeConnection(this.socket);
    // delete nameMap[socket.id];
  };

  private joinVideo = () => {
    const match = this.room.roster.find((user) => user.id === this.socket.id);
    if (match) {
      match.isVideoChat = true;
      redisCount('videoChatStarts');
    }
    this.room.io.of(this.room.roomId).emit('roster', this.room.roster);
  };

  private leaveVideo = () => {
    const match = this.room.roster.find((user) => user.id === this.socket.id);
    if (match) {
      match.isVideoChat = false;
    }
    this.room.io.of(this.room.roomId).emit('roster', this.room.roster);
  };
}

export default Connection;
