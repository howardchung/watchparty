require('dotenv').config();
const { v4 } = require('uuid');
const fs = require('fs');
const util = require('util');
const express = require('express');
// const axios = require('axios');
const Moniker = require('moniker');
const Youtube = require("youtube-api");
const cors = require('cors');
const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);
const names = Moniker.generator([Moniker.adjective, Moniker.noun, Moniker.verb]);

const rooms = new Map();
init();

async function init() {
    // Load rooms from Redis
    console.log('loading rooms from redis');
    const keys = await redis.keys('*');
    console.log(util.format('found %s rooms in redis', keys.length));
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const roomData = await redis.get(key);
        console.log(key, roomData.length);
        const roomObj = JSON.parse(roomData);
        rooms.set(key, new Room(key, roomObj));
    }

    if (!rooms.has('/default')) {
        rooms.set('/default', new Room('/default'));
    }

    // Start saving rooms to Redis
    setInterval(() => {
        rooms.forEach((value, key) => {
            const roomData = value.serialize();
            redis.setex(key, 60 * 60 * 1, roomData);
        });
    }, 2000);
}

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

class Room {
  video = '';
  videoTS = 0;
  paused = false;
  roster = [];
  chat = [];
  tsMap = {};
  nameMap = {};
  roomId = null;

  constructor(roomId, roomData) {
    this.roomId = roomId;
    if (roomData) {
        this.deserialize(roomData);
    }

    setInterval(() => {
        // console.log(roomId, this.video, this.roster, this.tsMap, this.nameMap);
        io.of(roomId).emit('REC:tsMap', this.tsMap);
    }, 1000);

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
    return JSON.stringify({ video: this.video, videoTS: this.videoTS, paused: this.paused, chat: this.chat });
  };

  deserialize = (roomData) => {
    this.video = roomData.video;
    this.videoTS = roomData.videoTS;
    this.paused = roomData.paused;
    this.chat = roomData.chat;
  }
  
  getHostState = () => {
    return { video: this.video, videoTS: this.videoTS, paused: this.paused };
  };
}

server.listen(process.env.PORT || 8080);

app.use(cors());
app.use(express.static('build'));

app.get('/ping', (req, res) => {
  res.json('pong');
});

app.get('/examples', (req, res) => {
    const examples = [
        'https://upload.wikimedia.org/wikipedia/commons/a/a5/Spring_-_Blender_Open_Movie.webm',
        'https://upload.wikimedia.org/wikipedia/commons/c/c0/Big_Buck_Bunny_4K.webm',
        'https://upload.wikimedia.org/wikipedia/commons/f/f1/Sintel_movie_4K.webm',
        'https://upload.wikimedia.org/wikipedia/commons/1/10/Tears_of_Steel_in_4k_-_Official_Blender_Foundation_release.webm',
        'https://upload.wikimedia.org/wikipedia/commons/3/36/Cosmos_Laundromat_-_First_Cycle_-_Official_Blender_Foundation_release.webm',
        'https://upload.wikimedia.org/wikipedia/commons/a/a2/Elephants_Dream_%282006%29.webm',
        'https://upload.wikimedia.org/wikipedia/commons/a/a9/HERO_-_Blender_Open_Movie-full_movie.webm',
        'https://upload.wikimedia.org/wikipedia/commons/0/02/Glass_Half_-_Blender_Open_Movie-full_movie.webm',
        'https://upload.wikimedia.org/wikipedia/commons/d/d0/Caminandes-_Llama_Drama_-_Short_Movie.ogv',
        'https://upload.wikimedia.org/wikipedia/commons/7/7c/Caminandes_-_Gran_Dillama_-_Blender_Foundation%27s_new_Open_Movie.webm',
        'https://upload.wikimedia.org/wikipedia/commons/a/ab/Caminandes_3_-_Llamigos_-_Blender_Animated_Short.webm',
    ].map(url => ({ url, type: 'file', name: url.slice(url.lastIndexOf('/') + 1) }));
    res.json(examples);
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