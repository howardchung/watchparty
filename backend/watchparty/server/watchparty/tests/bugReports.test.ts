import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reportPayload } from '../bugReports.ts';
const valid = {reportId:'12345678-1234-1234-1234-123456789012', description:' Video freezes ', clientInfo:{platform:'Android', model:'Pixel'}, sessionStartedAt:'2026-11-11T12:00:00Z', log:'Started\nVideo failed'};
test('report validation preserves Unicode descriptions, metadata and complete logs', () => {
 const report = reportPayload(valid);
 assert.equal(report.description, 'Video freezes');
 assert.equal(report.log, valid.log);
 assert.deepEqual(report.clientInfo, {model:'Pixel',platform:'Android'});
 assert.doesNotThrow(() => reportPayload({...valid,description:'😀'.repeat(8000)}));
});
test('reports reject blank, oversized, malformed and unbounded diagnostic payloads', () => {
 for (const body of [null, {}, {...valid,description:'  '}, {...valid,description:'x'.repeat(8001)}, {...valid,reportId:'not-a-uuid'}, {...valid,clientInfo:[]}, {...valid,clientInfo:{model:{}}}, {...valid,sessionStartedAt:'yesterday'}]) assert.throws(() => reportPayload(body), {code:'INVALID_REPORT'});
 assert.throws(() => reportPayload({...valid,log:'😀'.repeat(2*1024*1024+1)}), {code:'REPORT_TOO_LARGE'});
});
const png = {contentType:'image/png',data:'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jBz0AAAAASUVORK5CYII='};
test('optional screenshots preserve exact bytes and validate count, total size, encoding and image type', () => {
 assert.equal(reportPayload(valid).screenshots, undefined); // Keep hashes of legacy no-image retries stable.
 assert.deepEqual(reportPayload({...valid,screenshots:[png]}).screenshots,[png]);
 for (const screenshots of [null, {}, [null], [{...png,data:'not base64'}], [{...png,contentType:'image/jpeg'}], [{...png,contentType:'image/svg+xml'}], [{...png,data:''}], [{...png,data:png.data.replace(/=$/,'')}], [{...png,data:'iVBORw0KGgp='}]]) assert.throws(() => reportPayload({...valid,screenshots}), {code:'INVALID_REPORT'});
 assert.throws(() => reportPayload({...valid,screenshots:Array(4).fill(png)}), {code:'REPORT_TOO_LARGE'});
 const large=Buffer.alloc(3*1024*1024); Buffer.from(png.data,'base64').copy(large);
 const image={...png,data:large.toString('base64')};
 assert.throws(() => reportPayload({...valid,screenshots:[image,image]}), {code:'REPORT_TOO_LARGE'});
});
