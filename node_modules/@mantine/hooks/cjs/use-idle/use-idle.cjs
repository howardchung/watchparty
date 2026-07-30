'use client';
'use strict';

var React = require('react');

const DEFAULT_OPTIONS = {
  events: ["keydown", "mousemove", "touchmove", "click", "scroll", "wheel"],
  initialState: true
};
function useIdle(timeout, options) {
  const { events, initialState } = { ...DEFAULT_OPTIONS, ...options };
  const [idle, setIdle] = React.useState(initialState);
  const timer = React.useRef(-1);
  React.useEffect(() => {
    const handleEvents = () => {
      setIdle(false);
      if (timer.current) {
        window.clearTimeout(timer.current);
      }
      timer.current = window.setTimeout(() => {
        setIdle(true);
      }, timeout);
    };
    events.forEach((event) => document.addEventListener(event, handleEvents));
    timer.current = window.setTimeout(() => {
      setIdle(true);
    }, timeout);
    return () => {
      events.forEach((event) => document.removeEventListener(event, handleEvents));
      window.clearTimeout(timer.current);
      timer.current = -1;
    };
  }, [timeout]);
  return idle;
}

exports.useIdle = useIdle;
//# sourceMappingURL=use-idle.cjs.map
