'use client';
'use strict';

var React = require('react');
var useIsomorphicEffect = require('../use-isomorphic-effect/use-isomorphic-effect.cjs');

function useEyeDropper() {
  const [supported, setSupported] = React.useState(false);
  useIsomorphicEffect.useIsomorphicEffect(() => {
    setSupported(typeof window !== "undefined" && !isOpera() && "EyeDropper" in window);
  }, []);
  const open = React.useCallback(
    (options = {}) => {
      if (supported) {
        const eyeDropper = new window.EyeDropper();
        return eyeDropper.open(options);
      }
      return Promise.resolve(void 0);
    },
    [supported]
  );
  return { supported, open };
}
function isOpera() {
  return navigator.userAgent.includes("OPR");
}

exports.useEyeDropper = useEyeDropper;
//# sourceMappingURL=use-eye-dropper.cjs.map
