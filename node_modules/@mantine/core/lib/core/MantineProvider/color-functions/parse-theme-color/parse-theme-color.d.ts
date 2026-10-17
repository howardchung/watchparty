import type { CssVariable } from '../../../Box';
import type { MantineColorScheme, MantineColorShade, MantineTheme } from '../../theme.types';
interface ParseThemeColorOptions {
    color: unknown;
    theme: MantineTheme;
    colorScheme?: MantineColorScheme;
}
interface ParseThemeColorResult {
    color: string;
    value: string;
    shade: MantineColorShade | undefined;
    variable: CssVariable | undefined;
    isThemeColor: boolean;
    isLight: boolean;
}
export declare function parseThemeColor({ color, theme, colorScheme, }: ParseThemeColorOptions): ParseThemeColorResult;
export {};
