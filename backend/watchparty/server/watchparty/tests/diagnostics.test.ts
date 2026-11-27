import { test } from 'node:test';
import assert from 'node:assert/strict';
import { logHandledException } from '../diagnostics.ts';

test('handled diagnostics retain error details and causes while redacting secrets and source URLs', () => {
  const lines: string[] = [];
  const warn = console.warn;
  console.warn = (line: string) => { lines.push(line); };
  try {
    const error = new TypeError('Peer setup failed ticket=private-ticket', { cause: new Error('Bad config password=private-password') });
    error.stack = `${error.name}: ${error.message}\n at createPeer (https://private-origin/assets/voice.ts:375:16)`;
    logHandledException('voice.setup', error);
    const saved = lines.join('\n');
    for (const expected of ['exception.handled', 'voice.setup', 'TypeError', 'voice.ts:375:16']) assert.ok(saved.includes(expected), expected);
    for (const secret of ['Peer setup failed','Bad config','private-ticket', 'private-password', 'private-origin']) assert.ok(!saved.includes(secret), secret);
  } finally { console.warn = warn; }
});

test('handled diagnostics tolerate cycles and do not serialize arbitrary rejection payloads', () => {
  const lines: string[] = [];
  const warn = console.warn;
  console.warn = (line: string) => { lines.push(line); };
  try {
    const error = new Error('Loop'); error.cause = error;
    logHandledException('test.cycle', error);
    logHandledException('test.object', { code: 'INVALID_JSON', message: 'Bad input', body: 'private-body' });
    logHandledException('test.string', 'Failed token=private-token');
    assert.match(lines[0], /limited/);
    assert.match(lines[1], /INVALID_JSON/);
    assert.doesNotMatch(lines.join('\n'), /private-body|private-token/);
    console.warn = () => { throw new Error('Broken sink'); };
    assert.doesNotThrow(() => logHandledException('test.sink', error));
  } finally { console.warn = warn; }
});
