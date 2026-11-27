import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Pool } from 'pg';
import { ReportDelivery, feedbackEnvelope } from '../reportDelivery.ts';
import { sanitizeEvent } from '../observability.ts';

const row = {report_id:'12345678-1234-4234-8234-123456789012',description:'پخش قطع شد https://media.example/movie%20one.mkv?token=abc&lang=fa#t=12',
  client_info:{platform:'browser',build:'test',model:'Test device',token:'secret',name:'Private name'},
  app_log:'Started\nAuthorization: Bearer secret\nhttps://private.test/movie.mp4',sentry_attempts:0};
test('manual feedback has a stable ID, UTF8 byte lengths, redacted log and allowlisted context', () => {
  const body = feedbackEnvelope(row,'https://public@example.test/1','test');
  const lines = body.toString().split('\n');
  assert.equal(JSON.parse(lines[0]).event_id,row.report_id.replaceAll('-',''));
  assert.equal(JSON.parse(lines[1]).length,Buffer.byteLength(lines[2]));
  assert.equal(JSON.parse(lines[2]).contexts.feedback.message,row.description);
  assert.deepEqual(JSON.parse(lines[2]).contexts.client,{platform:'browser'});
  const log = body.subarray(body.indexOf(Buffer.from(lines[3]))+Buffer.byteLength(lines[3])+1,-1);
  assert.equal(JSON.parse(lines[3]).length,log.length);
  assert.ok(!body.includes(Buffer.from('secret')));
  assert.ok(!body.includes(Buffer.from('Private name')));
  assert.ok(!body.includes(Buffer.from('private.test')));
});
test('delivery retries rejected/network sends and acknowledges only accepted envelopes', async () => {
  const queries: {sql:string; args?:unknown[]}[] = [];
  const db = {query:async (sql:string,args?:unknown[]) => {
    queries.push({sql,args});return {rows:sql.startsWith('SELECT')?[row]:[]};
  }} as unknown as Pool;
  let accept = false;
  const send = async () => new Response('',{status:accept?200:429});
  const delivery = new ReportDelivery(db,'https://public@example.test/1',send);
  await delivery.deliverDue();
  assert.ok(queries.some(q=>q.sql.includes('sentry_next_attempt_at=') && q.args?.[1]===15));
  assert.ok(!queries.some(q=>q.sql.includes('sentry_delivered_at=now()')));
  queries.length=0;accept=true;
  await delivery.deliverDue();
  assert.ok(queries.some(q=>q.sql.includes('sentry_delivered_at=now()')));
});
test('automatic errors retain stack locations without request bodies, user fields or exception content', () => {
  const event = sanitizeEvent({type:undefined, request:{data:'chat content'},user:{email:'private@test'},extra:{token:'secret'},
    exception:{values:[{type:'TypeError',value:'private movie URL',stacktrace:{frames:[{filename:'app.ts?token=secret',lineno:12,vars:{password:'secret'}}]}}]}});
  assert.equal(event.request,undefined);
  assert.equal(event.exception?.values?.[0]?.value,'TypeError');
  assert.equal(event.exception?.values?.[0]?.stacktrace?.frames?.[0]?.lineno,12);
  assert.ok(!JSON.stringify(event).includes('secret'));
});
test('Sentry quota cooldown pauses the whole queue instead of sending other pending reports', async () => {
  let reads=0; let sends=0;
  const db = {query:async (sql:string) => {
    if (sql.startsWith('SELECT')) { reads++; return {rows:[row,{...row,report_id:'22345678-1234-4234-8234-123456789012'}]}; }
    return {rows:[]};
  }} as unknown as Pool;
  const delivery=new ReportDelivery(db,'https://public@example.test/1',async()=>{
    sends++;return new Response('',{status:429,headers:{'Retry-After':'120'}});
  });
  await delivery.deliverDue();
  await delivery.deliverDue();
  assert.equal(sends,1); assert.equal(reads,1);
});
test('manual screenshot attachments use byte-correct envelope framing and generated filenames', () => {
 const bytes=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jBz0AAAAASUVORK5CYII=','base64');
 const body=feedbackEnvelope({...row,screenshots:[{contentType:'image/png',data:bytes.toString('base64')}]},'https://public@example.test/1','test');
 let offset=body.indexOf(10)+1; const items:{header:Record<string,unknown>;data:Buffer}[]=[];
 while(offset<body.length){
  const end=body.indexOf(10,offset); const header=JSON.parse(body.toString('utf8',offset,end)); offset=end+1;
  const data=body.subarray(offset,offset+header.length); items.push({header,data}); offset+=header.length;
  assert.equal(body[offset++],10);
 }
 assert.equal(items.length,3);
 assert.equal(items[2].header.filename,'screenshot-1.png');
 assert.equal(items[2].header.content_type,'image/png');
 assert.deepEqual(items[2].data,bytes);
 assert.equal(items[2].header.length,bytes.length);
});

test('legacy queued diagnostics and new records use the same closed vocabulary', async () => {
  const {safeReportLog,safeClientInfo} = await import('../reportPrivacy.ts');
  const log = [
    '2026-01-01T00:00:00Z {"event":"http.start","method":"POST","route":"/private-room","header":"private-token"}',
    '{"event":"player.state","state":"paused","positionMs":12345,"file":"private.mkv"}',
    '{"event":"private-name","type":"private-value"}',
    'console: {"text":"private-chat"}'
  ].join('\n');
  const saved = safeReportLog(log);
  assert.equal(safeReportLog(saved), saved);
  assert.match(saved, /http.start/);
  assert.match(saved, /paused/);
  assert.doesNotMatch(saved, /private|12345/);
  assert.deepEqual(safeClientInfo({platform:'Android',model:'private',sdk:'34',osVersion:'14',userAgent:'private'}), {platform:'Android',sdk:'34',osVersion:'14'});
});

test('fatal process output is safe even without a Sentry DSN', async () => {
  const {spawnSync} = await import('node:child_process');
  const entry = new URL('../observability.ts',import.meta.url).href;
  const child = spawnSync(process.execPath,['--input-type=module','-e',
    `import {initializeMonitoring} from ${JSON.stringify(entry)}; initializeMonitoring(); Promise.reject("private-file.mkv");`],
    {env:{...process.env,SENTRY_DSN:''},encoding:'utf8',timeout:15000});
  assert.equal(child.status,1);
  assert.match(child.stderr,/auto.node.onunhandledrejection/);
  assert.doesNotMatch(child.stderr,/private-file/);
});

test('manual descriptions keep the authored narrative and scrub credential headers and private keys', async () => {
  const {sanitizeReportDescription} = await import('../reportPrivacy.ts');
  const redacted = sanitizeReportDescription('Video froze\nCookie: session=private-value; other=private-value\nAuthorization: Basic private-value\napi_key=private-value\npassword=https://private-value.test\n-----BEGIN PRIVATE KEY-----\nprivate-value\n-----END PRIVATE KEY-----');
  assert.match(redacted,/Video froze/);
  assert.doesNotMatch(redacted,/private-value/);
});
