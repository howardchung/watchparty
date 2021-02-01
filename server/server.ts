import config from './config';
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
import {
  getRedisCountDay,
  getRedisCountDayDistinct,
  redisCount,
} from './utils/redis';
import {
  getCustomerByEmail,
  createSelfServicePortal,
  getAllCustomers,
  getAllActiveSubscriptions,
} from './utils/stripe';
import { getUserByEmail, validateUserToken } from './utils/firebase';
import path from 'path';
import { Client } from 'pg';
import { getStartOfDay } from './utils/time';
import { createVMManagers } from './vm/utils';
import { fork } from 'child_process';

const releaseInterval = 5 * 60 * 1000;
const app = express();
let server: any = null;
if (config.HTTPS) {
  const key = fs.readFileSync(config.SSL_KEY_FILE as string);
  const cert = fs.readFileSync(config.SSL_CRT_FILE as string);
  server = https.createServer({ key: key, cert: cert }, app);
} else {
  server = new http.Server(app);
}
const io = socketIO(server, { origins: '*:*', transports: ['websocket'] });
let redis: Redis.Redis | undefined = undefined;
if (config.REDIS_URL) {
  redis = new Redis(config.REDIS_URL);
}
let postgres: Client | undefined = undefined;
if (config.DATABASE_URL) {
  postgres = new Client({
    connectionString: config.DATABASE_URL,
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
let permanentRooms: PermanentRoom[] = [];
const rooms = new Map<string, Room>();

const vmManagers = createVMManagers();
init();

async function init() {
  if (redis) {
    // Load rooms from Redis
    console.log('loading rooms from redis');
    const keys = await redis.keys(
      config.SHARD ? `/${config.SHARD}-[a-z]*` : '/[a-z]*'
    );
    console.log(util.format('found %s rooms in redis', keys.length));
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const roomData = await redis.get(key);
      // console.log(key, roomData);
      try {
        rooms.set(key, new Room(io, vmManagers, key, roomData));
      } catch (e) {
        console.warn(e);
      }
    }
  }
  if (postgres) {
    // load the roomState from postgres to fill any rooms that were lost in redis
    await cachePermanentRooms();
    const missingRooms = permanentRooms.filter(
      (room) => !rooms.has(room.roomId)
    );
    console.log(
      util.format(
        'found %s rooms in postgres missing from redis',
        missingRooms.length
      )
    );
    for (let i = 0; i < missingRooms.length; i++) {
      const key = missingRooms[i].roomId;
      rooms.set(
        key,
        new Room(io, vmManagers, key, JSON.stringify(missingRooms[i]))
      );
    }
  }

  if (!rooms.has('/default')) {
    rooms.set('/default', new Room(io, vmManagers, '/default'));
  }

  server.listen(config.PORT, config.HOST);
  // Following functions iterate over in-memory rooms
  setInterval(renew, 60 * 1000);
  setInterval(release, releaseInterval);
  setInterval(cleanupRooms, 5 * 60 * 1000);
  setInterval(cachePermanentRooms, 60 * 1000);
  saveRooms();
  if (process.env.NODE_ENV === 'development') {
    require('./vmWorker');
    require('./syncSubs');
    require('./timeSeries');
  }
}

app.use(cors());
app.use(bodyParser.json());

app.get('/ping', (req, res) => {
  res.json('pong');
});

// Data's already compressed so go before the compression middleware
app.get('/subtitle/:hash', async (req, res) => {
  const gzipped = await redis?.getBuffer('subtitle:' + req.params.hash);
  if (!gzipped) {
    return res.status(404).end('not found');
  }
  res.setHeader('Content-Encoding', 'gzip');
  res.end(gzipped);
});

app.use(compression());

app.get('/stats', async (req, res) => {
  if (req.query.key && req.query.key === config.STATS_KEY) {
    const stats = await getStats();
    if (
      stats.availableVBrowsers?.length === 0 ||
      stats.availableVBrowsersLarge?.length === 0
    ) {
      res.status(500);
    }
    res.json(stats);
  } else {
    return res.status(403).json({ error: 'Access Denied' });
  }
});

app.get('/timeSeries', async (req, res) => {
  if (req.query.key && req.query.key === config.STATS_KEY && redis) {
    const timeSeriesData = await redis.lrange('timeSeries', 0, -1);
    const timeSeries = timeSeriesData.map((entry) => JSON.parse(entry));
    res.json(timeSeries);
  } else {
    return res.status(403).json({ error: 'Access Denied' });
  }
});

app.get('/youtube', async (req, res) => {
  if (typeof req.query.q === 'string') {
    try {
      await redisCount('youtubeSearch');
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
  const genName = () =>
    '/' + (config.SHARD ? `${config.SHARD}-` : '') + names.choose();
  let name = genName();
  // Keep retrying until no collision
  while (rooms.has(name)) {
    name = genName();
  }
  console.log('createRoom: ', name);
  const newRoom = new Room(io, vmManagers, name);
  newRoom.video = req.body?.video || '';
  rooms.set(name, newRoom);
  res.json({ name: name.slice(1) });
});

app.get('/settings', (req, res) => {
  if (req.hostname === config.CUSTOM_SETTINGS_HOSTNAME) {
    return res.json({
      mediaPath: config.MEDIA_PATH,
      streamPath: config.STREAM_PATH,
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
    return res.json({ isSubscriber: false, isCustomer: false });
  }
  const isSubscriber = Boolean(
    customer.subscriptions?.data?.find((sub) => sub?.status === 'active')
  );
  const isCustomer = Boolean(customer.subscriptions?.data?.length);
  return res.json({ isSubscriber, isCustomer });
});

app.get('/resolveRoom/:vanity', async (req, res) => {
  const vanity = req.params.vanity;
  const result = await postgres?.query(
    `SELECT "roomId", vanity from room WHERE LOWER(vanity) = $1`,
    [vanity?.toLowerCase() ?? '']
  );
  // console.log(vanity, result.rows);
  // We also use this for checking name availability, so just return empty response if it doesn't exist (http 200)
  return res.json(result?.rows[0]);
});

app.get('/listRooms', async (req, res) => {
  const decoded = await validateUserToken(
    req.query?.uid as string,
    req.query?.token as string
  );
  if (!decoded) {
    return res.status(400).json({ error: 'invalid user token' });
  }
  const result = await postgres?.query<PermanentRoom>(
    `SELECT "roomId", vanity from room WHERE owner = $1`,
    [decoded.uid]
  );
  return res.json(result?.rows ?? []);
});

app.delete('/deleteRoom', async (req, res) => {
  const decoded = await validateUserToken(
    req.query?.uid as string,
    req.query?.token as string
  );
  if (!decoded) {
    return res.status(400).json({ error: 'invalid user token' });
  }
  const result = await postgres?.query(
    `DELETE from room WHERE owner = $1 and "roomId" = $2`,
    [decoded.uid, req.query.roomId]
  );
  return res.json(result?.rows);
});

app.get('/kv', async (req, res) => {
  if (req.query.key === config.KV_KEY && redis) {
    return res.end(await redis.get(('kv:' + req.query.k) as string));
  } else {
    return res.status(403).json({ error: 'Access Denied' });
  }
});

app.post('/kv', async (req, res) => {
  if (req.query.key === config.KV_KEY && redis) {
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

app.use(express.static(config.BUILD_DIRECTORY));
// Send index.html for all other requests (SPA)
app.use('/*', (req, res) => {
  res.sendFile(
    path.resolve(__dirname + `/../${config.BUILD_DIRECTORY}/index.html`)
  );
});

const forked = fork(__dirname + '/saveToRedis');
async function saveRooms() {
  setInterval(() => {
    const permanentSet = new Set(permanentRooms.map((room) => room.roomId));
    console.log(rooms, permanentSet);
    forked.send({ rooms, permanentSet });
  }, 1000);
}

function release() {
  // Reset VMs in rooms that are:
  // older than the session limit
  // assigned to a room with no users
  const roomArr = Array.from(rooms.values());
  for (let i = 0; i < roomArr.length; i++) {
    const room = roomArr[i];
    if (room.vBrowser && room.vBrowser.assignTime) {
      const maxTime = room.vBrowser.large
        ? 12 * 60 * 60 * 1000
        : 3 * 60 * 60 * 1000;
      const elapsed = Number(new Date()) - room.vBrowser.assignTime;
      const isTimedOut = elapsed > maxTime;
      const isAlmostTimedOut = elapsed > maxTime - releaseInterval;
      const isRoomEmpty = room.roster.length === 0;
      if (isTimedOut || isRoomEmpty) {
        console.log('[RELEASE] VM in room:', room.roomId);
        room.stopVBrowserInternal();
        if (isTimedOut) {
          room.addChatMessage(undefined, {
            id: '',
            system: true,
            cmd: 'vBrowserTimeout',
            msg: '',
          });
          redisCount('vBrowserTerminateTimeout');
        } else if (isRoomEmpty) {
          redisCount('vBrowserTerminateEmpty');
        }
      } else if (isAlmostTimedOut) {
        room.addChatMessage(undefined, {
          id: '',
          system: true,
          cmd: 'vBrowserAlmostTimeout',
          msg: '',
        });
      }
    }
  }
}
async function renew() {
  const roomArr = Array.from(rooms.values());
  for (let i = 0; i < roomArr.length; i++) {
    const room = roomArr[i];
    if (room.vBrowser && room.vBrowser.id) {
      // console.log('[RENEW] VM in room:', room.roomId, room.vBrowser.id);
      // Renew the lock on the VM
      await redis?.expire(
        'lock:' + room.vBrowser.provider + ':' + room.vBrowser.id,
        300
      );

      const expireTime = getStartOfDay() / 1000 + 86400;
      if (room.vBrowser.creatorClientID) {
        await redis?.zincrby(
          'vBrowserClientIDMinutes',
          1,
          room.vBrowser.creatorClientID
        );
        await redis?.expireat('vBrowserClientIDMinutes', expireTime);
      }
      if (room.vBrowser.creatorUID) {
        await redis?.zincrby('vBrowserUIDMinutes', 1, room.vBrowser.creatorUID);
        await redis?.expireat('vBrowserUIDMinutes', expireTime);
      }
    }
  }
}

function cleanupRooms() {
  // Clean up rooms that are no longer in Redis (expired) and empty
  // Frees up some JS memory space when process is long-running
  if (!redis) {
    return;
  }
  rooms.forEach(async (room, key) => {
    if (room.roster.length === 0) {
      const inRedis = await redis?.get(room.roomId);
      if (!inRedis) {
        rooms.delete(key);
      }
    }
  });
}

async function cachePermanentRooms() {
  if (!postgres) {
    return;
  }
  permanentRooms = (
    await postgres.query<PermanentRoom>(
      `SELECT * from room where "roomId" SIMILAR TO '${
        config.SHARD ? `/${config.SHARD}-[a-z]%` : '/[a-z]%'
      }'`
    )
  ).rows;
}

async function getStats() {
  const now = Number(new Date());
  const currentRoomData: any[] = [];
  let currentUsers = 0;
  let currentHttp = 0;
  let currentVBrowser = 0;
  let currentVBrowserLarge = 0;
  let currentVBrowserWaiting = 0;
  let currentScreenShare = 0;
  let currentFileShare = 0;
  let currentVideoChat = 0;
  let currentRoomSizeCounts: NumberDict = {};
  let currentVBrowserClientCounts: NumberDict = {};
  let currentRoomCount = rooms.size;
  const vmManager = vmManagers.standard;
  const vmManagerLarge = vmManagers.large;
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
    if (room.isAssigningVM) {
      currentVBrowserWaiting += 1;
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
    if (obj.rosterLength > 0) {
      if (!currentRoomSizeCounts[obj.rosterLength]) {
        currentRoomSizeCounts[obj.rosterLength] = 0;
      }
      currentRoomSizeCounts[obj.rosterLength] += 1;
    }
    if (obj.vBrowser && obj.vBrowser.creatorClientID) {
      if (!currentVBrowserClientCounts[obj.vBrowser.creatorClientID]) {
        currentVBrowserClientCounts[obj.vBrowser.creatorClientID] = 0;
      }
      currentVBrowserClientCounts[obj.vBrowser.creatorClientID] += 1;
    }
    if (obj.video) {
      currentRoomData.push(obj);
    }
  });

  currentVBrowserClientCounts = Object.fromEntries(
    Object.entries(currentVBrowserClientCounts).filter(([key, val]) => val > 1)
  );

  // Sort newest first
  currentRoomData.sort((a, b) => b.creationTime - a.creationTime);
  const uptime = Number(new Date()) - launchTime;
  const cpuUsage = os.loadavg();
  const memUsage = process.memoryUsage().rss;
  const redisUsage = (await redis?.info())
    ?.split('\n')
    .find((line) => line.startsWith('used_memory:'))
    ?.split(':')[1]
    .trim();
  const availableVBrowsers = await redis?.lrange(
    vmManager?.getRedisQueueKey() || 'availableList',
    0,
    -1
  );
  const stagingVBrowsers = await redis?.lrange(
    vmManager?.getRedisStagingKey() || 'stagingList',
    0,
    -1
  );
  const availableVBrowsersLarge = await redis?.lrange(
    vmManagerLarge?.getRedisQueueKey() || 'availableList',
    0,
    -1
  );
  const stagingVBrowsersLarge = await redis?.lrange(
    vmManagerLarge?.getRedisStagingKey() || 'stagingList',
    0,
    -1
  );
  const numPermaRooms = (await postgres?.query('SELECT count(1) from room'))
    ?.rows[0].count;
  const chatMessages = await getRedisCountDay('chatMessages');
  const vBrowserStarts = await getRedisCountDay('vBrowserStarts');
  const vBrowserLaunches = await getRedisCountDay('vBrowserLaunches');
  const vBrowserFails = await getRedisCountDay('vBrowserFails');
  const vBrowserStagingFails = await getRedisCountDay('vBrowserStagingFails');
  const vBrowserStartMS = await redis?.lrange('vBrowserStartMS', 0, -1);
  const vBrowserStageRetries = await redis?.lrange(
    'vBrowserStageRetries',
    0,
    -1
  );
  const vBrowserSessionMS = await redis?.lrange('vBrowserSessionMS', 0, -1);
  const vBrowserVMLifetime = await redis?.lrange('vBrowserVMLifetime', 0, -1);
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
  const recaptchaRejectsOther = await getRedisCountDay('recaptchaRejectsOther');
  const urlStarts = await getRedisCountDay('urlStarts');
  const screenShareStarts = await getRedisCountDay('screenShareStarts');
  const fileShareStarts = await getRedisCountDay('fileShareStarts');
  const videoChatStarts = await getRedisCountDay('videoChatStarts');
  const connectStarts = await getRedisCountDay('connectStarts');
  const connectStartsDistinct = await getRedisCountDayDistinct(
    'connectStartsDistinct'
  );
  const subUploads = await getRedisCountDay('subUploads');
  const youtubeSearch = await getRedisCountDay('youtubeSearch');
  const vBrowserClientIDs = await redis?.zrevrangebyscore(
    'vBrowserClientIDs',
    '+inf',
    '0',
    'WITHSCORES',
    'LIMIT',
    0,
    20
  );
  const vBrowserUIDs = await redis?.zrevrangebyscore(
    'vBrowserUIDs',
    '+inf',
    '0',
    'WITHSCORES',
    'LIMIT',
    0,
    20
  );
  const vBrowserClientIDMinutes = await redis?.zrevrangebyscore(
    'vBrowserClientIDMinutes',
    '+inf',
    '0',
    'WITHSCORES',
    'LIMIT',
    0,
    20
  );
  const vBrowserUIDMinutes = await redis?.zrevrangebyscore(
    'vBrowserUIDMinutes',
    '+inf',
    '0',
    'WITHSCORES',
    'LIMIT',
    0,
    20
  );
  const vBrowserClientIDsCard = await redis?.zcard('vBrowserClientIDs');
  const vBrowserUIDsCard = await redis?.zcard('vBrowserUIDs');

  return {
    uptime,
    cpuUsage,
    memUsage,
    redisUsage,
    currentRoomCount,
    currentRoomSizeCounts,
    currentUsers,
    currentVBrowser,
    currentVBrowserLarge,
    currentVBrowserWaiting,
    currentHttp,
    currentScreenShare,
    currentFileShare,
    currentVideoChat,
    currentVBrowserClientCounts,
    numPermaRooms,
    chatMessages,
    urlStarts,
    screenShareStarts,
    fileShareStarts,
    subUploads,
    youtubeSearch,
    videoChatStarts,
    connectStarts,
    connectStartsDistinct,
    vBrowserStarts,
    vBrowserLaunches,
    vBrowserFails,
    vBrowserStagingFails,
    vBrowserTerminateManual,
    vBrowserTerminateEmpty,
    vBrowserTerminateTimeout,
    recaptchaRejectsLowScore,
    recaptchaRejectsOther,
    availableVBrowsers,
    stagingVBrowsers,
    availableVBrowsersLarge,
    stagingVBrowsersLarge,
    vBrowserStartMS,
    vBrowserStageRetries,
    vBrowserSessionMS,
    vBrowserVMLifetime,
    vBrowserClientIDs,
    vBrowserClientIDsCard,
    vBrowserClientIDMinutes,
    vBrowserUIDs,
    vBrowserUIDsCard,
    vBrowserUIDMinutes,
    currentRoomData,
  };
}
