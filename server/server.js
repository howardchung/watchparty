const { v4 } = require('uuid');
const fs = require('fs');
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server, { origins: '*:*'});

server.listen(8080);

let video = null;
let videoTS = 0;
let roster = [];
let chat = [];
let tsMap = {};
let nameMap = {};
const mediaList = fs.readdirSync('./public/media/');

setInterval(() => {
  console.log(roster, tsMap, nameMap);
  io.emit('REC:tsMap', tsMap);
}, 1000);

io.on('connection', function (socket) {
  console.log(socket.id);
  roster.push({ id: socket.id });

  io.emit('roster', roster);
  socket.emit('chatinit', chat);
  socket.emit('REC:host', { video, videoTS });
  socket.emit('REC:nameMap', nameMap);
  socket.emit('REC:tsMap', tsMap);
  socket.emit('REC:mediaList', mediaList);
  
  socket.on('CMD:name', (data) => {
    nameMap[socket.id] = data;
    io.emit('REC:nameMap', nameMap);
  });
  socket.on('CMD:host', (data) => {
    console.log(socket.id, data);
    video = data;
    videoTS = 0;
    io.emit('REC:host', { video, videoTS });
    const chatMsg = { id: socket.id, cmd: 'host', msg: data };
    addChatMessage(chatMsg);
  });
  socket.on('CMD:play', () => {
    socket.broadcast.emit('REC:play', video);
    const chatMsg = { id: socket.id, cmd: 'play' };
    addChatMessage(chatMsg);
  });
  socket.on('CMD:pause', () => {
    socket.broadcast.emit('REC:pause');
    const chatMsg = { id: socket.id, cmd: 'pause' };
    addChatMessage(chatMsg);
  });
  socket.on('CMD:seek', (data) => {
     videoTS = data;
     socket.broadcast.emit('REC:seek', data);
     const chatMsg = { id: socket.id, cmd: 'seek', msg: data };
     addChatMessage(chatMsg);
  });
  socket.on('CMD:ts', (data) => {
     videoTS = data;
     tsMap[socket.id] = data;
  });
  socket.on('CMD:chat', (data) => {
     const chatMsg = {id: socket.id, msg: data};
     addChatMessage(chatMsg);
  });

  socket.on('disconnect', () => {
    let index = roster.findIndex(user => user.id === socket.id);
    roster.splice(index, 1);
    io.emit('roster', roster);
    // delete nameMap[socket.id];
    // delete tsMap[socket.id];
  });
  
  function addChatMessage(chatMsg) {
    const chatWithTime = {...chatMsg, timestamp: new Date().toISOString(), videoTS: tsMap[socket.id] };
    chat.push(chatWithTime);
    chat = chat.splice(-50);
    io.emit('REC:chat', chatWithTime);
  }
});
