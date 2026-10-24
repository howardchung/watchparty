'use client';
'use strict';

var cssVariablesObjectToString = require('./css-variables-object-to-string.cjs');

function convertCssVariables(input, selectorOverride) {
  const selectors = selectorOverride ? [selectorOverride] : [":root", ":host"];
  const sharedVariables = cssVariablesObjectToString.cssVariablesObjectToString(input.variables);
  const shared = sharedVariables ? `${selectors.join(", ")}{${sharedVariables}}` : "";
  const dark = cssVariablesObjectToString.cssVariablesObjectToString(input.dark);
  const light = cssVariablesObjectToString.cssVariablesObjectToString(input.light);
  const selectorsWithScheme = (scheme) => selectors.map(
    (selector) => selector === ":host" ? `${selector}([data-mantine-color-scheme="${scheme}"])` : `${selector}[data-mantine-color-scheme="${scheme}"]`
  ).join(", ");
  const darkForced = dark ? `${selectorsWithScheme("dark")}{${dark}}` : "";
  const lightForced = light ? `${selectorsWithScheme("light")}{${light}}` : "";
  return `${shared}

${darkForced}

${lightForced}`;
}

exports.convertCssVariables = convertCssVariables;
//# sourceMappingURL=convert-css-variables.cjs.map
