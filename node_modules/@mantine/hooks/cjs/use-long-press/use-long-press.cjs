'use client';
'use strict';

var React = require('react');

function useLongPress(onLongPress, options = {}) {
  const { threshold = 400, onStart, onFinish, onCancel } = options;
  const isLongPressActive = React.useRef(false);
  const isPressed = React.useRef(false);
  const timeout = React.useRef(-1);
  React.useEffect(() => () => window.clearTimeout(timeout.current), []);
  return React.useMemo(() => {
    if (typeof onLongPress !== "function") {
      return {};
    }
    const start = (event) => {
      if (!isMouseEvent(event) && !isTouchEvent(event)) {
        return;
      }
      if (onStart) {
        onStart(event);
      }
      isPressed.current = true;
      timeout.current = window.setTimeout(() => {
        onLongPress(event);
        isLongPressActive.current = true;
      }, threshold);
    };
    const cancel = (event) => {
      if (!isMouseEvent(event) && !isTouchEvent(event)) {
        return;
      }
      if (isLongPressActive.current) {
        if (onFinish) {
          onFinish(event);
        }
      } else if (isPressed.current) {
        if (onCancel) {
          onCancel(event);
        }
      }
      isLongPressActive.current = false;
      isPressed.current = false;
      if (timeout.current) {
        window.clearTimeout(timeout.current);
      }
    };
    return {
      onMouseDown: start,
      onMouseUp: cancel,
      onMouseLeave: cancel,
      onTouchStart: start,
      onTouchEnd: cancel
    };
  }, [onLongPress, threshold, onCancel, onFinish, onStart]);
}
function isTouchEvent(event) {
  return window.TouchEvent ? event.nativeEvent instanceof TouchEvent : "touches" in event.nativeEvent;
}
function isMouseEvent(event) {
  return event.nativeEvent instanceof MouseEvent;
}

exports.useLongPress = useLongPress;
//# sourceMappingURL=use-long-press.cjs.map
