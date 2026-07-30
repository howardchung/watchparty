'use client';
'use strict';

var React = require('react');

const DEFAULT_EVENTS = ["mousedown", "touchstart"];
function useClickOutside(callback, events, nodes) {
  const ref = React.useRef(null);
  const eventsList = events || DEFAULT_EVENTS;
  React.useEffect(() => {
    const listener = (event) => {
      const { target } = event ?? {};
      if (Array.isArray(nodes)) {
        const shouldIgnore = !document.body.contains(target) && target?.tagName !== "HTML";
        const shouldTrigger = nodes.every((node) => !!node && !event.composedPath().includes(node));
        shouldTrigger && !shouldIgnore && callback(event);
      } else if (ref.current && !ref.current.contains(target)) {
        callback(event);
      }
    };
    eventsList.forEach((fn) => document.addEventListener(fn, listener));
    return () => {
      eventsList.forEach((fn) => document.removeEventListener(fn, listener));
    };
  }, [ref, callback, nodes]);
  return ref;
}

exports.useClickOutside = useClickOutside;
//# sourceMappingURL=use-click-outside.cjs.map
