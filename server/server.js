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
const Room = require('./room');

const names = Moniker.generator([Moniker.adjective, Moniker.noun, Moniker.verb]);

const rooms = new Map();
init();

async function init() {
    if (process.env.REDIS_URL) {
        // Load rooms from Redis
        const redis = new Redis(process.env.REDIS_URL);
        console.log('loading rooms from redis');
        const keys = await redis.keys('*');
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
            console.time('roomSave');
            rooms.forEach((value, key) => {
                if (value.roster.length) {
                    const roomData = value.serialize();
                    redis.setex(key, 60 * 60 * 3, roomData);
                }
            });
            console.timeEnd('roomSave');
        }, 1000);
    }

    if (!rooms.has('/default')) {
        rooms.set('/default', new Room(io, '/default'));
    }
}

if (process.env.YOUTUBE_API_KEY) {
    Youtube.authenticate({
        type: "key",
        key: process.env.YOUTUBE_API_KEY,
    });
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