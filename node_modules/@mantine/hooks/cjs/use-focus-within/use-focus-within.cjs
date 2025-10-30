'use client';
'use strict';

var React = require('react');

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
  const [focused, setFocused] = React.useState(false);
  const focusedRef = React.useRef(false);
  const previousNode = React.useRef(null);
  const _setFocused = React.useCallback((value) => {
    setFocused(value);
    focusedRef.current = value;
  }, []);
  const handleFocusIn = React.useCallback(
    (event) => {
      if (!focusedRef.current) {
        _setFocused(true);
        onFocus?.(event);
      }
    },
    [onFocus]
  );
  const handleFocusOut = React.useCallback(
    (event) => {
      if (focusedRef.current && !containsRelatedTarget(event)) {
        _setFocused(false);
        onBlur?.(event);
      }
    },
    [onBlur]
  );
  const callbackRef = React.useCallback(
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
  React.useEffect(
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

exports.useFocusWithin = useFocusWithin;
//# sourceMappingURL=use-focus-within.cjs.map
