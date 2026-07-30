import { MantineTheme, MantineThemeOverride } from '../theme.types';
export declare const MantineThemeContext: import("react").Context<MantineTheme | null>;
export declare const useSafeMantineTheme: () => MantineTheme;
export declare function useMantineTheme(): MantineTheme;
export interface MantineThemeProviderProps {
    /** Determines whether theme should be inherited from parent MantineProvider @default `true` */
    inherit?: boolean;
    /** Theme override object */
    theme?: MantineThemeOverride;
    /** Your application or part of the application that requires different theme */
    children?: React.ReactNode;
}
export declare function MantineThemeProvider({ theme, children, inherit, }: MantineThemeProviderProps): import("react/jsx-runtime").JSX.Element;
export declare namespace MantineThemeProvider {
    var displayName: string;
}
