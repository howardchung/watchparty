'use client';
import { useState, useRef, useCallback, useEffect } from 'react';

function containsRelatedTarget(event) {
  if (event.currentTarget instanceof HTMLElement && event.relatedTarget instanceof HTMLElement) {
    return event.currentTarget.contains(event.relatedTarget);
  }
  return false;
}
function useFocusWithin({
  onBlur,
  onFocus
} = {}) {
  const [focused, setFocused] = useState(false);
  const focusedRef = useRef(false);
  const previousNode = useRef(null);
  const _setFocused = useCallback((value) => {
    setFocused(value);
    focusedRef.current = value;
  }, []);
  const handleFocusIn = useCallback(
    (event) => {
      if (!focusedRef.current) {
        _setFocused(true);
        onFocus?.(event);
      }
    },
    [onFocus]
  );
  const handleFocusOut = useCallback(
    (event) => {
      if (focusedRef.current && !containsRelatedTarget(event)) {
        _setFocused(false);
        onBlur?.(event);
      }
    },
    [onBlur]
  );
  const callbackRef = useCallback(
    (node) => {
      if (!node) {
        return;
      }
      if (previousNode.current) {
        previousNode.current.removeEventListener("focusin", handleFocusIn);
        previousNode.current.removeEventListener("focusout", handleFocusOut);
      }
      node.addEventListener("focusin", handleFocusIn);
      node.addEventListener("focusout", handleFocusOut);
    },
    [handleFocusIn, handleFocusOut]
  );
  useEffect(
    () => () => {
      if (previousNode.current) {
        previousNode.current.removeEventListener("focusin", handleFocusIn);
        previousNode.current.removeEventListener("focusout", handleFocusOut);
      }
    },
    []
  );
  return { ref: callbackRef, focused };
}

export { useFocusWithin };
//# sourceMappingURL=use-focus-within.mjs.map
