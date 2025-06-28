"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const compression_1 = __importDefault(require("compression"));
const os_1 = __importDefault(require("os"));
const cors_1 = __importDefault(require("cors"));
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const youtube_1 = require("./utils/youtube");
const room_1 = require("./room");
const redis_1 = require("./utils/redis");
const stripe_1 = require("./utils/stripe");
const firebase_1 = require("./utils/firebase");
const path_1 = __importDefault(require("path"));
const time_1 = require("./utils/time");
const utils_1 = require("./vm/utils");
const postgres_1 = require("./utils/postgres");
const axios_1 = __importStar(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const zlib_1 = __importDefault(require("zlib"));
const util_1 = __importDefault(require("util"));
const statsAgg_1 = require("./utils/statsAgg");
const resolveShard_1 = require("./utils/resolveShard");
const moniker_1 = require("./utils/moniker");
if (process.env.NODE_ENV === 'development') {
    axios_1.default.interceptors.request.use((config) => {
        // console.log(config);
        return config;
    }, (error) => {
        console.error(error);
    });
}
const gzip = util_1.default.promisify(zlib_1.default.gzip);
const releaseInterval = 5 * 60 * 1000;
const app = (0, express_1.default)();
let server = null;
if (config_1.default.SSL_KEY_FILE && config_1.default.SSL_CRT_FILE) {
    const key = fs_1.default.readFileSync(config_1.default.SSL_KEY_FILE);
    const cert = fs_1.default.readFileSync(config_1.default.SSL_CRT_FILE);
    server = https_1.default.createServer({ key: key, cert: cert }, app);
}
else {
    server = new http_1.default.Server(app);
}
const io = new socket_io_1.Server(server, { cors: {}, transports: ['websocket'] });
io.engine.use(async (req, res, next) => {
    const roomId = req._query.roomId;
    if (!roomId) {
        return next();
    }
    // Attempt to ensure the room being connected to is loaded in memory
    // If it doesn't exist, we may fail later with "invalid namespace"
    const shard = (0, resolveShard_1.resolveShard)(roomId);
    const key = '/' + roomId;
    // Check to make sure this shard should load this room
    const isCorrectShard = !config_1.default.SHARD || shard === Number(config_1.default.SHARD);
    if (isCorrectShard && postgres_1.postgres && !rooms.has(key)) {
        // Get the room data from postgres
        const { rows } = await postgres_1.postgres.query(`SELECT * from room where "roomId" = $1`, [key]);
        const persistedRoom = rows[0];
        const data = persistedRoom?.data
            ? JSON.stringify(persistedRoom.data)
            : undefined;
        const room = new room_1.Room(io, key, data);
        rooms.set(key, room);
        console.log('loading room %s into memory on shard %s', roomId, config_1.default.SHARD);
    }
    next();
});
const rooms = new Map();
init();
async function init() {
    server?.listen(config_1.default.PORT, config_1.default.HOST);
    // Following functions iterate over in-memory rooms
    setInterval(minuteMetrics, 60 * 1000);
    setInterval(release, releaseInterval);
    setInterval(saveRooms, 1000);
    if (process.env.NODE_ENV === 'development') {
        try {
            require('./vmWorker');
            // require('./syncSubs');
            // require('./timeSeries');
        }
        catch (e) {
            console.error(e);
        }
    }
}
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.raw({ type: 'text/plain', limit: 1000000 }));
app.get('/ping', (_req, res) => {
    res.json('pong');
});
// Data's already compressed so go before the compression middleware
app.get('/subtitle/:hash', async (req, res) => {
    const gzipped = await redis_1.redis?.getBuffer('subtitle:' + req.params.hash);
    if (!gzipped) {
        res.status(404).end('not found');
        return;
    }
    res.setHeader('Content-Encoding', 'gzip');
    res.end(gzipped);
});
app.use((0, compression_1.default)());
app.post('/subtitle', async (req, res) => {
    const data = req.body;
    if (!redis_1.redis) {
        return;
    }
    // calculate hash, gzip and save to redis
    const hash = crypto_1.default
        .createHash('sha256')
        .update(data, 'utf8')
        .digest()
        .toString('hex');
    let gzipData = await gzip(data);
    await redis_1.redis.setex('subtitle:' + hash, 24 * 60 * 60, gzipData);
    (0, redis_1.redisCount)('subUploads');
    res.json({ hash });
});
app.get('/downloadSubtitles', async (req, res) => {
    // Request the URL from OS
    try {
        const urlResp = await (0, axios_1.default)({
            url: 'https://api.opensubtitles.com/api/v1/download',
            method: 'POST',
            headers: {
                'User-Agent': 'watchparty v1',
                'Api-Key': config_1.default.OPENSUBTITLES_KEY,
                Accept: 'application/json',
                'Content-Type': 'application/json',
                // 'Authorization': 'Bearer ' + config.OPENSUBTITLES_KEY,
            },
            data: {
                file_id: req.query.file_id,
                // sub_format: 'srt',
            },
        });
        // console.log(urlResp.data);
        // Return the link to the user
        res.json(urlResp.data);
        (0, redis_1.redisCount)('subDownloadsOS');
        // Alternative: Download the data, store in redis, and return the hash (same as upload)
        // However, this will give no info about which subtitle option is selected
        // const response = await axios.get(urlResp.data.link, {
        //   responseType: 'arraybuffer',
        // });
    }
    catch (e) {
        if ((0, axios_1.isAxiosError)(e)) {
            console.log(e.response);
        }
        throw e;
    }
});
app.get('/searchSubtitles', async (req, res) => {
    try {
        const title = req.query.title;
        const url = req.query.url;
        let subUrl = '';
        if (url) {
            const startResp = await (0, axios_1.default)({
                method: 'get',
                url: url,
                headers: {
                    Range: 'bytes=0-65535',
                },
                responseType: 'arraybuffer',
            });
            const start = startResp.data;
            const size = Number(startResp.headers['content-range'].split('/')[1]);
            const endResp = await (0, axios_1.default)({
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
            subUrl = `https://api.opensubtitles.com/api/v1/subtitles?moviehash=${hash}&languages=en`;
        }
        else if (title) {
            subUrl = `https://api.opensubtitles.com/api/v1/subtitles?query=${title}&languages=en`;
        }
        // Alternative, web client calls this to get back some JS with the download URL embedded
        // https://www.opensubtitles.com/nocache/download/7585196/subreq.js?file_name=Borgen.S04E01.en&locale=en&np=true&sub_frmt=srt&subtitle_id=6615808&ext_installed=false
        // Up to 10 downloads per IP per day, but proxyable and doesn't require key
        const response = await axios_1.default.get(subUrl, {
            headers: {
                'User-Agent': 'watchparty v1',
                'Api-Key': config_1.default.OPENSUBTITLES_KEY,
            },
        });
        // console.log(subUrl, response.data);
        const subtitles = response.data;
        res.json(subtitles.data);
    }
    catch (e) {
        console.error(e.message);
        res.json([]);
    }
    (0, redis_1.redisCount)('subSearchesOS');
});
app.get('/stats', async (req, res) => {
    if (req.query.key && req.query.key === config_1.default.STATS_KEY) {
        const stats = await getStats();
        res.json(stats);
    }
    else {
        res.status(403).json({ error: 'Access Denied' });
    }
});
app.get('/statsAgg', async (req, res) => {
    if (req.query.key && req.query.key === config_1.default.STATS_KEY) {
        const stats = await (0, statsAgg_1.statsAgg)();
        res.json(stats);
    }
    else {
        res.status(403).json({ error: 'Access Denied' });
    }
});
app.get('/health/:metric', async (req, res) => {
    const vmManagerStats = (await axios_1.default.get('http://localhost:' + config_1.default.VMWORKER_PORT + '/stats')).data;
    const result = vmManagerStats[req.params.metric]?.availableVBrowsers?.length;
    res.status(result ? 200 : 500).json(result);
});
app.get('/timeSeries', async (req, res) => {
    if (req.query.key && req.query.key === config_1.default.STATS_KEY && redis_1.redis) {
        const timeSeriesData = await redis_1.redis.lrange('timeSeries', 0, -1);
        const timeSeries = timeSeriesData.map((entry) => JSON.parse(entry));
        res.json(timeSeries);
    }
    else {
        res.status(403).json({ error: 'Access Denied' });
    }
});
app.get('/youtube', async (req, res) => {
    if (typeof req.query.q === 'string') {
        try {
            await (0, redis_1.redisCount)('youtubeSearch');
            const items = await (0, youtube_1.searchYoutube)(req.query.q);
            res.json(items);
        }
        catch {
            res.status(500).json({ error: 'youtube error' });
        }
    }
    else {
        res.status(500).json({ error: 'query must be a string' });
    }
});
app.get('/youtubePlaylist/:playlistId', async (req, res) => {
    try {
        const items = await (0, youtube_1.youtubePlaylist)(req.params.playlistId);
        res.json(items);
    }
    catch {
        res.status(500).json({ error: 'youtube error' });
    }
});
app.post('/createRoom', async (req, res) => {
    const genName = () => '/' + (0, moniker_1.makeRoomName)(config_1.default.SHARD);
    let name = genName();
    console.log('createRoom: ', name);
    const newRoom = new room_1.Room(io, name);
    if (postgres_1.postgres) {
        const now = new Date();
        const roomObj = {
            roomId: newRoom.roomId,
            lastUpdateTime: now,
            creationTime: now,
        };
        try {
            await (0, postgres_1.insertObject)(postgres_1.postgres, 'room', roomObj);
        }
        catch (e) {
            (0, redis_1.redisCount)('createRoomError');
            throw e;
        }
    }
    const decoded = await (0, firebase_1.validateUserToken)(req.body?.uid, req.body?.token);
    newRoom.creator = decoded?.email;
    const preload = (req.body?.video || '').slice(0, 20000);
    if (preload) {
        (0, redis_1.redisCount)('createRoomPreload');
        newRoom.video = preload;
        newRoom.paused = true;
        await newRoom.saveRoom();
    }
    const prePlaylist = Array.isArray(req.body?.playlist) && req.body?.playlist;
    if (prePlaylist) {
        for (let i = 0; i < req.body.playlist; i++) {
            newRoom.playlistAdd(null, req.body.playlist[i]);
        }
    }
    rooms.set(name, newRoom);
    res.json({ name });
});
app.post('/manageSub', async (req, res) => {
    const decoded = await (0, firebase_1.validateUserToken)(req.body?.uid, req.body?.token);
    if (!decoded) {
        res.status(400).json({ error: 'invalid user token' });
        return;
    }
    if (!decoded.email) {
        res.status(400).json({ error: 'no email found' });
        return;
    }
    const customer = await (0, stripe_1.getCustomerByEmail)(decoded.email);
    if (!customer) {
        res.status(400).json({ error: 'customer not found' });
        return;
    }
    const session = await (0, stripe_1.createSelfServicePortal)(customer.id, req.body?.return_url);
    res.json(session);
});
app.delete('/deleteAccount', async (req, res) => {
    // TODO pass this in req.query instead
    const decoded = await (0, firebase_1.validateUserToken)(req.body?.uid, req.body?.token);
    if (!decoded) {
        res.status(400).json({ error: 'invalid user token' });
        return;
    }
    if (postgres_1.postgres) {
        // Delete rooms
        await postgres_1.postgres.query('DELETE FROM room WHERE owner = $1', [decoded.uid]);
        // Delete linked accounts
        await postgres_1.postgres.query('DELETE FROM link_account WHERE uid = $1', [
            decoded.uid,
        ]);
    }
    await (0, firebase_1.deleteUser)(decoded.uid);
    (0, redis_1.redisCount)('deleteAccount');
    res.json({});
});
app.get('/metadata', async (req, res) => {
    const decoded = await (0, firebase_1.validateUserToken)(req.query?.uid, req.query?.token);
    let isSubscriber = await (0, stripe_1.getIsSubscriberByEmail)(decoded?.email);
    // Has the user ever been a subscriber?
    // const customer = await getCustomerByEmail(decoded.email);
    let isFreePoolFull = false;
    try {
        isFreePoolFull = (await axios_1.default.get('http://localhost:' + config_1.default.VMWORKER_PORT + '/isFreePoolFull')).data.isFull;
    }
    catch (e) {
        console.warn('[WARNING]: free pool check failed: %s', e.code);
    }
    const beta = decoded?.email != null &&
        Boolean(config_1.default.BETA_USER_EMAILS.split(',').includes(decoded?.email));
    const streamPath = beta ? config_1.default.STREAM_PATH : undefined;
    // log metrics but don't wait for it
    if (postgres_1.postgres && decoded?.uid) {
        (0, postgres_1.upsertObject)(postgres_1.postgres, 'active_user', { uid: decoded?.uid, lastActiveTime: new Date() }, { uid: true });
    }
    res.json({
        isSubscriber,
        isFreePoolFull,
        beta,
        streamPath,
    });
});
app.get('/resolveRoom/:vanity', async (req, res) => {
    const vanity = req.params.vanity;
    const result = await postgres_1.postgres?.query(`SELECT "roomId", vanity from room WHERE LOWER(vanity) = $1`, [vanity?.toLowerCase() ?? '']);
    // console.log(vanity, result.rows);
    // We also use this for checking name availability, so just return null if it doesn't exist (http 200)
    res.json(result?.rows[0] ?? null);
});
app.get('/roomData/:roomId', async (req, res) => {
    // Returns the room data given a room ID
    // Only return data if the room doesn't have a password
    // If it does, we could accept it as a URL parameter but for now just don't support
    const result = await postgres_1.postgres?.query(`SELECT data from room WHERE "roomId" = $1 and password IS NULL`, ['/' + req.params.roomId]);
    res.json(result?.rows[0]?.data);
});
app.get('/resolveShard/:roomId', async (req, res) => {
    const shardNum = (0, resolveShard_1.resolveShard)(req.params.roomId);
    res.send(String(config_1.default.SHARD ? shardNum : ''));
});
app.get('/listRooms', async (req, res) => {
    const decoded = await (0, firebase_1.validateUserToken)(req.query?.uid, req.query?.token);
    if (!decoded) {
        res.status(400).json({ error: 'invalid user token' });
        return;
    }
    const result = await postgres_1.postgres?.query(`SELECT "roomId", vanity from room WHERE owner = $1`, [decoded.uid]);
    res.json(result?.rows ?? []);
});
app.delete('/deleteRoom', async (req, res) => {
    const decoded = await (0, firebase_1.validateUserToken)(req.query?.uid, req.query?.token);
    if (!decoded) {
        res.status(400).json({ error: 'invalid user token' });
        return;
    }
    const result = await postgres_1.postgres?.query(`DELETE from room WHERE owner = $1 and "roomId" = $2`, [decoded.uid, req.query.roomId]);
    res.json(result?.rows);
});
app.get('/linkAccount', async (req, res) => {
    const decoded = await (0, firebase_1.validateUserToken)(req.query?.uid, req.query?.token);
    if (!decoded) {
        res.status(400).json({ error: 'invalid user token' });
        return;
    }
    if (!postgres_1.postgres) {
        res.status(400).json({ error: 'invalid database client' });
        return;
    }
    // Get the linked accounts for the user
    let linkAccounts = [];
    if (decoded?.uid && postgres_1.postgres) {
        const { rows } = await postgres_1.postgres.query('SELECT kind, accountid, accountname, discriminator FROM link_account WHERE uid = $1', [decoded?.uid]);
        linkAccounts = rows;
    }
    res.json(linkAccounts);
});
app.post('/linkAccount', async (req, res) => {
    const decoded = await (0, firebase_1.validateUserToken)(req.body?.uid, req.body?.token);
    if (!decoded) {
        res.status(400).json({ error: 'invalid user token' });
        return;
    }
    if (!postgres_1.postgres) {
        res.status(400).json({ error: 'invalid database client' });
        return;
    }
    const kind = req.body?.kind;
    if (kind === 'discord') {
        const tokenType = req.body?.tokenType;
        const accessToken = req.body.accessToken;
        // Get the token and verify the user
        const response = await axios_1.default.get('https://discord.com/api/users/@me', {
            headers: {
                authorization: `${tokenType} ${accessToken}`,
            },
        });
        const accountid = response.data.id;
        const accountname = response.data.username;
        const discriminator = response.data.discriminator;
        // Store the user id, username, discriminator
        await (0, postgres_1.upsertObject)(postgres_1.postgres, 'link_account', {
            accountid: accountid,
            accountname: accountname,
            discriminator: discriminator,
            uid: decoded.uid,
            kind: kind,
        }, { uid: true, kind: true });
        res.json({});
    }
    else {
        res.status(400).json({ error: 'unsupported kind' });
    }
});
app.delete('/linkAccount', async (req, res) => {
    // TODO read from req.query instead
    const decoded = await (0, firebase_1.validateUserToken)(req.body?.uid, req.body?.token);
    if (!decoded) {
        res.status(400).json({ error: 'invalid user token' });
        return;
    }
    if (!postgres_1.postgres) {
        res.status(400).json({ error: 'invalid database client' });
        return;
    }
    await postgres_1.postgres.query('DELETE FROM link_account WHERE uid = $1 AND kind = $2', [decoded.uid, req.body.kind]);
    res.json({});
});
app.get('/generateName', async (req, res) => {
    res.send((0, moniker_1.makeUserName)());
});
// Proxy video segments
app.get('/proxy/*splat', async (req, res) => {
    try {
        if (req.path.includes('index-dvr.m3u8')) {
            // VOD
            // https://d2vjef5jvl6bfs.cloudfront.net/3012391a6c3e84c79ef6_gamesdonequick_41198403369_1681059003/chunked/index-dvr.m3u8
            const resp = await axios_1.default.get('https://' + req.query.host + req.path.slice('/proxy'.length));
            const re = /proxy\/(.*)\/chunked\/index-dvr.m3u8/;
            const rematch = re.exec(req.path);
            const host = req.query.host;
            const name = rematch?.[1];
            const re2 = /(.*).ts/g;
            const repl = resp.data.replaceAll(re2, `/proxy/${name}/chunked/$1.ts?host=${host}`);
            res.send(repl);
        }
        else if (req.path.includes('/v1/playlist')) {
            // Stream
            // https://video-weaver.sea02.hls.ttvnw.net/v1/playlist/CrQEgv7Mz6nnsfJH3XtVQxeYXk8mViy1zNGWglcybvxZsI1rv3iLnjAnnqwCiVXCJ-DdD27J6RuFrLy7YUYwHUCKazIKICIupUCn9UXtaBYhBM5JIYqg9dz6NWYrCWU9HZJj2TGROv9mAOKuTR51YS82hdYL4PFZa3xxWXhgDsxXQHNDB03kY6S0aG0-EVva1xYrn5Ge6IAXRwug9QDGlb-ydtF3BtYppoTklVI7CVLySPPwbbt5Ow1JXdnKhLSwQEs4bh3BLwMnRBwUFI5nmE18BLYbkMOUivgYP5SSMgnGGlSkJO-iJNPWvepunEgyBUzB_7L-b1keTcV-Qak9IcWIITIWbRvmg6qB3ZSuWdcJgWKmdXdIn4qoRM4o16G1_0N_WRqPtMQFo0hmTlAVmHrzRArJQmaSgqAxZxRbFMd9RFeX6qjP9NtwguPbSeStdVbQxMNC34iavYUIxo8Ug812BHsG7J_kIlof2zkIqkEbP3oV3UkSByIo7xh9EEVargjaGDuQRt8zPQ6-fNBWJJe9F6IFu7lXBPIJ016lopyfcvTWjbLbBHsVkg6vG-3UISh0nud7KB5g5ipQePhtcFSI5hvjlfX1DAVHEpTWXkvlnL4wNqEqpBYL2btSXYeE1Cb-RAvrAT0s61usERcL2eI-S5aTcSO8_hxQ2afC7c9vlypOWgP6p6XNpViZHXmdXv4t-d68Z-MpLtSU7VbB3pRWnSswFFyA3W39ITic4lb97Djp3wHhGgz0Sy8aDb9r0tnphIYgASoJdXMtZWFzdC0yMKQG.m3u8
            // Extract the edge URL host and add it to URL so proxy can fetch
            const resp = await axios_1.default.get('https://' + req.query.host + req.path.slice('/proxy'.length));
            const re = /https:\/\/(.*)\/v1\/segment\/(.*)/g;
            const match = re.exec(resp.data);
            const edgehost = match?.[1];
            const repl = resp.data.replaceAll(re, `/proxy/v1/segment/$2?host=${edgehost}`);
            res.send(repl);
        }
        else {
            // Segment
            const resp = await axios_1.default.get('https://' + req.query.host + req.path.slice('/proxy'.length), { responseType: 'arraybuffer' });
            res.writeHead(200, {
                'Content-Type': 'application/octet-stream',
                'Accept-Ranges': 'bytes',
                'Content-Length': resp.data.length,
                'Transfer-Encoding': 'chunked',
            });
            res.write(resp.data);
            res.end();
        }
    }
    catch (e) {
        console.log(e, 'axios proxy failed');
    }
});
app.use(express_1.default.static(config_1.default.BUILD_DIRECTORY));
// Send index.html for all other requests (SPA)
app.use('/*splat', (_req, res) => {
    res.sendFile(path_1.default.resolve(__dirname + `/../${config_1.default.BUILD_DIRECTORY}/index.html`));
});
async function saveRooms() {
    // Unload rooms that are empty and idle
    // Frees up some JS memory space when process is long-running
    // On reconnect, we'll attempt to reload the room
    let saveCount = 0;
    const start = Date.now();
    await Promise.all(Array.from(rooms.entries()).map(async ([key, room]) => {
        if (room.roster.length === 0 &&
            !room.vBrowser &&
            Number(room.lastUpdateTime) < Date.now() - 4 * 60 * 60 * 1000) {
            console.log('freeing room %s from memory on shard %s', key, config_1.default.SHARD);
            await room.saveRoom();
            room.destroy();
            rooms.delete(key);
            saveCount += 1;
            // Unregister the namespace to avoid dupes on reload
            io._nsps.delete(key);
        }
        else if (room.roster.length) {
            room.lastUpdateTime = new Date();
            await room.saveRoom();
            saveCount += 1;
        }
    }));
    const end = Date.now();
    console.log('[SAVEROOMS] %s saved in %sms', saveCount, end - start);
}
async function release() {
    // Reset VMs in rooms that are:
    // older than the session limit
    // assigned to a room with no users
    const roomArr = Array.from(rooms.values());
    console.log('[RELEASE] %s rooms in batch', roomArr.length);
    for (let i = 0; i < roomArr.length; i++) {
        const room = roomArr[i];
        if (room.vBrowser && room.vBrowser.assignTime) {
            const maxTime = (0, utils_1.getSessionLimitSeconds)(room.vBrowser.large) * 1000;
            const elapsed = Date.now() - room.vBrowser.assignTime;
            const ttl = maxTime - elapsed;
            const isTimedOut = ttl && ttl < releaseInterval;
            const isAlmostTimedOut = ttl && ttl < releaseInterval * 2;
            const isRoomEmpty = room.roster.length === 0;
            const isRoomIdle = Date.now() - Number(room.lastUpdateTime) > 5 * 60 * 1000;
            if (isTimedOut || (isRoomEmpty && isRoomIdle)) {
                console.log('[RELEASE] VM in room:', room.roomId);
                room.stopVBrowserInternal();
                if (isTimedOut) {
                    room.addChatMessage(null, {
                        id: '',
                        system: true,
                        cmd: 'vBrowserTimeout',
                        msg: '',
                    });
                    (0, redis_1.redisCount)('vBrowserTerminateTimeout');
                }
                else if (isRoomEmpty) {
                    (0, redis_1.redisCount)('vBrowserTerminateEmpty');
                }
            }
            else if (isAlmostTimedOut) {
                room.addChatMessage(null, {
                    id: '',
                    system: true,
                    cmd: 'vBrowserAlmostTimeout',
                    msg: '',
                });
            }
        }
        // We want to spread out the jobs over about half the release interval
        // This gives other jobs some CPU time
        const waitTime = releaseInterval / 2 / roomArr.length;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
}
async function minuteMetrics() {
    const roomArr = Array.from(rooms.values());
    for (let i = 0; i < roomArr.length; i++) {
        const room = roomArr[i];
        if (room.vBrowser && room.vBrowser.id) {
            // Update the heartbeat
            await postgres_1.postgres?.query(`UPDATE vbrowser SET "heartbeatTime" = NOW() WHERE "roomId" = $1 and vmid = $2`, [room.roomId, room.vBrowser.id]);
            const expireTime = (0, time_1.getStartOfDay)() / 1000 + 86400;
            if (room.vBrowser?.creatorClientID) {
                await redis_1.redis?.zincrby('vBrowserClientIDMinutes', 1, room.vBrowser.creatorClientID);
                await redis_1.redis?.expireat('vBrowserClientIDMinutes', expireTime);
            }
            if (room.vBrowser?.creatorUID) {
                await redis_1.redis?.zincrby('vBrowserUIDMinutes', 1, room.vBrowser?.creatorUID);
                await redis_1.redis?.expireat('vBrowserUIDMinutes', expireTime);
            }
        }
    }
}
async function getStats() {
    // Per-shard data is prefixed with "current"
    const now = Date.now();
    let currentUsers = 0;
    let currentHttp = 0;
    let currentVBrowser = 0;
    let currentVBrowserLarge = 0;
    let currentVBrowserWaiting = 0;
    let currentScreenShare = 0;
    let currentFileShare = 0;
    let currentVideoChat = 0;
    let currentRoomSizeCounts = {};
    let currentVBrowserUIDCounts = {};
    let currentRoomCount = [rooms.size];
    rooms.forEach((room) => {
        const obj = {
            video: room.video,
            rosterLength: room.roster.length,
            videoChats: room.roster.filter((p) => p.isVideoChat).length,
            vBrowser: room.vBrowser,
            vBrowserQueue: room.vBrowserQueue,
        };
        currentUsers += obj.rosterLength;
        currentVideoChat += obj.videoChats;
        if (obj.vBrowser) {
            currentVBrowser += 1;
        }
        if (obj.vBrowser && obj.vBrowser.large) {
            currentVBrowserLarge += 1;
        }
        if (obj.vBrowserQueue) {
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
    });
    currentVBrowserUIDCounts = Object.fromEntries(Object.entries(currentVBrowserUIDCounts).filter(([, val]) => val > 1));
    const dbRoomData = (await postgres_1.postgres?.query(`SELECT "roomId", "creationTime", "lastUpdateTime", vanity, "isSubRoom", "roomTitle", "roomDescription", "mediaPath", owner, password from room WHERE "lastUpdateTime" > NOW() - INTERVAL '7 day' ORDER BY "creationTime" DESC`))?.rows;
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
            vBrowserElapsed: room.vBrowser?.assignTime && now - room.vBrowser?.assignTime,
            lock: room.lock || undefined,
            creator: room.creator || undefined,
        };
        if ((obj.video && obj.creator) || obj.rosterLength > 0) {
            return obj;
        }
        else {
            return null;
        }
    })
        .filter(Boolean);
    // Per-shard data that we want to see in an array
    const currentUptime = [process.uptime()];
    const currentMemUsage = [process.memoryUsage().rss];
    // Singleton stats below (same for all shards so don't combine)
    const cpuUsage = os_1.default.loadavg();
    const redisUsage = Number((await redis_1.redis?.info())
        ?.split('\n')
        .find((line) => line.startsWith('used_memory:'))
        ?.split(':')[1]
        .trim());
    const postgresUsage = Number((await postgres_1.postgres?.query(`SELECT pg_database_size('postgres');`))?.rows[0]
        .pg_database_size);
    const numPermaRooms = Number((await postgres_1.postgres?.query('SELECT count(1) from room WHERE owner IS NOT NULL'))
        ?.rows[0].count);
    const numAllRooms = Number((await postgres_1.postgres?.query('SELECT count(1) from room'))?.rows[0].count);
    const numSubs = Number((await postgres_1.postgres?.query('SELECT count(1) from subscriber'))?.rows[0].count);
    const discordBotWatch = await (0, redis_1.getRedisCountDay)('discordBotWatch');
    const createRoomErrors = await (0, redis_1.getRedisCountDay)('createRoomError');
    const deleteAccounts = await (0, redis_1.getRedisCountDay)('deleteAccount');
    const chatMessages = await (0, redis_1.getRedisCountDay)('chatMessages');
    const addReactions = await (0, redis_1.getRedisCountDay)('addReaction');
    const hetznerApiRemaining = Number(await redis_1.redis?.get('hetznerApiRemaining'));
    const vBrowserStarts = await (0, redis_1.getRedisCountDay)('vBrowserStarts');
    const vBrowserLaunches = await (0, redis_1.getRedisCountDay)('vBrowserLaunches');
    const vBrowserFails = await (0, redis_1.getRedisCountDay)('vBrowserFails');
    const vBrowserStagingFails = await (0, redis_1.getRedisCountDay)('vBrowserStagingFails');
    const vBrowserReimages = await (0, redis_1.getRedisCountDay)('vBrowserReimage');
    const vBrowserCleanups = await (0, redis_1.getRedisCountDay)('vBrowserCleanup');
    const vBrowserStopTimeout = await (0, redis_1.getRedisCountDay)('vBrowserTerminateTimeout');
    const vBrowserStopEmpty = await (0, redis_1.getRedisCountDay)('vBrowserTerminateEmpty');
    const vBrowserStopManual = await (0, redis_1.getRedisCountDay)('vBrowserTerminateManual');
    const recaptchaRejectsLowScore = await (0, redis_1.getRedisCountDay)('recaptchaRejectsLowScore');
    const vBrowserStartMS = await redis_1.redis?.lrange('vBrowserStartMS', 0, -1);
    const vBrowserStageRetries = await redis_1.redis?.lrange('vBrowserStageRetries', 0, -1);
    const vBrowserStageFails = await redis_1.redis?.lrange('vBrowserStageFails', 0, -1);
    const vBrowserSessionMS = await redis_1.redis?.lrange('vBrowserSessionMS', 0, -1);
    // const vBrowserVMLifetime = await redis?.lrange('vBrowserVMLifetime', 0, -1);
    const recaptchaRejectsOther = await (0, redis_1.getRedisCountDay)('recaptchaRejectsOther');
    const urlStarts = await (0, redis_1.getRedisCountDay)('urlStarts');
    const playlistAdds = await (0, redis_1.getRedisCountDay)('playlistAdds');
    const screenShareStarts = await (0, redis_1.getRedisCountDay)('screenShareStarts');
    const fileShareStarts = await (0, redis_1.getRedisCountDay)('fileShareStarts');
    const mediasoupStarts = await (0, redis_1.getRedisCountDay)('mediasoupStarts');
    const videoChatStarts = await (0, redis_1.getRedisCountDay)('videoChatStarts');
    const connectStarts = await (0, redis_1.getRedisCountDay)('connectStarts');
    const connectStartsDistinct = await (0, redis_1.getRedisCountDayDistinct)('connectStartsDistinct');
    const subUploads = await (0, redis_1.getRedisCountDay)('subUploads');
    const subDownloadsOS = await (0, redis_1.getRedisCountDay)('subDownloadsOS');
    const subSearchesOS = await (0, redis_1.getRedisCountDay)('subSearchesOS');
    const youtubeSearch = await (0, redis_1.getRedisCountDay)('youtubeSearch');
    const vBrowserClientIDs = await redis_1.redis?.zrevrangebyscore('vBrowserClientIDs', '+inf', '0', 'WITHSCORES', 'LIMIT', 0, 20);
    const vBrowserUIDs = await redis_1.redis?.zrevrangebyscore('vBrowserUIDs', '+inf', '0', 'WITHSCORES', 'LIMIT', 0, 20);
    const vBrowserClientIDMinutes = await redis_1.redis?.zrevrangebyscore('vBrowserClientIDMinutes', '+inf', '0', 'WITHSCORES', 'LIMIT', 0, 20);
    const vBrowserUIDMinutes = await redis_1.redis?.zrevrangebyscore('vBrowserUIDMinutes', '+inf', '0', 'WITHSCORES', 'LIMIT', 0, 20);
    const vBrowserClientIDsCard = await redis_1.redis?.zcard('vBrowserClientIDs');
    const vBrowserUIDsCard = await redis_1.redis?.zcard('vBrowserUIDs');
    let vmManagerStats = null;
    try {
        vmManagerStats = (await axios_1.default.get('http://localhost:' + config_1.default.VMWORKER_PORT + '/stats')).data;
    }
    catch (e) {
        console.warn(e);
    }
    const createRoomPreloads = await (0, redis_1.getRedisCountDay)('createRoomPreload');
    return {
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
        currentUptime,
        currentRoomCount,
        currentMemUsage,
        cpuUsage,
        redisUsage,
        postgresUsage,
        numPermaRooms,
        numAllRooms,
        numSubs,
        discordBotWatch,
        createRoomErrors,
        createRoomPreloads,
        deleteAccounts,
        chatMessages,
        addReactions,
        urlStarts,
        playlistAdds,
        screenShareStarts,
        fileShareStarts,
        mediasoupStarts,
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
        vBrowserReimages,
        vBrowserCleanups,
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
function computeOpenSubtitlesHash(first, last, size) {
    // console.log(first.length, last.length, size);
    let temp = BigInt(size);
    process(first);
    process(last);
    temp = temp & BigInt('0xffffffffffffffff');
    return temp.toString(16).padStart(16, '0');
    function process(chunk) {
        for (let i = 0; i < chunk.length; i += 8) {
            const long = chunk.readBigUInt64LE(i);
            temp += long;
        }
    }
}
