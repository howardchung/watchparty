import type { CssVariable } from '../../Box';
export type CSSVariables = Record<CssVariable, string>;
export declare function cssVariablesObjectToString(variables: CSSVariables): string;
