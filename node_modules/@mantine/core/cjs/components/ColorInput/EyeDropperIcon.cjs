'use client';
'use strict';

var jsxRuntime = require('react/jsx-runtime');

function EyeDropperIcon({ style, ...others }) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      style: {
        width: "var(--ci-eye-dropper-icon-size)",
        height: "var(--ci-eye-dropper-icon-size)",
        ...style
      },
      viewBox: "0 0 24 24",
      strokeWidth: "1.5",
      stroke: "currentColor",
      fill: "none",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      ...others,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("path", { stroke: "none", d: "M0 0h24v24H0z", fill: "none" }),
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" }),
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M12 3l0 4" }),
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M12 21l0 -3" }),
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M3 12l4 0" }),
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M21 12l-3 0" }),
        /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M12 12l0 .01" })
      ]
    }
  );
}

exports.EyeDropperIcon = EyeDropperIcon;
//# sourceMappingURL=EyeDropperIcon.cjs.map
