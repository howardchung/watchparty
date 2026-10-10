import type { MantineTheme, MantineThemeOverride } from '../theme.types';
export declare const INVALID_PRIMARY_COLOR_ERROR = "[@mantine/core] MantineProvider: Invalid theme.primaryColor, it accepts only key of theme.colors, learn more \u2013 https://mantine.dev/theming/colors/#primary-color";
export declare const INVALID_PRIMARY_SHADE_ERROR = "[@mantine/core] MantineProvider: Invalid theme.primaryShade, it accepts only 0-9 integers or an object { light: 0-9, dark: 0-9 }";
export declare function validateMantineTheme(theme: MantineTheme): asserts theme is MantineTheme;
export declare function mergeMantineTheme(currentTheme: MantineTheme, themeOverride?: MantineThemeOverride): MantineTheme;
