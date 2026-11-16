'use client';
'use strict';

var jsxRuntime = require('react/jsx-runtime');

const clearSectionOffset = {
  xs: 7,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 15
};
function InputClearSection({
  __clearable,
  __clearSection,
  rightSection,
  __defaultRightSection,
  size = "sm"
}) {
  const clearSection = __clearable && __clearSection;
  if (clearSection && (rightSection || __defaultRightSection)) {
    return /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        "data-combined-clear-section": true,
        style: {
          display: "flex",
          gap: 2,
          alignItems: "center",
          paddingInlineEnd: clearSectionOffset[size]
        },
        children: [
          clearSection,
          rightSection || __defaultRightSection
        ]
      }
    );
  }
  return rightSection === null ? null : rightSection || clearSection || __defaultRightSection;
}

exports.InputClearSection = InputClearSection;
//# sourceMappingURL=InputClearSection.cjs.map
