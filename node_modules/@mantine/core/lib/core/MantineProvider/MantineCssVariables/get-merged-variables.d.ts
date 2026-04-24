import { ConvertCSSVariablesInput } from '../convert-css-variables';
import { MantineTheme } from '../theme.types';
interface GetMergedVariablesInput {
    theme: MantineTheme;
    generator?: (theme: MantineTheme) => ConvertCSSVariablesInput;
}
export declare function getMergedVariables({ theme, generator }: GetMergedVariablesInput): ConvertCSSVariablesInput;
export {};
