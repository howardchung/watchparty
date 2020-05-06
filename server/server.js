require('dotenv').config();
const { v4 } = require('uuid');
const fs = require('fs');
const util = require('util');
const express = require('express');
// const axios = require('axios');
const Moniker = require('moniker');
const Youtube = require('youtube-api');
const cors = require('cors');
const Redis = require('ioredis');
const app = express();
let server = null;
if (process.env.HTTPS) {
  const key = fs.readFileSync('./server/insecurekey.pem');
  const cert = fs.readFileSync('./server/insecurecert.pem');
  server = require('https').createServer({ key: key, cert: cert }, app);
} else {
  server = require('http').Server(app);
}
const io = require('socket.io')(server, { origins: '*:*' });
const Room = require('./room');
const { resizeVMGroup, cleanupVMs, isVBrowserFeatureEnabled } = require('./vm');

const names = Moniker.generator([
  Moniker.adjective,
  Moniker.noun,
  Moniker.verb,
]);

const rooms = new Map();
init();

async function init() {
  if (process.env.REDIS_URL) {
    // Load rooms from Redis
    const redis = new Redis(process.env.REDIS_URL);
    console.log('loading rooms from redis');
    const keys = await redis.keys('/*');
    console.log(util.format('found %s rooms in redis', keys.length));
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const roomData = await redis.get(key);
      console.log(key, roomData.length);
      const roomObj = JSON.parse(roomData);
      rooms.set(key, new Room(io, key, roomObj));
    }
    // Start saving rooms to Redis
    setInterval(() => {
      // console.time('roomSave');
      rooms.forEach((value, key) => {
        if (value.roster.length) {
          const roomData = value.serialize();
          redis.setex(key, 60 * 60 * 3, roomData);
        }
      });
      // console.timeEnd('roomSave');
    }, 1000);
  }

  if (!rooms.has('/default')) {
    rooms.set('/default', new Room(io, '/default'));
  }

  if (isVBrowserFeatureEnabled()) {
    resizeVMGroup();
    cleanupVMs(Array.from(rooms.values()));
    setInterval(() => resizeVMGroup(), 30 * 1000);
    setInterval(() => cleanupVMs(Array.from(rooms.values())), 1 * 60 * 1000);
  }
}

if (process.env.YOUTUBE_API_KEY) {
  Youtube.authenticate({
    type: 'key',
    key: process.env.YOUTUBE_API_KEY,
  });
}

server.listen(process.env.PORT || 8080);

app.use(cors());
app.use(express.static('build'));

app.get('/ping', (req, res) => {
  res.json('pong');
});

app.get('/stats', (req, res) => {
  if (req.query.key && req.query.key === process.env.STATS_KEY) {
    const roomData = [];
    rooms.forEach((room) => {
      roomData.push({
        roomId: room.roomId,
        video: room.video,
        videoTS: room.videoTS,
        rosterLength: room.roster.length,
      });
    });
    res.json({
      roomCount: rooms.size,
      rooms: roomData,
    });
  } else {
    return res.status(403).json({ error: 'Access Denied' });
  }
});

app.get('/youtube', (req, res) => {
  Youtube.search.list(
    { part: 'snippet', type: 'video', maxResults: 25, q: req.query.q },
    (err, data) => {
      if (data && data.items) {
        const response = data.items.map((video) => {
          return {
            url: 'https://www.youtube.com/watch?v=' + video.id.videoId,
            name: video.snippet.title,
            img: video.snippet.thumbnails.default.url,
          };
        });
        res.json(response);
      } else {
        console.error(data);
        return res.status(500).json({ error: 'youtube error' });
      }
    }
  );
});

app.post('/createRoom', (req, res) => {
  let name = names.choose();
  // Keep retrying until no collision
  while (rooms.has(name)) {
    name = names.choose();
  }
  console.log('createRoom: ', name);
  rooms.set('/' + name, new Room(io, '/' + name));
  res.json({ name });
});

// process.on('SIGINT', () => { console.log("Bye bye!"); process.exit(); });

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
