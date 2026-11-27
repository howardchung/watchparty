import { logHandledException } from './diagnostics.ts';
import express, {
  type ErrorRequestHandler,
  type Request,
  type RequestHandler,
  type Response,
} from "express";
import type { Config } from "./config.ts";
import type { AuthProvider, Session } from "./auth.ts";
import type { Identities } from "./db.ts";
import { profile } from "./db.ts";
import { REFRESH_TTL_MS, type IssuedSession } from "./auth.ts";
import { ApiError } from "./errors.ts";
import { captureServerError } from "./observability.ts";
import type { Rooms } from "./rooms.ts";
import { readChat, sendChat } from './chat.ts';
export interface AuthenticatedRequest extends Request {
  session: Session;
}
export interface Dependencies {
  auth: AuthProvider;
  rooms?: Rooms;
  issueRoomTicket?(
    uid: string,
    session: Session,
    roomId: string,
  ): Promise<unknown>;
  identities: Identities;
  databaseReady(): Promise<boolean>;
  submitBugReport?(uid: string, roomId: string | null, body: unknown): Promise<unknown>;
  // Phase 3 installs membership/ticket/socket cleanup, and dispatcher health.
  revokeIdentity?(uid: string): Promise<void>;
  dispatcherReady?(): boolean;
  realtimeAvailable?(): boolean;
  voiceAvailable?(): boolean;
  issueVoiceConfig?(uid: string, session: Session, roomId: string, voiceSessionId?: string, operation?: "join" | "resume" | "refresh"): Promise<unknown>;
}
export function createApplication(configuration: Config, deps: Dependencies) {
  const app = express();
  const api = express.Router();
  app.disable("x-powered-by");
  app.set("trust proxy", configuration.trustedProxies);
  const cookieName = configuration.environment === "development" ? "roomio-refresh" : "__Host-roomio-refresh";
  const browserRequest = (req: Request): boolean => {
    const origin = req.get("Origin");
    const browser = req.get("X-Roomio-Client") === "browser";
    if (origin || browser) {
      if (!browser || !origin || !configuration.allowedOrigins.includes(origin)) throw new ApiError(403, "FORBIDDEN");
      return true;
    }
    return false;
  };
  const readCookie = (req: Request): string | undefined => {
    const values = (req.get("Cookie") ?? "").split(";").map(x => x.trim()).filter(x => x.startsWith(cookieName + "="));
    if (values.length !== 1) return undefined;
    return values[0].slice(cookieName.length + 1);
  };
  const cookieOptions = { httpOnly: true, secure: configuration.environment !== "development", sameSite: "strict" as const, path: "/" };
  const sendSession = (res: Response, result: IssuedSession, browser: boolean, status = 200) => {
    res.setHeader("Cache-Control", "no-store");
    if (browser) {
      res.cookie(cookieName, result.refreshToken, { ...cookieOptions, maxAge: REFRESH_TTL_MS });
      const { refreshToken, ...payload } = result;
      res.status(status).json(payload);
    } else res.status(status).json(result);
  };
  // Cookie credentials are accepted only on the browser session routes. Product APIs use bearer access tokens.
  app.use((req, res, next) => {
    const origin = req.get("Origin");
    if (origin && configuration.allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.vary("Origin");
      if (req.method === "OPTIONS") {
        res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,Idempotency-Key,X-Roomio-Client");
        res.status(204).end(); return;
      }
    }
    next();
  });
  const budgets = new Map<string, { count: number; reset: number }>();
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, value] of budgets)
      if (value.reset <= now) budgets.delete(key);
  }, 60000);
  timer.unref();
  const limit =
    (name: string, max: number): RequestHandler =>
    (req, res, next) => {
      const key = `${name}:${req.ip}`;
      const now = Date.now();
      let budget = budgets.get(key);
      if (!budget || budget.reset <= now) {
        // Bound attacker-controlled client keys; never evict active entries to bypass their budgets.
        if (budgets.size >= 10000)
          return next(new ApiError(429, "RATE_LIMITED"));
        budget = { count: 0, reset: now + 60000 };
        budgets.set(key, budget);
      }
      if (++budget.count > max) {
        res.setHeader("Retry-After", Math.ceil((budget.reset - now) / 1000));
        return next(new ApiError(429, "RATE_LIMITED"));
      }
      next();
    };
  let draining = false;
  app.get("/healthz", limit("health", 600), (req, res) => {
    res.json({ status: "ok" });
  });
  app.get("/readyz", limit("health", 600), async (req, res) => {
    let database = false;
    try {
      database = await deps.databaseReady();
    } catch (handledError) { logHandledException("app.createApplication.1", handledError); }
    const dispatcher = deps.dispatcherReady?.() ?? true;
    const ready = !draining && database && dispatcher;
    res.status(ready ? 200 : 503).json({
      ready,
      database,
      dispatcher,
      voice: deps.voiceAvailable?.() ?? false,
    });
  });
  app.use((req, res, next) => {
    if (/^\/v1\/(?:rooms\/[^/]+\/)?bug-reports\/?$/.test(req.path)) return next();
    return express.json({ limit: "8kb", strict: true })(req, res, next);
  });
  const authenticate: RequestHandler = async (req, res, next) => {
    if (draining) throw new ApiError(503, "UNAVAILABLE");
    const header = req.get("Authorization");
    if (!header || !/^Bearer [^\s]+$/.test(header))
      throw new ApiError(401, "UNAUTHENTICATED");
    (req as AuthenticatedRequest).session = await deps.auth.verify(
      header.slice(7),
    );
    next();
  };
  api.post("/guest-sessions", limit("session-create", 20), async (req, res) => {
    if (draining) throw new ApiError(503, "UNAVAILABLE");
    const browser = browserRequest(req);
    if (!deps.auth.create) throw new ApiError(503, "AUTH_UNAVAILABLE");
    // An existing cookie must be restored or explicitly reset, never replaced by signup.
    if (browser && readCookie(req)) throw new ApiError(409, "SESSION_EXISTS");
    sendSession(res, await deps.auth.create(profile(req.body)), browser, 201);
  });
  api.post("/guest-sessions/refresh", limit("session-refresh", 120), async (req, res) => {
    if (draining) throw new ApiError(503, "UNAVAILABLE");
    const browser = browserRequest(req);
    if (!deps.auth.refresh) throw new ApiError(503, "AUTH_UNAVAILABLE");
    const refresh = browser ? readCookie(req) : req.body?.refreshToken;
    if (typeof refresh !== "string" || !refresh) throw new ApiError(401, "UNAUTHENTICATED");
    sendSession(res, await deps.auth.refresh(refresh), browser);
  });
  api.post("/guest-sessions/reset", limit("session-reset", 10), async (req, res) => {
    if (draining) throw new ApiError(503, "UNAVAILABLE");
    if (!browserRequest(req)) throw new ApiError(403, "FORBIDDEN");
    const refresh = readCookie(req);
    if (refresh && deps.auth.reset) {
      const uid = await deps.auth.reset(refresh);
      if (uid) await deps.revokeIdentity?.(uid);
    }
    res.clearCookie(cookieName, cookieOptions);
    res.setHeader("Cache-Control", "no-store");
    res.status(204).end();
  });
  api.use(limit("api", 120), authenticate);
  api.get('/rooms/:roomId/chat/messages', async (req: Request, res) => {
    if (!deps.rooms) throw new ApiError(503, 'UNAVAILABLE');
    res.setHeader('Cache-Control', 'no-store');
    res.json(await readChat(deps.rooms, (req as AuthenticatedRequest).session.uid, String(req.params.roomId), req.query.before));
  });
  api.post('/rooms/:roomId/chat/messages', async (req: Request, res) => {
    if (!deps.rooms) throw new ApiError(503, 'UNAVAILABLE');
    res.setHeader('Cache-Control', 'no-store');
    res.status(201).json(await sendChat(deps.rooms, (req as AuthenticatedRequest).session.uid, String(req.params.roomId), req.body));
  });
  // Allow JSON escaping of the 8 MiB log plus base64 for up to 5 MiB of images.
  api.post(["/bug-reports", "/rooms/:roomId/bug-reports"], limit("bug-report", 5), express.json({ limit: "64mb", strict: true }), async (req, res) => {
    if (!deps.submitBugReport) throw new ApiError(503, "UNAVAILABLE");
    res.setHeader("Cache-Control", "no-store");
    res.status(201).json(await deps.submitBugReport((req as AuthenticatedRequest).session.uid, req.params.roomId ? String(req.params.roomId) : null, req.body));
  });
  api.post("/identities/bootstrap", limit("profile", 30), async (req, res) => {
    const { uid } = (req as AuthenticatedRequest).session;
    res.json({
      identity: await deps.identities.bootstrap(uid, profile(req.body)),
    });
  });
  api.patch(
    "/guest-sessions/profile",
    limit("profile", 30),
    async (req, res) => {
      res.json({
        identity: await deps.identities.update(
          (req as AuthenticatedRequest).session.uid,
          profile(req.body),
        ),
      });
    },
  );
  api.post("/guest-sessions/revoke", limit("revoke", 10), async (req, res) => {
    const { uid } = (req as AuthenticatedRequest).session;
    await deps.auth.revoke(uid);
    await deps.revokeIdentity?.(uid);
    res.clearCookie(cookieName, cookieOptions);
    res.setHeader("Cache-Control", "no-store");
    res.status(204).end();
  });
  api.get("/capabilities", (req, res) => {
    res.json({
      protocolVersion: 3,
      voiceProtocolVersion: 4,
      realtime: deps.realtimeAvailable?.() ? ["socket.io"] : [],
      voice: deps.voiceAvailable?.() ? ["MESH"] : [],
    });
  });
  if (deps.rooms) {
    const rooms = deps.rooms;
    const uid = (req: Request) => (req as AuthenticatedRequest).session.uid;
    const key = (req: Request) => req.get("Idempotency-Key");
    const param = (req: Request, name: string) => String(req.params[name]);
    api.post("/rooms", async (req, res) => {
      const result = await rooms.create(uid(req), req.body?.title, key(req));
      res.status(result.status).json(result.body);
    });
    api.get("/rooms/:code/preview", async (req, res) => {
      res.json(await rooms.preview(uid(req), param(req, "code")));
    });
    api.post("/rooms/:code/join", async (req, res) => {
      const result = await rooms.join(uid(req), param(req, "code"), key(req));
      res.status(result.status).json(result.body);
    });
    api.get("/rooms/:roomId/snapshot", async (req, res) => {
      res.json(await rooms.snapshot(uid(req), param(req, "roomId")));
    });
    api.post("/rooms/:roomId/leave", async (req, res) => {
      res.json(await rooms.leave(uid(req), param(req, "roomId")));
    });
    for (const action of ["start", "abort"] as const) {
      api.post(`/rooms/:roomId/stream/${action}`, async (req, res) => {
        const result = await rooms.stream(
          uid(req),
          param(req, "roomId"),
          action,
          req.body ?? {},
          key(req),
        );
        res.status(result.status).json(result.body);
      });
    }
    api.post(
      "/rooms/:roomId/realtime-ticket",
      limit("ticket", 60),
      async (req, res) => {
        if (!deps.issueRoomTicket) throw new ApiError(503, "UNAVAILABLE");
        res
          .status(201)
          .json(
            await deps.issueRoomTicket(
              uid(req),
              (req as AuthenticatedRequest).session,
              param(req, "roomId"),
            ),
          );
      },
    );
    api.post("/rooms/:roomId/voice/config", limit("voice-config", 30), async (req, res) => {
      if (!deps.issueVoiceConfig || !deps.voiceAvailable?.())
        throw new ApiError(503, "VOICE_DISABLED");
      const voiceSessionId = req.body?.voiceSessionId;
      const operation = req.body?.operation ?? (voiceSessionId ? "resume" : "join");
      if (!["join", "resume", "refresh"].includes(operation) || operation !== "join" && !voiceSessionId) throw new ApiError(400, "INVALID_JSON");
      if (voiceSessionId !== undefined && (typeof voiceSessionId !== "string" || !/^[0-9a-f-]{36}$/i.test(voiceSessionId)))
        throw new ApiError(400, "INVALID_JSON");
      res.json(await deps.issueVoiceConfig(
        (req as AuthenticatedRequest).session.uid,
        (req as AuthenticatedRequest).session,
        param(req, "roomId"),
        voiceSessionId,
        operation,
      ));
    });
  }
  // Clients never receive unavailable capabilities.
  app.use("/v1", api);
  app.use((req, res, next) => next(new ApiError(404, "NOT_FOUND")));
  const errors: ErrorRequestHandler = (error, req, res, next) => {
    logHandledException('http.error', error);
    if (res.headersSent) return next(error);
    if (!(error instanceof ApiError) && !error?.type)
      console.error(JSON.stringify({ event: "internal_error" }));
    const code =
      error?.type === "entity.parse.failed"
        ? new ApiError(400, "INVALID_JSON")
        : error?.type === "entity.too.large"
          ? new ApiError(413, "PAYLOAD_TOO_LARGE")
          : error instanceof ApiError
            ? error
            : new ApiError(500, "INTERNAL_ERROR");
    if (code.status >= 500) captureServerError(error, code.status, req.method, req.route?.path);
    res.status(code.status).json({ code: code.code, message: code.message, ...(code.code === "ALREADY_IN_ROOM" && code.activePartyCode ? { activePartyCode: code.activePartyCode } : {}) });
  };
  app.use(errors);
  return {
    app,
    api,
    authenticate,
    limit,
    drain: () => {
      draining = true;
    },
    close: () => clearInterval(timer),
  };
}
