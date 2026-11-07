import dns from "node:dns";
import net from "node:net";

/**
 * Helpers for making server-side requests to URLs that users control.
 * Blocks loopback, private, link-local and other non-public addresses.
 */

const blocked = new net.BlockList();
// IPv4
for (const [net_, prefix] of [
  ["0.0.0.0", 8], // "this" network
  ["10.0.0.0", 8],
  ["100.64.0.0", 10], // CGNAT
  ["127.0.0.0", 8],
  ["169.254.0.0", 16], // link-local, cloud metadata
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["224.0.0.0", 4], // multicast
  ["240.0.0.0", 4], // reserved + broadcast
] as const) {
  blocked.addSubnet(net_, prefix, "ipv4");
}
// IPv6
blocked.addAddress("::", "ipv6");
blocked.addAddress("::1", "ipv6");
blocked.addSubnet("fc00::", 7, "ipv6"); // unique local
blocked.addSubnet("fe80::", 10, "ipv6"); // link-local
blocked.addSubnet("ff00::", 8, "ipv6"); // multicast

export function isPrivateIP(ip: string): boolean {
  const family = net.isIP(ip);
  if (family === 4) {
    return blocked.check(ip, "ipv4");
  }
  if (family === 6) {
    const lower = ip.toLowerCase();
    // IPv4-mapped, dotted form (::ffff:127.0.0.1)
    const dotted = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (dotted) {
      return blocked.check(dotted[1], "ipv4");
    }
    // IPv4-mapped, hex form (::ffff:7f00:1)
    const hex = lower.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
    if (hex) {
      const hi = parseInt(hex[1], 16);
      const lo = parseInt(hex[2], 16);
      return blocked.check(
        `${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`,
        "ipv4",
      );
    }
    return blocked.check(ip, "ipv6");
  }
  // Not an IP at all, fail closed
  return true;
}

/**
 * Throws unless the URL is http(s) and doesn't point at a non-public IP literal or localhost.
 */
export function assertPublicUrl(input: string | URL): URL {
  const url = typeof input === "string" ? new URL(input) : input;
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Unsupported protocol");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost")) {
    throw new Error("Blocked host");
  }
  if (net.isIP(host) && isPrivateIP(host)) {
    throw new Error("Blocked address");
  }
  return url;
}

const MAX_CONTENT_LENGTH = 50 * 1024 * 1024;

export async function safeFetch(
  input: string | URL,
  init?: RequestInit,
): Promise<Response> {
  let url = assertPublicUrl(input);
  for (let redirects = 0; redirects <= 3; redirects++) {
    const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
    if (!net.isIP(host)) {
      const addresses = await dns.promises.lookup(host, { all: true });
      const bad = addresses.find((a) => isPrivateIP(a.address));
      if (bad) {
        throw new Error(`Blocked address ${bad.address}`);
      }
    }
    const resp = await fetch(url, {
      ...init,
      redirect: "manual",
      signal: init?.signal ?? AbortSignal.timeout(15000),
    });
    if (
      resp.status >= 300 &&
      resp.status < 400 &&
      resp.headers.get("location")
    ) {
      if (redirects === 3) {
        throw new Error("Too many redirects");
      }
      url = assertPublicUrl(new URL(resp.headers.get("location")!, url));
      continue;
    }
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status}`);
    }
    const contentLength = Number(resp.headers.get("content-length"));
    if (contentLength > MAX_CONTENT_LENGTH) {
      throw new Error("Response too large");
    }
    return resp;
  }
  throw new Error("Too many redirects");
}
