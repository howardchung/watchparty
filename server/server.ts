require('dotenv').config();
import fs from 'fs';
import util from 'util';
import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import Moniker from 'moniker';
import os from 'os';
import cors from 'cors';
import Redis from 'ioredis';
import https from 'https';
import http from 'http';
import socketIO from 'socket.io';
import { searchYoutube } from './utils/youtube';
import { Room } from './room';
import { getRedisCountDay, getRedisCountDayDistinct } from './utils/redis';
import { Scaleway } from './vm/scaleway';
import { Hetzner } from './vm/hetzner';
import { DigitalOcean } from './vm/digitalocean';
import { Docker } from './vm/docker';
import { VMManager } from './vm/base';
import { getCustomerByEmail, createSelfServicePortal } from './utils/stripe';
import { validateUserToken } from './utils/firebase';
import path from 'path';
import { Client } from 'pg';

const app = express();
let server: any = null;
if (process.env.HTTPS) {
  const key = fs.readFileSync(process.env.SSL_KEY_FILE as string);
  const cert = fs.readFileSync(process.env.SSL_CRT_FILE as string);
  server = https.createServer({ key: key, cert: cert }, app);
} else {
  server = new http.Server(app);
}
const io = socketIO(server, { origins: '*:*', transports: ['websocket'] });
let redis = (undefined as unknown) as Redis.Redis;
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL);
}
let postgres = (undefined as unknown) as Client;
if (process.env.DATABASE_URL) {
  postgres = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  postgres.connect();
}

const names = Moniker.generator([
  Moniker.adjective,
  Moniker.noun,
  Moniker.verb,
]);
const launchTime = Number(new Date());

const rooms = new Map<string, Room>();
// Start the VM manager
let vmManager: VMManager;
let vmManagerLarge: VMManager;
if (
  process.env.REDIS_URL &&
  process.env.SCW_SECRET_KEY &&
  process.env.SCW_ORGANIZATION
) {
  // new Scaleway(rooms, 0);
  // new Scaleway(rooms, 0, true)
}
if (process.env.REDIS_URL && process.env.HETZNER_TOKEN) {
  vmManager = new Hetzner(rooms);
  vmManagerLarge = new Hetzner(rooms, undefined, true);
}
if (process.env.REDIS_URL && process.env.DO_TOKEN) {
  // new DigitalOcean(rooms, 0);
  // new DigitalOcean(rooms, 0, true);
}
if (process.env.REDIS_URL && process.env.DOCKER_VM_HOST) {
  vmManager = new Docker(rooms, undefined, false);
}
const vmManagers = { standard: vmManager!, large: vmManagerLarge! };
init();

async function saveRooms() {
  while (true) {
    // console.time('roomSave');
    const roomArr = Array.from(rooms.values());
    for (let i = 0; i < roomArr.length; i++) {
      if (roomArr[i].roster.length) {
        await roomArr[i].saveToRedis();
        // await roomArr[i].saveToPostgres();
      }
    }
    // console.timeEnd('roomSave');
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
async function init() {
  if (redis) {
    // Load rooms from Redis
    console.log('loading rooms from redis');
    const keys = await redis.keys('/*');
    console.log(util.format('found %s rooms in redis', keys.length));
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const roomData = await redis.get(key);
      // console.log(key, roomData);
      try {
        rooms.set(key, new Room(io, vmManagers, key, roomData));
      } catch (e) {
        console.error(e);
      }
    }
    // load the roomState from postgres to fill any rooms that were lost in redis
    const postgresRooms = (await postgres.query('SELECT * from room')).rows;
    console.log(
      util.format('found %s rooms in postgres', postgresRooms.length)
    );
    for (let i = 0; i < postgresRooms.length; i++) {
      const key = postgresRooms[i].roomId;
      if (!rooms.has(key)) {
        rooms.set(
          key,
          new Room(io, vmManagers, key, JSON.stringify(postgresRooms[i]))
        );
      }
    }
    // Start saving rooms
    saveRooms();
  }

  if (!rooms.has('/default')) {
    rooms.set('/default', new Room(io, vmManagers, '/default'));
  }

  server.listen(process.env.PORT || 8080);
}

app.use(cors());
app.use(bodyParser.json());

app.get('/ping', (req, res) => {
  res.json('pong');
});

// Data's already compressed so go before the compression middleware
app.get('/subtitle/:hash', async (req, res) => {
  const gzipped = await redis.getBuffer('subtitle:' + req.params.hash);
  if (!gzipped) {
    return res.status(404).end('not found');
  }
  res.setHeader('Content-Encoding', 'gzip');
  res.end(gzipped);
});

app.use(compression());

app.get('/stats', async (req, res) => {
  if (req.query.key && req.query.key === process.env.STATS_KEY) {
    const roomData: any[] = [];
    const now = Number(new Date());
    let currentUsers = 0;
    let currentHttp = 0;
    let currentVBrowser = 0;
    let currentVBrowserLarge = 0;
    let currentScreenShare = 0;
    let currentFileShare = 0;
    let currentVideoChat = 0;
    rooms.forEach((room) => {
      const obj = {
        creationTime: room.creationTime,
        roomId: room.roomId,
        video: room.video,
        videoTS: room.videoTS,
        rosterLength: room.roster.length,
        videoChats: room.roster.filter((p) => p.isVideoChat).length,
        vBrowser: room.vBrowser,
        vBrowserElapsed:
          room.vBrowser?.assignTime && now - room.vBrowser?.assignTime,
        lock: room.lock || undefined,
      };
      currentUsers += obj.rosterLength;
      currentVideoChat += obj.videoChats;
      if (obj.vBrowser) {
        currentVBrowser += 1;
      }
      if (obj.vBrowser && obj.vBrowser.large) {
        currentVBrowserLarge += 1;
      }
      if (obj.video?.startsWith('http') && obj.rosterLength) {
        currentHttp += 1;
      }
      if (obj.video?.startsWith('screenshare://') && obj.rosterLength) {
        currentScreenShare += 1;
      }
      if (obj.video?.startsWith('fileshare://') && obj.rosterLength) {
        currentFileShare += 1;
      }
      if (obj.video) {
        roomData.push(obj);
      }
    });
    // Sort newest first
    roomData.sort((a, b) => b.creationTime - a.creationTime);
    const uptime = Number(new Date()) - launchTime;
    const cpuUsage = os.loadavg();
    const redisUsage = (await redis.info())
      .split('\n')
      .find((line) => line.startsWith('used_memory:'))
      ?.split(':')[1]
      .trim();
    const availableVBrowsers = await redis.lrange(
      vmManager?.getRedisQueueKey() || 'availableList',
      0,
      -1
    );
    const stagingVBrowsers = await redis.lrange(
      vmManager?.getRedisStagingKey() || 'stagingList',
      0,
      -1
    );
    const availableVBrowsersLarge = await redis.lrange(
      vmManagerLarge?.getRedisQueueKey() || 'availableList',
      0,
      -1
    );
    const stagingVBrowsersLarge = await redis.lrange(
      vmManagerLarge?.getRedisStagingKey() || 'stagingList',
      0,
      -1
    );
    const chatMessages = await getRedisCountDay('chatMessages');
    const vBrowserStarts = await getRedisCountDay('vBrowserStarts');
    const vBrowserLaunches = await getRedisCountDay('vBrowserLaunches');
    const vBrowserStartMS = await redis.lrange('vBrowserStartMS', 0, -1);
    const vBrowserSessionMS = await redis.lrange('vBrowserSessionMS', 0, -1);
    const vBrowserVMLifetime = await redis.lrange('vBrowserVMLifetime', 0, -1);
    const vBrowserTerminateTimeout = await getRedisCountDay(
      'vBrowserTerminateTimeout'
    );
    const vBrowserTerminateEmpty = await getRedisCountDay(
      'vBrowserTerminateEmpty'
    );
    const vBrowserTerminateManual = await getRedisCountDay(
      'vBrowserTerminateManual'
    );
    const recaptchaRejectsLowScore = await getRedisCountDay(
      'recaptchaRejectsLowScore'
    );
    const recaptchaRejectsOther = await getRedisCountDay(
      'recaptchaRejectsOther'
    );
    const urlStarts = await getRedisCountDay('urlStarts');
    const screenShareStarts = await getRedisCountDay('screenShareStarts');
    const fileShareStarts = await getRedisCountDay('fileShareStarts');
    const videoChatStarts = await getRedisCountDay('videoChatStarts');
    const connectStarts = await getRedisCountDay('connectStarts');
    const connectStartsDistinct = await getRedisCountDayDistinct(
      'connectStartsDistinct'
    );
    const subUploads = await getRedisCountDay('subUploads');
    const vBrowserClientIDs = await redis.zrevrangebyscore(
      'vBrowserClientIDs',
      '+inf',
      '0',
      'WITHSCORES',
      'LIMIT',
      0,
      20
    );
    const vBrowserUIDs = await redis.zrevrangebyscore(
      'vBrowserUIDs',
      '+inf',
      '0',
      'WITHSCORES',
      'LIMIT',
      0,
      20
    );
    const vBrowserClientIDsCard = await redis.zcard('vBrowserClientIDs');
    const vBrowserUIDsCard = await redis.zcard('vBrowserUIDs');

    res.json({
      uptime,
      roomCount: rooms.size,
      cpuUsage,
      redisUsage,
      availableVBrowsers,
      stagingVBrowsers,
      availableVBrowsersLarge,
      stagingVBrowsersLarge,
      currentUsers,
      currentVBrowser,
      currentVBrowserLarge,
      currentHttp,
      currentScreenShare,
      currentFileShare,
      currentVideoChat,
      chatMessages,
      urlStarts,
      screenShareStarts,
      fileShareStarts,
      subUploads,
      videoChatStarts,
      connectStarts,
      connectStartsDistinct,
      vBrowserStarts,
      vBrowserLaunches,
      vBrowserTerminateManual,
      vBrowserTerminateEmpty,
      vBrowserTerminateTimeout,
      recaptchaRejectsLowScore,
      recaptchaRejectsOther,
      vBrowserStartMS,
      vBrowserSessionMS,
      vBrowserVMLifetime,
      vBrowserClientIDsCard,
      vBrowserUIDsCard,
      vBrowserClientIDs,
      vBrowserUIDs,
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
  const newRoom = new Room(io, vmManagers, '/' + name);
  newRoom.video = req.body?.video || '';
  rooms.set('/' + name, newRoom);
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

app.post('/manageSub', async (req, res) => {
  const decoded = await validateUserToken(req.body?.uid, req.body?.token);
  if (!decoded) {
    return res.status(400).json({ error: 'invalid user token' });
  }
  if (!decoded.email) {
    return res.status(400).json({ error: 'no email found' });
  }
  const customer = await getCustomerByEmail(decoded.email);
  if (!customer) {
    return res.status(400).json({ error: 'customer not found' });
  }
  const session = await createSelfServicePortal(
    customer.id,
    req.body?.return_url
  );
  return res.json(session);
});

app.get('/metadata', async (req, res) => {
  const decoded = await validateUserToken(
    req.query?.uid as string,
    req.query?.token as string
  );
  if (!decoded) {
    return res.status(400).json({ error: 'invalid user token' });
  }
  if (!decoded.email) {
    return res.status(400).json({ error: 'no email found' });
  }
  const customer = await getCustomerByEmail(decoded.email);
  if (!customer) {
    return res.status(400).json({ error: 'customer not found' });
  }
  const isSubscriber = Boolean(
    customer.subscriptions?.data?.[0]?.status === 'active'
  );
  return res.json({ isSubscriber });
});

app.get('/resolveRoom/:vanity', async (req, res) => {
  const vanity = req.params.vanity;
  const result = await postgres.query(
    `SELECT roomId as "roomId", vanity from room WHERE LOWER(vanity) = $1`,
    [vanity?.toLowerCase() ?? '']
  );
  // console.log(vanity, result.rows);
  // We also use this for checking name availability, so just return empty response if it doesn't exist (http 200)
  return res.json(result.rows[0]);
});

app.get('/listRooms', async (req, res) => {
  const decoded = await validateUserToken(
    req.query?.uid as string,
    req.query?.token as string
  );
  if (!decoded) {
    return res.status(400).json({ error: 'invalid user token' });
  }
  const result = await postgres.query(
    `SELECT roomId as "roomId", vanity from room WHERE owner = $1`,
    [decoded.uid]
  );
  return res.json(result.rows);
});

app.get('/kv', async (req, res) => {
  if (req.query.key === process.env.KV_KEY) {
    return res.end(await redis.get(('kv:' + req.query.k) as string));
  } else {
    return res.status(403).json({ error: 'Access Denied' });
  }
});

app.post('/kv', async (req, res) => {
  if (req.query.key === process.env.KV_KEY) {
    return res.end(
      await redis.setex(
        'kv:' + req.query.k,
        24 * 60 * 60,
        req.query.v as string
      )
    );
  } else {
    return res.status(403).json({ error: 'Access Denied' });
  }
});

app.use(express.static('build'));
// Send index.html for all other requests (SPA)
app.use('/*', (req, res) => {
  res.sendFile(path.resolve(__dirname + '/../build/index.html'));
});
