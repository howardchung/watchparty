'use client';
import { useRef, useState, useEffect, useCallback } from 'react';
import { clamp } from '../utils/clamp/clamp.mjs';

function clampUseMovePosition(position) {
  return {
    x: clamp(position.x, 0, 1),
    y: clamp(position.y, 0, 1)
  };
}
function useMove(onChange, handlers, dir = "ltr") {
  const mounted = useRef(false);
  const isSliding = useRef(false);
  const frame = useRef(0);
  const [active, setActive] = useState(false);
  const cleanupRef = useRef(null);
  useEffect(() => {
    mounted.current = true;
  }, []);
  const refCallback = useCallback(
    (node) => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      if (!node) {
        return;
      }
      const onScrub = ({ x, y }) => {
        cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(() => {
          if (mounted.current && node) {
            node.style.userSelect = "none";
            const rect = node.getBoundingClientRect();
            if (rect.width && rect.height) {
              const _x = clamp((x - rect.left) / rect.width, 0, 1);
              onChange({
                x: dir === "ltr" ? _x : 1 - _x,
                y: clamp((y - rect.top) / rect.height, 0, 1)
              });
            }
          }
        });
      };
      const bindEvents = () => {
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", stopScrubbing);
        document.addEventListener("touchmove", onTouchMove, { passive: false });
        document.addEventListener("touchend", stopScrubbing);
      };
      const unbindEvents = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", stopScrubbing);
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", stopScrubbing);
      };
      const startScrubbing = () => {
        if (!isSliding.current && mounted.current) {
          isSliding.current = true;
          typeof handlers?.onScrubStart === "function" && handlers.onScrubStart();
          setActive(true);
          bindEvents();
        }
      };
      const stopScrubbing = () => {
        if (isSliding.current && mounted.current) {
          isSliding.current = false;
          setActive(false);
          unbindEvents();
          setTimeout(() => {
            typeof handlers?.onScrubEnd === "function" && handlers.onScrubEnd();
          }, 0);
        }
      };
      const onMouseDown = (event) => {
        startScrubbing();
        event.preventDefault();
        onMouseMove(event);
      };
      const onMouseMove = (event) => onScrub({ x: event.clientX, y: event.clientY });
      const onTouchStart = (event) => {
        if (event.cancelable) {
          event.preventDefault();
        }
        startScrubbing();
        onTouchMove(event);
      };
      const onTouchMove = (event) => {
        if (event.cancelable) {
          event.preventDefault();
        }
        onScrub({ x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY });
      };
      node.addEventListener("mousedown", onMouseDown);
      node.addEventListener("touchstart", onTouchStart, { passive: false });
      cleanupRef.current = () => {
        node.removeEventListener("mousedown", onMouseDown);
        node.removeEventListener("touchstart", onTouchStart);
      };
    },
    [dir, onChange]
  );
  return { ref: refCallback, active };
}

export { clampUseMovePosition, useMove };
//# sourceMappingURL=use-move.mjs.map
