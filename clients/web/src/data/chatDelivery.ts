import { logHandledException } from './sessionLog';
import { ApiError } from './errors';

export const CHAT_SEND_DEADLINE_MS = 30_000;

/** One deliberate send/retry. The caller keeps its message ID and text unchanged. */
export async function deliverChat<T>(send: () => Promise<T>, ready: () => boolean, signal: AbortSignal): Promise<T> {
  const deadline = Date.now() + CHAT_SEND_DEADLINE_MS;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let wake: (() => void) | undefined;
  const stopped = new Promise<never>((_, reject) => {
    wake = () => reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
    signal.addEventListener('abort', wake, { once: true });
    timer = setTimeout(() => reject(new ApiError('CHAT_SEND_TIMEOUT')), CHAT_SEND_DEADLINE_MS);
  });
  const pause = (ms: number) => new Promise<void>(resolve => {
    const finish = () => { clearTimeout(delay); signal.removeEventListener('abort', finish); resolve(); };
    const delay = setTimeout(finish, ms);
    signal.addEventListener('abort', finish, { once: true });
  });
  const attempt = async () => {
    while (!signal.aborted && Date.now() < deadline) {
      if (!ready()) { await pause(100); continue; }
      try { return await send(); }
      catch (error) {
        logHandledException('chat.delivery', error);
        if (!(error instanceof ApiError) || error.code !== 'NETWORK') throw error;
        await pause(1_000);
      }
    }
    throw new ApiError('CHAT_SEND_TIMEOUT');
  };
  try {
    if (signal.aborted) throw signal.reason;
    return await Promise.race([attempt(), stopped]);
  } finally {
    clearTimeout(timer);
    if (wake) signal.removeEventListener('abort', wake);
  }
}
