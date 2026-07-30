'use client';
import { jsx } from 'react/jsx-runtime';
import { createContext, useContext, useState, useCallback } from 'react';
import { useIsomorphicEffect, useMutationObserver } from '@mantine/hooks';

const DirectionContext = createContext({
  dir: "ltr",
  toggleDirection: () => {
  },
  setDirection: () => {
  }
});
function useDirection() {
  return useContext(DirectionContext);
}
function DirectionProvider({
  children,
  initialDirection = "ltr",
  detectDirection = true
}) {
  const [dir, setDir] = useState(initialDirection);
  const setDirection = useCallback((direction) => {
    setDir(direction);
    if (document.documentElement.getAttribute("dir") !== direction) {
      document.documentElement.setAttribute("dir", direction);
    }
  }, []);
  const toggleDirection = () => setDirection(dir === "ltr" ? "rtl" : "ltr");
  useIsomorphicEffect(() => {
    if (detectDirection) {
      const direction = document.documentElement.getAttribute("dir");
      if (direction === "rtl" || direction === "ltr") {
        setDir(direction);
      }
    }
  }, []);
  const mutationCallback = useCallback(() => {
    if (typeof document === "undefined") {
      return;
    }
    const direction = document.documentElement.getAttribute("dir");
    if (direction === "rtl" || direction === "ltr") {
      setDir((prev) => prev !== direction ? direction : prev);
    }
  }, []);
  useMutationObserver(
    mutationCallback,
    detectDirection ? { attributes: true, attributeFilter: ["dir"] } : {},
    typeof document !== "undefined" && detectDirection ? document.documentElement : null
  );
  return /* @__PURE__ */ jsx(DirectionContext.Provider, { value: { dir, toggleDirection, setDirection }, children });
}

export { DirectionContext, DirectionProvider, useDirection };
//# sourceMappingURL=DirectionProvider.mjs.map
