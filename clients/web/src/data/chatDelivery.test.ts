import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from './errors';
import { CHAT_SEND_DEADLINE_MS, deliverChat } from './chatDelivery';

describe('bounded chat delivery', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  it('waits offline and sends once after recovery', async () => {
    let connected = false;
    const send = vi.fn().mockResolvedValue('accepted');
    const result = deliverChat(send, () => connected, new AbortController().signal);
    await vi.advanceTimersByTimeAsync(5_000);
    expect(send).not.toHaveBeenCalled();
    connected = true;
    await vi.advanceTimersByTimeAsync(100);
    await expect(result).resolves.toBe('accepted');
    expect(send).toHaveBeenCalledTimes(1);
  });
  it('retries network failures with backoff and the original operation', async () => {
    const send = vi.fn().mockRejectedValueOnce(new ApiError('NETWORK')).mockResolvedValue('accepted');
    const result = deliverChat(send, () => true, new AbortController().signal);
    await vi.advanceTimersByTimeAsync(999);
    expect(send).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    await expect(result).resolves.toBe('accepted');
    expect(send).toHaveBeenCalledTimes(2);
  });
  it('expires offline at the original deadline and never sends on later recovery', async () => {
    let connected = false;
    const send = vi.fn();
    const result = deliverChat(send, () => connected, new AbortController().signal);
    const failure = expect(result).rejects.toMatchObject({ code: 'CHAT_SEND_TIMEOUT' });
    await vi.advanceTimersByTimeAsync(CHAT_SEND_DEADLINE_MS);
    await failure;
    connected = true;
    await vi.advanceTimersByTimeAsync(5_000);
    expect(send).not.toHaveBeenCalled();
  });
  it('bounds a hung HTTP request and ignores late completion', async () => {
    let accept!: (value: string) => void;
    const send = vi.fn(() => new Promise<string>(resolve => { accept = resolve; }));
    const result = deliverChat(send, () => true, new AbortController().signal);
    const failure = expect(result).rejects.toMatchObject({ code: 'CHAT_SEND_TIMEOUT' });
    await vi.advanceTimersByTimeAsync(CHAT_SEND_DEADLINE_MS);
    await failure;
    accept('accepted');
    await vi.advanceTimersByTimeAsync(1_000);
    expect(send).toHaveBeenCalledTimes(1);
  });
  it('fails terminal errors immediately', async () => {
    const send = vi.fn().mockRejectedValue(new ApiError('RATE_LIMITED'));
    await expect(deliverChat(send, () => true, new AbortController().signal)).rejects.toMatchObject({ code: 'RATE_LIMITED' });
    expect(send).toHaveBeenCalledTimes(1);
  });
  it('stops waiting when reconciled or disposed', async () => {
    const controller = new AbortController();
    const send = vi.fn();
    const result = deliverChat(send, () => false, controller.signal);
    const failure = expect(result).rejects.toMatchObject({ name: 'AbortError' });
    controller.abort();
    await failure;
    await vi.advanceTimersByTimeAsync(CHAT_SEND_DEADLINE_MS);
    expect(send).not.toHaveBeenCalled();
  });
});
