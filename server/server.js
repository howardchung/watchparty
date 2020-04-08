require('dotenv').config();
const { v4 } = require('uuid');
const fs = require('fs');
const express = require('express');
// const axios = require('axios');
const Moniker = require('moniker');
const Youtube = require("youtube-api");
const cors = require('cors');

const names = Moniker.generator([Moniker.adjective, Moniker.noun, Moniker.verb]);

const app = express();
let server = null;
if (process.env.HTTPS) {
    const key = fs.readFileSync('./server/insecurekey.pem');
    const cert = fs.readFileSync('./server/insecurecert.pem');
    server = require('https').createServer({key: key, cert: cert }, app);
} else {
    server = require('http').Server(app);
}
const io = require('socket.io')(server, { origins: '*:*'});

if (process.env.YOUTUBE_API_KEY) {
    Youtube.authenticate({
        type: "key",
        key: process.env.YOUTUBE_API_KEY,
    });
}

// const Turn = require('node-turn');
// const turnServer = new Turn({
//   // set options
//   listeningIps: ['0.0.0.0'],
//   // relayIps: ['13.66.162.252'],
//   authMech: 'long-term',
//   credentials: {
//     username: "password"
//   },
//   debugLevel: 'DEBUG',
// });
// turnServer.start();

server.listen(process.env.PORT || 8080);

app.use(cors());
app.use(express.static('build'));
app.get('/ping', (req, res) => {
  res.json('pong');
});

app.get('/youtube', (req, res) => {
    Youtube.search.list({ part: 'snippet', type: 'video', maxResults: 25, q: req.query.q }, (err, data) => {
        const response = data.items.map(video => {
            return { 
                url: 'https://www.youtube.com/watch?v=' + video.id.videoId,
                name: video.snippet.title,
                img: video.snippet.thumbnails.default.url,
            };
        });
        res.json(response);
    });
});

app.post('/createRoom', (req, res) => {
  let name = names.choose();
  // Keep retrying until no collision
  while(rooms.has(name)) {
    name = names.choose();
  }
  console.log('createRoom: ', name);
  rooms.set('/' + name, new Room('/' + name));
  res.json({ name });
});

function Room(roomId) {
  this.video = '';
  this.videoTS = 0;
  this.paused = false;
  this.roster = [];
  this.chat = [];
  this.tsMap = {};
  this.nameMap = {};
  
  const getHostState = () => {
    return { video: this.video, videoTS: this.videoTS, paused: this.paused };
  };
  
  setInterval(() => {
    // console.log(roomId, this.video, this.roster, this.tsMap, this.nameMap);
    io.of(roomId).emit('REC:tsMap', this.tsMap);
  }, 1000);
  
  io.of(roomId).on('connection', (socket) => {
    const addChatMessage = (chatMsg) => {
      const chatWithTime = {...chatMsg, timestamp: new Date().toISOString(), videoTS: this.tsMap[socket.id] };
      this.chat.push(chatWithTime);
      this.chat = this.chat.splice(-50);
      io.of(roomId).emit('REC:chat', chatWithTime);
    };
  
    // console.log(socket.id);
    this.roster.push({ id: socket.id });
  
    io.of(roomId).emit('roster', this.roster);
    socket.emit('chatinit', this.chat);
    socket.emit('REC:host', getHostState());
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
      io.of(roomId).emit('REC:host', getHostState());
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

const rooms = new Map();
rooms.set('/default', new Room('/default'));
