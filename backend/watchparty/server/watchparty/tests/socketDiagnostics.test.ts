import { test } from "node:test";
import assert from "node:assert/strict";
import { safeSocketCloseReason, SocketCloseDiagnostics } from "../socketDiagnostics.ts";

test("socket close labels distinguish heartbeat, transport and namespace shutdown without exposing error text", () => {
  assert.equal(safeSocketCloseReason("ping timeout"), "ping_timeout");
  assert.equal(safeSocketCloseReason("transport close"), "transport_close");
  assert.equal(safeSocketCloseReason("server namespace disconnect"), "server_namespace_disconnect");
  for (const unsafe of ["accessToken=private", "v=0\r\nm=audio", "constructor", "__proto__", {}, null])
    assert.equal(safeSocketCloseReason(unsafe), "other");
});

test("socket diagnostics keep cumulative counters separate by layer and role with fixed log fields", () => {
  const original = console.log;
  const lines: string[] = [];
  console.log = (value: string) => { lines.push(value); };
  try {
    const diagnostics = new SocketCloseDiagnostics();
    diagnostics.record("transport", "shared", "ping timeout");
    diagnostics.record("transport", "shared", "ping timeout");
    diagnostics.record("namespace", "voice", "ping timeout");
    diagnostics.record("namespace", "room", "secret description");
    assert.equal(diagnostics.counts["transport:shared:ping_timeout"], 2);
    assert.equal(diagnostics.counts["namespace:voice:ping_timeout"], 1);
    assert.deepEqual(JSON.parse(lines[3]), { event: "socket_close", layer: "namespace", role: "room", reason: "other", count: 1 });
    assert.equal(lines.join("").includes("secret"), false);
  } finally { console.log = original; }
});
