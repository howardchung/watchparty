import config from './config';
import fs from 'fs';
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
import { getCustomerByEmail, createSelfServicePortal } from './utils/stripe';
import { validateUserToken } from './utils/firebase';
import path from 'path';
import { Client } from 'pg';
import { getStartOfDay } from './utils/time';
import { getBgVMManagers, getSessionLimitSeconds } from './vm/utils';
import { hashString } from './utils/string';
import { insertObject } from './utils/postgres';

const releaseInterval = 5 * 60 * 1000;
const releaseBatches = 5;
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
const rooms = new Map<string, Room>();
const vmManagers = getBgVMManagers();
init();

async function init() {
  if (config.ENABLE_POSTGRES_READING && postgres) {
    console.time('[LOADROOMSPOSTGRES]');
    const permanentRooms = await getPermanentRooms();
    console.log('found %s rooms in postgres', permanentRooms.length);
    console.timeEnd('[LOADROOMSPOSTGRES]');
    for (let i = 0; i < permanentRooms.length; i++) {
      const key = permanentRooms[i].roomId;
      const data = permanentRooms[i].data
        ? JSON.stringify(permanentRooms[i].data)
        : undefined;
      const room = new Room(io, key, data);
      rooms.set(key, room);
    }
  } else if (redis) {
    // Load rooms from Redis
    console.time('[LOADROOMSREDIS]');
    const keys = await redis.keys(
      config.SHARD ? `/${config.SHARD}-[a-z]*` : '/[a-z]*'
    );
    const data = keys.length ? await redis?.mget(keys) : [];
    console.log('found %s rooms in redis', keys.length);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const roomData = data[i];
      // console.log(key, roomData);
      try {
        rooms.set(key, new Room(io, key, roomData));
      } catch (e) {
        console.warn(e);
      }
    }
    console.timeEnd('[LOADROOMSREDIS]');
    if (postgres) {
      console.time('[LOADMISSINGROOMSPOSTGRES]');
      const permanentRooms = await getPermanentRooms();
      console.log('found %s rooms in postgres', permanentRooms.length);
      const keySet = new Set(keys);
      for (let i = 0; i < permanentRooms.length; i++) {
        const key = permanentRooms[i].roomId;
        const data = JSON.stringify(permanentRooms[i]);
        if (!keySet.has(key)) {
          console.log('detected room %s in postgres but not redis', key);
          const missingRoom = new Room(io, key, data);
          missingRoom.saveToRedis(true);
          rooms.set(key, missingRoom);
        }
      }
      console.timeEnd('[LOADMISSINGROOMSPOSTGRES]');
      // temporarily give all non-permanent rooms without ttl a 1 day timeout (repair)
      // console.time('[TTLREPAIR]');
      // const permanentSet = new Set(permanentRooms.map((room) => room.roomId));
      // for (let i = 0; i < keys.length; i++) {
      //   const ttl = await redis.ttl(keys[i]);
      //   if (ttl === -1 && !permanentSet.has(keys[i])) {
      //     console.log(
      //       '[TTLREPAIR] setting ttl on non-permanent room %s',
      //       keys[i]
      //     );
      //     await redis.expire(keys[i], 24 * 60 * 60);
      //   }
      // }
      // console.timeEnd('[TTLREPAIR]');
    }
  }
  if (!rooms.has('/default')) {
    rooms.set('/default', new Room(io, '/default'));
  }

  server.listen(config.PORT, config.HOST);
  // Following functions iterate over in-memory rooms
  setInterval(minuteMetrics, 60 * 1000);
  setInterval(release, releaseInterval / releaseBatches);
  setInterval(cleanupRooms, 5 * 60 * 1000);
  saveRooms();
  if (process.env.NODE_ENV === 'development') {
    require('./vmWorker');
    require('./syncSubs');
    require('./timeSeries');
  }
}

app.use(cors());
app.use(bodyParser.json());

app.get('/ping', (_req, res) => {
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
    res.json(stats);
  } else {
    return res.status(403).json({ error: 'Access Denied' });
  }
});

app.get('/health/:metric', async (req, res) => {
  const stats = await getStats();
  const metrics: BooleanDict = {
    vBrowser: Boolean(stats.availableVBrowsers?.length),
    vBrowserLarge: Boolean(stats.availableVBrowsersLarge?.length),
  };
  const result = metrics[req.params.metric];
  res.status(result ? 200 : 500).json(result);
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

app.post('/createRoom', async (req, res) => {
  const genName = () =>
    '/' + (config.SHARD ? `${config.SHARD}-` : '') + names.choose();
  let name = genName();
  // Keep retrying until no collision
  while (rooms.has(name)) {
    name = genName();
  }
  console.log('createRoom: ', name);
  const newRoom = new Room(io, name);
  newRoom.video = req.body?.video || '';
  rooms.set(name, newRoom);
  newRoom.saveToRedis(false);
  if (config.ENABLE_POSTGRES_SAVING && postgres) {
    const roomObj: any = {
      roomId: newRoom.roomId,
      creationTime: newRoom.creationTime,
    };
    await insertObject(postgres, 'room', roomObj);
  }
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
  const isVMPoolFull = vmManagers?.standard
    ? Boolean(await redis?.get(vmManagers.standard.getRedisVMPoolFullKey()))
    : false;
  let isCustomer = false;
  let isSubscriber = false;
  if (decoded?.email) {
    const customer = await getCustomerByEmail(decoded.email);
    isSubscriber = Boolean(
      customer?.subscriptions?.data?.find((sub) => sub?.status === 'active')
    );
    isCustomer = Boolean(customer);
  }
  return res.json({ isSubscriber, isCustomer, isVMPoolFull });
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
app.use('/*', (_req, res) => {
  res.sendFile(
    path.resolve(__dirname + `/../${config.BUILD_DIRECTORY}/index.html`)
  );
});

async function saveRooms() {
  while (true) {
    // console.time('roomSave');
    const roomArr = Array.from(rooms.values());
    for (let i = 0; i < roomArr.length; i++) {
      if (roomArr[i].roster.length) {
        await roomArr[i].saveToRedis(null);
        // await roomArr[i].saveToPostgres();
      }
    }
    // console.timeEnd('roomSave');
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

let currBatch = 0;
async function release() {
  // Reset VMs in rooms that are:
  // older than the session limit
  // assigned to a room with no users
  const roomArr = Array.from(rooms.values()).filter((room) => {
    return hashString(room.roomId) % releaseBatches === currBatch;
  });
  console.log('[RELEASE][%s] %s rooms in batch', currBatch, roomArr.length);
  for (let i = 0; i < roomArr.length; i++) {
    const room = roomArr[i];
    if (room.vBrowser && room.vBrowser.assignTime) {
      const maxTime = getSessionLimitSeconds(room.vBrowser.large) * 1000;
      const elapsed = Number(new Date()) - room.vBrowser.assignTime;
      const ttl = maxTime - elapsed;
      const isTimedOut = ttl && ttl < releaseInterval;
      const isAlmostTimedOut = ttl && ttl < releaseInterval * 2;
      const isRoomEmpty = room.roster.length === 0;
      if (isTimedOut || isRoomEmpty) {
        console.log('[RELEASE][%s] VM in room:', currBatch, room.roomId);
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
  currBatch = (currBatch + 1) % releaseBatches;
}

async function minuteMetrics() {
  const roomArr = Array.from(rooms.values());
  for (let i = 0; i < roomArr.length; i++) {
    const room = roomArr[i];
    if (room.vBrowser && room.vBrowser.id) {
      // Renew the lock
      await redis?.expire(
        'lock:' + room.vBrowser.provider + ':' + room.vBrowser.id,
        300
      );

      const expireTime = getStartOfDay() / 1000 + 86400;
      if (room.vBrowser?.creatorClientID) {
        await redis?.zincrby(
          'vBrowserClientIDMinutes',
          1,
          room.vBrowser.creatorClientID
        );
        await redis?.expireat('vBrowserClientIDMinutes', expireTime);
      }
      if (room.vBrowser?.creatorUID) {
        await redis?.zincrby('vBrowserUIDMinutes', 1, room.vBrowser.creatorUID);
        await redis?.expireat('vBrowserUIDMinutes', expireTime);
      }
    }
  }
}

async function cleanupRooms() {
  // Clean up rooms that are no longer in Redis (expired) and empty
  // Frees up some JS memory space when process is long-running
  if (!redis) {
    return;
  }
  const permanentRooms = await getPermanentRooms();
  const permanentSet = new Set(permanentRooms.map((room) => room.roomId));
  rooms.forEach(async (room, key) => {
    if (room.roster.length === 0) {
      const inRedis = await redis?.get(room.roomId);
      if (!inRedis && !permanentSet.has(room.roomId)) {
        room.destroy();
        rooms.delete(key);
      }
    }
  });
}

async function getPermanentRooms() {
  if (!postgres) {
    return [];
  }
  return (
    await postgres.query<PermanentRoom>(
      `SELECT * from room where "roomId" SIMILAR TO '${
        config.SHARD ? `/${config.SHARD}-[a-z]%` : '/[a-z]%'
      }' AND owner IS NOT NULL`
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
  let currentVBrowserUIDCounts: NumberDict = {};
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
    if (room.roomRedis) {
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
    if (obj.vBrowser && obj.vBrowser.creatorUID) {
      if (!currentVBrowserUIDCounts[obj.vBrowser.creatorUID]) {
        currentVBrowserUIDCounts[obj.vBrowser.creatorUID] = 0;
      }
      currentVBrowserUIDCounts[obj.vBrowser.creatorUID] += 1;
    }
    if (obj.video) {
      currentRoomData.push(obj);
    }
  });

  currentVBrowserUIDCounts = Object.fromEntries(
    Object.entries(currentVBrowserUIDCounts).filter(([, val]) => val > 1)
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
  const numSubs = (await postgres?.query('SELECT count(1) from subscriber'))
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
    currentVBrowserUIDCounts,
    numPermaRooms,
    numSubs,
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
