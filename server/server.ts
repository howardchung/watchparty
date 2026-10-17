import config from "./config.ts";
import fs from "node:fs";
import express, { type Response } from "express";
import bodyParser from "body-parser";
import compression from "compression";
import cors from "cors";
import https from "node:https";
import http from "node:http";
import { Server } from "socket.io";
import { searchYoutube, youtubePlaylist } from "./utils/youtube.ts";
import { Room } from "./room.ts";
import { redis, redisCount } from "./utils/redis.ts";
import {
  getCustomerByUid,
  createSelfServicePortal,
  getIsSubscriberByUid,
  recordCheckoutSession,
  stripe,
} from "./utils/stripe.ts";
import { deleteUser, validateUserToken } from "./utils/firebase.ts";
import path from "node:path";
import { getStartOfDay } from "./utils/time.ts";
import { getSessionLimitSeconds } from "./vm/utils.ts";
import { postgres, insertObject, upsertObject } from "./utils/postgres.ts";
import axios, { isAxiosError } from "axios";
import crypto from "node:crypto";
import { gzipSync } from "node:zlib";
import { resolveShard } from "./utils/resolveShard.ts";
import { makeRoomName, makeUserName } from "./utils/moniker.ts";
import { getStats } from "./utils/getStats.ts";
import { assertPublicUrl, safeAxiosConfig } from "./utils/ssrf.ts";

// Last-resort safety net: a stray rejected promise shouldn't take down every room on this shard.
// Socket handlers are individually guarded in room.ts, this catches anything we missed.
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});

// Run an async job on an interval without overlapping runs or unhandled rejections
function safeInterval(name: string, fn: () => Promise<void>, ms: number) {
  let running = false;
  return setInterval(async () => {
    if (running) {
      return;
    }
    running = true;
    try {
      await fn();
    } catch (e) {
      console.warn("[%s] failed:", name, e);
    } finally {
      running = false;
    }
  }, ms);
}

if (process.env.NODE_ENV === "development") {
  axios.interceptors.request.use(
    (config) => {
      // console.log(config);
      return config;
    },
    (error) => {
      console.error(error);
    },
  );
}

const releaseInterval = 5 * 60 * 1000;
const app = express();
let server = null as https.Server | http.Server | null;
if (config.SSL_KEY_FILE && config.SSL_CRT_FILE) {
  const key = fs.readFileSync(config.SSL_KEY_FILE);
  const cert = fs.readFileSync(config.SSL_CRT_FILE);
  server = https.createServer({ key: key, cert: cert }, app);
} else {
  server = new http.Server(app);
}
server?.listen(config.PORT, config.HOST);

const io = new Server(server, { cors: {}, transports: ["websocket"] });
io.engine.use(async (req: any, res: Response, next: () => void) => {
  const roomId = req._query.roomId;
  if (!roomId) {
    return next();
  }
  try {
    // Attempt to ensure the room being connected to is loaded in memory
    // If it doesn't exist, we may fail later with "invalid namespace"
    const shard = resolveShard(roomId);
    const key = "/" + roomId;
    // Check to make sure this shard should load this room
    const isCorrectShard = !config.SHARD || shard === Number(config.SHARD);
    if (isCorrectShard && !rooms.has(key)) {
      // Get the room data from postgres
      const persistedRoom = (
        await postgres?.query<PersistentRoom>(
          `SELECT * from room where "roomId" = $1`,
          [key],
        )
      )?.rows?.[0];
      // Re-check after the await in case a concurrent request already loaded the room
      if (!rooms.has(key)) {
        const data = persistedRoom?.data
          ? JSON.stringify(persistedRoom.data)
          : undefined;
        if (data) {
          const room = new Room(io, key, data);
          rooms.set(key, room);
          console.log(
            "loading room %s into memory on shard %s",
            roomId,
            config.SHARD,
          );
        }
      }
    }
  } catch (e) {
    // Fall through, the connection will fail later with "invalid namespace" if the room isn't loaded
    console.warn("failed to load room %s:", roomId, e);
  }
  next();
});

const rooms = new Map<string, Room>();
// Following functions iterate over in-memory rooms
safeInterval("minuteMetrics", minuteMetrics, 60 * 1000);
safeInterval("release", release, releaseInterval);
safeInterval("saveRooms", saveRooms, 1000);
if (process.env.NODE_ENV === "development") {
  try {
    import("./vmWorker.ts");
    // import('./syncSubs.ts');
    // import('./timeSeries.ts');
  } catch (e) {
    console.error(e);
  }
}

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.raw({ type: "text/plain", limit: 1000000 }));

app.get("/ping", (_req, res) => {
  res.json("pong");
});

// Data's already compressed so go before the compression middleware
app.get("/subtitle/:hash", async (req, res) => {
  if (!/^[0-9a-f]{64}$/.test(req.params.hash)) {
    res.status(404).end("not found");
    return;
  }
  const key = "subtitle:" + req.params.hash;
  const buf = await redis?.getBuffer(key);
  if (!buf) {
    res.status(404).end("not found");
    return;
  }
  await redis?.expire(key, 24 * 60 * 60);
  // User-uploaded content served from our origin: make sure it can never be rendered as HTML
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Security-Policy", "sandbox; default-src 'none'");
  res.setHeader("Content-Encoding", "gzip");
  res.end(buf);
});

app.use(compression());

app.post("/subtitle", async (req, res) => {
  if (!redis) {
    res.status(503).json({ error: "subtitle storage is not available" });
    return;
  }
  const data = req.body;
  // body-parser only produces a Buffer for text/plain bodies
  if (!Buffer.isBuffer(data) || data.length === 0) {
    res.status(400).json({ error: "expected a non-empty text/plain body" });
    return;
  }
  // calculate hash, gzip and save to redis
  const hash = crypto
    .createHash("sha256")
    .update(data)
    .digest()
    .toString("hex");
  let gzipData = gzipSync(data);
  await redis.setex("subtitle:" + hash, 24 * 60 * 60, gzipData);
  redisCount("subUploads");
  res.json({ hash });
});

app.get("/downloadSubtitles", async (req, res) => {
  // Request the URL from OS
  try {
    const urlResp = await axios<{ link: string }>({
      url: "https://api.opensubtitles.com/api/v1/download",
      method: "POST",
      headers: {
        "User-Agent": "watchparty v1",
        "Api-Key": config.OPENSUBTITLES_KEY,
        Accept: "application/json",
        "Content-Type": "application/json",
        // 'Authorization': 'Bearer ' + config.OPENSUBTITLES_KEY,
      },
      data: {
        file_id: req.query.file_id,
        // sub_format: 'srt',
      },
    });
    redisCount("subDownloadsOS");
    if (!redis) {
      // Return the direct link to the user, will work for about 3 hours
      res.json(urlResp.data);
      return;
    }
    // Cache the contents in Redis (longer retention)
    const subResp = await axios.get(urlResp.data.link, {
      responseType: "arraybuffer",
    });
    const data = subResp.data;
    const hash = crypto
      .createHash("sha256")
      .update(data, "utf8")
      .digest()
      .toString("hex");
    let gzipData = gzipSync(data);
    await redis.setex("subtitle:" + hash, 24 * 60 * 60, gzipData);
    res.json({ link: "/subtitle/" + hash });
  } catch (e) {
    if (isAxiosError(e)) {
      console.log(e.response);
    }
    throw e;
  }
});

app.get("/searchSubtitles", async (req, res) => {
  let result: unknown = [];
  try {
    const title =
      typeof req.query.title === "string" ? req.query.title.slice(0, 200) : "";
    let params: Record<string, string> | undefined = undefined;
    if (title) {
      params = { languages: "en", query: title };
    }
    if (params) {
      // Alternative, web client calls this to get back some JS with the download URL embedded
      // https://www.opensubtitles.com/nocache/download/7585196/subreq.js?file_name=Borgen.S04E01.en&locale=en&np=true&sub_frmt=srt&subtitle_id=6615808&ext_installed=false
      // Up to 10 downloads per IP per day, but proxyable and doesn't require key
      const response = await axios.get(
        "https://api.opensubtitles.com/api/v1/subtitles",
        {
          // axios URL-encodes these, so titles like "Law & Order" survive intact
          params,
          headers: {
            "User-Agent": "watchparty v1",
            "Api-Key": config.OPENSUBTITLES_KEY,
          },
        },
      );
      result = response.data.data;
    }
  } catch (e: any) {
    console.error(e.message);
    result = [];
  }
  res.json(result ?? []);
  redisCount("subSearchesOS");
});

app.get("/stats", async (req, res) => {
  if (req.query.key && req.query.key === config.STATS_KEY) {
    const stats = await getStats();
    res.json(stats);
  } else {
    res.status(403).json({ error: "Access Denied" });
  }
});

app.get("/health/:metric", async (req, res) => {
  const vmManagerStats = (
    await axios.get("http://localhost:" + config.VMWORKER_PORT + "/stats")
  ).data;
  const result = vmManagerStats[req.params.metric]?.availableVBrowsers?.length;
  res.status(result ? 200 : 500).json(result);
});

app.get("/timeSeries", async (req, res) => {
  if (req.query.key && req.query.key === config.STATS_KEY && redis) {
    const timeSeriesData = await redis.lrange("timeSeries", 0, -1);
    const timeSeries = timeSeriesData.map((entry) => JSON.parse(entry));
    res.json(timeSeries);
  } else {
    res.status(403).json({ error: "Access Denied" });
  }
});

app.get("/youtube", async (req, res) => {
  if (typeof req.query.q === "string") {
    try {
      redisCount("youtubeSearch");
      const items = await searchYoutube(req.query.q);
      res.json(items);
    } catch {
      res.status(500).json({ error: "youtube error" });
    }
  } else {
    res.status(500).json({ error: "query must be a string" });
  }
});

app.get("/youtubePlaylist/:playlistId", async (req, res) => {
  try {
    const items = await youtubePlaylist(req.params.playlistId);
    res.json(items);
  } catch {
    res.status(500).json({ error: "youtube error" });
  }
});

app.post("/createRoom", async (req, res) => {
  // Pick a name nobody else is using. Collisions in memory or in the DB just retry.
  let name = "";
  for (let attempt = 0; attempt < 5 && !name; attempt++) {
    const candidate = "/" + makeRoomName(config.SHARD);
    if (rooms.has(candidate)) {
      continue;
    }
    if (postgres) {
      const now = new Date();
      try {
        await insertObject(postgres, "room", {
          roomId: candidate,
          lastUpdateTime: now,
          creationTime: now,
        });
      } catch (e) {
        console.error(e);
        redisCount("createRoomError");
        continue;
      }
    }
    name = candidate;
  }
  if (!name) {
    res.status(503).json({ error: "could not allocate a room name" });
    return;
  }
  console.log("createRoom: ", name);
  // Only construct the Room once the name is secured, since it registers a namespace and a timer
  const newRoom = new Room(io, name);
  rooms.set(name, newRoom);
  try {
    const decoded = await validateUserToken(req.body?.uid, req.body?.token);
    newRoom.creator = decoded?.email;
    const preload =
      typeof req.body?.video === "string" ? req.body.video.slice(0, 20000) : "";
    if (preload) {
      redisCount("createRoomPreload");
      newRoom.video = preload;
      newRoom.paused = true;
      await newRoom.saveRoom();
    }
    // Only accept reasonably sized strings, cap the number of items
    const prePlaylist: string[] = Array.isArray(req.body?.playlist)
      ? req.body.playlist
          .filter(
            (item: unknown): item is string =>
              typeof item === "string" &&
              item.length > 0 &&
              item.length <= 20000,
          )
          .slice(0, 25)
      : [];
    if (prePlaylist.length) {
      // Add in order in the background, a failing item shouldn't affect the others or the request
      (async () => {
        for (const item of prePlaylist) {
          try {
            await newRoom.playlistAdd(null, item);
          } catch (e) {
            console.warn(e);
          }
        }
      })();
    }
  } catch (e) {
    // Don't leave a half-created room (and its timer/namespace) behind
    newRoom.destroy();
    rooms.delete(name);
    throw e;
  }
  res.json({ name });
});

app.post("/checkoutSub", async (req, res) => {
  const decoded = await validateUserToken(
    String(req.body?.uid),
    String(req.body?.token),
  );
  if (!decoded) {
    res.status(400).json({ error: "invalid user token" });
    return;
  }
  // Don't let a user subscribe twice
  if (postgres) {
    const { rows } = await postgres.query(
      "SELECT 1 FROM subscriber WHERE uid = $1 AND status = 'active'",
      [decoded.uid],
    );
    if (rows.length) {
      res.status(400).json({ error: "already subscribed" });
      return;
    }
  }
  const returnUrl = req.body?.return_url
  if (!returnUrl) {
    res.status(400).json({ error: "invalid return_url" });
    return;
  }
  // Stripe redirects to success_url on our server first, so we can record the subscription
  // before sending the user back to their room
  const proto = (req.get("x-forwarded-proto") ?? req.protocol)
    .split(",")[0]
    .trim();
  const serverUrl = `${proto === "https" ? "https" : "http"}://${req.get("host")}`;
  // Reuse the existing customer for this user, or create one tagged with their UID
  // so we can find it later even if their email changes
  const customer =
    (await getCustomerByUid(decoded.uid)) ??
    (await stripe.customers.create({
      email: decoded.email,
      metadata: { firebaseUid: decoded.uid },
    }));
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    client_reference_id: decoded.uid,
    customer: customer.id,
    line_items: [
      {
        price:
          config.NODE_ENV === "development"
            ? "price_HNGtabCzD5qyfd"
            : "price_HNDBoPDI7yYRi9",
        quantity: 1,
      },
    ],
    // {CHECKOUT_SESSION_ID} is filled in by Stripe, so it must not be URL-encoded
    success_url: `${serverUrl}/subSuccess?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: returnUrl,
    // /subSuccess redirects here. Stored on the session (not in the success URL) so
    // the redirect target can't be changed by editing a link.
    metadata: { return_url: returnUrl },
  });
  res.json({ url: session.url });
});

// Stripe sends the user here after a successful checkout
app.get("/subSuccess", async (req, res) => {
  const sessionId =
    typeof req.query.session_id === "string" ? req.query.session_id : "";
  let returnUrl: string | undefined = undefined;
  const result = await recordCheckoutSession(sessionId);
  returnUrl = result.returnUrl;
  // Only ever redirect to the URL we validated and stored when creating the session
  // (never to something from this request's query string). If we couldn't read it, go home.
  res.redirect(returnUrl || "/");
});

app.post("/manageSub", async (req, res) => {
  const decoded = await validateUserToken(
    String(req.body?.uid),
    String(req.body?.token),
  );
  if (!decoded) {
    res.status(400).json({ error: "invalid user token" });
    return;
  }
  const customer = await getCustomerByUid(decoded.uid);
  if (!customer) {
    res.status(400).json({ error: "customer not found" });
    return;
  }
  const session = await createSelfServicePortal(
    customer.id,
    req.body?.return_url,
  );
  res.json(session);
});

app.delete("/deleteAccount", async (req, res) => {
  // TODO pass this in req.query instead
  const decoded = await validateUserToken(req.body?.uid, req.body?.token);
  if (!decoded) {
    res.status(400).json({ error: "invalid user token" });
    return;
  }
  if (postgres) {
    // Delete rooms
    await postgres.query("DELETE FROM room WHERE owner = $1", [decoded.uid]);
    // Delete linked accounts
    await postgres.query("DELETE FROM link_account WHERE uid = $1", [
      decoded.uid,
    ]);
  }
  await deleteUser(decoded.uid);
  redisCount("deleteAccount");
  res.json({});
});

app.get("/metadata", async (req, res) => {
  const decoded = await validateUserToken(
    String(req.query?.uid),
    String(req.query?.token),
  );
  let isSubscriber = await getIsSubscriberByUid(decoded?.uid);
  // Has the user ever been a subscriber?
  // const customer = await getCustomerByUid(decoded.uid);
  let isFreePoolFull = false;
  try {
    isFreePoolFull = (
      await axios.get(
        "http://localhost:" + config.VMWORKER_PORT + "/isFreePoolFull",
      )
    ).data.isFull;
  } catch (e: any) {
    console.warn("[WARNING]: free pool check failed: %s", e.code);
  }
  const beta =
    decoded?.email != null &&
    Boolean(config.BETA_USER_EMAILS.split(",").includes(decoded?.email));
  const streamPath = beta ? config.STREAM_PATH : undefined;
  // log metrics but don't wait for it
  if (postgres && decoded?.uid) {
    upsertObject(
      postgres,
      "active_user",
      { uid: decoded?.uid, lastActiveTime: new Date() },
      { uid: true },
    );
  }
  res.json({
    isSubscriber,
    isFreePoolFull,
    beta,
    streamPath,
  });
});

app.get("/resolveRoom/:vanity", async (req, res) => {
  const vanity = req.params.vanity;
  const result = await postgres?.query(
    `SELECT "roomId", vanity from room WHERE LOWER(vanity) = $1`,
    [vanity?.toLowerCase() ?? ""],
  );
  // console.log(vanity, result.rows);
  // We also use this for checking name availability, so just return null if it doesn't exist (http 200)
  res.json(result?.rows[0] ?? null);
});

app.get("/roomData/:roomId", async (req, res) => {
  // Returns the room data given a room ID
  // Only return data if the room doesn't have a password
  // If it does, we could accept it as a URL parameter but for now just don't support
  const result = await postgres?.query(
    `SELECT data from room WHERE "roomId" = $1 and password IS NULL`,
    ["/" + req.params.roomId],
  );
  res.json(result?.rows[0]?.data);
});

app.get("/resolveShard/:roomId", async (req, res) => {
  const shardNum = resolveShard(req.params.roomId);
  res.send(String(config.SHARD ? shardNum : ""));
});

app.get("/listRooms", async (req, res) => {
  const decoded = await validateUserToken(
    String(req.query?.uid),
    String(req.query?.token),
  );
  if (!decoded) {
    res.status(400).json({ error: "invalid user token" });
    return;
  }
  const result = await postgres?.query<PersistentRoom>(
    `SELECT "roomId", vanity, password from room WHERE owner = $1`,
    [decoded.uid],
  );
  res.json(result?.rows ?? []);
});

app.delete("/deleteRoom", async (req, res) => {
  const decoded = await validateUserToken(
    String(req.query?.uid),
    String(req.query?.token),
  );
  if (!decoded) {
    res.status(400).json({ error: "invalid user token" });
    return;
  }
  const result = await postgres?.query(
    `DELETE from room WHERE owner = $1 and "roomId" = $2`,
    [decoded.uid, req.query.roomId],
  );
  res.json(result?.rows);
});

app.get("/linkAccount", async (req, res) => {
  const decoded = await validateUserToken(
    String(req.query?.uid),
    String(req.query?.token),
  );
  if (!decoded) {
    res.status(400).json({ error: "invalid user token" });
    return;
  }
  if (!postgres) {
    res.status(400).json({ error: "invalid database client" });
    return;
  }
  // Get the linked accounts for the user
  let linkAccounts: LinkAccount[] = [];
  if (decoded?.uid && postgres) {
    const { rows } = await postgres.query(
      "SELECT kind, accountid, accountname, discriminator FROM link_account WHERE uid = $1",
      [decoded?.uid],
    );
    linkAccounts = rows;
  }
  res.json(linkAccounts);
});

app.post("/linkAccount", async (req, res) => {
  const decoded = await validateUserToken(
    String(req.body?.uid),
    String(req.body?.token),
  );
  if (!decoded) {
    res.status(400).json({ error: "invalid user token" });
    return;
  }
  if (!postgres) {
    res.status(400).json({ error: "invalid database client" });
    return;
  }
  const kind = req.body?.kind;
  if (kind === "discord") {
    const tokenType = req.body?.tokenType;
    const accessToken = req.body.accessToken;
    // Get the token and verify the user
    const response = await axios.get("https://discord.com/api/users/@me", {
      headers: {
        authorization: `${tokenType} ${accessToken}`,
      },
    });
    const accountid = response.data.id;
    const accountname = response.data.username;
    const discriminator = response.data.discriminator;
    // Store the user id, username, discriminator
    await upsertObject(
      postgres,
      "link_account",
      {
        accountid: accountid,
        accountname: accountname,
        discriminator: discriminator,
        uid: decoded.uid,
        kind: kind,
      },
      { uid: true, kind: true },
    );
    res.json({});
  } else {
    res.status(400).json({ error: "unsupported kind" });
  }
});

app.delete("/linkAccount", async (req, res) => {
  // TODO read from req.query instead
  const decoded = await validateUserToken(
    String(req.body?.uid),
    String(req.body?.token),
  );
  if (!decoded) {
    res.status(400).json({ error: "invalid user token" });
    return;
  }
  if (!postgres) {
    res.status(400).json({ error: "invalid database client" });
    return;
  }
  await postgres.query(
    "DELETE FROM link_account WHERE uid = $1 AND kind = $2",
    [decoded.uid, req.body.kind],
  );
  res.json({});
});

app.get("/generateName", async (req, res) => {
  res.send(makeUserName());
});

// Proxy video segments
// Hostname only: no scheme, port, userinfo or path, so it can't be used to redirect the request elsewhere
const PROXY_HOST_RE =
  /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i;
app.get("/proxy/*splat", async (req, res) => {
  redisCount("proxyReqs");
  try {
    const parsed = new URL("http://localhost" + req.url);
    const pathname = parsed.pathname.slice("/proxy".length);
    const host = parsed.searchParams.get("host") ?? "";
    if (!PROXY_HOST_RE.test(host)) {
      res.status(400).end();
      return;
    }
    const upstream = new URL("https://" + host + pathname);
    if (upstream.hostname !== host.toLowerCase()) {
      res.status(400).end();
      return;
    }
    // Refuse private/loopback addresses (hostnames are re-checked when connecting)
    assertPublicUrl(upstream);
    const upstreamConfig = {
      ...safeAxiosConfig,
      maxContentLength: 50 * 1024 * 1024,
    };
    // Upstream content is untrusted, never let it be interpreted as HTML on our origin
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (pathname.endsWith("index-dvr.m3u8")) {
      // VOD
      // https://d2vjef5jvl6bfs.cloudfront.net/3012391a6c3e84c79ef6_gamesdonequick_41198403369_1681059003/chunked/index-dvr.m3u8
      const resp = await axios.get(upstream.href, upstreamConfig);
      const re2 = /(.*.ts)/g;
      let repl = String(resp.data).replaceAll(re2, `$1?host=${host}`);
      // Mark this as a VOD
      repl += "#EXT-X-ENDLIST";
      res.type("application/vnd.apple.mpegurl").send(repl);
    } else if (pathname.endsWith(".m3u8")) {
      // Stream
      // https://video-weaver.sea02.hls.ttvnw.net/v1/playlist/<token>.m3u8
      // Extract the edge URL host and add it to URL so proxy can fetch
      const resp = await axios.get(upstream.href, upstreamConfig);
      res.type("application/vnd.apple.mpegurl").send(String(resp.data));
    } else if (pathname.endsWith(".ts")) {
      // Segment
      const resp = await axios.get(upstream.href, {
        ...upstreamConfig,
        responseType: "arraybuffer",
      });
      res.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Accept-Ranges": "bytes",
        "Content-Length": resp.data.length,
        "Transfer-Encoding": "chunked",
      });
      res.write(resp.data);
      res.end();
    } else {
      res.status(404);
      res.end();
    }
  } catch (e) {
    // console.log(e);
    console.log("proxy failed: %s", req.url);
    // Always answer, otherwise the client hangs until it times out
    if (!res.headersSent) {
      res.status(502).end();
    } else {
      res.end();
    }
  }
});

app.use(express.static(config.BUILD_DIRECTORY));
// Send index.html for all other requests (SPA)
app.use("/*splat", (_req, res) => {
  res.sendFile(
    path.resolve(
      import.meta.dirname + `/../${config.BUILD_DIRECTORY}/index.html`,
    ),
  );
});

async function saveRooms() {
  // Unload rooms that are empty and idle
  // Frees up some JS memory space when process is long-running
  // On reconnect, we'll attempt to reload the room
  let saveCount = 0;
  let skipCount = 0;
  const start = Date.now();
  await Promise.all(
    Array.from(rooms.entries()).map(async ([key, room]) => {
      if (
        room.roster.length === 0 &&
        !room.vBrowser &&
        Number(room.lastUpdateTime) < Date.now() - 8 * 60 * 60 * 1000
      ) {
        console.log(
          "freeing room %s from memory on shard %s",
          key,
          config.SHARD,
        );
        await room.saveRoom();
        room.destroy();
        rooms.delete(key);
        saveCount += 1;
        // Unregister the namespace to avoid dupes on reload
        io._nsps.delete(key);
      } else if (room.roster.length) {
        room.lastUpdateTime = new Date();
        await room.saveRoom();
        saveCount += 1;
      } else {
        skipCount += 1;
      }
    }),
  );
  const end = Date.now();
  console.log(
    "[SAVEROOMS] %s saved in %sms, %s skipped",
    saveCount,
    end - start,
    skipCount,
  );
}

async function release() {
  // Reset VMs in rooms that are:
  // older than the session limit
  // assigned to a room with no users
  const roomArr = Array.from(rooms.values());
  console.log("[RELEASE] %s rooms in batch", roomArr.length);
  for (let room of roomArr) {
    if (room.vBrowser && room.vBrowser.assignTime) {
      const maxTime = getSessionLimitSeconds(room.vBrowser.large) * 1000;
      const elapsed = Date.now() - room.vBrowser.assignTime;
      const ttl = maxTime - elapsed;
      const isTimedOut = ttl && ttl < releaseInterval;
      const isAlmostTimedOut = ttl && ttl < releaseInterval * 2;
      const isRoomEmpty = room.roster.length === 0;
      const isRoomIdle =
        Date.now() - Number(room.lastUpdateTime) > 5 * 60 * 1000;
      if (isTimedOut || (isRoomEmpty && isRoomIdle)) {
        console.log("[RELEASE] VM in room:", room.roomId);
        room.stopVBrowserInternal();
        if (isTimedOut) {
          room.addChatMessage(null, {
            id: "",
            system: true,
            cmd: "vBrowserTimeout",
            msg: "",
          });
          redisCount("vBrowserTerminateTimeout");
        } else if (isRoomEmpty) {
          redisCount("vBrowserTerminateEmpty");
        }
      } else if (isAlmostTimedOut) {
        room.addChatMessage(null, {
          id: "",
          system: true,
          cmd: "vBrowserAlmostTimeout",
          msg: "",
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
  let vbWaiting = 0;
  for (let room of roomArr) {
    try {
      if (room.vBrowser && room.vBrowser.id) {
        // Update the heartbeat
        await postgres?.query(
          `UPDATE vbrowser SET "heartbeatTime" = NOW() WHERE "roomId" = $1 and vmid = $2`,
          [room.roomId, room.vBrowser.id],
        );

        const expireTime = getStartOfDay() / 1000 + 86400;
        if (room.vBrowser?.creatorClientID) {
          await redis?.zincrby(
            "vBrowserClientIDMinutes",
            1,
            room.vBrowser.creatorClientID,
          );
          await redis?.expireat("vBrowserClientIDMinutes", expireTime);
        }
        if (room.vBrowser?.creatorUID) {
          await redis?.zincrby(
            "vBrowserUIDMinutes",
            1,
            room.vBrowser?.creatorUID,
          );
          await redis?.expireat("vBrowserUIDMinutes", expireTime);
        }
      }
      const users = room.roster.length;
      if (users) {
        await redis?.setex(`roomCounts:${room.roomId}`, 120, users);
        await redis?.setex(
          `roomRosters:${room.roomId}`,
          120,
          JSON.stringify(room.getRosterForStats()),
        );
      }
      vbWaiting += room.vBrowserQueue ? 1 : 0;
    } catch (e) {
      // One room's failure shouldn't stop metrics for the rest
      console.warn("[minuteMetrics] room %s failed:", room.roomId, e);
    }
  }
  // Report shard metrics
  const obj: ShardMetric = {
    uptime: process.uptime(),
    mem: process.memoryUsage().rss,
    roomCount: rooms.size,
    users: io.engine.clientsCount,
    vbWaiting,
  };
  await redis?.setex(
    `shardMetrics:${config.SHARD ?? 0}`,
    120,
    JSON.stringify(obj),
  );
}
