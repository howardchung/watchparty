import { logHandledException } from './diagnostics.ts';
import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { profile as namedProfile, identity, type Identity, type Profile } from "./db.ts";
import { ApiError } from "./errors.ts";

export const ACCESS_TTL_MS = 15 * 60 * 1000;
export const REFRESH_TTL_MS = 180 * 24 * 60 * 60 * 1000;
export interface Session {
  /** Internal product identity UUID, retained under this transport-neutral name. */
  uid: string;
  expiresAt: number;
  authTime: number;
  token: string;
}
export interface IssuedSession {
  identity: Identity;
  accessToken: string;
  accessExpiresAt: string;
  refreshToken: string;
  refreshExpiresAt: string;
}
export interface AuthProvider {
  verify(token: string): Promise<Session>;
  revoke(uid: string): Promise<void>;
  create?(profile: Profile): Promise<IssuedSession>;
  refresh?(token: string): Promise<IssuedSession>;
  reset?(token: string): Promise<string | undefined>;
  close?(): Promise<void>;
}
export function authError(error: unknown): ApiError {
  return error instanceof ApiError ? error : new ApiError(503, "AUTH_UNAVAILABLE");
}
export function tokenHash(token: string): string {
  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token))
    throw new ApiError(401, "INVALID_TOKEN");
  return createHash("sha256").update(token).digest("hex");
}
export class LocalAuthProvider implements AuthProvider {
  readonly db: Pool;
  constructor(db: Pool) { this.db = db; }
  private async transaction<T>(operation: (client: PoolClient) => Promise<T>): Promise<T> {
    let client: PoolClient | undefined;
    try {
      client = await this.db.connect();
      await client.query("BEGIN");
      const result = await operation(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      logHandledException("auth.transaction.1", error);
      try { await client?.query("ROLLBACK"); } catch (handledError) { logHandledException("auth.transaction.2", handledError); }
      throw authError(error);
    } finally { client?.release(); }
  }
  async create(profile: Profile): Promise<IssuedSession> {
    profile = namedProfile(profile);
    return this.transaction(async client => {
      const uid = randomUUID();
      const user = await client.query("INSERT INTO identities(id,name,avatar,language) VALUES($1,$2,$3,$4) RETURNING *", [uid,profile.name,profile.avatar,profile.language]);
      const refreshToken = randomBytes(32).toString("base64url");
      const expires = new Date(Date.now() + REFRESH_TTL_MS);
      const session = await client.query("INSERT INTO guest_sessions(id,identity_id,refresh_hash,refresh_expires_at) VALUES($1,$2,$3,$4) RETURNING *", [randomUUID(),uid,tokenHash(refreshToken),expires]);
      return this.issue(client, user.rows[0], session.rows[0], refreshToken);
    });
  }
  private async issue(client: PoolClient, user: Record<string, any>, session: Record<string, any>, refreshToken: string): Promise<IssuedSession> {
    const accessToken = randomBytes(32).toString("base64url");
    const expires = new Date(Date.now() + ACCESS_TTL_MS);
    await client.query("INSERT INTO access_credentials(token_hash,session_id,expires_at) VALUES($1,$2,$3)", [tokenHash(accessToken),session.id,expires]);
    // Retain unexpired access credentials so concurrent browser tabs remain valid.
    await client.query("DELETE FROM access_credentials WHERE token_hash IN (SELECT token_hash FROM access_credentials WHERE expires_at < now() - interval '1 day' LIMIT 1000)", []);
    return { identity: identity(user), accessToken, accessExpiresAt: expires.toISOString(), refreshToken, refreshExpiresAt: session.refresh_expires_at.toISOString() };
  }
  async refresh(refreshToken: string): Promise<IssuedSession> {
    const hash = tokenHash(refreshToken);
    return this.transaction(async client => {
      const result = await client.query("SELECT * FROM guest_sessions WHERE refresh_hash=$1 FOR UPDATE", [hash]);
      const session = result.rows[0];
      if (!session) throw new ApiError(401, "INVALID_TOKEN");
      if (session.revoked_at) throw new ApiError(401, "SESSION_REVOKED");
      if (session.refresh_expires_at.getTime() <= Date.now()) throw new ApiError(401, "SESSION_EXPIRED");
      const user = await client.query("SELECT * FROM identities WHERE id=$1", [session.identity_id]);
      const expires = new Date(Date.now() + REFRESH_TTL_MS);
      await client.query("UPDATE guest_sessions SET refresh_expires_at=$2 WHERE id=$1", [session.id,expires]);
      session.refresh_expires_at = expires;
      return this.issue(client, user.rows[0], session, refreshToken);
    });
  }
  async verify(token: string): Promise<Session> {
    const hash = tokenHash(token);
    try {
      const result = await this.db.query("SELECT a.expires_at,s.identity_id,s.created_at,s.refresh_expires_at,s.revoked_at FROM access_credentials a JOIN guest_sessions s ON s.id=a.session_id WHERE a.token_hash=$1", [hash]);
      const value = result.rows[0];
      if (!value) throw new ApiError(401, "INVALID_TOKEN");
      if (value.revoked_at) throw new ApiError(401, "SESSION_REVOKED");
      if (value.expires_at.getTime() <= Date.now() || value.refresh_expires_at.getTime() <= Date.now()) throw new ApiError(401, "SESSION_EXPIRED");
      return { uid: value.identity_id, expiresAt: value.expires_at.getTime(), authTime: value.created_at.getTime(), token };
    } catch (error) { logHandledException("auth.verify.3", error);  throw authError(error); }
  }
  async revoke(uid: string): Promise<void> {
    await this.transaction(async client => {
      await client.query("UPDATE guest_sessions SET revoked_at=COALESCE(revoked_at,now()) WHERE identity_id=$1", [uid]);
    });
  }
  async reset(token: string): Promise<string | undefined> {
    let hash: string;
    try { hash = tokenHash(token); } catch (handledError) { logHandledException("auth.reset.4", handledError);  return undefined; }
    return this.transaction(async client => {
      const result = await client.query("SELECT identity_id FROM guest_sessions WHERE refresh_hash=$1", [hash]);
      const uid = result.rows[0]?.identity_id;
      if (uid) await client.query("UPDATE guest_sessions SET revoked_at=COALESCE(revoked_at,now()) WHERE identity_id=$1", [uid]);
      return uid;
    });
  }
  async close() {}
}
export async function createAuth(db: Pool): Promise<LocalAuthProvider> {
  return new LocalAuthProvider(db);
}
