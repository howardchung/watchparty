import { logHandledException } from './diagnostics.ts';
import { createServer, type Server } from "node:http";
import { config, type Config } from "./config.ts";
import { createAuth, type LocalAuthProvider } from "./auth.ts";
import { pool, migrate, IdentityStore } from "./db.ts";
import { createApplication } from "./app.ts";
import { Rooms } from "./rooms.ts";
import { Realtime } from "./realtime.ts";
import { MeshVoice } from "./voice.ts";
import { BugReports } from "./bugReports.ts";
import { ReportDelivery } from "./reportDelivery.ts";
import { flushMonitoring } from "./observability.ts";
export async function start(configuration: Config = config()) {
  const db = pool(configuration.databaseUrl);
  db.on("error", error => {
    logHandledException('database.pool', error);
    console.error(JSON.stringify({ event: "database_pool_error" }));
  });
  let auth: LocalAuthProvider | undefined;
  let application: ReturnType<typeof createApplication> | undefined;
  let server: Server | undefined;
  let realtime: Realtime | undefined;
  let voice: MeshVoice | undefined;
  let rooms: Rooms | undefined;
  let instanceLock: import("pg").PoolClient | undefined;
  let ownershipLost = false;
  let reportDelivery: ReportDelivery | undefined;
  let reportCleanup: ReturnType<typeof setInterval> | undefined;
  const onLockLost = (error?: Error) => {
    if (error) logHandledException('database.ownership', error);
    if (ownershipLost) return;
    ownershipLost = true;
    application?.drain();
    rooms?.drain();
    realtime?.quiesce();
    voice?.drain();
    console.error(JSON.stringify({ event: "runtime_ownership_lost" }));
  };
  const cleanup = async () => {
    clearInterval(reportCleanup);
    await reportDelivery?.stop();
    application?.drain();
    rooms?.drain();
    try {
      await voice?.close();
    } catch (handledError) {
      logHandledException("main.start.cleanup.1", handledError);
      console.error(JSON.stringify({ event: "voice_cleanup_failed" }));
    }
    try {
      await realtime?.close();
    } catch (handledError) {
      logHandledException("main.start.cleanup.2", handledError);
      console.error(JSON.stringify({ event: "realtime_cleanup_failed" }));
    }
    if (server?.listening) {
      const deadline = setTimeout(() => server?.closeAllConnections(), 5000);
      deadline.unref();
      await new Promise<void>((resolve) => server!.close(() => resolve()));
      clearTimeout(deadline);
    }
    application?.close();
    try {
      await auth?.close();
    } catch (handledError) {
      logHandledException("main.start.cleanup.3", handledError);
      console.error(JSON.stringify({ event: "auth_cleanup_failed" }));
    } finally {
      if (instanceLock) {
        const lock = instanceLock;
        instanceLock = undefined;
        try {
          if (!ownershipLost)
            await lock.query("SELECT pg_advisory_unlock(734782094)");
        } catch (handledError) {
          logHandledException("main.start.cleanup.4", handledError);
          ownershipLost = true;
        } finally {
          lock.off("error", onLockLost);
          lock.off("end", onLockLost);
          lock.release(ownershipLost);
        }
      }
      await db.end();
      await flushMonitoring();
    }
  };
  try {
    await migrate(db);
    auth = await createAuth(db);
    await db.query("SELECT 1");
    instanceLock = await db.connect();
    instanceLock.on("error", onLockLost);
    instanceLock.on("end", onLockLost);
    const acquired = await instanceLock.query(
      "SELECT pg_try_advisory_lock(734782094) AS acquired",
    );
    if (!acquired.rows[0].acquired)
      throw new Error(
        "Only one watchparty runtime may own this database; stop the existing instance first",
      );
    rooms = new Rooms(db);
    await rooms.recover();
    if (ownershipLost)
      throw new Error("Database runtime ownership lost during startup");
    const reports = new BugReports(db);
    await reports.purge();
    reportDelivery = new ReportDelivery(db);
    reportDelivery.start();
    reportCleanup = setInterval(() => { void reports.purge().catch((handledError) => {
      logHandledException("main.start.5", handledError); return console.error(JSON.stringify({ event: "report_cleanup_failed" })); }); }, 3600000);
    reportCleanup.unref();
    application = createApplication(configuration, {
      submitBugReport: async (uid, roomId, body) => { await reports.purge(); return reports.submit(uid, roomId, body); },
      rooms,
      issueRoomTicket: (uid, session, roomId) =>
        realtime!.ticket(uid, session, roomId),
      realtimeAvailable: () => !!realtime,
      voiceAvailable: () => voice?.available ?? false,
      issueVoiceConfig: (uid, session, roomId, voiceSessionId, operation) =>
        voice!.issue(uid, session, roomId, voiceSessionId, operation),
      dispatcherReady: () => realtime?.healthy() ?? false,
      revokeIdentity: async (uid) => {
        realtime?.revoke(uid);
        voice?.revoke(uid);
        await rooms!.revoke(uid);
      },
      auth,
      identities: new IdentityStore(db),
      databaseReady: async () => {
        await db.query("SELECT 1");
        return true;
      },
    });
    server = createServer(application.app);
    realtime = new Realtime(server, rooms, auth, configuration.namespacePrefix);
    voice = new MeshVoice(realtime.io, rooms, auth, configuration);
    await new Promise<void>((resolve, reject) => {
      const onError = (error: Error) => {
        server!.off("listening", onListen);
        reject(error);
      };
      const onListen = () => {
        server!.off("error", onError);
        resolve();
      };
      server!.once("error", onError);
      server!.once("listening", onListen);
      server!.listen(configuration.port, configuration.host);
    });
  } catch (error) {
    logHandledException("main.start.6", error);
    await cleanup();
    throw error;
  }
  console.log(
    JSON.stringify({
      event: "watchparty_started",
      port: configuration.port,
      auth: "local",
    }),
  );
  let stopping = false;
  const signalStop = () => void stop();
  const stop = async () => {
    if (stopping) return;
    stopping = true;
    process.off("SIGTERM", signalStop);
    process.off("SIGINT", signalStop);
    await cleanup();
  };
  process.once("SIGTERM", signalStop);
  process.once("SIGINT", signalStop);
  return { server, application, db, auth, rooms, realtime, voice, stop };
}
