'use client';
import { cssVariablesObjectToString } from './css-variables-object-to-string.mjs';

function convertCssVariables(input, selectorOverride) {
  const selectors = selectorOverride ? [selectorOverride] : [":root", ":host"];
  const sharedVariables = cssVariablesObjectToString(input.variables);
  const shared = sharedVariables ? `${selectors.join(", ")}{${sharedVariables}}` : "";
  const dark = cssVariablesObjectToString(input.dark);
  const light = cssVariablesObjectToString(input.light);
  const selectorsWithScheme = (scheme) => selectors.map(
    (selector) => selector === ":host" ? `${selector}([data-mantine-color-scheme="${scheme}"])` : `${selector}[data-mantine-color-scheme="${scheme}"]`
  ).join(", ");
  const darkForced = dark ? `${selectorsWithScheme("dark")}{${dark}}` : "";
  const lightForced = light ? `${selectorsWithScheme("light")}{${light}}` : "";
  return `${shared}

${darkForced}

${lightForced}`;
}

export { convertCssVariables };
//# sourceMappingURL=convert-css-variables.mjs.map
