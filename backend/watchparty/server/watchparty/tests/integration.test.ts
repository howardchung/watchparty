import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { config } from "../config.ts";
import { createAuth, tokenHash } from "../auth.ts";
import { pool, migrate, IdentityStore } from "../db.ts";
import { start } from "../main.ts";
import { createApplication } from "../app.ts";
const enabled = process.env.WATCHPARTY_INTEGRATION === "true";
const profile = { name: "Alice", avatar: "comet", language: "en" };
test("PostgreSQL guest sessions: atomic creation, concurrent refresh, expiry, revocation, restart and browser cookie protections", { skip: !enabled, timeout: 30000 }, async () => {
  const configuration = config({ ...process.env, NODE_ENV: "development", AUTH_ALLOWED_ORIGINS: "http://localhost:5173" });
  const db = pool(configuration.databaseUrl);
  await migrate(db);
  const auth = await createAuth(db);
  const store = new IdentityStore(db);
  const app = createApplication(configuration, { auth, identities: store, databaseReady: async () => { await db.query("SELECT 1"); return true; } });
  const server = createServer(app.app);
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  const post = (path: string, body: unknown = {}, headers: Record<string,string> = {}) => fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) });
  const browser = { Origin: "http://localhost:5173", "X-Roomio-Client": "browser" };
  try {
    const occupiedPort = (server.address() as { port: number }).port;
    const taggedUrl = new URL(configuration.databaseUrl);
    taggedUrl.searchParams.set("application_name", "watchparty-failed-start");
    await assert.rejects(start({ ...configuration, port: occupiedPort, databaseUrl: taggedUrl.toString() }), { code: "EADDRINUSE" });
    assert.equal((await db.query("SELECT count(*)::int AS count FROM pg_stat_activity WHERE application_name='watchparty-failed-start'")).rows[0].count, 0);
    const running = await start({ ...configuration, port: 0 });
    assert.equal((await fetch(`http://127.0.0.1:${(running.server!.address() as { port: number }).port}/readyz`)).status, 200);
    await running.stop();
    assert.equal((await post("/v1/guest-sessions", { ...profile, avatar: "unknown" })).status, 400);
    const created = await post("/v1/guest-sessions", profile);
    assert.equal(created.status, 201);
    assert.equal(created.headers.get("cache-control"), "no-store");
    const user = await created.json();
    assert.match(user.identity.id, /^[0-9a-f-]{36}$/);
    assert.equal((await auth.verify(user.accessToken)).uid, user.identity.id);
    const secretRows = await db.query("SELECT refresh_hash FROM guest_sessions WHERE identity_id=$1", [user.identity.id]);
    assert.equal(secretRows.rows[0].refresh_hash, tokenHash(user.refreshToken));
    assert.ok(!JSON.stringify(secretRows.rows).includes(user.refreshToken));
    const bootstrap = await Promise.all(Array.from({ length: 15 }, () => post("/v1/identities/bootstrap", { ...profile, name: "Do not overwrite" }, { Authorization: `Bearer ${user.accessToken}` })));
    for (const response of bootstrap) {
      assert.equal(response.status, 200);
      assert.deepEqual((await response.json()).identity, user.identity);
    }
    const refreshes = await Promise.all(Array.from({ length: 8 }, () => post("/v1/guest-sessions/refresh", { refreshToken: user.refreshToken })));
    for (const response of refreshes) {
      assert.equal(response.status, 200);
      const value = await response.json();
      assert.equal(value.refreshToken, user.refreshToken);
      assert.equal(value.identity.id, user.identity.id);
      assert.equal((await auth.verify(value.accessToken)).uid, user.identity.id);
    }
    // Retrying a response lost in transit uses the same durable refresh secret.
    assert.equal((await post("/v1/guest-sessions/refresh", { refreshToken: user.refreshToken })).status, 200);
    const secondDb = pool(configuration.databaseUrl);
    try { assert.equal((await (await createAuth(secondDb)).verify(user.accessToken)).uid, user.identity.id); }
    finally { await secondDb.end(); }
    await db.query("UPDATE access_credentials SET expires_at=now()-interval '1 second' WHERE token_hash=$1", [tokenHash(user.accessToken)]);
    await assert.rejects(auth.verify(user.accessToken), { code: "SESSION_EXPIRED" });
    await assert.rejects(auth.verify("forged"), { code: "INVALID_TOKEN" });
    const restored = await auth.refresh(user.refreshToken);
    await auth.revoke(user.identity.id);
    await assert.rejects(auth.verify(restored.accessToken), { code: "SESSION_REVOKED" });
    await assert.rejects(auth.refresh(user.refreshToken), { code: "SESSION_REVOKED" });
    const expired = await auth.create(profile);
    await db.query("UPDATE guest_sessions SET refresh_expires_at=now()-interval '1 second' WHERE identity_id=$1", [expired.identity.id]);
    await assert.rejects(auth.refresh(expired.refreshToken), { code: "SESSION_EXPIRED" });
    assert.equal((await post("/v1/guest-sessions", profile, { Origin: "https://evil.example" })).status, 403);
    assert.equal((await post("/v1/guest-sessions", profile, { Origin: browser.Origin })).status, 403);
    assert.equal((await post("/v1/guest-sessions", profile, { "X-Roomio-Client": "browser" })).status, 403);
    const browserCreate = await post("/v1/guest-sessions", profile, browser);
    assert.equal(browserCreate.status, 201);
    const cookie = browserCreate.headers.get("set-cookie")!;
    assert.match(cookie, /HttpOnly/); assert.match(cookie, /SameSite=Strict/); assert.match(cookie, /Path=\//);
    const browserUser = await browserCreate.json();
    assert.equal(browserUser.refreshToken, undefined);
    const cookieHeader = cookie.split(";")[0];
    assert.equal((await post("/v1/guest-sessions", profile, { ...browser, Cookie: cookieHeader })).status, 409);
    const refreshedBrowser = await post("/v1/guest-sessions/refresh", {}, { ...browser, Cookie: cookieHeader });
    assert.equal(refreshedBrowser.status, 200);
    assert.equal((await refreshedBrowser.json()).identity.id, browserUser.identity.id);
    assert.equal((await post("/v1/guest-sessions/refresh", { refreshToken: user.refreshToken }, browser)).status, 401);
    assert.equal((await post("/v1/guest-sessions/reset", {}, { ...browser, Cookie: cookieHeader })).status, 204);
    await assert.rejects(auth.verify(browserUser.accessToken), { code: "SESSION_REVOKED" });
    assert.equal((await post("/v1/guest-sessions/reset", {}, { ...browser, Cookie: "roomio-refresh=malformed" })).status, 204);
    const unavailable = pool(configuration.databaseUrl); await unavailable.end();
    await assert.rejects((await createAuth(unavailable)).verify(restored.accessToken), { code: "AUTH_UNAVAILABLE" });
  } finally {
    app.close();
    await new Promise<void>(resolve => server.close(() => resolve()));
    await auth.close(); await db.end();
  }
});
