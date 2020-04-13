module.exports = class Room {
  video = '';
  videoTS = 0;
  paused = false;
  roster = [];
  chat = [];
  tsMap = {};
  nameMap = {};
  roomId = null;

  constructor(io, roomId, roomData) {
    this.roomId = roomId;
    if (roomData) {
        this.deserialize(roomData);
    }

    setInterval(() => {
        // console.log(roomId, this.video, this.roster, this.tsMap, this.nameMap);
        io.of(roomId).emit('REC:tsMap', this.tsMap);
    }, 3000);

    io.of(roomId).on('connection', (socket) => {
        // console.log(socket.id);
        const addChatMessage = (chatMsg) => {
            const chatWithTime = {...chatMsg, timestamp: new Date().toISOString(), videoTS: this.tsMap[socket.id] };
            this.chat.push(chatWithTime);
            this.chat = this.chat.splice(-50);
            io.of(roomId).emit('REC:chat', chatWithTime);
        };

        this.roster.push({ id: socket.id });
    
        io.of(roomId).emit('roster', this.roster);
        socket.emit('chatinit', this.chat);
        socket.emit('REC:host', this.getHostState());
        socket.emit('REC:nameMap', this.nameMap);
        socket.emit('REC:tsMap', this.tsMap);
    
        socket.on('CMD:name', (data) => {
            this.nameMap[socket.id] = data;
            io.of(roomId).emit('REC:nameMap', this.nameMap);
        });
        socket.on('CMD:host', (data) => {
            console.log(socket.id, data);
            this.video = data;
            this.videoTS = 0;
            this.paused = false;
            io.of(roomId).emit('REC:host', this.getHostState());
            const chatMsg = { id: socket.id, cmd: 'host', msg: data };
            addChatMessage(chatMsg);
        });
        socket.on('CMD:play', () => {
            socket.broadcast.emit('REC:play', this.video);
            const chatMsg = { id: socket.id, cmd: 'play', msg: this.tsMap[socket.id] };
            this.paused = false;
            addChatMessage(chatMsg);
        });
        socket.on('CMD:pause', () => {
            socket.broadcast.emit('REC:pause');
            const chatMsg = { id: socket.id, cmd: 'pause', msg: this.tsMap[socket.id] };
            this.paused = true;
            addChatMessage(chatMsg);
        });
        socket.on('CMD:seek', (data) => {
            this.videoTS = data;
            socket.broadcast.emit('REC:seek', data);
            const chatMsg = { id: socket.id, cmd: 'seek', msg: data };
            addChatMessage(chatMsg);
        });
        socket.on('CMD:ts', (data) => {
            this.videoTS = data;
            this.tsMap[socket.id] = data;
        });
        socket.on('CMD:chat', (data) => {
            const chatMsg = {id: socket.id, msg: data};
            addChatMessage(chatMsg);
        });
        socket.on('CMD:joinVideo', (data) => {
            const match = this.roster.find(user => user.id === socket.id);
            if (match) {
                match.isVideoChat = true;
            }
            io.of(roomId).emit('roster', this.roster);
        });
        socket.on('CMD:leaveVideo', (data) => {
            const match = this.roster.find(user => user.id === socket.id);
            if (match) {
                match.isVideoChat = false;
            }
            io.of(roomId).emit('roster', this.roster);
        });
        socket.on('signal', (data) => {
            io.of(roomId).to(data.to).emit('signal', { from: socket.id, msg: data.msg });
        });
    
        socket.on('disconnect', () => {
            let index = this.roster.findIndex(user => user.id === socket.id);
            this.roster.splice(index, 1);
            io.of(roomId).emit('roster', this.roster);
            // delete nameMap[socket.id];
            // delete tsMap[socket.id];
        });
    });
  }

  serialize = () => {
    return JSON.stringify({ video: this.video, videoTS: this.videoTS, paused: this.paused, nameMap: this.nameMap, chat: this.chat });
  };

  deserialize = (roomData) => {
    this.video = roomData.video;
    this.videoTS = roomData.videoTS;
    this.paused = roomData.paused;
    if (roomData.chat) {
        this.chat = roomData.chat;
    }
    if (roomData.nameMap) {
        this.nameMap = roomData.nameMap;
    }
  }
  
  getHostState = () => {
    return { video: this.video, videoTS: this.videoTS, paused: this.paused };
  };
}