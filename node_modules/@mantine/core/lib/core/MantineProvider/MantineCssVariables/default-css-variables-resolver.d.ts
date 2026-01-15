import { ConvertCSSVariablesInput } from '../convert-css-variables';
import { MantineTheme } from '../theme.types';
export type CSSVariablesResolver = (theme: MantineTheme) => ConvertCSSVariablesInput;
export declare const defaultCssVariablesResolver: CSSVariablesResolver;
