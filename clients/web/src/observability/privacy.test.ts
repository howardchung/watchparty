import { describe, expect, it } from 'vitest';
import { diagnosticEvent, logHandledException } from '../data/sessionLog';
import { sanitizeErrorEvent } from './privacy';

describe('error capture privacy', () => {
  const rejection = {
    type: 'UnhandledRejection', value: 'private reason',
    mechanism: { type: 'auto.browser.global_handlers.onunhandledrejection', handled: false },
  };

  it.each([
    ['null', null], ['undefined', undefined], ['string', 'private chat'],
    ['object', { secret: 'private token' }], ['number', 42],
  ])('retains only the %s rejection type', (type, reason) => {
    const event = { type: undefined, exception: { values: [{ ...rejection }] }, contexts: { private: { message: 'private' } } };
    const result = sanitizeErrorEvent(event, { originalException: reason });
    expect(result.contexts).toEqual({ promise_rejection: { reason_type: type } });
    expect(result.exception?.values?.[0]).toEqual({ ...rejection, value: 'UnhandledRejection' });
    expect(JSON.stringify(result)).not.toMatch(/secret|private/);
  });

  it('omits rejection diagnostics for missing hints and other capture mechanisms', () => {
    expect(sanitizeErrorEvent({ type: undefined, contexts: {}, exception: { values: [{ ...rejection }] } }, {}).contexts).toEqual({});
    const exception = { ...rejection, mechanism: { type: 'generic' } };
    expect(sanitizeErrorEvent({ type: undefined, contexts: {}, exception: { values: [exception] } }, { originalException: 'private' }).contexts).toEqual({});
  });
});

describe('automatic errors', () => {
  it('keeps only owned history, reason and application asset coordinates', () => {
    for (let i = 0; i < 15; i++)
      diagnosticEvent('player.seek_requested', { seconds: 123, route: '/private-value' });
    const result = sanitizeErrorEvent({
      type: undefined,
      request: { data: 'private-value' },
      user: { email: 'private-value' },
      tags: { private: 'private-value' },
      breadcrumbs: [{ message: 'private-value' }],
      exception: {
        values: [
          {
            type: 'InvalidStateError',
            value: 'SourceBuffer was removed private-value',
            stacktrace: {
              frames: [
                {
                  filename: '/assets/app-B1234567.js?token=private-value',
                  lineno: 27,
                  vars: { secret: 'private-value' },
                },
                { filename: 'file:///private-value/movie.js', function: 'private-value' },
              ],
            },
          },
        ],
      },
    });
    expect(result.exception?.values?.[0]?.value).toBe('SOURCE_BUFFER_REMOVED');
    expect(result.exception?.values?.[0]?.stacktrace?.frames?.[0]).toMatchObject({
      filename: '/assets/app-B1234567.js',
      lineno: 27,
    });
    expect(result.exception?.values?.[0]?.stacktrace?.frames?.[1]?.filename).toBe('[external]');
    expect(result.breadcrumbs).toHaveLength(12);
    expect(JSON.stringify(result)).not.toMatch(/private-value|seconds/);
  });
  it('attributes a rejection previously seen at an owned recovery boundary', () => {
    const error = new TypeError('private-value');
    logHandledException('voice.connect', error);
    const result = sanitizeErrorEvent(
      {
        type: undefined,
        exception: {
          values: [
            { type: 'TypeError', mechanism: { type: 'auto.browser.global_handlers.onunhandledrejection' } },
          ],
        },
      },
      { originalException: error }
    );
    expect(result.tags).toMatchObject({ operation: 'voice', rejection_kind: 'error' });
  });
});
