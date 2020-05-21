require('dotenv').config();
import fs from 'fs';
import util from 'util';
import express from 'express';
import Moniker from 'moniker';
import Youtube from 'youtube-api';
import cors from 'cors';
import Redis from 'ioredis';
import https from 'https';
import http from 'http';
import socketIO from 'socket.io';
import { searchYoutube } from './utils/youtube';
import { Room } from './room';
import {
  resizeVMGroupIncr,
  resizeVMGroupDecr,
  cleanupVMGroup,
  isVBrowserFeatureEnabled,
} from './vm';

const app = express();
let server: any = null;
if (process.env.HTTPS) {
  const key = fs.readFileSync(process.env.SSL_KEY_FILE as string);
  const cert = fs.readFileSync(process.env.SSL_CRT_FILE as string);
  server = https.createServer({ key: key, cert: cert }, app);
} else {
  server = new http.Server(app);
}
const io = socketIO(server, { origins: '*:*' });
let redis = (undefined as unknown) as Redis.Redis;
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
}

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
    console.log('loading rooms from redis');
    const keys = await redis.keys('/*');
    console.log(util.format('found %s rooms in redis', keys.length));
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const roomData = await redis.get(key);
      console.log(key, roomData?.length);
      rooms.set(key, new Room(io, key, roomData));
    }
    // Start saving rooms to Redis
    setInterval(() => {
      // console.time('roomSave');
      rooms.forEach((value, key) => {
        if (value.roster.length) {
          const roomData = value.serialize();
          redis.setex(key, 24 * 60 * 60, roomData);
        }
      });
      // console.timeEnd('roomSave');
    }, 1000);
  }

  if (!rooms.has('/default')) {
    rooms.set('/default', new Room(io, '/default'));
  }

  if (isVBrowserFeatureEnabled()) {
    const release = async () => {
      // Reset VMs in rooms that are:
      // assigned more than 6 hours ago
      // assigned to a room with no users
      const roomArr = Array.from(rooms.values());
      for (let i = 0; i < roomArr.length; i++) {
        const room = roomArr[i];
        if (room.vBrowser && room.vBrowser.assignTime) {
          if (
            Number(new Date()) - room.vBrowser.assignTime >
              6 * 60 * 60 * 1000 ||
            room.roster.length === 0
          ) {
            console.log('[RESET] VM in room:', room.roomId);
            room.resetRoomVM();
          }
        }
      }
    };
    const renew = async () => {
      const roomArr = Array.from(rooms.values());
      for (let i = 0; i < roomArr.length; i++) {
        const room = roomArr[i];
        if (room.vBrowser && room.vBrowser.id) {
          console.log('[RENEW] VM in room:', room.roomId, room.vBrowser.id);
          // Renew the lock on the VM
          await redis.expire('vbrowser:' + room.vBrowser.id, 300);
        }
      }
    };
    setInterval(resizeVMGroupIncr, 15 * 1000);
    setInterval(resizeVMGroupDecr, 15 * 60 * 1000);
    setInterval(cleanupVMGroup, 60 * 1000);
    setInterval(renew, 30 * 1000);
    setInterval(release, 5 * 60 * 1000);
  }

  server.listen(process.env.PORT || 8080);
}

app.use(cors());
app.use(express.static('build'));

app.get('/ping', (req, res) => {
  res.json('pong');
});

app.get('/stats', (req, res) => {
  if (req.query.key && req.query.key === process.env.STATS_KEY) {
    const roomData: any[] = [];
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

app.get('/youtube', async (req, res) => {
  if (typeof req.query.q === 'string') {
    try {
      const items = await searchYoutube(req.query.q);
      res.json(items);
    } catch {
      return res.status(500).json({ error: 'youtube error' });
    }
  } else {
    return res.status(500).json({ error: 'query must be a string' });
  }
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

app.get('/settings', (req, res) => {
  if (req.hostname === process.env.CUSTOM_SETTINGS_HOSTNAME) {
    return res.json({
      mediaPath: process.env.MEDIA_PATH,
      streamPath: process.env.STREAM_PATH,
    });
  }
  return res.json({});
});
