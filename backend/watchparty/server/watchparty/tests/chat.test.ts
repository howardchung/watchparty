import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { chatInput, chatCursor } from '../chat.ts';
test('chat normalizes plain text and shares UTF-16 and control-character limits', () => {
  const messageId = randomUUID();
  assert.equal(chatInput({ messageId, text: '  سلام 🍿\r\nHi  ' }).text, 'سلام 🍿\nHi');
  assert.equal(chatInput({ messageId, text: '🍿'.repeat(250) }).text.length, 500);
  for (const text of ['', ' \n\t ', '🍿'.repeat(251), 'x'.repeat(501), 'x\0y', 'x\u001by', '\ud800', '\udfff']) assert.throws(() => chatInput({ messageId, text }), { code: 'INVALID_CHAT_MESSAGE' });
  assert.equal(chatInput({ messageId, text: '<img onerror=alert(1)>' }).text, '<img onerror=alert(1)>');
  for (const body of [null, {}, {messageId:'x',text:'hi'}, {messageId,text:23}]) assert.throws(() => chatInput(body), {code:'INVALID_CHAT_MESSAGE'});
});
test('history cursors are positive safe integers and reject arrays and exponent syntax', () => {
  assert.equal(chatCursor(undefined), undefined);
  assert.equal(chatCursor('12'), 12);
  for (const value of ['0','-1','1.5','1e3','9007199254740992',['12'],{}]) assert.throws(() => chatCursor(value), {code:'INVALID_CHAT_CURSOR'});
});
