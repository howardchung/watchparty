import { logHandledException } from './diagnostics.ts';
export interface Config {
  environment: string;
  host: string;
  port: number;
  databaseUrl: string;
  allowedOrigins: string[];
  trustedProxies: string[];
  turnUrls: string[];
  turnSecret?: string;
  namespacePrefix?: string;
}
export function config(env: NodeJS.ProcessEnv = process.env): Config {
  const environment = env.NODE_ENV ?? "development";
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const allowedOrigins = (env.AUTH_ALLOWED_ORIGINS ?? (environment !== "development" ? "https://watchparty.top" : "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173")).split(",").map(x => x.trim()).filter(Boolean);
  if (!allowedOrigins.length || allowedOrigins.some(value => {
    try { const url = new URL(value); return url.origin !== value || (url.protocol !== "https:" && !(environment === "development" && url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))); } catch (handledError) { logHandledException("config.config.1", handledError);  return true; }
  })) throw new Error("AUTH_ALLOWED_ORIGINS must contain exact HTTPS origins (localhost HTTP is development-only)");
  const port = Number(env.PORT ?? 8080);
  if (!Number.isInteger(port) || port < 0 || port > 65535)
    throw new Error("Invalid PORT");
  const turnUrls = (env.TURN_URLS ?? "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
  if (turnUrls.some((url) =>
    !/^(?:stun|turn|turns):(?:\[[0-9a-f:]+\]|[a-z0-9.-]+)(?::[0-9]{1,5})?(?:\?transport=(?:udp|tcp))?$/i.test(url)))
    throw new Error("TURN_URLS contains an invalid ICE URL");
  const turnSecret = env.TURN_SHARED_SECRET || undefined;
  if (turnSecret && Buffer.byteLength(turnSecret) < 32)
    throw new Error("TURN_SHARED_SECRET must be at least 32 bytes");
  const namespacePrefix = env.SOCKET_NAMESPACE_PREFIX ?? "watchparty";
  if (!/^[a-z0-9-]{1,64}$/.test(namespacePrefix)) throw new Error("Invalid SOCKET_NAMESPACE_PREFIX");
  return {
    namespacePrefix,
    environment,
    allowedOrigins,
    databaseUrl: env.DATABASE_URL,
    host: env.HOST ?? "127.0.0.1",
    port,
    trustedProxies: (env.TRUSTED_PROXIES ?? "").split(",").filter(Boolean),
    turnUrls,
    turnSecret,
  };
}
