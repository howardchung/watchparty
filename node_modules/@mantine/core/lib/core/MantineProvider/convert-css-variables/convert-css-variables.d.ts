import { CSSVariables } from './css-variables-object-to-string';
export interface ConvertCSSVariablesInput {
    /** Shared CSS variables that should be accessible independent from color scheme */
    variables: CSSVariables;
    /** CSS variables available only in dark color scheme */
    dark: CSSVariables;
    /** CSS variables available only in light color scheme */
    light: CSSVariables;
}
export declare function convertCssVariables(input: ConvertCSSVariablesInput, selectorOverride?: string): string;
