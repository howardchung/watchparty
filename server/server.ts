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
import { Server } from 'socket.io';
import { searchYoutube } from './utils/youtube';
import { Room } from './room';
import {
  getRedisCountDay,
  getRedisCountDayDistinct,
  redisCount,
} from './utils/redis';
import { getCustomerByEmail, createSelfServicePortal } from './utils/stripe';
import { deleteUser, validateUserToken } from './utils/firebase';
import path from 'path';
import { Client } from 'pg';
import { getStartOfDay } from './utils/time';
import { getBgVMManagers, getSessionLimitSeconds } from './vm/utils';
import { hashString } from './utils/string';
import { insertObject, upsertObject } from './utils/postgres';
import axios from 'axios';
import crypto from 'crypto';
import zlib from 'zlib';
import util from 'util';
import { Intents } from 'discord.js';
import { DiscordBot } from './utils/discord';

const gzip = util.promisify(zlib.gzip);

const releaseInterval = 5 * 60 * 1000;
const releaseBatches = 10;
const app = express();
let server: any = null;
if (config.HTTPS) {
  const key = fs.readFileSync(config.SSL_KEY_FILE as string);
  const cert = fs.readFileSync(config.SSL_CRT_FILE as string);
  server = https.createServer({ key: key, cert: cert }, app);
} else {
  server = new http.Server(app);
}
const io = new Server(server, { cors: {}, transports: ['websocket'] });
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

let discordBot: DiscordBot;
if (
  config.DISCORD_BOT_TOKEN &&
  config.DISCORD_SERVER_ID &&
  config.DISCORD_SUB_ROLE_ID
) {
  discordBot = new DiscordBot({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS],
  });
  discordBot.once('ready', () => {
    console.log(`Discord Bot "${discordBot?.user?.username}" ready`);
  });
  if (!discordBot.isReady()) {
    discordBot.login(config.DISCORD_BOT_TOKEN);
  }
}

const names = Moniker.generator([
  Moniker.adjective,
  Moniker.noun,
  Moniker.verb,
]);
const launchTime = Number(new Date());
const rooms = new Map<string, Room>();
init();

async function init() {
  if (postgres) {
    console.time('[LOADROOMSPOSTGRES]');
    const persistedRooms = await getAllRooms();
    console.log('found %s rooms in postgres', persistedRooms.length);
    for (let i = 0; i < persistedRooms.length; i++) {
      const key = persistedRooms[i].roomId;
      const data = persistedRooms[i].data
        ? JSON.stringify(persistedRooms[i].data)
        : undefined;
      const room = new Room(io, key, data);
      rooms.set(key, room);
    }
    console.timeEnd('[LOADROOMSPOSTGRES]');
  }

  if (!rooms.has('/default')) {
    rooms.set('/default', new Room(io, '/default'));
  }

  server.listen(config.PORT, config.HOST);
  // Following functions iterate over in-memory rooms
  setInterval(minuteMetrics, 60 * 1000);
  setInterval(release, releaseInterval / releaseBatches);
  setInterval(freeUnusedRooms, 5 * 60 * 1000);
  saveRooms();
  if (process.env.NODE_ENV === 'development') {
    try {
      require('./vmWorker');
      require('./syncSubs');
      require('./timeSeries');
    } catch (e) {
      console.error(e);
    }
  }
}

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.raw({ type: 'text/plain', limit: 1000000 }));

app.get('/ping', (_req, res) => {
  res.json('pong');
});

app.post('/discord/auth', async (req, res) => {
  const decoded = await validateUserToken(req.body?.uid, req.body?.token);
  if (!decoded) {
    return res.status(400).json({ error: 'invalid user token' });
  }
  const customer = await getCustomerByEmail(decoded.email as string);
  const isSubscriber = Boolean(
    customer?.subscriptions?.data?.find((sub) => sub?.status === 'active')
  );
  if (!isSubscriber) {
    return res.status(400).json({ error: 'not subscribed' });
  }
  if (!postgres || !discordBot) {
    return res.sendStatus(500);
  }
  try {
    const user = await discordBot.assignRole(
      req.body?.username,
      req.body?.discriminator
    );
    if (!user) {
      return res.status(400).json({
        error: 'Discord account not found. Please join our Discord server.',
      });
    }
    await upsertObject(
      postgres,
      'account',
      {
        discordUsername: req.body?.username,
        discordDiscriminator: req.body?.discriminator,
        email: decoded.email,
      },
      { email: decoded.email }
    );
  } catch (e) {
    console.error(e);
    return res.sendStatus(500);
  }
  return res.status(200).json({});
});

app.delete('/discord/delete', async (req, res) => {
  const decoded = await validateUserToken(
    req.body?.uid as string,
    req.body?.token as string
  );
  if (!decoded) {
    return res.status(400).json({ error: 'invalid user token' });
  }
  if (!postgres || !discordBot) {
    return res.sendStatus(500);
  }
  try {
    const result = await postgres?.query(
      `UPDATE account 
        SET "discordUsername" = null, "discordDiscriminator" = null 
        WHERE email = $1 RETURNING "discordUsername","discordDiscriminator"
      `,
      [decoded.email]
    );
    await discordBot.assignRole(
      result.rows[0].discordUsername,
      result.rows[0].discordDiscriminator,
      true
    );
  } catch (e) {
    console.error(e);
    return res.sendStatus(500);
  }
  return res.status(200).json({});
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

app.post('/subtitle', async (req, res) => {
  const data = req.body;
  if (!redis) {
    return;
  }
  // calculate hash, gzip and save to redis
  const hash = crypto
    .createHash('sha256')
    .update(data, 'utf8')
    .digest()
    .toString('hex');
  let gzipData = (await gzip(data)) as Buffer;
  await redis.setex('subtitle:' + hash, 24 * 60 * 60, gzipData);
  redisCount('subUploads');
  return res.json({ hash });
});

app.get('/downloadSubtitles', async (req, res) => {
  const response = await axios.get(req.query.url as string, {
    responseType: 'arraybuffer',
  });
  res.append('Content-Encoding', 'gzip');
  res.append('Content-Type', 'text/plain');
  redisCount('subDownloadsOS');
  res.end(response.data);
});

app.get('/searchSubtitles', async (req, res) => {
  try {
    const title = req.query.title as string;
    const url = req.query.url as string;
    let subUrl = '';
    if (url) {
      const startResp = await axios({
        method: 'get',
        url: url,
        headers: {
          Range: 'bytes=0-65535',
        },
        responseType: 'arraybuffer',
      });
      const start = startResp.data;
      const size = Number(startResp.headers['content-range'].split('/')[1]);
      const endResp = await axios({
        method: 'get',
        url: url,
        headers: {
          Range: `bytes=${size - 65536}-`,
        },
        responseType: 'arraybuffer',
      });
      const end = endResp.data;
      // console.log(start, end, size);
      let hash = computeOpenSubtitlesHash(start, end, size);
      // hash = 'f65334e75574f00f';
      // Search API for subtitles by hash
      subUrl = `https://rest.opensubtitles.org/search/moviebytesize-${size}/moviehash-${hash}/sublanguageid-eng`;
    } else if (title) {
      subUrl = `https://rest.opensubtitles.org/search/query-${encodeURIComponent(
        title
      )}/sublanguageid-eng`;
    }
    console.log(subUrl);
    const response = await axios.get(subUrl, {
      headers: { 'User-Agent': 'VLSub 0.10.2' },
    });
    // console.log(response);
    const subtitles = response.data;
    res.json(subtitles);
  } catch (e: any) {
    console.error(e.message);
    res.json([]);
  }
  redisCount('subSearchesOS');
});

app.get('/stats', async (req, res) => {
  if (req.query.key && req.query.key === config.STATS_KEY) {
    const stats = await getStats();
    res.json(stats);
  } else {
    return res.status(403).json({ error: 'Access Denied' });
  }
});

app.get('/health/:metric', async (req, res) => {
  const vmManagerStats = (
    await axios.get('http://localhost:' + config.VMWORKER_PORT + '/stats')
  ).data;
  const result = vmManagerStats[req.params.metric]?.availableVBrowsers?.length;
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
    '/' + (config.SHARD ? `${config.SHARD}@` : '') + names.choose();
  let name = genName();
  // Keep retrying until no collision
  while (rooms.has(name)) {
    name = genName();
  }
  console.log('createRoom: ', name);
  const newRoom = new Room(io, name);
  if (postgres) {
    const roomObj: any = {
      roomId: newRoom.roomId,
      creationTime: new Date(),
    };
    await insertObject(postgres, 'room', roomObj);
  }
  const decoded = await validateUserToken(req.body?.uid, req.body?.token);
  newRoom.creator = decoded?.email;
  newRoom.video = req.body?.video || '';
  rooms.set(name, newRoom);
  res.json({ name: name.slice(1) });
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

app.delete('/deleteAccount', async (req, res) => {
  const decoded = await validateUserToken(req.body?.uid, req.body?.token);
  if (!decoded) {
    return res.status(400).json({ error: 'invalid user token' });
  }
  if (postgres) {
    await postgres?.query('DELETE FROM room WHERE owner = $1', [decoded.uid]);
    await postgres?.query('DELETE FROM account WHERE email = $1', [
      decoded.email,
    ]);
  }
  await deleteUser(decoded.uid);
  redisCount('deleteAccount');
  return res.json({});
});

app.get('/metadata', async (req, res) => {
  const decoded = await validateUserToken(
    req.query?.uid as string,
    req.query?.token as string
  );
  let isCustomer = false;
  let isSubscriber = false;
  let discordUsername = undefined;
  let discordDiscriminator = undefined;
  if (decoded?.email) {
    const customer = await getCustomerByEmail(decoded.email);
    isSubscriber = Boolean(
      customer?.subscriptions?.data?.find((sub) => sub?.status === 'active')
    );
    isCustomer = Boolean(customer);
    if (postgres) {
      const result = await postgres?.query(
        'SELECT "discordUsername", "discordDiscriminator" FROM account WHERE email = $1',
        [decoded?.email]
      );
      discordUsername = result?.rows[0]?.discordUsername;
      discordDiscriminator = result?.rows[0]?.discordDiscriminator;
    }
  }
  let isVMPoolFull = null;
  try {
    isVMPoolFull = (
      await axios.get(
        'http://localhost:' + config.VMWORKER_PORT + '/isVMPoolFull'
      )
    ).data;
  } catch (e) {
    console.warn(e);
  }

  const beta =
    decoded?.email != null &&
    Boolean(config.BETA_USER_EMAILS.split(',').includes(decoded?.email));
  const streamPath = beta ? config.STREAM_PATH : undefined;
  const isCustomDomain = req.hostname === config.CUSTOM_SETTINGS_HOSTNAME;

  return res.json({
    isSubscriber,
    isCustomer,
    isVMPoolFull,
    discordUsername,
    discordDiscriminator,
    beta,
    streamPath,
    isCustomDomain,
  });
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
  const result = await postgres?.query<PersistentRoom>(
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

app.use(express.static(config.BUILD_DIRECTORY));
// Send index.html for all other requests (SPA)
app.use('/*', (_req, res) => {
  res.sendFile(
    path.resolve(__dirname + `/../${config.BUILD_DIRECTORY}/index.html`)
  );
});

async function saveRooms() {
  while (true) {
    // console.time('[SAVEROOMS]');
    const roomArr = Array.from(rooms.values());
    for (let i = 0; i < roomArr.length; i++) {
      if (roomArr[i].roster.length) {
        await roomArr[i].saveRoom();
      }
    }
    // console.timeEnd('[SAVEROOMS]');
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
      const isRoomIdle =
        Date.now() - Number(room.lastUpdateTime) > 5 * 60 * 1000;
      if (isTimedOut || (isRoomEmpty && isRoomIdle)) {
        console.log('[RELEASE][%s] VM in room:', currBatch, room.roomId);
        room.stopVBrowserInternal();
        if (isTimedOut) {
          room.addChatMessage(null, {
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
        room.addChatMessage(null, {
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
      // Renew the locks
      await redis?.expire(
        'lock:' + room.vBrowser.provider + ':' + room.vBrowser.id,
        300
      );
      await redis?.expire('vBrowserUIDLock:' + room.vBrowser?.creatorUID, 120);

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
        await redis?.zincrby(
          'vBrowserUIDMinutes',
          1,
          room.vBrowser?.creatorUID
        );
        await redis?.expireat('vBrowserUIDMinutes', expireTime);
      }
    }
  }
}

async function freeUnusedRooms() {
  // Clean up rooms that are no longer persisted and empty
  // Frees up some JS memory space when process is long-running
  const persistedRooms = await getAllRooms();
  const persistedSet = new Set(persistedRooms.map((room) => room.roomId));
  rooms.forEach(async (room, key) => {
    if (room.roster.length === 0) {
      if (!persistedSet.has(room.roomId)) {
        room.destroy();
        rooms.delete(key);
      }
    }
  });
}

async function getAllRooms() {
  if (!postgres) {
    return [];
  }
  return (
    await postgres.query<PersistentRoom>(
      `SELECT * from room where "roomId" LIKE '${
        config.SHARD ? `/${config.SHARD}@%` : '/%'
      }'`
    )
  ).rows;
}

async function getStats() {
  const now = Number(new Date());
  let currentUsers = 0;
  let currentHttp = 0;
  let currentVBrowser = 0;
  let currentVBrowserLarge = 0;
  let currentVBrowserWaiting = await redis?.get('currentVBrowserWaiting');
  let currentScreenShare = 0;
  let currentFileShare = 0;
  let currentVideoChat = 0;
  let currentRoomSizeCounts: NumberDict = {};
  let currentVBrowserUIDCounts: NumberDict = {};
  let currentRoomCount = rooms.size;
  rooms.forEach((room) => {
    const obj = {
      video: room.video,
      rosterLength: room.roster.length,
      videoChats: room.roster.filter((p) => p.isVideoChat).length,
      vBrowser: room.vBrowser,
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
  });

  currentVBrowserUIDCounts = Object.fromEntries(
    Object.entries(currentVBrowserUIDCounts).filter(([, val]) => val > 1)
  );

  const dbRoomData = (
    await postgres?.query(
      `SELECT "roomId", "creationTime", "lastUpdateTime", vanity, "isSubRoom", "roomTitle", "roomDescription", "mediaPath", owner, password from room WHERE "lastUpdateTime" > NOW() - INTERVAL '30 day' ORDER BY "creationTime" DESC`
    )
  )?.rows;
  const currentRoomData = dbRoomData
    ?.map((dbRoom) => {
      const room = rooms.get(dbRoom.roomId);
      if (!room) {
        return null;
      }
      const obj = {
        roomId: room.roomId,
        video: room.video || undefined,
        videoTS: room.videoTS || undefined,
        creationTime: dbRoom.creationTime || undefined,
        lastUpdateTime: dbRoom.lastUpdateTime || undefined,
        vanity: dbRoom.vanity || undefined,
        isSubRoom: dbRoom.isSubRoom || undefined,
        owner: dbRoom.owner || undefined,
        password: dbRoom.password || undefined,
        roomTitle: dbRoom.roomTitle || undefined,
        roomDescription: dbRoom.roomDescription || undefined,
        mediaPath: dbRoom.mediaPath || undefined,
        rosterLength: room.roster.length,
        roster: room.getRosterForStats(),
        vBrowser: room.vBrowser,
        vBrowserElapsed:
          room.vBrowser?.assignTime && now - room.vBrowser?.assignTime,
        lock: room.lock || undefined,
        creator: room.creator || undefined,
      };
      if (obj.video || obj.rosterLength > 0) {
        return obj;
      } else {
        return null;
      }
    })
    .filter(Boolean);

  const uptime = Number(new Date()) - launchTime;
  const cpuUsage = os.loadavg();
  const memUsage = process.memoryUsage().rss;
  const redisUsage = (await redis?.info())
    ?.split('\n')
    .find((line) => line.startsWith('used_memory:'))
    ?.split(':')[1]
    .trim();
  const postgresUsage = (
    await postgres?.query(`SELECT pg_database_size('postgres');`)
  )?.rows[0].pg_database_size;
  const numPermaRooms = (
    await postgres?.query('SELECT count(1) from room WHERE owner IS NOT NULL')
  )?.rows[0].count;
  const numSubs = (await postgres?.query('SELECT count(1) from subscriber'))
    ?.rows[0].count;
  const deleteAccounts = await getRedisCountDay('deleteAccount');
  const chatMessages = await getRedisCountDay('chatMessages');
  const addReactions = await getRedisCountDay('addReaction');
  const hetznerApiRemaining = await redis?.get('hetznerApiRemaining');
  const vBrowserStarts = await getRedisCountDay('vBrowserStarts');
  const vBrowserLaunches = await getRedisCountDay('vBrowserLaunches');
  const vBrowserFails = await getRedisCountDay('vBrowserFails');
  const vBrowserStagingFails = await getRedisCountDay('vBrowserStagingFails');
  const vBrowserStopTimeout = await getRedisCountDay(
    'vBrowserTerminateTimeout'
  );
  const vBrowserStopEmpty = await getRedisCountDay('vBrowserTerminateEmpty');
  const vBrowserStopManual = await getRedisCountDay('vBrowserTerminateManual');
  const recaptchaRejectsLowScore = await getRedisCountDay(
    'recaptchaRejectsLowScore'
  );
  const vBrowserStartMS = await redis?.lrange('vBrowserStartMS', 0, -1);
  const vBrowserStageRetries = await redis?.lrange(
    'vBrowserStageRetries',
    0,
    -1
  );
  const vBrowserStageFails = await redis?.lrange('vBrowserStageFails', 0, -1);
  const vBrowserSessionMS = await redis?.lrange('vBrowserSessionMS', 0, -1);
  // const vBrowserVMLifetime = await redis?.lrange('vBrowserVMLifetime', 0, -1);
  const recaptchaRejectsOther = await getRedisCountDay('recaptchaRejectsOther');
  const urlStarts = await getRedisCountDay('urlStarts');
  const playlistAdds = await getRedisCountDay('playlistAdds');
  const screenShareStarts = await getRedisCountDay('screenShareStarts');
  const fileShareStarts = await getRedisCountDay('fileShareStarts');
  const videoChatStarts = await getRedisCountDay('videoChatStarts');
  const connectStarts = await getRedisCountDay('connectStarts');
  const connectStartsDistinct = await getRedisCountDayDistinct(
    'connectStartsDistinct'
  );
  const subUploads = await getRedisCountDay('subUploads');
  const subDownloadsOS = await getRedisCountDay('subDownloadsOS');
  const subSearchesOS = await getRedisCountDay('subSearchesOS');
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

  let vmManagerStats = null;
  try {
    vmManagerStats = (
      await axios.get('http://localhost:' + config.VMWORKER_PORT + '/stats')
    ).data;
  } catch (e) {
    console.warn(e);
  }

  return {
    uptime,
    cpuUsage,
    memUsage,
    redisUsage,
    postgresUsage,
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
    deleteAccounts,
    chatMessages,
    addReactions,
    urlStarts,
    playlistAdds,
    screenShareStarts,
    fileShareStarts,
    subUploads,
    subDownloadsOS,
    subSearchesOS,
    youtubeSearch,
    videoChatStarts,
    connectStarts,
    connectStartsDistinct,
    hetznerApiRemaining,
    vBrowserStarts,
    vBrowserLaunches,
    vBrowserFails,
    vBrowserStagingFails,
    vBrowserStopManual,
    vBrowserStopEmpty,
    vBrowserStopTimeout,
    recaptchaRejectsLowScore,
    recaptchaRejectsOther,
    vmManagerStats,
    vBrowserStartMS,
    vBrowserStageRetries,
    vBrowserStageFails,
    vBrowserSessionMS,
    // vBrowserVMLifetime,
    vBrowserClientIDs,
    vBrowserClientIDsCard,
    vBrowserClientIDMinutes,
    vBrowserUIDs,
    vBrowserUIDsCard,
    vBrowserUIDMinutes,
    currentRoomData,
  };
}

function computeOpenSubtitlesHash(first: Buffer, last: Buffer, size: number) {
  // console.log(first.length, last.length, size);
  let temp = BigInt(size);
  process(first);
  process(last);

  temp = temp & BigInt('0xffffffffffffffff');
  return temp.toString(16).padStart(16, '0');

  function process(chunk: Buffer) {
    for (let i = 0; i < chunk.length; i += 8) {
      const long = chunk.readBigUInt64LE(i);
      temp += long;
    }
  }
}
