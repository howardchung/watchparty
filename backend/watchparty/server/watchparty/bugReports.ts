import { sanitizeReportDescription, safeClientInfo, safeReportLog } from './reportPrivacy.ts';
import { logHandledException } from './diagnostics.ts';
import { createHash } from "node:crypto";
import type { Pool } from "pg";
import { ApiError } from "./errors.ts";
export interface ReportScreenshot { contentType: string; data: string }
export function reportScreenshots(value: unknown): ReportScreenshot[] {
 if (value === undefined) return [];
 if (!Array.isArray(value)) throw new ApiError(400, "INVALID_REPORT");
 if (value.length > 3) throw new ApiError(413, "REPORT_TOO_LARGE");
 let total = 0;
 return value.map(item => {
  if (!item || typeof item !== "object" || typeof item.data !== "string"
   || !["image/png", "image/jpeg", "image/webp"].includes(item.contentType)) throw new ApiError(400, "INVALID_REPORT");
  if (item.data.length > 4 * Math.ceil(5 * 1024 * 1024 / 3)) throw new ApiError(413, "REPORT_TOO_LARGE");
  if (!item.data || item.data.length % 4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(item.data)) throw new ApiError(400, "INVALID_REPORT");
  const bytes = Buffer.from(item.data, "base64");
  total += bytes.length;
  if (total > 5 * 1024 * 1024) throw new ApiError(413, "REPORT_TOO_LARGE");
  const valid = item.contentType === "image/png" ? bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
   : item.contentType === "image/jpeg" ? bytes.length >= 4 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
   : bytes.length >= 12 && bytes.toString("ascii",0,4) === "RIFF" && bytes.toString("ascii",8,12) === "WEBP";
  if (!valid || bytes.toString("base64") !== item.data) throw new ApiError(400, "INVALID_REPORT");
  return {contentType: item.contentType, data: item.data};
 });
}
export function reportPayload(body: unknown) {
 const d = body as Record<string, unknown> | null;
 if (!d || typeof d.reportId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(d.reportId)
 || typeof d.description !== "string" || !d.description.trim() || [...d.description.trim()].length > 8000
 || typeof d.log !== "string" || typeof d.sessionStartedAt !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(d.sessionStartedAt) || !Number.isFinite(Date.parse(d.sessionStartedAt))
 || !d.clientInfo || typeof d.clientInfo !== "object" || Array.isArray(d.clientInfo)) throw new ApiError(400, "INVALID_REPORT");
 if (Buffer.byteLength(d.log) > 8 * 1024 * 1024) throw new ApiError(413, "REPORT_TOO_LARGE");
 const entries = Object.entries(d.clientInfo);
 if (!entries.length || entries.length > 32 || entries.some(([k,v]) => !k || k.length > 64 || typeof v !== "string" || v.length > 2048)) throw new ApiError(400, "INVALID_REPORT");
 const screenshots = reportScreenshots(d.screenshots);
 return { ...(screenshots.length ? {screenshots} : {}), reportId: d.reportId.toLowerCase(), description: d.description.trim(), clientInfo: Object.fromEntries(entries.sort(([a],[b]) => a.localeCompare(b))), sessionStartedAt: new Date(d.sessionStartedAt).toISOString(), log: d.log };
}
export class BugReports {
 private db: Pool;
 constructor(db: Pool) { this.db = db; }
 async purge() { await this.db.query("DELETE FROM bug_reports WHERE created_at < now()-interval '30 days'"); }
 async submit(uid: string, roomId: string | null, body: unknown) {
  const r = reportPayload(body);
  if (roomId !== null && !/^[0-9a-f-]{36}$/i.test(roomId)) throw new ApiError(400, "INVALID_REPORT");
  const hash = createHash("sha256").update(JSON.stringify({roomId,...r})).digest("hex");
  const c = await this.db.connect();
  try {
   await c.query("BEGIN");
   await c.query("SELECT id FROM identities WHERE id=$1 FOR UPDATE", [uid]);
   const existing = await c.query("SELECT identity_id,payload_hash FROM bug_reports WHERE report_id=$1", [r.reportId]);
   if (existing.rowCount) {
    if (existing.rows[0].identity_id !== uid || existing.rows[0].payload_hash !== hash) throw new ApiError(409, "REPORT_CONFLICT");
   } else {
    if (roomId !== null) {
     const member = await c.query("SELECT id FROM memberships WHERE room_id=$1 AND identity_id=$2 AND left_at IS NULL", [roomId,uid]);
     if (!member.rowCount) throw new ApiError(403,"NOT_A_MEMBER");
    }
    const count = await c.query("SELECT count(*)::int AS count FROM bug_reports WHERE identity_id=$1 AND created_at > now()-interval '1 day'", [uid]);
    if (count.rows[0].count >= 10) throw new ApiError(429,"RATE_LIMITED");
    await c.query("INSERT INTO bug_reports(report_id,identity_id,room_id,description,client_info,session_started_at,app_log,payload_hash,screenshots) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)", [r.reportId,uid,roomId,sanitizeReportDescription(r.description),safeClientInfo(r.clientInfo),r.sessionStartedAt,safeReportLog(r.log),hash,JSON.stringify(r.screenshots ?? [])]);
   }
   await c.query("COMMIT"); return {reportId:r.reportId};
  } catch (error) {
    logHandledException("bugReports.submit.1", error);
   await c.query("ROLLBACK");
   if ((error as {code?:string}).code === "23505") throw new ApiError(409,"REPORT_CONFLICT");
   throw error;
  } finally { c.release(); }
 }
}
