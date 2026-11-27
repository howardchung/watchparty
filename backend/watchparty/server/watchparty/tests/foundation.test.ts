import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { config } from "../config.ts";
import { profile } from "../db.ts";
import { authError } from "../auth.ts";
import { ApiError } from "../errors.ts";
import { createApplication } from "../app.ts";
const configuration = config({
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://localhost/test",
});
test("test and production environments use HTTPS origins without permitting development cookies", () => {
  for (const environment of ["test", "production"]) {
    const value = config({ NODE_ENV: environment, DATABASE_URL: "postgresql://localhost/db" });
    assert.deepEqual(value.allowedOrigins, ["https://watchparty.top"]);
    assert.throws(() => config({ NODE_ENV: environment, DATABASE_URL: "postgresql://localhost/db", AUTH_ALLOWED_ORIGINS: "http://localhost:5173" }));
  }
  assert.doesNotThrow(() => config({ NODE_ENV: "development", DATABASE_URL: "postgresql://localhost/db", AUTH_ALLOWED_ORIGINS: "http://localhost:5173" }));
});
test("configuration rejects unsafe origins and malformed TURN settings", () => {
  assert.doesNotThrow(() => config({ NODE_ENV: "production", DATABASE_URL: "postgresql://localhost/db" }));
  assert.throws(() => config({ NODE_ENV: "production", DATABASE_URL: "postgresql://localhost/db", AUTH_ALLOWED_ORIGINS: "http://localhost:5173" }));
  assert.throws(() => config({ DATABASE_URL: "postgresql://localhost/db", AUTH_ALLOWED_ORIGINS: "https://example.org/path" }));
  assert.throws(() => config({ DATABASE_URL: "postgresql://localhost/db", TURN_SHARED_SECRET: "too-short" }));
  assert.throws(() => config({ DATABASE_URL: "postgresql://localhost/db", TURN_URLS: "https://example.invalid" }));
});
test("profile derives avatar names, ignores custom input, and rejects unknown avatars", () => {
  assert.deepEqual(profile({name:"Custom name",avatar:"MINT",language:"fa"}), {name:"قورباغهٔ جادوگر",avatar:"mint",language:"fa"});
  assert.equal(profile({avatar:"berry",language:"en"}).name, "Captain Octopus");
  assert.equal(profile({name:"",avatar:"comet",language:"en"}).name, "Ice Queen");
  assert.throws(() => profile({avatar:"unknown",language:"en"}));
  assert.throws(() => profile({avatar:"comet",language:""}));
});
test("auth preserves rejected credentials and hides database failures", () => {
  assert.equal(authError(new ApiError(401, "SESSION_REVOKED")).code, "SESSION_REVOKED");
  assert.equal(authError(new Error("private database detail")).code, "AUTH_UNAVAILABLE");
});
test("HTTP mandatory auth, fail-closed outage, readiness, bootstrap and disabled stock routes", async () => {
  let ready = true;
  let revoked = false;
  const identities = new Map();
  const value = {
    id: "internal-uuid",
    name: "A",
    avatar: "comet",
    language: "en",
    createdAt: "now",
    updatedAt: "now",
  };
  const app = createApplication(configuration, {
    auth: {
      async verify(token) {
        if (token === "unexpected")
          throw new Error("private detail must not be returned");
        if (token === "outage") throw new ApiError(503, "AUTH_UNAVAILABLE");
        if (token !== "valid") throw new ApiError(401, "INVALID_TOKEN");
        return {
          uid: "internal-uuid",
          token,
          expiresAt: Date.now() + 60000,
          authTime: Date.now(),
        };
      },
      async revoke() {
        revoked = true;
      },
    },
    identities: {
      async bootstrap(uid, profile) {
        if (!identities.has(uid)) identities.set(uid, { ...value, ...profile });
        return identities.get(uid);
      },
      async get(uid) {
        return identities.get(uid);
      },
      async update(uid, profile) {
        return { ...identities.get(uid), ...profile };
      },
    },
    databaseReady: async () => ready,
  });
  const server = createServer(app.app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  const request = (path: string, token = "valid", body?: unknown) =>
    fetch(base + path, {
      method: body !== undefined ? "POST" : "GET",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  try {
    assert.equal((await fetch(base + "/v1/capabilities")).status, 401);
    assert.equal((await request("/v1/capabilities", "forged")).status, 401);
    assert.equal((await request("/v1/capabilities", "outage")).status, 503);
    const unexpected = await request("/v1/capabilities", "unexpected");
    assert.equal(unexpected.status, 500);
    assert.deepEqual(await unexpected.json(), {
      code: "INTERNAL_ERROR",
      message: "INTERNAL_ERROR",
    });
    assert.deepEqual(await (await request("/v1/capabilities")).json(), {
      protocolVersion: 3,
      voiceProtocolVersion: 4,
      realtime: [],
      voice: [],
    });
    assert.equal((await request("/createRoom", "valid", {})).status, 404);
    assert.equal((await request("/proxy")).status, 404);
    const first = await (
      await request("/v1/identities/bootstrap", "valid", {
        name: "Alice",
        avatar: "comet",
        language: "en",
      })
    ).json();
    const again = await (
      await request("/v1/identities/bootstrap", "valid", {
        name: "Bob",
        avatar: "mint",
        language: "fa",
      })
    ).json();
    assert.deepEqual(first, again);
    assert.equal((await fetch(base + "/readyz")).status, 200);
    ready = false;
    assert.equal((await fetch(base + "/readyz")).status, 503);
    assert.equal(
      (await request("/v1/guest-sessions/revoke", "valid", {})).status,
      204,
    );
    assert.ok(revoked);
    app.drain();
    assert.equal((await request("/v1/capabilities")).status, 503);
  } finally {
    app.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
