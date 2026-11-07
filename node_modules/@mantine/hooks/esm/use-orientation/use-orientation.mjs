'use client';
import { useState } from 'react';
import { useIsomorphicEffect } from '../use-isomorphic-effect/use-isomorphic-effect.mjs';

function getInitialValue(initialValue, getInitialValueInEffect) {
  if (getInitialValueInEffect) {
    return initialValue;
  }
  if (typeof window !== "undefined" && "screen" in window) {
    return {
      angle: window.screen.orientation?.angle ?? initialValue.angle,
      type: window.screen.orientation?.type ?? initialValue.type
    };
  }
  return initialValue;
}
function useOrientation({
  defaultAngle = 0,
  defaultType = "landscape-primary",
  getInitialValueInEffect = true
} = {}) {
  const [orientation, setOrientation] = useState(
    getInitialValue(
      {
        angle: defaultAngle,
        type: defaultType
      },
      getInitialValueInEffect
    )
  );
  const handleOrientationChange = (event) => {
    const target = event.currentTarget;
    setOrientation({ angle: target?.angle || 0, type: target?.type || "landscape-primary" });
  };
  useIsomorphicEffect(() => {
    window.screen.orientation?.addEventListener("change", handleOrientationChange);
    return () => window.screen.orientation?.removeEventListener("change", handleOrientationChange);
  }, []);
  return orientation;
}

export { useOrientation };
//# sourceMappingURL=use-orientation.mjs.map
