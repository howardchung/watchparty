import { ConvertCSSVariablesInput } from './convert-css-variables';
import type { MantineColorScheme, MantineTheme } from './theme.types';
export interface MantineStylesTransform {
    sx?: () => (sx: any) => string;
    styles?: () => (styles: any, payload: any) => Record<string, string>;
}
interface MantineContextValue {
    colorScheme: MantineColorScheme;
    setColorScheme: (colorScheme: MantineColorScheme) => void;
    clearColorScheme: () => void;
    getRootElement: () => HTMLElement | undefined;
    classNamesPrefix: string;
    getStyleNonce?: () => string | undefined;
    cssVariablesResolver?: (theme: MantineTheme) => ConvertCSSVariablesInput;
    cssVariablesSelector: string;
    withStaticClasses: boolean;
    headless?: boolean;
    stylesTransform?: MantineStylesTransform;
    env?: 'default' | 'test';
}
export declare const MantineContext: import("react").Context<MantineContextValue | null>;
export declare function useMantineContext(): MantineContextValue;
export declare function useMantineCssVariablesResolver(): ((theme: MantineTheme) => ConvertCSSVariablesInput) | undefined;
export declare function useMantineClassNamesPrefix(): string;
export declare function useMantineStyleNonce(): (() => string | undefined) | undefined;
export declare function useMantineWithStaticClasses(): boolean;
export declare function useMantineIsHeadless(): boolean | undefined;
export declare function useMantineSxTransform(): (() => (sx: any) => string) | undefined;
export declare function useMantineStylesTransform(): (() => (styles: any, payload: any) => Record<string, string>) | undefined;
export declare function useMantineEnv(): "default" | "test";
export {};
