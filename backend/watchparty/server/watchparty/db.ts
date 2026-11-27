import { logHandledException } from './diagnostics.ts';
import { avatarNames, persianAvatarNames } from "./avatarNames.ts";
import { Pool } from "pg";
import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { ApiError } from "./errors.ts";
export interface Profile {
  name: string;
  avatar: string;
  language: string;
}
export interface Identity extends Profile {
  id: string;
  createdAt: string;
  updatedAt: string;
}
export function profile(body: unknown): Profile {
  const data = body as Record<string, unknown> | null;
  if (
    !data ||
    ["avatar", "language"].some((key) => typeof data[key] !== "string")
  )
    throw new ApiError(400, "INVALID_PROFILE");
  const avatar = (data.avatar as string).trim().toLowerCase();
  if (!Object.hasOwn(avatarNames, avatar)) throw new ApiError(400, "INVALID_PROFILE");
  if (data.name !== undefined && typeof data.name !== "string") throw new ApiError(400, "INVALID_PROFILE");
  const language = (data.language as string).trim();
  const names = language === "fa" ? persianAvatarNames : avatarNames;
  const value = {
    name: data.name === undefined ? names[avatar as keyof typeof names] : data.name.trim(),
    avatar,
    language,
  };
  if (
    !value.name ||
    [...value.name].length > 48 ||
    !value.avatar ||
    Buffer.byteLength(value.avatar) > 32 ||
    !value.language ||
    Buffer.byteLength(value.language) > 16
  )
    throw new ApiError(400, "INVALID_PROFILE");
  return value;
}
export function pool(databaseUrl: string): Pool {
  // TLS is controlled by the explicit connection URL; never disable certificate verification.
  return new Pool({
    connectionString: databaseUrl,
    max: 20,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    query_timeout: 10000,
    statement_timeout: 10000,
  });
}
export async function migrate(db: Pool): Promise<void> {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(734782093)");
    // Preserve the migration history of installations using a previous table name.
    const ledger = process.env.WATCHPARTY_MIGRATION_LEDGER ?? "watchparty_migrations";
    if (!/^[a-z][a-z0-9_]{0,47}_migrations$/.test(ledger))
      throw new Error("Invalid migration ledger name");
    if (ledger !== "watchparty_migrations") {
      const existing = await client.query("SELECT to_regclass($1) AS ledger", [ledger]);
      if (!existing.rows[0].ledger) throw new Error("Configured migration ledger is missing");
    }
    await client.query(
      `CREATE TABLE IF NOT EXISTS ${ledger} (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())`,
    );
    const directory = new URL("./migrations/", import.meta.url);
    for (const name of (await readdir(directory))
      .filter((x) => x.endsWith(".sql"))
      .sort()) {
      const sql = await readFile(new URL(name, directory), "utf8");
      const hash = createHash("sha256").update(sql).digest("hex");
      const existing = await client.query(
        `SELECT checksum FROM ${ledger} WHERE name=$1`,
        [name],
      );
      if (existing.rowCount) {
        if (existing.rows[0].checksum !== hash)
          throw new Error(`Migration checksum mismatch: ${name}`);
        continue;
      }
      await client.query(sql);
      await client.query(
        `INSERT INTO ${ledger}(name,checksum) VALUES($1,$2)`,
        [name, hash],
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    logHandledException("db.migrate.1", error);
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
export function identity(row: Record<string, any>): Identity {
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar,
    language: row.language,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}
export interface Identities {
  bootstrap(uid: string, initial: Profile): Promise<Identity>;
  get(uid: string): Promise<Identity>;
  update(uid: string, value: Profile): Promise<Identity>;
}
export class IdentityStore implements Identities {
  readonly db: Pool;
  constructor(db: Pool) {
    this.db = db;
  }
  async bootstrap(uid: string, initial: Profile): Promise<Identity> {
    // Session creation owns identity insertion; bootstrap only restores this identity.
    return this.get(uid);
  }
  async get(uid: string): Promise<Identity> {
    const result = await this.db.query(
      "SELECT * FROM identities WHERE id=$1",
      [uid],
    );
    if (!result.rowCount) throw new ApiError(404, "IDENTITY_NOT_FOUND");
    return identity(result.rows[0]);
  }
  async update(uid: string, value: Profile): Promise<Identity> {
    value = profile(value);
    const result = await this.db.query(
      "UPDATE identities SET name=$2,avatar=$3,language=$4,updated_at=now() WHERE id=$1 RETURNING *",
      [uid, value.name, value.avatar, value.language],
    );
    if (!result.rowCount) throw new ApiError(404, "IDENTITY_NOT_FOUND");
    return identity(result.rows[0]);
  }
}
