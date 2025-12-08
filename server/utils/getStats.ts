import type { AssignedVM } from '../vm/base.ts';
import { postgres } from './postgres.ts';
import os from 'node:os';
import { getRedisCountDay, getRedisCountDayDistinct, redis } from './redis.ts';
import config from '../config.ts';

export async function getStats() {
  const now = Date.now();

  // TODO if we serialize currentUsers, currentVideoChat, currentVBrowserWaiting to postgres then we can just count them below
  // This would simplify minutemetrics code
  // Need to assemble currentRoomSizes
  const roomSizes = (await redis?.hgetall('roomCounts')) ?? {};
  const currentRoomSizes: Record<string, number> = {};
  Object.keys(roomSizes).forEach((key) => {
    let value = roomSizes[key];
    currentRoomSizes[value] = (currentRoomSizes[value] ?? 0) + 1;
  });

  // Need to sum currentUsers, currentVBrowserWaiting, currentVideoChat
  let currentUsers = 0;
  let currentVideoChat = 0;
  let currentVBrowserWaiting = 0;
  const resp2 = (await redis?.hgetall('shardMetrics')) ?? {};
  // Render each shard metrics as its own object
  const shardMetrics: Record<string, ShardMetric> = {};
  Object.keys(resp2).forEach((key) => {
    const value: ShardMetric = JSON.parse(resp2[key]);
    shardMetrics[key] = value;
    currentUsers += value.users;
    currentVideoChat += value.videoChat;
    currentVBrowserWaiting = value.vBrowserWaiting;
  });

  // Count these from postgres data
  let currentHttp = 0;
  let currentVBrowser = 0;
  let currentVBrowserLarge = 0;
  let currentScreenShare = 0;
  let currentFileShare = 0;

  const result = await postgres?.query<{
    roomId: string;
    creationTime: Date;
    lastUpdateTime: Date;
    vanity: string;
    isSubRoom: boolean;
    roomTitle: string;
    roomDescription: string;
    mediaPath: string;
    owner: string;
    password: string;
    video: string;
    videoTS: number;
    vBrowser: AssignedVM;
    creator: string;
    lock: string;
  }>(
    `SELECT "roomId", "creationTime", "lastUpdateTime", vanity, "isSubRoom", "roomTitle", "roomDescription", "mediaPath", owner, password,
    data->'video' as video, data->'videoTS' as videoTS, data->'vBrowser' as vBrowser, data->'creator' as creator, data->'lock' as lock
    FROM room
    WHERE "lastUpdateTime" > NOW() - INTERVAL '7 day'
    ORDER BY "creationTime" DESC`,
  );
  const currentRoomData: any[] = [];
  for (let dbRoom of result?.rows ?? []) {
    // Get roster info from Redis
    const rosterLength = Number(roomSizes[dbRoom.roomId]) || 0;
    let roster = [];
    if (rosterLength > 0) {
      const resp = await redis?.hget('roomRosters', dbRoom.roomId);
      if (resp) {
        roster = JSON.parse(resp);
      }
    }
    const vBrowser = dbRoom.vBrowser;
    const obj = {
      roomId: dbRoom.roomId,
      video: dbRoom.video || undefined,
      videoTS: dbRoom.videoTS || undefined,
      creationTime: dbRoom.creationTime || undefined,
      lastUpdateTime: dbRoom.lastUpdateTime || undefined,
      vanity: dbRoom.vanity || undefined,
      isSubRoom: dbRoom.isSubRoom || undefined,
      owner: dbRoom.owner || undefined,
      password: dbRoom.password || undefined,
      roomTitle: dbRoom.roomTitle || undefined,
      roomDescription: dbRoom.roomDescription || undefined,
      mediaPath: dbRoom.mediaPath || undefined,
      vBrowser,
      vBrowserElapsed: vBrowser?.assignTime && now - vBrowser?.assignTime,
      lock: dbRoom.lock || undefined,
      creator: dbRoom.creator || undefined,
      rosterLength,
      roster,
    };
    if (vBrowser) {
      currentVBrowser += 1;
    }
    if (vBrowser?.large) {
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
    if (obj.video || obj.rosterLength > 0) {
      currentRoomData.push(obj);
    }
  }
  // Singleton stats below (same for all shards)
  const cpuUsage = os.loadavg()[1] * 100;
  const redisUsage = Number(
    (await redis?.info())
      ?.split('\n')
      .find((line) => line.startsWith('used_memory:'))
      ?.split(':')[1]
      .trim(),
  );
  const postgresUsage = Number(
    (await postgres?.query(`SELECT pg_database_size('postgres');`))?.rows[0]
      .pg_database_size,
  );
  const numPermaRooms = Number(
    (await postgres?.query('SELECT count(1) from room WHERE owner IS NOT NULL'))
      ?.rows[0].count,
  );
  const numAllRooms = Number(
    (await postgres?.query('SELECT count(1) from room'))?.rows[0].count,
  );
  const numSubs = Number(
    (await postgres?.query('SELECT count(1) from subscriber'))?.rows[0].count,
  );
  const discordBotWatch = await getRedisCountDay('discordBotWatch');
  const createRoomErrors = await getRedisCountDay('createRoomError');
  const deleteAccounts = await getRedisCountDay('deleteAccount');
  const chatMessages = await getRedisCountDay('chatMessages');
  const addReactions = await getRedisCountDay('addReaction');
  const hetznerApiRemaining = Number(await redis?.get('hetznerApiRemaining'));
  const vBrowserStarts = await getRedisCountDay('vBrowserStarts');
  const vBrowserLaunches = await getRedisCountDay('vBrowserLaunches');
  const vBrowserFails = await getRedisCountDay('vBrowserFails');
  const vBrowserStagingFails = await getRedisCountDay('vBrowserStagingFails');
  const vBrowserReimages = await getRedisCountDay('vBrowserReimage');
  const vBrowserCleanups = await getRedisCountDay('vBrowserCleanup');
  const vBrowserStopTimeout = await getRedisCountDay(
    'vBrowserTerminateTimeout',
  );
  const vBrowserStopEmpty = await getRedisCountDay('vBrowserTerminateEmpty');
  const vBrowserStopManual = await getRedisCountDay('vBrowserTerminateManual');
  const recaptchaRejectsLowScore = await getRedisCountDay(
    'recaptchaRejectsLowScore',
  );
  const vBrowserStartMS = await redis?.lrange('vBrowserStartMS', 0, -1);
  const vBrowserStageRetries = await redis?.lrange(
    'vBrowserStageRetries',
    0,
    -1,
  );
  const vBrowserStageFails = await redis?.lrange('vBrowserStageFails', 0, -1);
  const vBrowserSessionMS = await redis?.lrange('vBrowserSessionMS', 0, -1);
  // const vBrowserVMLifetime = await redis?.lrange('vBrowserVMLifetime', 0, -1);
  const recaptchaRejectsOther = await getRedisCountDay('recaptchaRejectsOther');
  const proxyReqs = await getRedisCountDay('proxyReqs');
  const urlStarts = await getRedisCountDay('urlStarts');
  const streamStarts = await getRedisCountDay('streamStarts');
  const convertStarts = await getRedisCountDay('convertStarts');
  const playlistAdds = await getRedisCountDay('playlistAdds');
  const screenShareStarts = await getRedisCountDay('screenShareStarts');
  const fileShareStarts = await getRedisCountDay('fileShareStarts');
  const mediasoupStarts = await getRedisCountDay('mediasoupStarts');
  const videoChatStarts = await getRedisCountDay('videoChatStarts');
  const connectStarts = await getRedisCountDay('connectStarts');
  const connectStartsDistinct = await getRedisCountDayDistinct(
    'connectStartsDistinct',
  );
  const subUploads = await getRedisCountDay('subUploads');
  const subDownloadsOS = await getRedisCountDay('subDownloadsOS');
  const subSearchesOS = await getRedisCountDay('subSearchesOS');
  const youtubeSearch = await getRedisCountDay('youtubeSearch');
  const vBrowserClientIDsCard = await redis?.zcard('vBrowserClientIDs');
  const vBrowserUIDsCard = await redis?.zcard('vBrowserUIDs');
  const createRoomPreloads = await getRedisCountDay('createRoomPreload');

  const vBrowserClientIDs = altArrayToObject(
    await redis?.zrevrangebyscore(
      'vBrowserClientIDs',
      '+inf',
      '0',
      'WITHSCORES',
      'LIMIT',
      0,
      20,
    ),
  );
  const vBrowserUIDs = altArrayToObject(
    await redis?.zrevrangebyscore(
      'vBrowserUIDs',
      '+inf',
      '0',
      'WITHSCORES',
      'LIMIT',
      0,
      20,
    ),
  );
  const vBrowserClientIDMinutes = altArrayToObject(
    await redis?.zrevrangebyscore(
      'vBrowserClientIDMinutes',
      '+inf',
      '0',
      'WITHSCORES',
      'LIMIT',
      0,
      20,
    ),
  );
  const vBrowserUIDMinutes = altArrayToObject(
    await redis?.zrevrangebyscore(
      'vBrowserUIDMinutes',
      '+inf',
      '0',
      'WITHSCORES',
      'LIMIT',
      0,
      20,
    ),
  );

  // Fetch VM stats from vmworker
  const resp = await fetch(
    'http://localhost:' + config.VMWORKER_PORT + '/stats',
  );
  const vmManagerStats = await resp.json();

  return {
    currentRoomSizes,
    ...shardMetrics,
    counts: {
      currentUsers,
      currentVideoChat,
      currentVBrowser,
      currentVBrowserLarge,
      currentVBrowserWaiting,
      currentHttp,
      currentScreenShare,
      currentFileShare,
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
      proxyReqs,
      urlStarts,
      streamStarts,
      convertStarts,
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
      vBrowserClientIDsCard,
      vBrowserUIDsCard,
    },
    // Stats object from vmWorker (render as JSON)
    vmManagerStats,
    // Array of room data (render as JSON)
    currentRoomData,
    // Arrays of last values (render as one column table)
    vBrowserStartMS,
    vBrowserStageRetries,
    vBrowserStageFails,
    vBrowserSessionMS,
    // Maps of vbrowser users
    vBrowserClientIDs,
    vBrowserClientIDMinutes,
    vBrowserUIDs,
    vBrowserUIDMinutes,
  };
}

function altArrayToObject(arr: string[] | undefined) {
  const result: Record<string, number> = {};
  if (!arr) {
    return result;
  }
  for (let i = 0; i < arr.length; i += 2) {
    const k = arr[i];
    const v = arr[i + 1];
    result[k] = Number(v);
  }
  return result;
}
