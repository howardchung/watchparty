'use client';
'use strict';

var jsxRuntime = require('react/jsx-runtime');
var React = require('react');
var hooks = require('@mantine/hooks');

const DirectionContext = React.createContext({
  dir: "ltr",
  toggleDirection: () => {
  },
  setDirection: () => {
  }
});
function useDirection() {
  return React.useContext(DirectionContext);
}
function DirectionProvider({
  children,
  initialDirection = "ltr",
  detectDirection = true
}) {
  const [dir, setDir] = React.useState(initialDirection);
  const setDirection = React.useCallback((direction) => {
    setDir(direction);
    if (document.documentElement.getAttribute("dir") !== direction) {
      document.documentElement.setAttribute("dir", direction);
    }
  }, []);
  const toggleDirection = () => setDirection(dir === "ltr" ? "rtl" : "ltr");
  hooks.useIsomorphicEffect(() => {
    if (detectDirection) {
      const direction = document.documentElement.getAttribute("dir");
      if (direction === "rtl" || direction === "ltr") {
        setDir(direction);
      }
    }
  }, []);
  const mutationCallback = React.useCallback(() => {
    if (typeof document === "undefined") {
      return;
    }
    const direction = document.documentElement.getAttribute("dir");
    if (direction === "rtl" || direction === "ltr") {
      setDir((prev) => prev !== direction ? direction : prev);
    }
  }, []);
  hooks.useMutationObserver(
    mutationCallback,
    detectDirection ? { attributes: true, attributeFilter: ["dir"] } : {},
    typeof document !== "undefined" && detectDirection ? document.documentElement : null
  );
  return /* @__PURE__ */ jsxRuntime.jsx(DirectionContext.Provider, { value: { dir, toggleDirection, setDirection }, children });
}

exports.DirectionContext = DirectionContext;
exports.DirectionProvider = DirectionProvider;
exports.useDirection = useDirection;
//# sourceMappingURL=DirectionProvider.cjs.map
