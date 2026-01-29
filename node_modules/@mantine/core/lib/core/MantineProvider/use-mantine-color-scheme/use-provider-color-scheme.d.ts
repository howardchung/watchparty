import type { MantineColorSchemeManager } from '../color-scheme-managers';
import type { MantineColorScheme } from '../theme.types';
interface UseProviderColorSchemeOptions {
    manager: MantineColorSchemeManager;
    defaultColorScheme: MantineColorScheme;
    forceColorScheme: 'light' | 'dark' | undefined;
    getRootElement: () => HTMLElement | undefined;
}
export declare function useProviderColorScheme({ manager, defaultColorScheme, getRootElement, forceColorScheme, }: UseProviderColorSchemeOptions): {
    colorScheme: MantineColorScheme;
    setColorScheme: (colorScheme: MantineColorScheme) => void;
    clearColorScheme: () => void;
};
export {};
