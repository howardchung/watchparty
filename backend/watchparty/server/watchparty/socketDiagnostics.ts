/** Fixed labels only: never log Socket.IO descriptions or arbitrary error text. */
const reasons: Readonly<Record<string, string>> = {
  "ping timeout": "ping_timeout",
  "transport close": "transport_close",
  "transport error": "transport_error",
  "forced close": "forced_close",
  "server close": "server_close",
  "server shutting down": "server_shutting_down",
  "server namespace disconnect": "server_namespace_disconnect",
  "client namespace disconnect": "client_namespace_disconnect",
  "client disconnect": "client_disconnect",
  "parse error": "parse_error",
  "client error": "client_error",
};

export function safeSocketCloseReason(reason: unknown): string {
  return typeof reason === "string" && Object.hasOwn(reasons, reason) ? reasons[reason] : "other";
}

export class SocketCloseDiagnostics {
  readonly counts: Record<string, number> = {};
  record(layer: "transport" | "namespace", role: "shared" | "room" | "voice", rawReason: unknown) {
    const reason = safeSocketCloseReason(rawReason);
    const key = `${layer}:${role}:${reason}`;
    const count = this.counts[key] = (this.counts[key] ?? 0) + 1;
    console.log(JSON.stringify({ event: "socket_close", layer, role, reason, count }));
  }
}
