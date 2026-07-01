'use client';
import { useRef, useMemo, useEffect } from 'react';
import { useCallbackRef } from '../utils/use-callback-ref/use-callback-ref.mjs';

function useDebouncedCallback(callback, options) {
  const { delay, flushOnUnmount, leading } = typeof options === "number" ? { delay: options, flushOnUnmount: false, leading: false } : options;
  const handleCallback = useCallbackRef(callback);
  const debounceTimerRef = useRef(0);
  const lastCallback = useMemo(() => {
    const currentCallback = Object.assign(
      (...args) => {
        window.clearTimeout(debounceTimerRef.current);
        const isFirstCall = currentCallback._isFirstCall;
        currentCallback._isFirstCall = false;
        function clearTimeoutAndLeadingRef() {
          window.clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = 0;
          currentCallback._isFirstCall = true;
        }
        if (leading && isFirstCall) {
          handleCallback(...args);
          const resetLeadingState = () => {
            clearTimeoutAndLeadingRef();
          };
          const flush2 = () => {
            if (debounceTimerRef.current !== 0) {
              clearTimeoutAndLeadingRef();
              handleCallback(...args);
            }
          };
          const cancel2 = () => {
            clearTimeoutAndLeadingRef();
          };
          currentCallback.flush = flush2;
          currentCallback.cancel = cancel2;
          debounceTimerRef.current = window.setTimeout(resetLeadingState, delay);
          return;
        }
        if (leading && !isFirstCall) {
          const flush2 = () => {
            if (debounceTimerRef.current !== 0) {
              clearTimeoutAndLeadingRef();
              handleCallback(...args);
            }
          };
          const cancel2 = () => {
            clearTimeoutAndLeadingRef();
          };
          currentCallback.flush = flush2;
          currentCallback.cancel = cancel2;
          const resetLeadingState = () => {
            clearTimeoutAndLeadingRef();
          };
          debounceTimerRef.current = window.setTimeout(resetLeadingState, delay);
          return;
        }
        const flush = () => {
          if (debounceTimerRef.current !== 0) {
            clearTimeoutAndLeadingRef();
            handleCallback(...args);
          }
        };
        const cancel = () => {
          clearTimeoutAndLeadingRef();
        };
        currentCallback.flush = flush;
        currentCallback.cancel = cancel;
        debounceTimerRef.current = window.setTimeout(flush, delay);
      },
      {
        flush: () => {
        },
        cancel: () => {
        },
        _isFirstCall: true
      }
    );
    return currentCallback;
  }, [handleCallback, delay, leading]);
  useEffect(
    () => () => {
      if (flushOnUnmount) {
        lastCallback.flush();
      } else {
        lastCallback.cancel();
      }
    },
    [lastCallback, flushOnUnmount]
  );
  return lastCallback;
}

export { useDebouncedCallback };
//# sourceMappingURL=use-debounced-callback.mjs.map
