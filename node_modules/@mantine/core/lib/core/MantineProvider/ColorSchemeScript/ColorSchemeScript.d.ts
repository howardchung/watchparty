import type { MantineColorScheme } from '../theme.types';
export interface ColorSchemeScriptProps extends React.ComponentPropsWithoutRef<'script'> {
    forceColorScheme?: 'light' | 'dark';
    defaultColorScheme?: MantineColorScheme;
    localStorageKey?: string;
}
export declare function ColorSchemeScript({ defaultColorScheme, localStorageKey, forceColorScheme, ...others }: ColorSchemeScriptProps): import("react/jsx-runtime").JSX.Element;
