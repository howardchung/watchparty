'use client';
'use strict';

var React = require('react');
var clamp = require('../utils/clamp/clamp.cjs');

const DEFAULT_OPTIONS = {
  min: -Infinity,
  max: Infinity
};
function useCounter(initialValue = 0, options) {
  const { min, max } = { ...DEFAULT_OPTIONS, ...options };
  const [count, setCount] = React.useState(clamp.clamp(initialValue, min, max));
  const increment = React.useCallback(
    () => setCount((current) => clamp.clamp(current + 1, min, max)),
    [min, max]
  );
  const decrement = React.useCallback(
    () => setCount((current) => clamp.clamp(current - 1, min, max)),
    [min, max]
  );
  const set = React.useCallback((value) => setCount(clamp.clamp(value, min, max)), [min, max]);
  const reset = React.useCallback(
    () => setCount(clamp.clamp(initialValue, min, max)),
    [initialValue, min, max]
  );
  return [count, { increment, decrement, set, reset }];
}

exports.useCounter = useCounter;
//# sourceMappingURL=use-counter.cjs.map
