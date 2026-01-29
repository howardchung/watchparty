'use client';
import { useState, useRef, useCallback, useEffect } from 'react';

function useInterval(fn, interval, { autoInvoke = false } = {}) {
  const [active, setActive] = useState(false);
  const intervalRef = useRef(null);
  const fnRef = useRef(null);
  const start = useCallback(() => {
    setActive((old) => {
      if (!old && (!intervalRef.current || intervalRef.current === -1)) {
        intervalRef.current = window.setInterval(fnRef.current, interval);
      }
      return true;
    });
  }, []);
  const stop = useCallback(() => {
    setActive(false);
    window.clearInterval(intervalRef.current || -1);
    intervalRef.current = -1;
  }, []);
  const toggle = useCallback(() => {
    if (active) {
      stop();
    } else {
      start();
    }
  }, [active]);
  useEffect(() => {
    fnRef.current = fn;
    active && start();
    return stop;
  }, [fn, active, interval]);
  useEffect(() => {
    if (autoInvoke) {
      start();
    }
  }, []);
  return { start, stop, toggle, active };
}

export { useInterval };
//# sourceMappingURL=use-interval.mjs.map
