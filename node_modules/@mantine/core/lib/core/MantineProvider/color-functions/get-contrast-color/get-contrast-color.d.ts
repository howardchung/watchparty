import type { MantineTheme } from '../../theme.types';
interface GetContrastColorInput {
    color: string | null | undefined;
    theme: MantineTheme;
    autoContrast?: boolean | undefined | null;
}
export declare function getContrastColor({ color, theme, autoContrast }: GetContrastColorInput): "var(--mantine-color-black)" | "var(--mantine-color-white)";
export declare function getPrimaryContrastColor(theme: MantineTheme, colorScheme: 'light' | 'dark'): "var(--mantine-color-black)" | "var(--mantine-color-white)";
export {};
