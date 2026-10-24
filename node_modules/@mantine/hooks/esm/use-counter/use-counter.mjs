'use client';
import { useState, useCallback } from 'react';
import { clamp } from '../utils/clamp/clamp.mjs';

const DEFAULT_OPTIONS = {
  min: -Infinity,
  max: Infinity
};
function useCounter(initialValue = 0, options) {
  const { min, max } = { ...DEFAULT_OPTIONS, ...options };
  const [count, setCount] = useState(clamp(initialValue, min, max));
  const increment = useCallback(
    () => setCount((current) => clamp(current + 1, min, max)),
    [min, max]
  );
  const decrement = useCallback(
    () => setCount((current) => clamp(current - 1, min, max)),
    [min, max]
  );
  const set = useCallback((value) => setCount(clamp(value, min, max)), [min, max]);
  const reset = useCallback(
    () => setCount(clamp(initialValue, min, max)),
    [initialValue, min, max]
  );
  return [count, { increment, decrement, set, reset }];
}

export { useCounter };
//# sourceMappingURL=use-counter.mjs.map
