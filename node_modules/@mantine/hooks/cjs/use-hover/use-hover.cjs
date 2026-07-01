'use client';
'use strict';

var React = require('react');

function useHover() {
  const [hovered, setHovered] = React.useState(false);
  const previousNode = React.useRef(null);
  const handleMouseEnter = React.useCallback(() => {
    setHovered(true);
  }, []);
  const handleMouseLeave = React.useCallback(() => {
    setHovered(false);
  }, []);
  const ref = React.useCallback(
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

exports.useHover = useHover;
//# sourceMappingURL=use-hover.cjs.map
