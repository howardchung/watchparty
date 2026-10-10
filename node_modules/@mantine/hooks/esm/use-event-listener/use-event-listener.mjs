'use client';
import { useRef, useCallback, useEffect } from 'react';

function useEventListener(type, listener, options) {
  const previousListener = useRef(null);
  const previousNode = useRef(null);
  const callbackRef = useCallback(
    (node) => {
      if (!node) {
        return;
      }
      if (previousNode.current && previousListener.current) {
        previousNode.current.removeEventListener(type, previousListener.current, options);
      }
      node.addEventListener(type, listener, options);
      previousNode.current = node;
      previousListener.current = listener;
    },
    [type, listener, options]
  );
  useEffect(
    () => () => {
      if (previousNode.current && previousListener.current) {
        previousNode.current.removeEventListener(type, previousListener.current, options);
      }
    },
    [type, options]
  );
  return callbackRef;
}

export { useEventListener };
//# sourceMappingURL=use-event-listener.mjs.map
