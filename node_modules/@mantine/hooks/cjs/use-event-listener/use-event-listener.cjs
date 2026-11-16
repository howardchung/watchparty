'use client';
'use strict';

var React = require('react');

function useEventListener(type, listener, options) {
  const previousListener = React.useRef(null);
  const previousNode = React.useRef(null);
  const callbackRef = React.useCallback(
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
  React.useEffect(
    () => () => {
      if (previousNode.current && previousListener.current) {
        previousNode.current.removeEventListener(type, previousListener.current, options);
      }
    },
    [type, options]
  );
  return callbackRef;
}

exports.useEventListener = useEventListener;
//# sourceMappingURL=use-event-listener.cjs.map
