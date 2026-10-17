'use client';
import { useState, useRef, useCallback } from 'react';

function useHover() {
  const [hovered, setHovered] = useState(false);
  const previousNode = useRef(null);
  const handleMouseEnter = useCallback(() => {
    setHovered(true);
  }, []);
  const handleMouseLeave = useCallback(() => {
    setHovered(false);
  }, []);
  const ref = useCallback(
    (node) => {
      if (previousNode.current) {
        previousNode.current.removeEventListener("mouseenter", handleMouseEnter);
        previousNode.current.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (node) {
        node.addEventListener("mouseenter", handleMouseEnter);
        node.addEventListener("mouseleave", handleMouseLeave);
      }
      previousNode.current = node;
    },
    [handleMouseEnter, handleMouseLeave]
  );
  return { ref, hovered };
}

export { useHover };
//# sourceMappingURL=use-hover.mjs.map
